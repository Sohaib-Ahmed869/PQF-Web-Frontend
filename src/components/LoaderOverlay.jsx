import React from 'react';
import Logo from '../assets/PQF-22.png';

const LoaderOverlay = ({ text = 'Loading...' }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
    <div className="relative w-24 h-24 mb-6 mx-auto flex items-center justify-center">
      {/* Logo Circle */}
      <div className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm shadow-lg animate-pulse relative">
        {/* ← Replace the X with your logo */}
        <img
          src={Logo}
          alt="Premier Quality Foods Logo"
          className="w-10 h-10 object-contain"
        />
        <div
          className="absolute inset-0 rounded-full bg-white/5 animate-ping"
          style={{ animationDuration: '3s' }}
        />
      </div>
      {/* Spinner on boundary */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 border-4 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
    <h1 className="text-3xl font-bold mb-1 tracking-wider text-gray-800 drop-shadow-lg">
      PREMIER
    </h1>
    <p className="text-lg opacity-90 mb-6 drop-shadow text-gray-500">
      QUALITY FOODS
    </p>
    {text && <div className="text-gray-600 text-lg mt-2">{text}</div>}
  </div>
);

export default LoaderOverlay;
