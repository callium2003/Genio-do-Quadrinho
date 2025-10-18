import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center my-10 text-center">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#7C4DFF] rounded-full opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full border-t-4 border-[#7C4DFF] rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-lg text-[#7C4DFF]">{message || 'O Gênio está criando uma incrível história...'}</p>
    </div>
  );
};

export default LoadingSpinner;