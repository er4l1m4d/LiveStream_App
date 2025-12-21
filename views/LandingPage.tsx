import React, { useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useProduction } from '../context/ProductionContext';

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-church-accent">
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

export const LandingPage: React.FC = () => {
  const { createChurch, joinChurch } = useProduction();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Form State
  const [churchName, setChurchName] = useState('');
  const [churchId, setChurchId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Success State (New Church Created)
  const [newChurchInfo, setNewChurchInfo] = useState<{name: string, id: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'REGISTER') {
        const result = await createChurch(churchName, password);
        if (!result.success) {
          setError(result.message || 'Registration failed');
        } else if (result.churchId) {
          setNewChurchInfo({ name: churchName, id: result.churchId });
          setChurchName('');
          setPassword('');
        }
      } else {
        const result = await joinChurch(churchId, password);
        if (!result.success) {
          setError(result.message || 'Login failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (newChurchInfo) {
    return (
      <div className="min-h-screen bg-church-900 flex items-center justify-center p-6 transition-colors duration-300">
        <div className="max-w-md w-full bg-church-800 border border-church-700 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-4xl border border-green-500/50">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-church-main mb-2">Church Server Created!</h2>
          <p className="text-church-muted mb-6">Your production team can now join <span className="text-church-main font-bold">{newChurchInfo.name}</span> using this ID:</p>
          
          <div className="bg-church-900 border-2 border-church-accent border-dashed rounded-xl p-6 mb-6">
            <p className="text-xs text-church-muted uppercase font-bold tracking-widest mb-1">CHURCH ID</p>
            <p className="text-4xl font-mono font-bold text-church-main tracking-widest select-all uppercase">{newChurchInfo.id}</p>
          </div>

          <p className="text-sm text-church-muted mb-8">
            Share this <strong>Church ID</strong> and your <strong>Shared Password</strong> with your mixers and cameramen.
          </p>

          <button 
            onClick={() => {
              setNewChurchInfo(null);
              setMode('LOGIN');
              setChurchId(newChurchInfo.id);
            }}
            className="w-full bg-church-accent hover:bg-church-accent-hover text-white font-bold py-3 rounded-xl transition-all shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-church-900 flex items-center justify-center p-6 relative transition-colors duration-300">
      
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full">
        {/* Header - No church name or logo until logged in */}
        <div className="text-center flex flex-col items-center mb-10">
          <div className="w-24 h-24 mb-6 rounded-2xl bg-church-800 border border-church-700 flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-church-accent/20">
             <CameraIcon />
          </div>
          <h1 className="text-4xl font-bold text-church-main mb-2 tracking-tight">LiveStream</h1>
          <p className="text-[#A5098D] font-medium tracking-wide">Multi-Church Production Hub</p>
        </div>

        {/* Card */}
        <div className="bg-church-800 border border-church-700 rounded-2xl p-6 md:p-8 shadow-2xl">
          
          <div className="flex bg-church-900 rounded-lg p-1 mb-6">
            <button 
              onClick={() => { setMode('LOGIN'); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'LOGIN' ? 'bg-church-700 text-white shadow' : 'text-church-muted hover:text-white'}`}
            >
              Enter Church ID
            </button>
            <button 
              onClick={() => { setMode('REGISTER'); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'REGISTER' ? 'bg-church-700 text-white shadow' : 'text-church-muted hover:text-white'}`}
            >
              New Church
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'REGISTER' ? (
              <div>
                <label className="block text-xs font-bold text-church-muted uppercase tracking-wider mb-2">Church Name</label>
                <input 
                  type="text" 
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  placeholder="e.g. Grace Community"
                  className="w-full bg-church-900 border border-church-700 rounded-lg p-3 text-church-main focus:ring-2 focus:ring-church-accent outline-none transition-all"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-church-muted uppercase tracking-wider mb-2">Church ID</label>
                <input 
                  type="text" 
                  value={churchId}
                  onChange={(e) => setChurchId(e.target.value.toUpperCase())}
                  placeholder="e.g. X7K9P2"
                  className="w-full bg-church-900 border border-church-700 rounded-lg p-3 text-church-main focus:ring-2 focus:ring-church-accent outline-none font-mono uppercase tracking-widest"
                  maxLength={10}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-church-muted uppercase tracking-wider mb-2">
                {mode === 'REGISTER' ? 'Create Shared Password' : 'Shared Password'}
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-church-900 border border-church-700 rounded-lg p-3 text-church-main focus:ring-2 focus:ring-church-accent outline-none transition-all"
                required
              />
              {mode === 'REGISTER' && (
                <p className="text-xs text-church-muted mt-2">
                  Share this password with your workers so they can join your server.
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-church-accent hover:bg-church-accent-hover text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-church-accent/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? 'Processing...' : (mode === 'REGISTER' ? 'Generate Church ID' : 'Connect to Server')}
            </button>
          </form>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-xs text-church-muted">Cloud Management v2.2</p>
        </div>
      </div>
    </div>
  );
};