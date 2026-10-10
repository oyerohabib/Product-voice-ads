export const ENERGIES = ["calm", "natural", "excited"] as const;
export const PACES = ["slower", "normal", "faster"] as const;

export type Energy = (typeof ENERGIES)[number];
export type Pace = (typeof PACES)[number];

export const ENERGY_LABELS: Record<Energy, string> = {
  calm: "Calmer",
  natural: "Natural",
  excited: "More excited",
};

export const PACE_LABELS: Record<Pace, string> = {
  slower: "Slower",
  normal: "Normal pace",
  faster: "Faster",
};

// Lower stability gives the voice more emotional range; style exaggerates the
// speaker's delivery. ElevenLabs accepts speed between 0.7 and 1.2.
const ENERGY_SETTINGS: Record<Energy, { stability: number; style: number }> = {
  calm: { stability: 0.75, style: 0 },
  natural: { stability: 0.5, style: 0 },
  excited: { stability: 0.3, style: 0.6 },
};

const PACE_SPEED: Record<Pace, number> = {
  slower: 0.9,
  normal: 1,
  faster: 1.12,
};

export function voiceSettingsFor(energy: Energy, pace: Pace) {
  return {
    ...ENERGY_SETTINGS[energy],
    similarityBoost: 0.75,
    useSpeakerBoost: true,
    speed: PACE_SPEED[pace],
  };
}
