import React, { useState } from 'react';
import { UserRole } from '../types';
import { ThemeToggle } from '../components/ThemeToggle';
import { useProduction } from '../context/ProductionContext';

interface Props {
  onSelect: (role: UserRole) => void;
}

export const RoleSelection: React.FC<Props> = ({ onSelect }) => {
  const { state, churchName } = useProduction();
  const [showPasswordModal, setShowPasswordModal] = useState<UserRole | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const initiateRoleSelect = (role: UserRole) => {
    if (role === 'CAMERAMAN') {
      onSelect(role);
    } else {
      setShowPasswordModal(role);
      setPasswordInput('');
      setShowPassword(false);
      setError('');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordModal) return;

    const ADMIN_PASS = state.adminPassword || 'admin';
    const MIXER_PASS = state.mixerPassword || 'mixer';

    if (showPasswordModal === 'ADMIN' && passwordInput === ADMIN_PASS) {
      onSelect('ADMIN');
      setShowPasswordModal(null);
    } else if (showPasswordModal === 'MIXER' && passwordInput === MIXER_PASS) {
      onSelect('MIXER');
      setShowPasswordModal(null);
    } else {
      setError('Incorrect Password');
    }
  };

  const LogoPlaceholder = () => (
    <div className="w-full h-full bg-church-accent flex items-center justify-center text-white text-4xl font-black">
      {churchName?.charAt(0).toUpperCase() || 'L'}
    </div>
  );

  return (
    <div className="min-h-screen bg-church-900 flex items-center justify-center p-6 relative transition-colors duration-300">
      
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center flex flex-col items-center">
          <div className="w-24 h-24 mb-6 rounded-2xl bg-church-800 border border-church-700 flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-church-accent/20">
             {state.churchLogoUrl ? (
               <img src={state.churchLogoUrl} alt="Church Logo" className="w-full h-full object-cover" onError={(e) => {
                 (e.target as HTMLImageElement).style.display = 'none';
               }} />
             ) : (
               <LogoPlaceholder />
             )}
          </div>
          <h1 className="text-4xl font-bold text-church-main mb-2 tracking-tight">LiveStream</h1>
          <p className="text-[#A5098D] font-medium tracking-wide text-lg">{churchName || 'Production System'}</p>
          <p className="text-church-muted mt-2 text-sm">Select your station to begin.</p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => initiateRoleSelect('MIXER')}
            className="w-full group relative p-6 bg-church-800 border border-church-700 rounded-xl hover:border-church-accent transition-all text-center hover:shadow-lg hover:shadow-church-accent/10"
          >
            <h3 className="text-xl font-bold text-church-main group-hover:text-church-accent">Mixer Control</h3>
            <p className="text-sm text-church-muted mt-1">Monitor all feeds and operator status.</p>
          </button>

          <button
            onClick={() => initiateRoleSelect('CAMERAMAN')}
            className="w-full group relative p-6 bg-church-800 border border-church-700 rounded-xl hover:border-church-accent transition-all text-center hover:shadow-lg hover:shadow-church-accent/10"
          >
            <h3 className="text-xl font-bold text-church-main group-hover:text-church-accent">Cameraman</h3>
            <p className="text-sm text-church-muted mt-1">Manage status, shifts, and readiness.</p>
          </button>

          <button
            onClick={() => initiateRoleSelect('ADMIN')}
            className="w-full group relative p-6 bg-church-800 border border-church-700 rounded-xl hover:border-church-accent transition-all text-center hover:shadow-lg hover:shadow-church-accent/10"
          >
            <h3 className="text-xl font-bold text-church-main group-hover:text-church-accent">Admin</h3>
            <p className="text-sm text-church-muted mt-1">Configure cameras and branding.</p>
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-church-800 p-6 rounded-xl border border-church-700 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-church-main">Enter {showPasswordModal} Password</h3>
            <form onSubmit={handlePasswordSubmit}>
              <input 
                type={showPassword ? "text" : "password"}
                autoFocus
                className="w-full bg-church-900 border border-church-700 rounded-lg p-3 text-church-main focus:ring-2 focus:ring-church-accent outline-none mb-3"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowPasswordModal(null)} className="flex-1 py-2 bg-church-700 rounded-lg text-church-main">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-church-accent rounded-lg font-bold text-white">Login</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};