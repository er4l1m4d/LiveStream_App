import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState, Camera, CameraStatus, LogEntry, Operator, SavedCode } from '../types';
import { INITIAL_CAMERAS } from '../constants';
import { supabase } from '../supabaseClient';

interface ProductionContextType {
  state: AppState;
  churchSlug: string | null;
  churchName: string | null;
  isLoading: boolean;
  joinChurch: (slug: string, password: string) => Promise<{ success: boolean; message?: string }>;
  createChurch: (name: string, password: string) => Promise<{ success: boolean; message?: string; churchId?: string }>;
  logoutChurch: () => void;
  
  // Actions
  updateCameraStatus: (cameraId: string, status: CameraStatus) => void;
  assignOperator: (cameraId: string, operatorName: string, accessCode: string) => Promise<boolean>;
  removeOperator: (cameraId: string, operatorId: string) => void;
  startShift: (cameraId: string) => void;
  endShift: (cameraId: string) => void;
  togglePauseShift: (cameraId: string) => void;
  extendShift: (cameraId: string, minutes: number) => void;
  kickOperators: (cameraId: string) => void;
  setAttention: (cameraId: string, isNeeded: boolean) => void;
  addCamera: (name: string, type: 'SINGLE' | 'DUAL', duration: number, code: string) => void;
  updateCameraConfig: (cameraId: string, updates: Partial<Camera>) => void;
  addSavedCode: (label: string, code: string) => void;
  deleteSavedCode: (id: string) => void;
  updateAdminPassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  updateMixerPassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  updateChurchBranding: (name: string, logoUrl: string) => void;
  isCloudConnected: boolean;
}

const ProductionContext = createContext<ProductionContextType | undefined>(undefined);

export const ProductionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    cameras: [],
    savedCodes: [],
    logs: [],
    adminPassword: '',
    mixerPassword: '',
    churchName: '',
    churchLogoUrl: ''
  });
  const [churchSlug, setChurchSlug] = useState<string | null>(null);
  const [churchName, setChurchName] = useState<string | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Session Restore
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        } else {
          // Don't force anonymous auth - let the app work without authentication
          console.log('No user session found - app will work without auth');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }

      const storedSlug = localStorage.getItem('dcn_active_church_slug');
      if (storedSlug) {
        setChurchSlug(storedSlug);
      }
    };

    initAuth();
  }, []);

  // 2. Real-time Synchronization Listeners
  useEffect(() => {
    if (!churchSlug) {
      setIsCloudConnected(false);
      return;
    }

    setIsCloudConnected(true);

    const fetchData = async () => {
      // Fetch Church Data
      const { data: church } = await supabase.from('churches').select('*').eq('id', churchSlug).single();
      if (church) {
        setChurchName(church.name);
        setState(prev => ({
          ...prev,
          churchName: church.name,
          churchLogoUrl: church.logo_url,
          adminPassword: church.admin_password,
          mixerPassword: church.mixer_password,
        }));
      }

      // Fetch Cameras
      const { data: cameras } = await supabase.from('cameras').select('*').eq('church_id', churchSlug);
      if (cameras) {
        const mappedCameras = cameras.map(cam => ({
          ...cam,
          accessCode: cam.access_code,
          currentOperators: cam.current_operators || [],
          defaultShiftDuration: cam.default_shift_duration,
          isAttentionNeeded: cam.is_attention_needed,
          isPaused: cam.is_paused,
          isShiftActive: cam.is_shift_active,
          pausedRemainingTime: cam.paused_remaining_time,
          shiftEndTime: cam.shift_end_time
        }));
        setState(prev => ({ ...prev, cameras: mappedCameras.sort((a, b) => a.name.localeCompare(b.name)) }));
      }

      // Fetch Logs
      const { data: logs } = await supabase.from('logs').select('*').eq('church_id', churchSlug).order('created_at', { ascending: false }).limit(50);
      if (logs) {
        setState(prev => ({ ...prev, logs: logs.map(l => ({ id: l.id, timestamp: new Date(l.created_at).getTime(), message: l.message, type: l.type })) }));
      }

      // Fetch Saved Codes
      const { data: codes } = await supabase.from('saved_codes').select('*').eq('church_id', churchSlug);
      if (codes) {
        setState(prev => ({ ...prev, savedCodes: codes }));
      }
    };

    fetchData();

    // Setup Realtime Subscriptions
    const channel = supabase.channel(`church_${churchSlug}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'churches', filter: `id=eq.${churchSlug}` }, payload => {
        if (payload.eventType === 'UPDATE') {
          const updated = payload.new;
          setChurchName(updated.name);
          setState(prev => ({
            ...prev,
            churchName: updated.name,
            churchLogoUrl: updated.logo_url,
            adminPassword: updated.admin_password,
            mixerPassword: updated.mixer_password,
          }));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cameras', filter: `church_id=eq.${churchSlug}` }, payload => {
        fetchData(); // Refresh cameras list on any change
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'logs', filter: `church_id=eq.${churchSlug}` }, payload => {
        const newLog = payload.new;
        setState(prev => ({
          ...prev,
          logs: [{ id: newLog.id, timestamp: new Date(newLog.created_at).getTime(), message: newLog.message, type: newLog.type }, ...prev.logs].slice(0, 50)
        }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saved_codes', filter: `church_id=eq.${churchSlug}` }, payload => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [churchSlug]);

  const writeLog = async (message: string, type: LogEntry['type'] = 'INFO') => {
    if (!churchSlug) return;
    await supabase.from('logs').insert({
      church_id: churchSlug,
      message,
      type
    });
  };

  const createChurch = async (name: string, password: string) => {
    try {
      // Generate shorter church ID: first letter + 5 random numbers
      const firstLetter = name.charAt(0).toUpperCase();
      const randomNumbers = Math.floor(10000 + Math.random() * 90000); // 5-digit number
      let churchId = `${firstLetter}${randomNumbers}`;

      // Check if ID already exists (very unlikely but just in case)
      const { data: existingChurch } = await supabase.from('churches').select('id').eq('id', churchId).single();
      if (existingChurch) {
        // If by some chance it exists, generate another one
        const newRandomNumbers = Math.floor(10000 + Math.random() * 90000);
        churchId = `${firstLetter}${newRandomNumbers}`;
      }

      const { data: churchData, error: churchError } = await supabase.from('churches').insert({
        id: churchId,
        name,
        shared_password: password,
        admin_password: 'admin',
        mixer_password: 'mixer',
        logo_url: ''
      }).select().single();

      if (churchError) throw churchError;

      // Initial Cameras
      const camsToInsert = INITIAL_CAMERAS.map(({ 
        id, 
        accessCode, 
        currentOperators, 
        defaultShiftDuration, 
        isAttentionNeeded,
        isPaused,
        isShiftActive,
        pausedRemainingTime,
        shiftEndTime,
        ...rest 
      }) => ({
        ...rest,
        church_id: churchId,
        access_code: accessCode,
        current_operators: currentOperators,
        default_shift_duration: defaultShiftDuration,
        is_attention_needed: isAttentionNeeded,
        is_paused: isPaused,
        is_shift_active: isShiftActive,
        paused_remaining_time: pausedRemainingTime,
        shift_end_time: shiftEndTime
      }));
      
      const { error: camError } = await supabase.from('cameras').insert(camsToInsert);
      if (camError) throw camError;

      await writeLog(`Church ${name} production server initialized`, 'INFO');

      return { success: true, churchId };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const joinChurch = async (slugInput: string, passwordInput: string) => {
    const formattedId = slugInput.trim().toUpperCase();
    try {
      const { data, error } = await supabase.from('churches').select('*').eq('id', formattedId).single();
      if (error || !data) return { success: false, message: 'Church ID not found.' };
      if (data.shared_password !== passwordInput) return { success: false, message: 'Incorrect password.' };

      setChurchSlug(formattedId);
      localStorage.setItem('dcn_active_church_slug', formattedId);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const logoutChurch = () => {
    setChurchSlug(null);
    setChurchName(null);
    localStorage.removeItem('dcn_active_church_slug');
  };

  const updateCameraStatus = async (cameraId: string, status: CameraStatus) => {
    if (!churchSlug) return;
    const cam = state.cameras.find(c => c.id === cameraId);
    if (!cam) return;

    await supabase.from('cameras').update({ status }).eq('id', cameraId);
    await writeLog(`${cam.name} status: ${status}`, status === 'SWITCH_NOW' ? 'ALERT' : 'STATUS_CHANGE');
  };

  const setAttention = async (cameraId: string, isNeeded: boolean) => {
    if (!churchSlug) return;
    const cam = state.cameras.find(c => c.id === cameraId);
    if (!cam) return;

    await supabase.from('cameras').update({ is_attention_needed: isNeeded }).eq('id', cameraId);
    await writeLog(`${cam.name} ${isNeeded ? 'requests attention' : 'cleared attention'}`, isNeeded ? 'ALERT' : 'INFO');
  };

  const assignOperator = async (cameraId: string, operatorName: string, accessCode: string): Promise<boolean> => {
    if (!churchSlug) return false;
    const cam = state.cameras.find(c => c.id === cameraId);
    if (!cam || cam.accessCode !== accessCode) return false;

    const currentOperators = cam.currentOperators || [];
    const isFull = (cam.type === 'SINGLE' && currentOperators.length >= 1) || (cam.type === 'DUAL' && currentOperators.length >= 2);
    if (isFull) return false;

    const newOp: Operator = { id: userId || Date.now().toString(), name: operatorName };
    await supabase.from('cameras').update({
      currentOperators: [...currentOperators, newOp]
    }).eq('id', cameraId);
    
    await writeLog(`${operatorName} joined ${cam.name}`);
    return true;
  };

  const removeOperator = async (cameraId: string, operatorId: string) => {
    if (!churchSlug) return;
    const cam = state.cameras.find(c => c.id === cameraId);
    if (!cam) return;

    const op = cam.currentOperators.find(o => o.id === operatorId);
    await supabase.from('cameras').update({
      currentOperators: cam.currentOperators.filter(o => o.id !== operatorId)
    }).eq('id', cameraId);
    
    if (op) await writeLog(`${op.name} left ${cam.name}`);
  };

  const startShift = async (cameraId: string) => {
    if (!churchSlug) return;
    const cam = state.cameras.find(c => c.id === cameraId);
    if (!cam) return;

    const endTime = Date.now() + (cam.defaultShiftDuration * 60 * 1000);
    await supabase.from('cameras').update({
      is_shift_active: true,
      shift_end_time: endTime,
      is_paused: false,
      paused_remaining_time: null
    }).eq('id', cameraId);
    await writeLog(`Shift started for ${cam.name}`);
  };

  const endShift = async (cameraId: string) => {
    if (!churchSlug) return;
    await supabase.from('cameras').update({
      is_shift_active: false,
      shift_end_time: null,
      is_paused: false,
      paused_remaining_time: null
    }).eq('id', cameraId);
    await writeLog(`Shift ended for ${cameraId}`, 'ALERT');
  };

  const togglePauseShift = async (cameraId: string) => {
    if (!churchSlug) return;
    const cam = state.cameras.find(c => c.id === cameraId);
    if (!cam || !cam.isShiftActive) return;

    if (!cam.isPaused) {
      const remaining = cam.shiftEndTime ? Math.max(0, cam.shiftEndTime - Date.now()) : 0;
      await supabase.from('cameras').update({
        is_paused: true,
        shift_end_time: null,
        paused_remaining_time: remaining
      }).eq('id', cameraId);
      await writeLog(`Shift paused for ${cam.name}`);
    } else {
      const remaining = cam.pausedRemainingTime || 0;
      await supabase.from('cameras').update({
        is_paused: false,
        shift_end_time: Date.now() + remaining,
        paused_remaining_time: null
      }).eq('id', cameraId);
      await writeLog(`Shift resumed for ${cam.name}`);
    }
  };

  const extendShift = async (cameraId: string, minutes: number) => {
    if (!churchSlug) return;
    const cam = state.cameras.find(c => c.id === cameraId);
    if (!cam) return;
    const ms = minutes * 60 * 1000;

    if (cam.isPaused && cam.pausedRemainingTime !== null) {
      await supabase.from('cameras').update({ paused_remaining_time: cam.pausedRemainingTime + ms }).eq('id', cameraId);
    } else if (cam.shiftEndTime) {
      await supabase.from('cameras').update({ shift_end_time: cam.shiftEndTime + ms }).eq('id', cameraId);
    }
    await writeLog(`Shift extended for ${cam.name} by ${minutes}m`);
  };

  const kickOperators = async (cameraId: string) => {
    if (!churchSlug) return;
    await supabase.from('cameras').update({
      currentOperators: [],
      is_shift_active: false,
      shift_end_time: null,
      status: 'NOT_READY',
      is_paused: false,
      paused_remaining_time: null,
      is_attention_needed: false
    }).eq('id', cameraId);
    await writeLog(`Reset operator station ${cameraId}`, 'ALERT');
  };

  const addCamera = async (name: string, type: 'SINGLE' | 'DUAL', duration: number, code: string) => {
    if (!churchSlug) return;
    await supabase.from('cameras').insert({
      church_id: churchSlug,
      name,
      type,
      status: 'NOT_READY',
      currentOperators: [],
      shift_end_time: null,
      is_shift_active: false,
      is_paused: false,
      paused_remaining_time: null,
      is_attention_needed: false,
      default_shift_duration: duration,
      access_code: code
    });
    await writeLog(`New device added: ${name}`);
  };

  const updateCameraConfig = async (cameraId: string, updates: Partial<Camera>) => {
    if (!churchSlug) return;
    // Map camelCase to snake_case for DB updates if necessary
    const dbUpdates: any = { ...updates };
    if (updates.defaultShiftDuration) dbUpdates.default_shift_duration = updates.defaultShiftDuration;
    if (updates.accessCode) dbUpdates.access_code = updates.accessCode;
    
    await supabase.from('cameras').update(dbUpdates).eq('id', cameraId);
  };

  const addSavedCode = async (label: string, code: string) => {
    if (!churchSlug) return;
    await supabase.from('saved_codes').insert({ church_id: churchSlug, label, code });
  };

  const deleteSavedCode = async (id: string) => {
    if (!churchSlug) return;
    await supabase.from('saved_codes').delete().eq('id', id);
  };

  const updateAdminPassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!churchSlug || state.adminPassword !== oldPassword) return false;
    await supabase.from('churches').update({ admin_password: newPassword }).eq('id', churchSlug);
    await writeLog('Admin security updated', 'ALERT');
    return true;
  };

  const updateMixerPassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!churchSlug || state.mixerPassword !== oldPassword) return false;
    await supabase.from('churches').update({ mixer_password: newPassword }).eq('id', churchSlug);
    await writeLog('Mixer security updated', 'ALERT');
    return true;
  };

  const updateChurchBranding = async (name: string, logoUrl: string) => {
    if (!churchSlug) return;
    await supabase.from('churches').update({ 
      name: name, 
      logo_url: logoUrl 
    }).eq('id', churchSlug);
    await writeLog('Church branding updated');
  };

  return (
    <ProductionContext.Provider value={{
      state,
      churchSlug,
      churchName,
      isLoading,
      joinChurch,
      createChurch,
      logoutChurch,
      updateCameraStatus,
      assignOperator,
      removeOperator,
      startShift,
      endShift,
      togglePauseShift,
      extendShift,
      kickOperators,
      setAttention,
      addCamera,
      updateCameraConfig,
      addSavedCode,
      deleteSavedCode,
      updateAdminPassword,
      updateMixerPassword,
      updateChurchBranding,
      isCloudConnected
    }}>
      {children}
    </ProductionContext.Provider>
  );
};

export const useProduction = () => {
  const context = useContext(ProductionContext);
  if (!context) throw new Error("useProduction must be used within ProductionProvider");
  return context;
};