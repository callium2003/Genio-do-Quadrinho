import React from 'react';
import type { StoryPanel } from '../types';

interface PanelProgressBarProps {
  panels: StoryPanel[];
  className?: string;
}

const PanelProgressBar: React.FC<PanelProgressBarProps> = ({ panels, className = '' }) => {
  return (
    <div className={`flex justify-center items-center gap-2 ${className}`}>
      {panels.map(panel => (
        <div
          key={panel.id}
          className={`w-3 h-3 rounded-full transition-colors duration-500 ${
            panel.imageUrl ? 'bg-[#1DE9B6]' : 'bg-gray-300'
          }`}
          title={`Painel ${panel.id + 1} ${panel.imageUrl ? 'Completo' : 'Pendente'}`}
        ></div>
      ))}
    </div>
  );
};

export default PanelProgressBar;
