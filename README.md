# Gênio das Histórias 🧞✨

Um aplicativo web criativo e interativo que utiliza a IA do Google Gemini para gerar histórias infantis personalizadas em formato de quadrinhos, completas com texto e ilustrações. A partir de uma simples ideia, o Gênio cria um enredo, personagens e imagens vibrantes, prontos para serem salvos como um PDF.

## 🚀 Funcionalidades Principais

-   **Geração de História Completa:** Cria um título, sinopse, descrição de personagens e um roteiro de 8 painéis a partir de uma única ideia do usuário.
-   **Ilustrações por IA:** Gera imagens únicas no estilo de desenho animado para cada painel da história.
-   **Consistência de Personagens:** Permite o upload de imagens de referência para que a IA desenhe os personagens de forma consistente ao longo da história.
-   **Exportação para PDF:** Salva a história finalizada como um arquivo PDF de alta qualidade, pronto para ser lido ou impresso.
-   **Design Responsivo:** Interface amigável que funciona perfeitamente em desktops, tablets e celulares.
-   **Cache Inteligente:** Utiliza a Cache API do navegador para armazenar imagens geradas, permitindo acesso mais rápido e visualização offline.

---

## 🛠️ Arquitetura e Tecnologias

O projeto é dividido em um frontend moderno e um backend opcional, mas recomendado para produção.

### Frontend

-   **Framework:** React 19 com TypeScript.
-   **Estilização:** TailwindCSS para um design rápido e responsivo.
-   **Gerenciamento de Estado:** React Context API (`StoryContext`) para um controle centralizado do fluxo da história.
-   **API de IA:** SDK `@google/genai` para comunicação direta com os modelos Gemini.
-   **Geração de PDF:** As bibliotecas `html2canvas` e `jspdf` são usadas no lado do cliente para converter o HTML da história em um PDF.
-   **Ambiente de Execução:** Utiliza um `importmap` no `index.html`, permitindo o uso de módulos ES6 diretamente no navegador sem a necessidade de um passo de *build* (bundler).

### Backend (Proxy - Opcional)

Uma pasta `backend/` está inclusa com um servidor Node.js/Express que atua como um proxy seguro e inteligente para a API do Gemini.

-   **Gerenciamento de Chaves de API:** Gerencia duas chaves de API (uma para o nível gratuito e outra para o pago) a partir de variáveis de ambiente (`.env`).
-   **Controle de Uso:** Implementa um limite diário de chamadas para a chave gratuita. Ao atingir o limite, o backend automaticamente alterna para a chave paga.
-   **Tarefas Agendadas:** Utiliza `node-cron` para resetar o contador de uso da chave gratuita diariamente à meia-noite.
-   **Notificações:** Pode enviar uma notificação de administrador (via webhook, como o IFTTT) quando o limite da chave gratuita é atingido, informando sobre a troca para a chave paga.

---

## 🧠 Lógica da Inteligência Artificial (`services/geminiService.ts`)

A "mágica" do Gênio das Histórias reside em dois processos principais orquestrados por prompts cuidadosamente elaborados.

### 1. `generateFullStoryFromIdea` (Função "Maestro")

Esta é a função inicial que transforma a ideia do usuário em uma estrutura de história completa.

-   **Modelo Utilizado:** `gemini-2.5-flash`.
-   **Prompt Estratégico:** Um prompt detalhado instrui a IA a agir como um "roteirista e diretor de arte". Ele contém regras estritas para:
    -   Gerar um objeto JSON completo usando `responseSchema`.
    -   Manter o idioma da história (`titulo`, `sinopse`, `text` dos painéis) consistente com o idioma da ideia do usuário.
    -   **Criticamente**, escrever os `imagePrompt` (instruções para o modelo de imagem) **sempre em inglês** para maximizar a qualidade e compatibilidade da geração de imagens.
    -   Dividir a história em **exatamente 8 painéis**.

### 2. `generatePanelImage` (Função "Ilustrador")

Esta função gera a imagem para cada painel, com uma lógica inteligente para manter a consistência dos personagens.

-   **Modelos Utilizados:**
    -   `imagen-4.0-generate-001`: Para gerar imagens de alta qualidade quando **nenhuma referência** de personagem é fornecida.
    -   `gemini-2.5-flash-image`: Um modelo multimodal usado quando há **imagens de referência**, permitindo que ele "veja" o personagem e o redesenhe na nova cena.
-   **Lógica de Referência Canônica:**
    1.  Opcionalmente, o usuário pode enviar uma foto de um personagem.
    2.  Quando a primeira imagem de um personagem é gerada pela IA, essa imagem se torna a **"referência canônica"** para aquele personagem.
    3.  Para todos os painéis subsequentes que apresentem o mesmo personagem, a IA usará essa "referência canônica" (e não mais a foto original) para garantir que o estilo do desenho permaneça consistente.

---

## ⚙️ Instalação e Execução

### Pré-requisitos

-   Node.js e npm (apenas para o backend).
-   Uma chave de API do Google AI Studio.

### Configurando o Frontend

1.  **Chave de API:** O frontend espera que a chave de API esteja disponível como uma variável de ambiente `process.env.API_KEY` no ambiente de hospedagem.
2.  **Execução:** Como não há um passo de *build*, basta servir os arquivos estáticos ( `index.html`, `index.tsx`, etc.) a partir de um servidor web.

### Configurando o Backend (Recomendado)

1.  Navegue até a pasta do backend:
    ```bash
    cd backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie um arquivo `.env` na raiz da pasta `backend/` e adicione as seguintes variáveis:
    ```env
    # Chave para o nível de uso gratuito (ex: limite de 1500 chamadas/dia)
    GOOGLE_API_KEY_FREE="SUA_CHAVE_API_GRATUITA"

    # Chave para o nível pago, usada como fallback
    GOOGLE_API_KEY_PAID="SUA_CHAVE_API_PAGA"

    # (Opcional) URL de um webhook (ex: IFTTT) para notificar quando a chave paga for ativada
    ADMIN_NOTIFICATION_WEBHOOK_URL="URL_DO_SEU_WEBHOOK"

    # Porta em que o servidor irá rodar
    PORT=3001
    ```
4.  Inicie o servidor:
    ```bash
    npm start
    ```
5.  **Importante:** Para que o frontend use este backend, você precisará atualizar as chamadas no arquivo `services/geminiService.ts` para apontar para os endpoints do seu servidor (ex: `http://localhost:3001/api/generate-script`) em vez de chamar a API do Google diretamente.

---

## 📂 Estrutura do Projeto

```
.
├── backend/                  # Servidor proxy Node.js (opcional)
│   ├── index.js              # Lógica principal do servidor
│   └── package.json
├── components/               # Componentes React reutilizáveis
│   ├── Step1_StoryForm.tsx   # Formulário inicial da ideia
│   ├── Step1_5_...tsx        # Tela de upload de fotos de personagens
│   ├── Step2_ImageViewer.tsx # Galeria de geração de imagens
│   └── Step3_FinalStory.tsx  # Visualização final e download
├── contexts/                 # Gerenciamento de estado global
│   └── StoryContext.tsx      # Lógica de negócio e fluxo de etapas
├── services/                 # Módulos de serviço
│   ├── geminiService.ts      # Comunicação com a API Gemini
│   └── cacheService.ts       # Lógica de cache de imagens
├── App.tsx                   # Componente principal da aplicação
├── index.html                # Ponto de entrada HTML com importmap
├── index.tsx                 # Ponto de entrada do React
└── types.ts                  # Definições de tipos TypeScript
```

---
Criado com ❤️ por Denis Cullen.
