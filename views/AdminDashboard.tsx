import React, { useState } from 'react';
import { useProduction } from '../context/ProductionContext';
import { TimerDisplay } from '../components/TimerDisplay';
import { Camera } from '../types';

export const AdminDashboard: React.FC = () => {
  const { state, addCamera, startShift, endShift, togglePauseShift, kickOperators, updateCameraConfig, addSavedCode, deleteSavedCode, updateAdminPassword, updateMixerPassword, updateChurchBranding, isCloudConnected } = useProduction();
  
  // Branding State
  const [editChurchName, setEditChurchName] = useState(state.churchName || '');
  const [editLogoUrl, setEditLogoUrl] = useState(state.churchLogoUrl || '');

  // Setup State
  const [newCamName, setNewCamName] = useState('');
  const [newCamType, setNewCamType] = useState<'SINGLE' | 'DUAL'>('SINGLE');
  const [newCamDuration, setNewCamDuration] = useState(45);
  const [newCamCode, setNewCamCode] = useState('');

  // Preset State
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetCode, setNewPresetCode] = useState('');

  // Security State
  const [oldAdminPass, setOldAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [oldMixerPass, setOldMixerPass] = useState('');
  const [newMixerPass, setNewMixerPass] = useState('');
  const [adminPassMsg, setAdminPassMsg] = useState({ text: '', type: '' });
  const [mixerPassMsg, setMixerPassMsg] = useState({ text: '', type: '' });
  
  // Password Visibility State
  const [showPass, setShowPass] = useState({
    oldAdmin: false,
    newAdmin: false,
    oldMixer: false,
    newMixer: false
  });

  const [confirmDismissCam, setConfirmDismissCam] = useState<Camera | null>(null);

  const togglePass = (key: keyof typeof showPass) => {
    setShowPass(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCamName && newCamCode) {
      addCamera(newCamName, newCamType, newCamDuration, newCamCode);
      setNewCamName('');
      setNewCamCode('');
    }
  };

  const handleUpdateBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateChurchBranding(editChurchName, editLogoUrl);
    alert("Branding updated successfully!");
  };

  const handleAddPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPresetLabel && newPresetCode) {
      addSavedCode(newPresetLabel, newPresetCode);
      setNewPresetLabel('');
      setNewPresetCode('');
    }
  };

  const handleUpdateAdminPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPass.length < 4) {
      setAdminPassMsg({ text: 'Password too short', type: 'error' });
      return;
    }
    const success = updateAdminPassword(oldAdminPass, newAdminPass);
    if (success) {
      setOldAdminPass('');
      setNewAdminPass('');
      setAdminPassMsg({ text: 'Admin password updated!', type: 'success' });
      setTimeout(() => setAdminPassMsg({ text: '', type: '' }), 3000);
    } else {
      setAdminPassMsg({ text: 'Incorrect old password', type: 'error' });
    }
  };

  const handleUpdateMixerPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMixerPass.length < 4) {
      setMixerPassMsg({ text: 'Password too short', type: 'error' });
      return;
    }
    const success = updateMixerPassword(oldMixerPass, newMixerPass);
    if (success) {
      setOldMixerPass('');
      setNewMixerPass('');
      setMixerPassMsg({ text: 'Mixer password updated!', type: 'success' });
      setTimeout(() => setMixerPassMsg({ text: '', type: '' }), 3000);
    } else {
      setMixerPassMsg({ text: 'Incorrect old password', type: 'error' });
    }
  };

  const initiateDismiss = (cam: Camera) => {
    setConfirmDismissCam(cam);
  };

  const executeDismiss = () => {
    if (confirmDismissCam) {
      kickOperators(confirmDismissCam.id);
      setConfirmDismissCam(null);
    }
  };

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  const renderCameraStatus = (cam: Camera) => (
    <div className="flex flex-col gap-1">
      {cam.isShiftActive ? (
        <div className={`flex items-center gap-2 font-bold ${cam.isPaused ? 'text-orange-400' : 'text-green-400'}`}>
          {cam.isPaused ? <span className="text-xl">⏸</span> : <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
          <TimerDisplay endTime={cam.shiftEndTime} isPaused={cam.isPaused} pausedRemaining={cam.pausedRemainingTime} compact />
        </div>
      ) : (
        <span className="text-church-muted text-sm">Shift Inactive</span>
      )}
      <div className="text-xs flex items-center gap-1">
        <span className="text-church-muted">Ops:</span>
        {cam.currentOperators.length > 0 ? (
          <span className="text-church-main font-medium">{cam.currentOperators.map(o => o.name).join(', ')}</span>
        ) : (
          <span className="text-church-muted italic bg-church-900/50 px-1.5 rounded">None</span>
        )}
      </div>
    </div>
  );

  const renderCameraActions = (cam: Camera) => (
    <div className="flex flex-wrap justify-end gap-2">
      {!cam.isShiftActive ? (
        <button onClick={() => startShift(cam.id)} className="flex-1 sm:flex-none px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold shadow-lg shadow-green-900/20 whitespace-nowrap">START SHIFT</button>
      ) : (
        <>
          <button onClick={() => togglePauseShift(cam.id)} className={`flex-1 sm:flex-none px-3 py-1.5 border rounded text-xs font-bold whitespace-nowrap ${cam.isPaused ? 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white' : 'bg-church-800 hover:bg-church-700 border-gray-600 text-church-muted'}`}>
            {cam.isPaused ? 'RESUME' : 'PAUSE'}
          </button>
          <button onClick={() => endShift(cam.id)} className="flex-1 sm:flex-none px-3 py-1.5 bg-church-700 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600 rounded text-xs font-bold whitespace-nowrap">STOP</button>
        </>
      )}
      <button onClick={() => initiateDismiss(cam)} className="flex-1 sm:flex-none px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shadow-sm transition-colors whitespace-nowrap">Dismiss Ops</button>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          {!isCloudConnected && (
             <div className="bg-orange-600/20 border border-orange-600/50 text-orange-200 p-4 rounded-xl flex items-center gap-3">
               <span className="text-2xl">⚠️</span>
               <div>
                 <h3 className="font-bold">Cloud Sync Disconnected</h3>
                 <p className="text-xs opacity-80">Changes are only saved to this device. Please check Supabase credentials.</p>
               </div>
             </div>
          )}

          {/* Church Branding Section */}
          <div className="bg-church-800 rounded-xl p-6 border border-church-700 shadow-lg">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-church-main">
              <span>🏛️</span> Church Branding
            </h2>
            <form onSubmit={handleUpdateBranding} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-church-muted block mb-1">Church Name</label>
                <input 
                  type="text" 
                  value={editChurchName}
                  onChange={(e) => setEditChurchName(e.target.value)}
                  placeholder="e.g. Grace Community"
                  className="w-full bg-church-900 border border-church-700 rounded-lg p-3 text-sm text-church-main focus:border-church-accent outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-church-muted block mb-1">Logo URL</label>
                <input 
                  type="text" 
                  value={editLogoUrl}
                  onChange={(e) => setEditLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-church-900 border border-church-700 rounded-lg p-3 text-sm text-church-main focus:border-church-accent outline-none"
                />
              </div>
              <button type="submit" className="md:col-span-2 bg-church-accent hover:bg-church-accent-hover text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
                Save Branding Changes
              </button>
            </form>
          </div>

          <div className="bg-church-800 rounded-xl p-4 md:p-6 border border-church-700 shadow-lg">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-church-main"><span>📷</span> Camera Configuration</h2>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-church-700 text-church-muted text-sm">
                    <th className="pb-4 pl-2 font-medium">Camera Name</th>
                    <th className="pb-4 font-medium">Status / Ops</th>
                    <th className="pb-4 font-medium text-center">Default Timer</th>
                    <th className="pb-4 font-medium text-center">Access Code</th>
                    <th className="pb-4 font-medium text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-church-700">
                  {state.cameras.map(cam => (
                    <tr key={cam.id} className="group hover:bg-church-700/30 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="font-bold text-church-main">{cam.name}</div>
                        <span className="text-xs bg-church-900 text-church-muted px-2 py-0.5 rounded border border-church-700">{cam.type} Station</span>
                      </td>
                      <td className="py-4 text-sm">{renderCameraStatus(cam)}</td>
                      <td className="py-4 text-center">
                        <input type="number" className="w-16 bg-church-900 border border-church-700 rounded p-1 text-center text-sm text-church-main" value={cam.defaultShiftDuration} onChange={(e) => updateCameraConfig(cam.id, { defaultShiftDuration: Number(e.target.value) })} />
                      </td>
                      <td className="py-4 text-center">
                        <input type="text" className="w-24 bg-church-900 border border-church-700 rounded p-1 text-center text-sm font-mono text-church-main" value={cam.accessCode} onChange={(e) => updateCameraConfig(cam.id, { accessCode: e.target.value })} />
                      </td>
                      <td className="py-4 text-right pr-2">{renderCameraActions(cam)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Camera Cards */}
            <div className="md:hidden space-y-4">
              {state.cameras.map(cam => (
                <div key={cam.id} className="bg-church-900 rounded-lg p-4 border border-church-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-church-main text-lg">{cam.name}</h3>
                      <span className="text-xs bg-church-800 text-church-muted px-2 py-1 rounded border border-church-600">{cam.type} Station</span>
                    </div>
                    <div className="text-right">
                      {renderCameraActions(cam)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-church-muted mb-1">Status</div>
                      {renderCameraStatus(cam)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-church-muted block mb-1">Default Timer</label>
                        <input 
                          type="number" 
                          className="w-full bg-church-800 border border-church-600 rounded p-2 text-center text-sm text-church-main" 
                          value={cam.defaultShiftDuration} 
                          onChange={(e) => updateCameraConfig(cam.id, { defaultShiftDuration: Number(e.target.value) })} 
                        />
                      </div>
                      <div>
                        <label className="text-xs text-church-muted block mb-1">Access Code</label>
                        <input 
                          type="text" 
                          className="w-full bg-church-800 border border-church-600 rounded p-2 text-center text-sm font-mono text-church-main" 
                          value={cam.accessCode} 
                          onChange={(e) => updateCameraConfig(cam.id, { accessCode: e.target.value })} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-church-800 rounded-xl p-6 border border-church-700">
            <h3 className="font-bold text-church-main mb-4">Add New Device</h3>
            <form onSubmit={handleAddCamera} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <input type="text" placeholder="e.g. Balcony Cam" value={newCamName} onChange={(e) => setNewCamName(e.target.value)} className="w-full bg-church-900 border border-church-700 rounded-lg p-2.5 text-sm text-church-main" required />
              </div>
              <select value={newCamType} onChange={(e) => setNewCamType(e.target.value as 'SINGLE' | 'DUAL')} className="w-full bg-church-900 border border-church-700 rounded-lg p-2.5 text-sm text-church-main">
                <option value="SINGLE">Single Op</option>
                <option value="DUAL">Dual Op</option>
              </select>
              <input type="number" value={newCamDuration} onChange={(e) => setNewCamDuration(Number(e.target.value))} className="w-full bg-church-900 border border-church-700 rounded-lg p-2.5 text-sm text-church-main" />
              <input type="text" value={newCamCode} onChange={(e) => setNewCamCode(e.target.value)} className="w-full bg-church-900 border border-church-700 rounded-lg p-2.5 text-sm text-church-main" placeholder="1234" required />
              <button type="submit" className="md:col-span-5 bg-church-accent hover:bg-church-accent-hover text-white font-bold py-2.5 rounded-lg text-sm mt-2 transition-colors">Add Camera</button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-church-800 rounded-xl p-6 border border-church-700">
            <h3 className="font-bold text-church-main mb-4 flex items-center gap-2"><span>🛡️</span> Security Settings</h3>
            <div className="space-y-6">
                <form onSubmit={handleUpdateAdminPass} className="space-y-2 pb-4 border-b border-church-700">
                    <input type={showPass.oldAdmin ? "text" : "password"} placeholder="Current Admin Password" value={oldAdminPass} onChange={(e) => setOldAdminPass(e.target.value)} className="w-full bg-church-900 border border-church-700 rounded-lg p-2.5 text-sm text-church-main" required />
                    <input type={showPass.newAdmin ? "text" : "password"} placeholder="New Admin Password" value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)} className="w-full bg-church-900 border border-church-700 rounded-lg p-2.5 text-sm text-church-main" required />
                    <button type="submit" className="w-full bg-church-accent hover:bg-church-accent-hover text-white font-bold py-2 rounded-lg text-sm">Update Admin Password</button>
                </form>
                <form onSubmit={handleUpdateMixerPass} className="space-y-2">
                    <input type={showPass.oldMixer ? "text" : "password"} placeholder="Current Mixer Password" value={oldMixerPass} onChange={(e) => setOldMixerPass(e.target.value)} className="w-full bg-church-900 border border-church-700 rounded-lg p-2.5 text-sm text-church-main" required />
                    <input type={showPass.newMixer ? "text" : "password"} placeholder="New Mixer Password" value={newMixerPass} onChange={(e) => setNewMixerPass(e.target.value)} className="w-full bg-church-900 border border-church-700 rounded-lg p-2.5 text-sm text-church-main" required />
                    <button type="submit" className="w-full bg-church-accent hover:bg-church-accent-hover text-white font-bold py-2 rounded-lg text-sm">Update Mixer Password</button>
                </form>
            </div>
          </div>
          <div className="bg-church-800 rounded-xl p-6 border border-church-700 h-[300px] flex flex-col">
            <h2 className="text-sm font-bold mb-3 uppercase tracking-wide text-church-muted">System Log</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {state.logs.map(log => (
                <div key={log.id} className="text-xs border-l-2 border-church-700 pl-2 py-0.5">
                  <span className="text-church-muted mr-2">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <span className={`${log.type === 'ALERT' ? 'text-red-400 font-bold' : log.type === 'STATUS_CHANGE' ? 'text-church-accent' : 'text-church-main'}`}>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {confirmDismissCam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-church-800 border border-church-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-church-main mb-2">Confirm Dismissal</h3>
            <p className="text-church-muted mb-6">Dismiss operators from <span className="text-white font-bold">{confirmDismissCam.name}</span>?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDismissCam(null)} className="px-4 py-2 rounded-lg bg-church-700 text-church-muted font-bold">Cancel</button>
              <button onClick={executeDismiss} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold">Yes, Dismiss Ops</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};