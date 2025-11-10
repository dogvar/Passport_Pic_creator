
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        AI Passport & Portrait Pro
      </h1>
      <p className="mt-2 text-lg text-gray-400">
        Powered by Gemini 2.5 Flash Image
      </p>
    </header>
  );
};

export default Header;
