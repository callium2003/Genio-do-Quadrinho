import { GoogleGenAI, Type, Part, Modality } from "@google/genai";
import type { StoryInputs, Character, FullStory, StoryPanel } from '../types';
import { getCachedImage, cacheImage } from './cacheService';

// A chave de API deve ser gerenciada por meio de variáveis de ambiente.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("A variável de ambiente API_KEY não está definida.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Converte um objeto File em uma Part generativa para a API do Gemini.
 */
const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type,
        },
    };
};

/**
 * Função "Maestro": Gera a história completa, incluindo título, sinopse, personagens e prompts de imagem detalhados para cada painel, em uma única chamada.
 */
export async function generateFullStoryFromIdea(inputs: StoryInputs): Promise<FullStory> {
  const { idea } = inputs;

  if (!idea) {
    throw new Error("A ideia da história deve ser preenchida.");
  }
  
  console.log("Gerando Roteiro Mestre para a ideia:", idea);

  const prompt = `Você é um roteirista e diretor de arte para quadrinhos infantis. Sua tarefa é pegar uma ideia e transformá-la em um "Roteiro Mestre" completo no formato JSON.

**REGRAS GERAIS:**
1.  **IDIOMA:** Detecte o idioma da ideia do usuário. TODO o conteúdo de 'titulo', 'sinopse', 'personagens' e o campo 'text' dos painéis DEVE estar nesse idioma.
2.  **TÍTULO:** CRIE um 'titulo' curto, mágico e cativante para a história.
3.  **TOM:** A história deve ser positiva, criativa e sempre ter um final feliz.
4.  **ESTRUTURA:** A história DEVE ser dividida em EXATAMENTE 8 painéis.

**REGRAS PARA 'imagePrompt' (CRÍTICO):**
1.  **IDIOMA DO PROMPT:** O campo 'imagePrompt' DEVE ser escrito em INGLÊS, para máxima compatibilidade com o modelo de imagem.
2.  **FOCO VISUAL:** O 'imagePrompt' deve descrever APENAS os elementos visuais da cena. Inclua detalhes sobre o cenário, ações dos personagens, emoções e composição.
3.  **DIÁLOGO:** Se o 'text' do painel contiver diálogo entre aspas (ex: "Vamos lá!"), o 'imagePrompt' DEVE incluir a instrução para desenhar esse texto dentro de um balão de fala (ex: "with a speech bubble saying 'Vamos lá!'").
4.  **SEM NARRAÇÃO NA IMAGEM:** O 'imagePrompt' NUNCA deve instruir o modelo a escrever texto narrativo na imagem. A narração pertence apenas ao campo 'text'.
5.  **ESTILO:** O prompt deve especificar um estilo de cartoon vibrante, colorido e alegre, adequado para crianças, com contornos bem definidos ("vibrant, colorful and cheerful cartoon style, suitable for children, with well-defined outlines, high quality, 1:1 aspect ratio").

**Ideia do Usuário:** "${idea}"

Crie o Roteiro Mestre completo, certificando-se de que TODOS os campos obrigatórios, incluindo 'titulo', 'sinopse', 'personagens' e 'paineis', sejam preenchidos corretamente no formato JSON solicitado.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titulo: { type: Type.STRING, description: "O título mágico da história." },
            sinopse: { type: Type.STRING, description: "Uma sinopse curta e envolvente." },
            personagens: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nome: { type: Type.STRING },
                  descricao: { type: Type.STRING }
                },
                required: ["nome", "descricao"]
              },
              description: "Lista de personagens principais com nome e descrição."
            },
            paineis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "O texto narrativo/descritivo do painel (no idioma do usuário)." },
                  imagePrompt: { type: Type.STRING, description: "A instrução visual detalhada para o modelo de imagem (SEMPRE em inglês)." }
                },
                required: ["text", "imagePrompt"]
              },
              description: "Uma lista com exatamente 8 painéis."
            }
          },
          required: ["titulo", "sinopse", "personagens", "paineis"],
        }
      }
    });

    let jsonStr = response.text.trim();
    const result: FullStory = JSON.parse(jsonStr);

    if (!result.paineis || result.paineis.length !== 8) {
      console.warn(`Alerta de Validação: A IA gerou ${result.paineis?.length ?? 0} painéis em vez de 8.`, result);
      throw new Error(`O Gênio se empolgou e criou uma história com ${result.paineis?.length ?? 0} partes em vez de 8! Por favor, tente gerar novamente.`);
    }

    return result;

  } catch (error) {
    console.error("Erro ao gerar o Roteiro Mestre:", error);
    if (error instanceof Error && error.message.includes("partes em vez de 8")) {
        throw error;
    }
    throw new Error("O Gênio teve um bloqueio criativo! Por favor, tente uma nova ideia.");
  }
}

/**
 * Gera a imagem para um único painel da história usando o prompt pré-gerado.
 */
export async function generatePanelImage(panel: StoryPanel, referenceFiles: File[]): Promise<string> {
    const { imagePrompt, text } = panel;
    const referenceFileNames = referenceFiles.map(f => f.name).sort().join(',');
    const cacheKey = `panel-image-${text}-${referenceFileNames}`;
    
    const cachedImage = await getCachedImage(cacheKey);
    if (cachedImage) {
        console.log("Servindo imagem do cache para:", text);
        return cachedImage;
    }

    // Se não há referências, usamos um modelo para criar uma imagem do zero.
    if (referenceFiles.length === 0) {
        console.log("Gerando nova imagem para:", text);
        
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            }
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        await cacheImage(cacheKey, imageUrl);
        return imageUrl;
    }

    // Se há referências, usamos um modelo multimodal.
    console.log("Gerando imagem com referências para:", text);

    const textPart = { text: imagePrompt + " Use the provided character reference images to ensure consistency. Re-draw the characters in the same style as the references, but place them in the new scene described." };
    const imageParts: Part[] = await Promise.all(referenceFiles.map(fileToGenerativePart));

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [textPart, ...imageParts] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);

    if (imagePart?.inlineData) {
        const base64ImageBytes: string = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType;
        const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
        await cacheImage(cacheKey, imageUrl);
        return imageUrl;
    }
    
    throw new Error("Não foi possível gerar a imagem com os personagens. Tente novamente.");
}