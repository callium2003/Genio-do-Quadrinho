import React, { useState } from 'react';
import { useStory } from '../contexts/StoryContext';
import type { StoryInputs } from '../types';
import LoadingSpinner from './LoadingSpinner';

const Step1StoryForm: React.FC = () => {
  const { createStory, isLoading } = useStory();
  const [idea, setIdea] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isFormValid = idea.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setError(null);
      createStory({ idea });
    } else {
      setError("Por favor, escreva uma ideia para começarmos a mágica da história!");
    }
  };
  
  const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIdea(e.target.value);
    if (error) {
        setError(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="O Gênio está mergulhando no mundo da imaginação..." />;
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
            <label htmlFor="idea" className="block text-lg font-bold text-gray-700 mb-2 text-center">
                Oi, sou o Gênio das Histórias! Me conte sua ideia e juntos vamos criar uma aventura mágica e divertida!
            </label>
            <textarea 
                id="idea" 
                rows={4}
                value={idea}
                onChange={handleIdeaChange} 
                maxLength={250}
                placeholder="Ex: Uma história sobre dois amigos, João e a cachorrinha Laika, que encontram um mapa mágico e viajam para a Lua em busca de um tesouro." 
                className={`w-full bg-white border-2 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:outline-none transition-all duration-300 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#1DE9B6] focus:border-[#1DE9B6]'}`}
                required 
                aria-invalid={!!error}
                aria-describedby={error ? "idea-error" : undefined}
            />
            <div className="flex justify-end items-center mt-1">
              <p className="text-right text-sm text-gray-500">{idea.length} / 250</p>
            </div>
        </div>
        
        {error && <p id="idea-error" className="text-red-500 text-sm -mt-2 text-center font-bold animate-fade-in">{error}</p>}
        
        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-3 text-xl font-extrabold bg-[#FFE066] text-[#7C4DFF] px-6 py-4 rounded-xl shadow-lg hover:bg-[#FFD133] transform hover:scale-105 transition-all duration-300 disabled:bg-[#FFE066]/50 disabled:text-[#7C4DFF]/60 disabled:cursor-not-allowed disabled:scale-100">
            Agora deixe comigo que eu vou criar uma história com a sua ideia!
        </button>
      </form>
    </div>
  );
};

export default Step1StoryForm;