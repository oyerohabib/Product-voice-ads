"use client";

import { useEffect, useRef, useState } from "react";
import { LANGUAGE_CODES, LANGUAGES, measureScript, type LanguageCode } from "@/lib/languages";
import { TONES, type VoiceOption } from "@/lib/schemas";

type Product = {
  name: string;
  description: string;
  price: string;
  sellingPoints: string;
  tone: (typeof TONES)[number];
};

const EMPTY_PRODUCT: Product = {
  name: "",
  description: "",
  price: "",
  sellingPoints: "",
  tone: "friendly",
};

const EXAMPLE_PRODUCT: Product = {
  name: "Solar Rechargeable Standing Fan (16-inch)",
  description:
    "A 16-inch standing fan with a built-in rechargeable battery and a solar panel included. Runs up to 10 hours on a full charge, has 3 speed settings, a remote control and a USB port for charging phones.",
  price: "₦45,000",
  sellingPoints: "Keeps working during power cuts, solar panel included, quiet motor",
  tone: "energetic",
};

async function readError(response: Response) {
  try {
    const data = await response.json();
    return typeof data.error === "string" ? data.error : `Request failed (${response.status}).`;
  } catch {
    return `Request failed (${response.status}).`;
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";
const labelClass = "mb-1.5 block text-sm font-medium text-zinc-800";
const primaryButton =
  "inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50";

export function AdStudio() {
  const [product, setProduct] = useState<Product>(EMPTY_PRODUCT);
  const [language, setLanguage] = useState<LanguageCode>("en");

  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voiceId, setVoiceId] = useState("");

  const [script, setScript] = useState("");
  const [scriptLanguage, setScriptLanguage] = useState<LanguageCode>("en");
  const [writing, setWriting] = useState(false);

  const [audio, setAudio] = useState<{ url: string; filename: string } | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/voices")
      .then(async (response) => {
        if (!response.ok) throw new Error(await readError(response));
        return response.json() as Promise<{ voices: VoiceOption[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        setVoices(data.voices);
        setVoiceId((current) => current || data.voices[0]?.id || "");
      })
      .catch((err: Error) => !cancelled && setVoicesError(err.message))
      .finally(() => !cancelled && setVoicesLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!audio) return;
    return () => URL.revokeObjectURL(audio.url);
  }, [audio]);

  const update = <K extends keyof Product>(key: K, value: Product[K]) =>
    setProduct((current) => ({ ...current, [key]: value }));

  const selectedVoice = voices.find((voice) => voice.id === voiceId);
  const scriptLength = measureScript(script, LANGUAGES[scriptLanguage]);

  async function writeScript(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setWriting(true);
    try {
      const response = await fetch("/api/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, language }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const data = (await response.json()) as { script: string };
      setScript(data.script);
      setScriptLanguage(language);
      setAudio(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setWriting(false);
    }
  }

  async function generateVoiceover() {
    setError(null);
    setSpeaking(true);
    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, voiceId, language: scriptLanguage }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const blob = await response.blob();
      const name = slugify(product.name) || "product-ad";
      setAudio({ url: URL.createObjectURL(blob), filename: `${name}-${scriptLanguage}.mp3` });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSpeaking(false);
    }
  }

  function previewVoice() {
    if (!selectedVoice?.previewUrl) return;
    previewRef.current?.pause();
    previewRef.current = new Audio(selectedVoice.previewUrl);
    void previewRef.current.play();
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Product Voice Ads
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
          Paste a product listing, get a short ad script, and turn it into a voiceover with
          ElevenLabs.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={writeScript}
          className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-900">1. Product</h2>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => setProduct(EXAMPLE_PRODUCT)}
            >
              Use example
            </button>
          </div>

          <div>
            <label htmlFor="name" className={labelClass}>
              Product name
            </label>
            <input
              id="name"
              className={inputClass}
              value={product.name}
              onChange={(e) => update("name", e.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              className={`${inputClass} min-h-28 resize-y`}
              value={product.description}
              onChange={(e) => update("description", e.target.value)}
              maxLength={2000}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className={labelClass}>
                Price <span className="font-normal text-zinc-500">(optional)</span>
              </label>
              <input
                id="price"
                className={inputClass}
                value={product.price}
                onChange={(e) => update("price", e.target.value)}
                maxLength={40}
              />
            </div>
            <div>
              <label htmlFor="tone" className={labelClass}>
                Tone
              </label>
              <select
                id="tone"
                className={`${inputClass} capitalize`}
                value={product.tone}
                onChange={(e) => update("tone", e.target.value as Product["tone"])}
              >
                {TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="sellingPoints" className={labelClass}>
              Key selling points <span className="font-normal text-zinc-500">(optional)</span>
            </label>
            <textarea
              id="sellingPoints"
              className={`${inputClass} min-h-20 resize-y`}
              value={product.sellingPoints}
              onChange={(e) => update("sellingPoints", e.target.value)}
              maxLength={600}
            />
          </div>

          <fieldset>
            <legend className={labelClass}>Language</legend>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  aria-pressed={language === code}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    language === code
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {LANGUAGES[code].label}
                </button>
              ))}
            </div>
          </fieldset>

          <button type="submit" className={`${primaryButton} w-full`} disabled={writing}>
            {writing ? "Writing script..." : script ? "Rewrite script" : "Write script"}
          </button>
        </form>

        <section className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-zinc-900">2. Script and voice</h2>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="script" className="text-sm font-medium text-zinc-800">
                Script{" "}
                {script && (
                  <span className="font-normal text-zinc-500">
                    ({LANGUAGES[scriptLanguage].label})
                  </span>
                )}
              </label>
              {script && (
                <span
                  className={`text-xs ${scriptLength.withinRange ? "text-zinc-500" : "text-amber-700"}`}
                >
                  {scriptLength.count} {scriptLength.unit} · target {scriptLength.min}–
                  {scriptLength.max}
                </span>
              )}
            </div>
            <textarea
              id="script"
              className={`${inputClass} min-h-48 resize-y leading-relaxed`}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Your script shows up here. You can edit it before generating audio."
            />
            {script && language !== scriptLanguage && (
              <p className="mt-1.5 text-xs text-amber-700">
                This script is in {LANGUAGES[scriptLanguage].label}. Rewrite it to switch to{" "}
                {LANGUAGES[language].label}.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="voice" className={labelClass}>
              Voice
            </label>
            <div className="flex gap-2">
              <select
                id="voice"
                className={inputClass}
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                disabled={voicesLoading || voices.length === 0}
              >
                {voicesLoading && <option>Loading voices...</option>}
                {!voicesLoading && voices.length === 0 && <option>No voices available</option>}
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {[voice.name, voice.gender, voice.accent].filter(Boolean).join(" · ")}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={secondaryButton}
                onClick={previewVoice}
                disabled={!selectedVoice?.previewUrl}
              >
                Preview
              </button>
            </div>
            {voicesError && <p className="mt-1.5 text-xs text-red-700">{voicesError}</p>}
          </div>

          <button
            type="button"
            className={`${primaryButton} w-full`}
            onClick={generateVoiceover}
            disabled={speaking || !script.trim() || !voiceId}
          >
            {speaking ? "Generating voiceover..." : "Generate voiceover"}
          </button>

          {audio && (
            <div className="space-y-3 rounded-xl bg-zinc-50 p-4">
              <audio controls src={audio.url} className="w-full" />
              <a href={audio.url} download={audio.filename} className={secondaryButton}>
                Download MP3
              </a>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
