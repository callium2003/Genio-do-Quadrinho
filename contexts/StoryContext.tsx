import React, { createContext, useState, useCallback, useRef, useContext } from 'react';
import type { StoryInputs, StoryPanel, FullStory } from '../types';
import { generateFullStoryFromIdea, generatePanelImage } from '../services/geminiService';

type AppStep = 'CREATE' | 'CHARACTER_ASSIGNMENT' | 'IMAGE_GENERATION' | 'FINAL_STORY';

interface StoryContextType {
  step: AppStep;
  fullStory: FullStory | null;
  panels: StoryPanel[];
  error: string | null;
  isLoading: boolean;
  createStory: (inputs: StoryInputs) => Promise<void>;
  confirmCharacters: (photoMap: Map<string, File>) => void;
  generateImage: (panelId: number) => Promise<void>;
  generateAllImages: () => Promise<void>;
  goToFinalStory: () => void;
  reset: () => void;
  setError: (error: string | null) => void;
}

const urlToFile = async (url: string, filename: string, mimeType: string = 'image/png'): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType });
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<AppStep>('CREATE');
  const [fullStory, setFullStory] = useState<FullStory | null>(null);
  const [panels, setPanels] = useState<StoryPanel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Armazena as fotos originais enviadas pelo usuário.
  const characterPhotoMapRef = useRef<Map<string, File>>(new Map());
  // Armazena a PRIMEIRA imagem gerada para cada personagem, que se torna a referência principal.
  const characterReferencesRef = useRef<Map<string, string>>(new Map());

  const reset = useCallback(() => {
    setStep('CREATE');
    setFullStory(null);
    setPanels([]);
    setError(null);
    setIsLoading(false);
    characterPhotoMapRef.current.clear();
    characterReferencesRef.current.clear();
  }, []);

  const createStory = useCallback(async (inputs: StoryInputs) => {
    setIsLoading(true);
    setError(null);
    characterPhotoMapRef.current.clear();
    characterReferencesRef.current.clear();

    try {
      const storyResult = await generateFullStoryFromIdea(inputs);
      setFullStory(storyResult);
      
      const initialPanels: StoryPanel[] = storyResult.paineis.map((panelData, index) => ({
        id: index,
        text: panelData.text,
        imagePrompt: panelData.imagePrompt,
        isLoading: false,
      }));
      setPanels(initialPanels);
      
      setStep('CHARACTER_ASSIGNMENT');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      setStep('CREATE');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const confirmCharacters = useCallback((photoMap: Map<string, File>) => {
    characterPhotoMapRef.current = photoMap;
    setStep('IMAGE_GENERATION');
  }, []);

  const generateImage = useCallback(async (panelId: number) => {
    if (!fullStory) {
      setError("As informações da história não foram encontradas. Por favor, tente novamente.");
      return;
    }
    
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, isLoading: true, error: undefined } : p));
    
    // Pega o painel mais recente do estado para evitar problemas de concorrência
    const panelToUpdate = panels.find(p => p.id === panelId);
    if (!panelToUpdate) return;

    try {
      const charactersInPanelNames = fullStory.personagens
        .map(c => c.nome)
        .filter(name => new RegExp(`\\b${name}\\b`, 'i').test(panelToUpdate.text));

      const referenceFiles: File[] = [];

      for (const charName of charactersInPanelNames) {
        // PRIORIDADE 1: A referência "canônica" já gerada.
        if (characterReferencesRef.current.has(charName)) {
            const imageUrl = characterReferencesRef.current.get(charName)!;
            const imageFile = await urlToFile(imageUrl, `${charName.replace(/\s+/g, '_')}.png`);
            referenceFiles.push(imageFile);
        } 
        // PRIORIDADE 2: A foto original do usuário, se a canônica ainda não existir.
        else if (characterPhotoMapRef.current.has(charName)) {
            referenceFiles.push(characterPhotoMapRef.current.get(charName)!);
        }
      }
      
      const imageUrl = await generatePanelImage(panelToUpdate, referenceFiles);
      
      setPanels(prev => prev.map(p => p.id === panelId ? { ...p, imageUrl, isLoading: false } : p));

      // Após gerar a imagem com sucesso, estabelece a "Referência Canônica".
      for (const charName of charactersInPanelNames) {
        // Se este personagem ainda não tem uma imagem de referência gerada,
        // defina a imagem recém-criada como sua referência canônica para os próximos painéis.
        if (!characterReferencesRef.current.has(charName)) {
          characterReferencesRef.current.set(charName, imageUrl);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar imagem.';
      setPanels(prev => prev.map(p => p.id === panelId ? { ...p, isLoading: false, error: errorMessage } : p));
    }
  }, [fullStory, panels]);

  const generateAllImages = useCallback(async () => {
    // Processa os painéis em ordem para garantir que a primeira aparição de um personagem
    // estabeleça a referência correta para os painéis subsequentes.
    const panelsToGenerate = panels.filter(panel => !panel.imageUrl && !panel.isLoading);
    for (const panel of panelsToGenerate) {
        await generateImage(panel.id);
    }
  }, [panels, generateImage]);

  const goToFinalStory = useCallback(() => {
    setStep('FINAL_STORY');
  }, []);

  const value = {
      step,
      fullStory,
      panels,
      error,
      isLoading,
      createStory,
      confirmCharacters,
      generateImage,
      generateAllImages,
      goToFinalStory,
      reset,
      setError,
  };

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
};

export const useStory = () => {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error('useStory deve ser usado dentro de um StoryProvider');
  }
  return context;
};