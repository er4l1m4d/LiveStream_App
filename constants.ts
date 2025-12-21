import { Camera } from "./types";

// Using the local image file as requested
export const APP_LOGO = "DCN Logo.jpg";

export const INITIAL_CAMERAS: Camera[] = [
  {
    id: 'cam-1',
    name: 'Camera 1 (Main)',
    type: 'SINGLE',
    status: 'NOT_READY',
    currentOperators: [],
    shiftEndTime: null,
    isShiftActive: false,
    isPaused: false,
    pausedRemainingTime: null,
    isAttentionNeeded: false,
    defaultShiftDuration: 45,
    accessCode: '1111'
  },
  {
    id: 'cam-2',
    name: 'Camera 2 (Wide)',
    type: 'DUAL',
    status: 'NOT_READY',
    currentOperators: [],
    shiftEndTime: null,
    isShiftActive: false,
    isPaused: false,
    pausedRemainingTime: null,
    isAttentionNeeded: false,
    defaultShiftDuration: 45,
    accessCode: '2222'
  },
  {
    id: 'cam-3',
    name: 'Camera 3 (Crowd)',
    type: 'DUAL',
    status: 'NOT_READY',
    currentOperators: [],
    shiftEndTime: null,
    isShiftActive: false,
    isPaused: false,
    pausedRemainingTime: null,
    isAttentionNeeded: false,
    defaultShiftDuration: 30, // Example of different duration
    accessCode: '3333'
  }
];

export const STATUS_COLORS = {
  NOT_READY: 'bg-status-notReady',
  READY: 'bg-status-ready',
  HOLD: 'bg-status-hold',
  SWITCH_NOW: 'bg-status-switch',
};

export const STATUS_LABELS = {
  NOT_READY: 'Not Ready',
  READY: 'Ready',
  HOLD: 'Hold',
  SWITCH_NOW: 'Switch Now!',
};