import React from 'react';
import type { StoryPanel } from '../types';
import PanelProgressBar from './PanelProgressBar';
import { useStory } from '../contexts/StoryContext';

interface PanelProps {
  panel: StoryPanel;
  totalPanels: number;
}

const Panel: React.FC<PanelProps> = ({ panel, totalPanels }) => {
  const { generateImage } = useStory();

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg flex flex-col gap-3">
      <div className="text-center">
        <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full text-sm">
          Quadrinho {panel.id + 1} de {totalPanels}
        </span>
      </div>

      <p className="text-gray-600 text-sm text-center h-20 overflow-y-auto">{panel.text}</p>

      <div className="comic-panel relative w-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
        
        {panel.isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-10 p-4 text-center">
            <svg className="w-12 h-12 text-[#FFE066] animate-spin" style={{ animationDuration: '1.5s' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
            </svg>
            <p className="text-lg mt-4 font-bold text-[#7C4DFF] animate-pulse">
                O Gênio está pintando...
            </p>
          </div>
        )}
        
        {panel.imageUrl ? (
          <img src={panel.imageUrl} alt={panel.text} className="w-full h-full object-cover" />
        ) : !panel.isLoading && !panel.error && (
           <button
            onClick={() => generateImage(panel.id)}
            className="w-4/5 text-base font-bold bg-[#FFE066] text-gray-800 px-4 py-3 rounded-lg shadow-md hover:bg-[#FFD133] transform hover:scale-105 transition-all duration-300 z-10"
            >
            Gerar Imagem
          </button>
        )}

        {panel.error && (
          <div className="absolute inset-0 bg-red-100/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-2 text-center">
            <p className="text-red-700 text-sm font-bold mb-3">{panel.error}</p>
            <button
                onClick={() => generateImage(panel.id)}
                className="text-sm font-bold bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transform hover:scale-105 transition-all duration-300"
            >
                Tentar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Step2ImageViewer: React.FC = () => {
    const { panels, generateAllImages, goToFinalStory } = useStory();
    const allImagesGenerated = panels.every(p => p.imageUrl);
    const isGeneratingAny = panels.some(p => p.isLoading);

    const generatedCount = panels.filter(p => p.imageUrl).length;
    const totalCount = panels.length;
    const progressPercentage = totalCount > 0 ? (generatedCount / totalCount) * 100 : 0;

    return (
        <div className="w-full flex flex-col items-center gap-6">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-[#7C4DFF]">Vamos Criar as Cenas!</h2>
                <p className="text-gray-600 mt-1">Gere as imagens para cada parte da sua história.</p>
            </div>

            <PanelProgressBar panels={panels} />

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {panels.map(panel => (
                    <Panel key={panel.id} panel={panel} totalPanels={panels.length} />
                ))}
            </div>
            
            {(isGeneratingAny || (allImagesGenerated && generatedCount < totalCount)) && (
              <div className="w-full max-w-md my-2 animate-fade-in">
                <p className="text-center text-lg font-bold text-[#7C4DFF] mb-2 animate-pulse">
                  O Gênio está pintando... ({generatedCount} de {totalCount})
                </p>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-[#1DE9B6] h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-4">
                <button
                onClick={generateAllImages}
                disabled={allImagesGenerated || isGeneratingAny}
                className="w-full text-lg font-bold bg-[#7C4DFF] text-white px-6 py-3 rounded-xl shadow-lg hover:bg-[#6A3EEA] transform hover:scale-105 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                Gerar Todas de Uma Vez
                </button>
                <button
                onClick={goToFinalStory}
                disabled={!allImagesGenerated}
                className="w-full text-lg font-bold bg-[#B2FF59] text-gray-800 px-6 py-3 rounded-xl shadow-lg hover:bg-[#A1F04D] transform hover:scale-105 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                Ver História Completa!
                </button>
            </div>
        </div>
    );
};

export default Step2ImageViewer;