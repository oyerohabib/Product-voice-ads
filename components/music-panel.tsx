"use client";

import { useEffect, useRef, useState } from "react";
import { audioDuration, mixVoiceWithMusic } from "@/lib/audio-mix";
import { ELEVENLABS_KEY_HEADER } from "@/lib/elevenlabs-key";
import { MUSIC_STYLE_IDS, MUSIC_STYLES, type MusicStyleId } from "@/lib/music";

type Props = {
  voiceBlob: Blob;
  fileBase: string;
  defaultStyle: MusicStyleId;
  elevenLabsKey: string;
  onManageKey: () => void;
};

type Track = { style: MusicStyleId; durationSec: number; blob: Blob };
type MusicError = { message: string; needsKey: boolean; key: string };

export function MusicPanel({
  voiceBlob,
  fileBase,
  defaultStyle,
  elevenLabsKey,
  onManageKey,
}: Props) {
  const [style, setStyle] = useState<MusicStyleId>(defaultStyle);
  const [volume, setVolume] = useState(0.22);
  const [track, setTrack] = useState<Track | null>(null);
  const [mixUrl, setMixUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "composing" | "mixing">("idle");
  const [musicError, setMusicError] = useState<MusicError | null>(null);
  const mixRun = useRef(0);

  // An error from an older key no longer applies once the user adds or changes their key.
  const error = musicError?.key === elevenLabsKey ? musicError : null;
  const setError = (message: string | null, needsKey = false) =>
    setMusicError(message ? { message, needsKey, key: elevenLabsKey } : null);

  useEffect(() => {
    if (!mixUrl) return;
    return () => URL.revokeObjectURL(mixUrl);
  }, [mixUrl]);

  async function remix(music: Blob, musicVolume: number) {
    const run = ++mixRun.current;
    setStatus("mixing");
    try {
      const wav = await mixVoiceWithMusic(voiceBlob, music, musicVolume);
      if (run === mixRun.current) setMixUrl(URL.createObjectURL(wav));
    } catch {
      if (run === mixRun.current) setError("Could not mix the music in this browser.");
    } finally {
      if (run === mixRun.current) setStatus("idle");
    }
  }

  useEffect(() => {
    if (!track) return;
    const timer = setTimeout(() => void remix(track.blob, volume), 250);
    return () => clearTimeout(timer);
    // Remix only when the volume changes; new tracks are mixed right after they arrive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume]);

  async function addMusic() {
    setError(null);
    setStatus("composing");
    try {
      const durationSec = Math.ceil((await audioDuration(voiceBlob)) + 3.5);
      let next = track;
      if (!next || next.style !== style || next.durationSec !== durationSec) {
        const response = await fetch("/api/music", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(elevenLabsKey && { [ELEVENLABS_KEY_HEADER]: elevenLabsKey }),
          },
          body: JSON.stringify({ style, durationMs: durationSec * 1000 }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setError(data.error ?? `Music generation failed (${response.status}).`, data.needsKey);
          setStatus("idle");
          return;
        }
        next = { style, durationSec, blob: await response.blob() };
        setTrack(next);
      }
      await remix(next.blob, volume);
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  const busy = status !== "idle";
  const hasCurrentStyle = track?.style === style;

  return (
    <div className="space-y-3 border-t border-zinc-200 pt-4">
      <div>
        <p className="text-sm font-medium text-zinc-800">Background music</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          Composes an instrumental track with ElevenLabs Music and mixes it under the voice.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MUSIC_STYLE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setStyle(id)}
            aria-pressed={style === id}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              style === id
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {MUSIC_STYLES[id].label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={addMusic}
        disabled={busy || hasCurrentStyle}
        className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "composing"
          ? "Composing music..."
          : hasCurrentStyle
            ? `${MUSIC_STYLES[style].label} music added`
            : `Add ${MUSIC_STYLES[style].label} music`}
      </button>

      {track && (
        <label className="flex items-center gap-3 text-xs text-zinc-600">
          Music volume
          <input
            type="range"
            min={0.05}
            max={0.6}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 accent-zinc-900"
          />
          <span className="w-8 text-right tabular-nums">{Math.round(volume * 100)}%</span>
        </label>
      )}

      {error?.needsKey ? (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-900">{error.message}</p>
          <button
            type="button"
            onClick={onManageKey}
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-700"
          >
            {elevenLabsKey ? "Change ElevenLabs key" : "Add your ElevenLabs key"}
          </button>
        </div>
      ) : (
        error && <p className="text-xs text-red-700">{error.message}</p>
      )}

      {!error?.needsKey && (
        <p className="text-xs text-zinc-500">
          {elevenLabsKey ? "Using your ElevenLabs key. " : "Have a paid ElevenLabs plan? "}
          <button
            type="button"
            onClick={onManageKey}
            className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
          >
            {elevenLabsKey ? "Change" : "Use your own key"}
          </button>
        </p>
      )}

      {mixUrl && (
        <div className="space-y-3 rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-medium text-zinc-600">
            Voice + music{status === "mixing" ? " (updating...)" : ""}
          </p>
          <audio controls src={mixUrl} className="w-full" />
          <a
            href={mixUrl}
            download={`${fileBase}-with-music.wav`}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
          >
            Download with music (WAV)
          </a>
        </div>
      )}
    </div>
  );
}
