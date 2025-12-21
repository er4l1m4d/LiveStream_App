import React from 'react';
import { useProduction } from '../context/ProductionContext';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';

export const MixerDashboard: React.FC = () => {
  const { state, setAttention } = useProduction();

  const camerasNeedingAttention = state.cameras.filter(c => c.isAttentionNeeded);

  return (
    <div className="space-y-6">
      
      {/* Attention Alert Bar */}
      {camerasNeedingAttention.length > 0 && (
        <div className="space-y-2 mb-6">
          {camerasNeedingAttention.map(cam => (
            <div key={cam.id} className="flex items-center justify-between bg-status-attention text-white p-4 rounded-xl shadow-lg animate-pulse">
               <div className="flex items-center gap-3">
                 <span className="text-2xl">⚠️</span>
                 <span className="font-bold text-lg">
                   {cam.name} is seeking attention!
                 </span>
               </div>
               <button 
                 onClick={() => setAttention(cam.id, false)}
                 className="bg-white text-status-attention px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-sm"
               >
                 Dismiss
               </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-church-main">Mixer Control Board</h2>
          <p className="text-church-muted text-sm">Monitor operator signals and readiness.</p>
        </div>
        
        {/* Legend */}
        <div className="hidden md:flex gap-4 text-xs bg-church-800 p-3 rounded-lg border border-church-700 shadow-sm text-church-main">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-switch animate-pulse"></span> Switch Now
          </div>
          <div className="flex items-center gap-2">
             <span className="w-3 h-3 rounded-full bg-status-attention animate-ping"></span> Attention
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-ready"></span> Ready
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-hold"></span> Hold
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-notReady"></span> Not Ready
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.cameras.map((cam) => {
          const isSwitchNow = cam.status === 'SWITCH_NOW';
          // Status color is now solely determined by the main status
          const statusColorClass = STATUS_COLORS[cam.status];
          const statusLabel = STATUS_LABELS[cam.status];
          
          // Icon selection based on status
          let icon = '🛑';
          if (cam.status === 'READY') icon = '✅';
          if (cam.status === 'HOLD') icon = '✋';
          if (cam.status === 'SWITCH_NOW') icon = '🎥';

          return (
            <div 
              key={cam.id}
              className={`relative flex flex-col bg-church-800 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                isSwitchNow ? 'border-status-switch shadow-[0_0_30px_rgba(59,130,246,0.4)] scale-[1.02] z-10' : 
                cam.isAttentionNeeded ? 'border-status-attention shadow-[0_0_30px_rgba(244,63,94,0.4)] z-20' :
                cam.status === 'READY' ? 'border-status-ready' : 'border-church-700'
              }`}
            >
              {/* Blinking Attention Overlay */}
              {cam.isAttentionNeeded && (
                <div className="absolute top-2 right-2 z-50 text-3xl animate-bounce filter drop-shadow-md">
                  ⚠️
                </div>
              )}

              {/* Status Signal Area */}
              <div className={`h-40 flex flex-col items-center justify-center ${statusColorClass} transition-colors duration-300 relative overflow-hidden`}>
                {/* Pulse overlay */}
                {isSwitchNow && (
                   <div className="absolute inset-0 bg-white/30 animate-pulse-fast"></div>
                )}
                
                <div className={`text-6xl mb-2 relative z-10 drop-shadow-sm transform transition-transform group-hover:scale-110`}>
                  {icon}
                </div>
                
                <h3 className={`text-3xl font-black uppercase tracking-wider relative z-10 drop-shadow-md ${
                  cam.status === 'HOLD' ? 'text-church-900' : 'text-white'
                }`}>
                  {statusLabel}
                </h3>
              </div>

              {/* Info Panel */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-church-main">{cam.name}</h3>
                    <span className="text-xs font-mono text-church-muted bg-church-900 px-2 py-1 rounded border border-church-700">
                      {cam.type}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <div className="w-8 h-8 rounded-full bg-church-700 flex items-center justify-center text-church-muted mr-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-church-muted text-xs font-bold uppercase">Current Operator</span>
                        <span className="font-medium text-church-main">
                          {cam.currentOperators.length > 0 
                            ? cam.currentOperators.map(op => op.name).join(', ') 
                            : <span className="text-church-muted italic">Unassigned</span>
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shift Indicator */}
                <div className="mt-6 pt-4 border-t border-church-700">
                  <div className="flex justify-between text-xs text-church-muted mb-2">
                    <span className="uppercase tracking-wider">Shift Status</span>
                    {cam.isShiftActive ? (
                      <span className="text-green-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-church-muted">INACTIVE</span>
                    )}
                  </div>
                  {cam.shiftEndTime ? (
                     <div className="w-full bg-church-900 rounded-full h-1.5 overflow-hidden">
                       <div className="bg-church-accent h-full rounded-full w-full" style={{ width: '100%' }}></div>
                     </div>
                  ) : (
                    <div className="w-full bg-church-900 rounded-full h-1.5"></div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {state.cameras.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-church-800 rounded-xl border-2 border-dashed border-church-700">
          <div className="text-4xl mb-4">📹</div>
          <p className="text-church-muted text-lg font-medium">No cameras configured.</p>
          <p className="text-church-muted text-sm mt-1">Ask an Admin to setup devices in the dashboard.</p>
        </div>
      )}
    </div>
  );
};