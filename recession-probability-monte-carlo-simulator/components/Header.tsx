
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center py-6 md:py-8">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
        Recession Risk Simulator
      </h1>
      <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
        Use a Monte Carlo model to analyze economic indicators and get AI-powered context on recession probability.
      </p>
    </header>
  );
};

export default Header;
