export const MUSIC_STYLE_IDS = ["afrobeats", "acoustic", "lofi", "corporate", "luxury"] as const;

export type MusicStyleId = (typeof MUSIC_STYLE_IDS)[number];

const BED =
  "instrumental only, no vocals, steady and unobtrusive so a voiceover sits clearly on top";

export const MUSIC_STYLES: Record<MusicStyleId, { label: string; prompt: string }> = {
  afrobeats: {
    label: "Afrobeats",
    prompt: `Light, upbeat Afrobeats background bed for a radio ad, warm percussion and clean guitar, ${BED}`,
  },
  acoustic: {
    label: "Acoustic",
    prompt: `Warm, friendly acoustic guitar background bed for an advert, gentle rhythm, ${BED}`,
  },
  lofi: {
    label: "Lo-fi",
    prompt: `Mellow lo-fi background bed, soft keys and a gentle relaxed beat, ${BED}`,
  },
  corporate: {
    label: "Bright pop",
    prompt: `Bright, modern pop background bed for a product advert, light piano and plucks, optimistic, ${BED}`,
  },
  luxury: {
    label: "Elegant",
    prompt: `Elegant, premium background bed with soft strings and piano, slow and refined, ${BED}`,
  },
};

export function suggestedMusicStyle(tone: string): MusicStyleId {
  if (tone === "energetic") return "afrobeats";
  if (tone === "calm") return "lofi";
  if (tone === "premium") return "luxury";
  return "acoustic";
}
