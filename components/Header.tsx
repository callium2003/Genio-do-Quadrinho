
import React from 'react';

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
  </svg>
);

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 md:mb-12">
      <div className="flex justify-center items-center gap-4">
        <StarIcon className="w-8 h-8 text-[#FFE066] transform -rotate-12" />
        <h1 className="text-5xl md:text-6xl font-bold text-[#7C4DFF] drop-shadow-lg">
          Gênio das Histórias
        </h1>
        <StarIcon className="w-8 h-8 text-[#FFE066] transform rotate-12" />
      </div>
      <p className="mt-4 text-xl font-extrabold uppercase tracking-wider text-gray-600">Dê vida à sua história!</p>
    </header>
  );
};

export default Header;