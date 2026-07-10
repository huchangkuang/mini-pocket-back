export const CommonBeatList = [
  40, 44, 48, 52, 56, 60, 64, 68, 72, 80, 84, 88, 92, 96, 100, 104, 108, 112, 116, 120, 126, 132,
  138, 144, 152, 160, 168, 176, 184, 182, 200, 208,
];

export const PRESET_BPM_LIST = [60, 72, 84, 120] as const;

export const PRESET_BPM_LABELS: Record<(typeof PRESET_BPM_LIST)[number], string> = {
  60: "Slow",
  72: "Std",
  84: "Mod",
  120: "Fast",
};

export const MAX_BPM = 208;
export const DEFAULT_BPM = 72;
