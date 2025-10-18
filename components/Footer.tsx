import React from 'react';

interface FooterProps {
  onAdminClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer className="w-full text-center p-4 mt-8">
      <p className="text-base font-bold text-gray-500/80">
        Criado com ❤️ por Denis Cullen para divertir e permitir a integração das crianças com seus pais, avós e amigos.
      </p>
      <div className="mt-2">
        <button 
          onClick={onAdminClick}
          className="text-xs text-gray-400 hover:text-gray-600 hover:underline transition-colors"
        >
          Painel do Administrador
        </button>
      </div>
    </footer>
  );
};

export default Footer;