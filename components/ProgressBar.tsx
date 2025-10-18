import React from 'react';
import { useStory } from '../contexts/StoryContext';

const ProgressBar: React.FC = () => {
  const { step } = useStory();
  const steps = [
    { id: 'CREATE', label: '1. Ideia' },
    { id: 'CHARACTER_ASSIGNMENT', label: '2. Personagens' },
    { id: 'IMAGE_GENERATION', label: '3. Imagens' },
    { id: 'FINAL_STORY', label: '4. Final' },
  ];

  const stepIndices: Record<string, number> = {
    CHARACTER_ASSIGNMENT: 1,
    IMAGE_GENERATION: 2,
    FINAL_STORY: 3,
  };

  const currentStepIndex = stepIndices[step] ?? 0;

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((s, index) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl transition-all duration-300 ${
                  index <= currentStepIndex
                    ? 'bg-[#FFE066] text-gray-800'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {s.label.charAt(0)}
              </div>
              <p className="mt-2 text-sm md:text-base font-bold">{s.label}</p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-all duration-500 rounded-full ${
                  index < currentStepIndex ? 'bg-[#FFE066]' : 'bg-gray-200'
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;