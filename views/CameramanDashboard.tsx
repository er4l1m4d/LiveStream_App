import React, { useState, useEffect } from 'react';
import { useProduction } from '../context/ProductionContext';
import { CameraStatus } from '../types';
import { TimerDisplay } from '../components/TimerDisplay';

export const CameramanDashboard: React.FC = () => {
  const { state, assignOperator, updateCameraStatus, setAttention } = useProduction();
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [operatorName, setOperatorName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isValidatingLogin, setIsValidatingLogin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedCamera = state.cameras.find(c => c.id === selectedCameraId);

  // Login Validation & Kick Detection Logic
  useEffect(() => {
    // If no camera selected, we don't need to check status
    if (!selectedCameraId) return;
    
    const cam = state.cameras.find(c => c.id === selectedCameraId);
    
    // If camera was deleted by admin while logged in
    if (!cam) {
      if (isLoggedIn) {
        setIsLoggedIn(false);
        setIsValidatingLogin(false);
        setOperatorName('');
        setAccessCode('');
        setSelectedCameraId(null);
        alert("Station configuration removed.");
      }
      return;
    }

    const isUserInList = cam.currentOperators.some(op => op.name === operatorName);

    // 1. Validate Login: Wait for global state to update with new operator
    if (isValidatingLogin) {
      if (isUserInList) {
        setIsLoggedIn(true);
        setIsValidatingLogin(false);
      }
      // We continue waiting if not in list yet (state propagation delay)
    } 
    // 2. Monitor Session: Check if removed (Kicked)
    else if (isLoggedIn) {
      if (!isUserInList) {
        setIsLoggedIn(false);
        setOperatorName('');
        setAccessCode('');
        setSelectedCameraId(null);
        alert("Session ended by Administrator.");
      }
    }
  }, [state.cameras, isLoggedIn, isValidatingLogin, selectedCameraId, operatorName]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (selectedCameraId && operatorName && accessCode) {
      const cam = state.cameras.find(c => c.id === selectedCameraId);
      
      if (!cam) return;
      
      // UX: Validate access code locally first for better error message
      if (cam.accessCode !== accessCode) {
        setErrorMsg("Invalid Access Code.");
        return;
      }

      const success = assignOperator(selectedCameraId, operatorName, accessCode);
      
      if (success) {
        setIsValidatingLogin(true);
      } else {
        setErrorMsg("Station is full or system error.");
      }
    }
  };

  const handleStatusChange = (status: CameraStatus) => {
    if (selectedCameraId) {
      updateCameraStatus(selectedCameraId, status);
    }
  };

  const toggleAttention = () => {
    if (selectedCameraId && selectedCamera) {
      setAttention(selectedCameraId, !selectedCamera.isAttentionNeeded);
    }
  };

  // Login View
  if (!isLoggedIn && !isValidatingLogin) {
    return (
      <div className="max-w-md mx-auto mt-6 md:mt-10 p-6 md:p-8 bg-church-800 rounded-2xl border border-church-700 shadow-2xl">
        <h2 className="text-3xl font-bold mb-2 text-church-main">Operator Login</h2>
        <p className="text-church-muted mb-8 text-sm">Enter your credentials to access the station.</p>
        
        {errorMsg && (
          <div className="bg-red-900/50 border border-red-900 text-red-200 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-church-muted uppercase tracking-wider mb-2">Select Position</label>
            <select 
              className="w-full bg-church-900 border border-church-700 rounded-lg p-4 text-church-main focus:ring-2 focus:ring-church-accent outline-none appearance-none"
              value={selectedCameraId || ''}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              required
            >
              <option value="">-- Choose Camera --</option>
              {state.cameras.map(cam => {
                const isFull = (cam.type === 'SINGLE' && cam.currentOperators.length >= 1) || (cam.type === 'DUAL' && cam.currentOperators.length >= 2);
                return (
                  <option key={cam.id} value={cam.id} disabled={isFull}>
                    {cam.name} {isFull ? '(FULL)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-church-muted uppercase tracking-wider mb-2">Operator Name</label>
            <input 
              type="text" 
              className="w-full bg-church-900 border border-church-700 rounded-lg p-4 text-church-main focus:ring-2 focus:ring-church-accent outline-none"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-church-muted uppercase tracking-wider mb-2">Access Code</label>
            <input 
              type="password" 
              className="w-full bg-church-900 border border-church-700 rounded-lg p-4 text-church-main focus:ring-2 focus:ring-church-accent outline-none font-mono tracking-widest"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-church-accent hover:bg-church-accent-hover text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-900/20"
          >
            Authenticate
          </button>
        </form>
      </div>
    );
  }

  // Loading / Validating State
  if (isValidatingLogin) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <div className="w-12 h-12 border-4 border-church-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-xl font-bold text-church-main">Logging in...</h3>
        <p className="text-church-muted text-sm">Synchronizing with production control.</p>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top Bar Status */}
      <div className="bg-church-800 p-4 rounded-xl border border-church-700 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-church-main">{selectedCamera?.name}</h2>
          <div className="flex items-center gap-2 text-sm text-church-muted">
             <span className={`w-2 h-2 rounded-full ${selectedCamera?.isPaused ? 'bg-orange-400' : 'bg-green-500'}`}></span>
             Operator: <span className="text-church-main font-medium">{operatorName}</span>
          </div>
        </div>
        <div className="w-full sm:w-auto flex justify-between sm:block text-right">
          <p className="text-xs text-church-muted uppercase tracking-wide font-bold mb-1">Shift Timer</p>
          <TimerDisplay 
            endTime={selectedCamera?.shiftEndTime || null} 
            isPaused={selectedCamera?.isPaused}
            pausedRemaining={selectedCamera?.pausedRemainingTime}
            onExpire={() => alert("Shift Ended! Please switch operators.")}
          />
        </div>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        {/* Not Ready */}
        <button
          onClick={() => handleStatusChange('NOT_READY')}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all transform active:scale-95 ${
            selectedCamera?.status === 'NOT_READY' 
              ? 'bg-status-notReady text-white ring-4 ring-white/20 shadow-xl shadow-red-900/30' 
              : 'bg-church-800 border-2 border-status-notReady text-status-notReady hover:bg-status-notReady/10'
          }`}
        >
          <div className="text-5xl mb-2 filter drop-shadow-md">🛑</div>
          <span className="text-2xl font-bold">NOT READY</span>
        </button>

        {/* Ready */}
        <button
          onClick={() => handleStatusChange('READY')}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all transform active:scale-95 ${
            selectedCamera?.status === 'READY' 
              ? 'bg-status-ready text-white ring-4 ring-white/20 shadow-xl shadow-green-900/30' 
              : 'bg-church-800 border-2 border-status-ready text-status-ready hover:bg-status-ready/10'
          }`}
        >
          <div className="text-5xl mb-2 filter drop-shadow-md">✅</div>
          <span className="text-2xl font-bold">READY</span>
        </button>

        {/* Hold */}
        <button
          onClick={() => handleStatusChange('HOLD')}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all transform active:scale-95 ${
            selectedCamera?.status === 'HOLD' 
              ? 'bg-status-hold text-black ring-4 ring-white/20 shadow-xl shadow-orange-900/30' 
              : 'bg-church-800 border-2 border-status-hold text-status-hold hover:bg-status-hold/10'
          }`}
        >
          <div className="text-5xl mb-2 filter drop-shadow-md">✋</div>
          <span className="text-2xl font-bold">HOLD</span>
          <span className="text-sm opacity-75 font-medium">Getting shot ready...</span>
        </button>

        {/* Switch Now */}
        <button
          onClick={() => handleStatusChange('SWITCH_NOW')}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all transform active:scale-95 ${
            selectedCamera?.status === 'SWITCH_NOW' 
              ? 'bg-status-switch text-white ring-4 ring-white/20 animate-pulse shadow-xl shadow-blue-900/30' 
              : 'bg-church-800 border-2 border-status-switch text-status-switch hover:bg-status-switch/10'
          }`}
        >
          <div className="text-5xl mb-2 filter drop-shadow-md">🎥</div>
          <span className="text-2xl font-bold">SWITCH NOW</span>
          <span className="text-sm opacity-75 font-medium">Great shot active!</span>
        </button>
      </div>

      {/* Footer Controls */}
      <div className="mt-4">
        <button 
           onClick={toggleAttention}
           className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${
             selectedCamera?.isAttentionNeeded
             ? 'bg-status-attention animate-pulse ring-4 ring-rose-500/30 text-white shadow-lg shadow-rose-900/20' 
             : 'bg-church-700 hover:bg-church-600 text-white shadow-md'
           }`}
        >
          {selectedCamera?.isAttentionNeeded ? '⚠️ Signal Sent!' : '⚠️ Attention Needed'}
        </button>
      </div>
    </div>
  );
};