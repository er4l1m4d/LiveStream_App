import React, { useState } from 'react';
import { ProductionProvider, useProduction } from './context/ProductionContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './components/DashboardLayout';
import { RoleSelection } from './views/RoleSelection';
import { MixerDashboard } from './views/MixerDashboard';
import { CameramanDashboard } from './views/CameramanDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { LandingPage } from './views/LandingPage';
import { UserRole } from './types';

// Separation of concerns: Inner component accesses Context
const AppContent = () => {
  const { churchSlug, logoutChurch, isLoading } = useProduction();
  const [currentRole, setCurrentRole] = useState<UserRole>('NONE');

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-church-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 mb-6 rounded-full bg-church-accent animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full animate-ping"></div>
          </div>
          <h1 className="text-2xl font-bold text-church-main mb-2">Loading LiveStream...</h1>
          <p className="text-church-muted">Initializing production system</p>
        </div>
      </div>
    );
  }

  // If not connected to a specific church, show Landing Page
  if (!churchSlug) {
    return <LandingPage />;
  }

  // Handle Logout from Church
  const handleFullLogout = () => {
    setCurrentRole('NONE');
    logoutChurch();
  };

  const renderDashboard = () => {
    switch (currentRole) {
      case 'MIXER':
        return <MixerDashboard />;
      case 'CAMERAMAN':
        return <CameramanDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <RoleSelection onSelect={setCurrentRole} />;
    }
  };

  if (currentRole === 'NONE') {
    return (
      <>
        <RoleSelection onSelect={setCurrentRole} />
        {/* Overlay logout button on Role Selection screen */}
        <div className="fixed top-6 left-6 z-50">
           <button 
             onClick={handleFullLogout}
             className="text-xs text-church-muted hover:text-white flex items-center gap-2 bg-church-800/50 px-3 py-1.5 rounded-full border border-church-700/50 hover:bg-church-700 transition-colors"
           >
             ← Switch Church
           </button>
        </div>
      </>
    );
  }

  return (
    <DashboardLayout role={currentRole} onLogout={() => setCurrentRole('NONE')}>
      {renderDashboard()}
    </DashboardLayout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ProductionProvider>
        <AppContent />
      </ProductionProvider>
    </ThemeProvider>
  );
}

export default App;