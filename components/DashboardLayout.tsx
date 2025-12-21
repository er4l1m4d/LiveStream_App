import React from 'react';
import { UserRole } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { useProduction } from '../context/ProductionContext';

interface Props {
  role: UserRole;
  onLogout: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<Props> = ({ role, onLogout, children }) => {
  const { state, churchName } = useProduction();

  const LogoPlaceholder = () => (
    <div className="w-full h-full bg-church-accent flex items-center justify-center text-white text-xs font-bold">
      {churchName?.charAt(0).toUpperCase() || 'L'}
    </div>
  );

  return (
    <div className="min-h-screen bg-church-900 text-church-main flex flex-col transition-colors duration-300">
      <header className="bg-church-800 border-b border-church-700 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={onLogout} 
            className="flex items-center gap-3 md:gap-4 hover:opacity-80 transition-opacity focus:outline-none text-left"
            title="Return to Station Selection"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-church-900 border border-church-700 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-inner">
               {state.churchLogoUrl ? (
                 <img src={state.churchLogoUrl} alt="Logo" className="w-full h-full object-cover" />
               ) : (
                 <LogoPlaceholder />
               )}
            </div>
            <div>
              <h1 className="font-bold text-lg md:text-xl leading-none text-church-main tracking-tight">
                {churchName || 'LiveStream'}
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-church-accent font-bold mt-0.5">{role}</p>
            </div>
          </button>
          
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            <button 
              onClick={onLogout}
              className="text-xs md:text-sm text-church-muted hover:text-church-main transition-colors px-3 py-2 rounded hover:bg-church-700 flex items-center gap-1"
            >
              <span className="hidden sm:inline">Exit Station</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 mb-10 flex flex-col">
        {children}
      </main>

      <footer className="py-6 border-t border-church-800 text-center">
        <p className="text-church-muted text-sm font-medium tracking-wide">
          Production Platform Cloud
        </p>
      </footer>
    </div>
  );
};