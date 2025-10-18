export interface StoryInputs {
  idea: string;
}

export interface Character {
  nome: string;
  descricao: string;
}

export interface StoryPanel {
  id: number;
  text: string;
  imagePrompt: string; // Instrução específica para a IA de imagem
  imageUrl?: string;
  isLoading: boolean;
  error?: string;
}

export interface FullStory {
  titulo: string;
  sinopse: string;
  personagens: Character[];
  paineis: Omit<StoryPanel, 'id' | 'imageUrl' | 'isLoading' | 'error'>[];
}
