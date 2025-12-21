
export type CameraStatus = 'NOT_READY' | 'READY' | 'HOLD' | 'SWITCH_NOW';

export interface Operator {
  id: string;
  name: string;
}

export interface Camera {
  id: string;
  name: string;
  type: 'SINGLE' | 'DUAL'; // Single operator or dual operator
  status: CameraStatus;
  currentOperators: Operator[];
  shiftEndTime: number | null; // Timestamp
  isShiftActive: boolean;
  isPaused: boolean; // New: Track if shift is paused
  pausedRemainingTime: number | null; // New: Store remaining milliseconds when paused
  isAttentionNeeded: boolean; // New: Orthogonal status for requesting attention
  defaultShiftDuration: number; // Specific shift duration for this camera
  accessCode: string; // Password for this camera
}

export interface SavedCode {
  id: string;
  label: string;
  code: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'INFO' | 'ALERT' | 'STATUS_CHANGE';
}

export interface AppState {
  cameras: Camera[];
  savedCodes: SavedCode[]; // Library of reusable passwords
  logs: LogEntry[];
  adminPassword?: string; // Store admin password
  mixerPassword?: string; // Store mixer password
  churchName?: string; // Store church name to sync across devices
  churchLogoUrl?: string; // Store custom logo URL
}

export type UserRole = 'MIXER' | 'CAMERAMAN' | 'ADMIN' | 'NONE';
