
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Ч</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">ЧЕРКАСИ <span className="text-blue-600">NEWS</span></h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Головне в області</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-900 hover:text-blue-600 font-medium transition-colors">Головна</a>
            <a href="#politics" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Політика</a>
            <a href="#incidents" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Події</a>
            <a href="#culture" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Культура</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <div className="text-sm font-medium text-gray-500 hidden sm:block">
              {new Date().toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
