// 1. Importações e Configuração Inicial
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { GoogleGenAI } = require('@google/genai');

// --- Validação das Chaves de API ---
if (!process.env.GOOGLE_API_KEY_FREE || !process.env.GOOGLE_API_KEY_PAID) {
  throw new Error("As chaves de API GOOGLE_API_KEY_FREE e GOOGLE_API_KEY_PAID devem ser definidas no arquivo .env");
}

// --- Variáveis de Estado e Constantes ---
let freeTierUsage = 0;
const DAILY_FREE_TIER_LIMIT = 1500; // Limite de chamadas diárias para a chave gratuita. Ajuste conforme necessário.
let hasNotifiedAdmin = false; // Flag para garantir que a notificação de troca de chave seja enviada apenas uma vez por dia.

// --- Inicialização dos Clientes da IA ---
// Criamos duas instâncias separadas, uma para cada chave.
const aiFree = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY_FREE });
const aiPaid = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY_PAID });

// --- Configuração do Servidor Express ---
const app = express();
app.use(cors()); // Habilita CORS para permitir que seu frontend se conecte
app.use(express.json()); // Habilita o parsing de corpos de requisição JSON

// 2. Endpoint do Proxy para Geração de Conteúdo (Roteiros)
app.post('/api/generate-script', async (req, res) => {
  try {
    const { prompt, config } = req.body;
    if (!prompt || !config) {
      return res.status(400).json({ success: false, message: "É necessário fornecer 'prompt' e 'config'." });
    }

    let activeAi;
    let keyUsed = 'free';

    // --- Lógica de Decisão da Chave ---
    if (freeTierUsage < DAILY_FREE_TIER_LIMIT) {
      activeAi = aiFree;
      freeTierUsage++;
      console.log(`[Backend] Usando chave GRATUITA. Uso: ${freeTierUsage}/${DAILY_FREE_TIER_LIMIT}`);
    } else {
      activeAi = aiPaid;
      keyUsed = 'paid';
      if (!hasNotifiedAdmin) {
        console.warn(`[Backend] ATENÇÃO: Limite de uso gratuito atingido. Alternando para a chave PAGA.`);
        
        // --- Disparar Notificação para o Administrador ---
        if (process.env.ADMIN_NOTIFICATION_WEBHOOK_URL) {
          // Usamos uma função anônima auto-executável para que a notificação
          // seja enviada em segundo plano, sem atrasar a resposta ao usuário.
          (async () => {
            try {
              await fetch(process.env.ADMIN_NOTIFICATION_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value1: "Gênio das Histórias" }) // IFTTT pode usar "value1" no corpo do e-mail
              });
              console.log('[Backend] Notificação de administrador enviada com sucesso.');
            } catch (notificationError) {
              console.error('[Backend] Falha ao enviar notificação de administrador:', notificationError);
            }
          })();
        }
        
        hasNotifiedAdmin = true; // Evita notificações repetidas no mesmo dia
      }
    }

    // --- Chamada para a API do Google ---
    const response = await activeAi.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: config,
    });

    // Retorna a resposta para o frontend
    res.json({ success: true, text: response.text, keyUsed });

  } catch (error) {
    console.error("[Backend] Erro ao gerar roteiro:", error);
    res.status(500).json({ success: false, message: "Erro interno no servidor ao gerar roteiro." });
  }
});


// 3. Endpoint do Proxy para Geração de Imagens (seria implementado de forma similar)
// app.post('/api/generate-image', ...);


// 4. Tarefa Agendada (Cron Job) para Resetar o Contador
// "0 0 * * *" = "Às 00:00, todos os dias"
cron.schedule('0 0 * * *', () => {
  console.log('[Backend] Meia-noite! Resetando o contador de uso da API gratuita.');
  freeTierUsage = 0;
  hasNotifiedAdmin = false;
}, {
  timezone: "America/Sao_Paulo" // Defina seu fuso horário
});

// 5. Iniciar o Servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Backend] Servidor do Gênio das Histórias rodando na porta ${PORT}`);
  console.log(`[Backend] Limite diário da chave gratuita definido para ${DAILY_FREE_TIER_LIMIT} chamadas.`);
});
