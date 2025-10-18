import React, { useRef, useState } from 'react';
import type { StoryPanel } from '../types';
import { useStory } from '../contexts/StoryContext';

// Import dinâmico requer que os pacotes estejam disponíveis como módulos.
// Eles foram adicionados ao importmap no index.html.
import('html2canvas');
import('jspdf');

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);


const Step3FinalStory: React.FC = () => {
  const { panels, fullStory, reset } = useStory();
  const title = fullStory?.titulo;
  const synopsis = fullStory?.sinopse;

  const storyRef = useRef<HTMLDivElement>(null);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleSavePdf = async () => {
    if (!storyRef.current || isSavingPdf) return;

    setIsSavingPdf(true);
    setPdfError(null);
    
    try {
        const { default: html2canvas } = await import('html2canvas');
        const { jsPDF } = await import('jspdf');
        
        const canvas = await html2canvas(storyRef.current, { 
            backgroundColor: '#F5F5F5',
            useCORS: true, 
            scale: 2 
        });
        
        const imgData = canvas.toDataURL('image/png');
      
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save((title?.replace(/\s+/g, '_') || 'minha-historia') + '.pdf');

    } catch(err) {
        console.error("Erro ao gerar PDF:", err);
        setPdfError("Oops! Algo deu errado ao tentar criar o PDF.");
    } finally {
        setIsSavingPdf(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
        <div className="text-center bg-[#B2FF59]/30 border border-[#B2FF59] p-4 rounded-xl animate-pop-in">
            <h2 className="text-2xl md:text-3xl font-extrabold text-green-800">Parabéns, sua história está pronta!</h2>
            <p className="text-green-700 mt-1">Veja como ficou incrível a sua aventura em quadrinhos.</p>
        </div>

        <div ref={storyRef} className="w-full max-w-5xl p-4 md:p-6 bg-[#F5F5F5] rounded-2xl shadow-2xl">
            {title && synopsis && (
                <div className="text-center mb-6 border-b-2 border-gray-300 pb-4 animate-fade-in">
                    <h3 className="text-3xl md:text-4xl font-extrabold text-[#7C4DFF] [text-shadow:1px_1px_2px_rgba(0,0,0,0.1)]">{title}</h3>
                    <p className="mt-2 text-gray-700 italic max-w-2xl mx-auto">{synopsis}</p>
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {panels.map(panel => (
                    <div key={panel.id} className="bg-white rounded-lg p-3 flex flex-col gap-2 border border-gray-200 shadow-sm">
                        <div className="aspect-square w-full rounded-md overflow-hidden">
                            {panel.imageUrl && <img src={panel.imageUrl} alt={panel.text} className="w-full h-full object-cover" />}
                        </div>
                        <p className="text-lg font-bold text-[#222] text-center [text-shadow:0px_1px_2px_rgba(0,0,0,0.15)] flex-grow flex items-center justify-center p-2">{panel.text}</p>
                    </div>
                ))}
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">Criado com o Gênio das Histórias</p>
        </div>

        <div className="w-full max-w-md flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button
                onClick={handleSavePdf}
                disabled={isSavingPdf}
                className="w-full flex items-center justify-center gap-2 text-lg font-bold bg-[#1DE9B6] text-gray-800 px-6 py-3 rounded-xl shadow-lg hover:bg-[#18CFAF] transform hover:scale-105 transition-all duration-300 disabled:bg-teal-200 disabled:cursor-wait disabled:scale-100"
                >
                    {isSavingPdf ? 'Salvando PDF...' : (
                        <>
                            <DownloadIcon className="w-6 h-6" />
                            <span>Salvar História (PDF)</span>
                        </>
                    )}
                </button>
                <button
                onClick={reset}
                className="w-full text-lg font-bold bg-[#FF7043] text-white px-6 py-3 rounded-xl shadow-lg hover:bg-[#F86031] transform hover:scale-105 transition-all duration-300"
                >
                    Criar Nova História
                </button>
            </div>
            {pdfError && <p className="text-red-500 text-sm text-center font-bold animate-fade-in mt-2">{pdfError}</p>}
        </div>
    </div>
  );
};

export default Step3FinalStory;