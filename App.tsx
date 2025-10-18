import React, { useState } from 'react';
import { StoryProvider, useStory } from './contexts/StoryContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Step1StoryForm from './components/Step1_StoryForm';
import Step1_5_CharacterAssignment from './components/Step1_5_CharacterAssignment';
import Step2ImageViewer from './components/Step2_ImageViewer';
import Step3FinalStory from './components/Step3_FinalStory';
import ProgressBar from './components/ProgressBar';
import AdminDashboard from './components/AdminDashboard';

// Este componente lê do contexto para decidir qual etapa renderizar.
const StoryCreator: React.FC = () => {
    const { step } = useStory();

    // A chave `key={step}` é importante para remontar o componente a cada etapa e acionar as animações.
    return (
        <div key={step} className="w-full animate-fade-in">
            {step === 'CREATE' && <Step1StoryForm />}
            {step === 'CHARACTER_ASSIGNMENT' && <Step1_5_CharacterAssignment />}
            {step === 'IMAGE_GENERATION' && <Step2ImageViewer />}
            {step === 'FINAL_STORY' && <Step3FinalStory />}
        </div>
    );
}

// Um componente auxiliar para acessar o contexto dentro do escopo do provedor.
const AppContent: React.FC = () => {
    const { step, error, setError } = useStory();
    return (
        <>
            {step !== 'CREATE' && <ProgressBar />}
            {error && (
                <div className="my-4 w-full max-w-4xl bg-[#FF7043] text-white p-4 rounded-lg text-center shadow-lg flex justify-between items-center animate-fade-in">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-4 font-bold text-xl hover:scale-110 transition-transform">&times;</button>
                </div>
            )}
        </>
    );
};

const App: React.FC = () => {
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);

  return (
    <StoryProvider>
        <div className="min-h-screen flex flex-col items-center justify-between p-4 md:p-8 selection:bg-[#FF80AB] selection:text-white">
            <Header />
            
            <main className="w-full max-w-6xl mx-auto flex flex-col items-center flex-grow">
                {showAdminPanel ? (
                    <AdminDashboard onClose={() => setShowAdminPanel(false)} />
                ) : (
                    <>
                        <AppContent />
                        <StoryCreator />
                    </>
                )}
            </main>

            <Footer onAdminClick={() => setShowAdminPanel(prev => !prev)} />
        </div>
    </StoryProvider>
  );
};

export default App;