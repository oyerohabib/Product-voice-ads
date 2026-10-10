"use client";

import { useEffect, useRef, useState } from "react";
import { DeliveryControls } from "@/components/delivery-controls";
import { MusicPanel } from "@/components/music-panel";
import { ApiKeyDialog, type KeyProvider } from "@/components/openai-key-panel";
import { ScriptEdits } from "@/components/script-edits";
import type { Energy, Pace } from "@/lib/delivery";
import { EMPTY_PRODUCT, PRODUCT_EXAMPLES } from "@/lib/examples";
import { LANGUAGE_CODES, LANGUAGES, measureScript, type LanguageCode } from "@/lib/languages";
import { suggestedMusicStyle } from "@/lib/music";
import { OPENAI_KEY_HEADER } from "@/lib/openai-key";
import { TONES, type ProductDraft, type VoiceOption } from "@/lib/schemas";
import { useElevenLabsKey, useOpenAIKey } from "@/lib/use-openai-key";

type Product = ProductDraft;

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
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:text-sm";
const labelClass = "mb-1.5 block text-sm font-medium text-zinc-800";
const primaryButton =
  "inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50";

export function AdStudio() {
  const keyState = useOpenAIKey();
  const elevenLabsKeyState = useElevenLabsKey();
  const [product, setProduct] = useState<Product>(EMPTY_PRODUCT);
  const [exampleId, setExampleId] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageCode>("en");

  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voiceId, setVoiceId] = useState("");

  const [script, setScript] = useState("");
  const [scriptLanguage, setScriptLanguage] = useState<LanguageCode>("en");
  const [scriptFromExample, setScriptFromExample] = useState(false);
  const [previousScript, setPreviousScript] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);

  const [ownProductOpen, setOwnProductOpen] = useState(false);
  const [keyDialog, setKeyDialog] = useState<KeyProvider | null>(null);

  const [energy, setEnergy] = useState<Energy>("natural");
  const [pace, setPace] = useState<Pace>("normal");
  const [audio, setAudio] = useState<{
    url: string;
    blob: Blob;
    filename: string;
    energy: Energy;
    pace: Pace;
  } | null>(null);
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

  const update = <K extends keyof Product>(key: K, value: Product[K]) => {
    setExampleId(null);
    setProduct((current) => ({ ...current, [key]: value }));
  };

  function pickExample(id: string) {
    const example = PRODUCT_EXAMPLES.find((item) => item.id === id);
    if (!example) return;
    setExampleId(id);
    setProduct(example.product);
    setScript(example.scripts[language]);
    setScriptLanguage(language);
    setScriptFromExample(true);
    setPreviousScript(null);
    setAudio(null);
    setError(null);
  }

  function changeLanguage(code: LanguageCode) {
    setLanguage(code);
    const example = PRODUCT_EXAMPLES.find((item) => item.id === exampleId);
    if (example && scriptFromExample) {
      setScript(example.scripts[code]);
      setScriptLanguage(code);
      setPreviousScript(null);
      setAudio(null);
    }
  }

  function applyEditedScript(edited: string) {
    setPreviousScript(script);
    setScript(edited);
    setScriptFromExample(false);
    setAudio(null);
  }

  function undoEdit() {
    if (previousScript === null) return;
    setScript(previousScript);
    setPreviousScript(null);
    setAudio(null);
  }

  function clearProduct() {
    setExampleId(null);
    setProduct(EMPTY_PRODUCT);
  }

  const selectedVoice = voices.find((voice) => voice.id === voiceId);
  const scriptLength = measureScript(script, LANGUAGES[scriptLanguage]);

  async function writeScript(event: React.FormEvent) {
    event.preventDefault();
    if (!keyState.trimmedKey) {
      setKeyDialog("openai");
      return;
    }
    setError(null);
    setWriting(true);
    try {
      const response = await fetch("/api/script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [OPENAI_KEY_HEADER]: keyState.trimmedKey,
        },
        body: JSON.stringify({ ...product, language }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const data = (await response.json()) as { script: string };
      setScript(data.script);
      setScriptLanguage(language);
      setScriptFromExample(false);
      setPreviousScript(null);
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
        body: JSON.stringify({ script, voiceId, language: scriptLanguage, energy, pace }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const blob = await response.blob();
      const name = slugify(product.name) || "product-ad";
      setAudio({
        url: URL.createObjectURL(blob),
        blob,
        filename: `${name}-${scriptLanguage}.mp3`,
        energy,
        pace,
      });
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
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:py-14">
      <ApiKeyDialog
        provider="openai"
        keyState={keyState}
        open={keyDialog === "openai"}
        onClose={() => setKeyDialog(null)}
      />
      <ApiKeyDialog
        provider="elevenlabs"
        keyState={elevenLabsKeyState}
        open={keyDialog === "elevenlabs"}
        onClose={() => setKeyDialog(null)}
      />

      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Product Voice Ads
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
          Hear how a product sounds as a short voice ad. Pick a product, choose a voice, and
          generate the voiceover with ElevenLabs.
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

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <section className="min-w-0 space-y-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">1. Pick a product</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Each example comes with a ready-made script in English, French and Chinese.
            </p>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRODUCT_EXAMPLES.map((example) => {
                const active = example.id === exampleId;
                return (
                  <button
                    key={example.id}
                    type="button"
                    onClick={() => pickExample(example.id)}
                    aria-pressed={active}
                    className={`min-w-0 rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-zinc-50 text-zinc-900 hover:border-zinc-400 hover:bg-white"
                    }`}
                  >
                    <span
                      className={`block text-[11px] font-medium tracking-wide uppercase ${
                        active ? "text-zinc-300" : "text-zinc-500"
                      }`}
                    >
                      {example.category}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm leading-snug font-medium">
                      {example.product.name}
                    </span>
                    <span
                      className={`mt-1.5 block text-xs capitalize ${
                        active ? "text-zinc-300" : "text-zinc-500"
                      }`}
                    >
                      {example.product.price} · {example.product.tone}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-4">
            <button
              type="button"
              onClick={() => setOwnProductOpen((open) => !open)}
              aria-expanded={ownProductOpen}
              aria-controls="own-product"
              className="flex w-full items-center justify-between gap-3 text-left text-sm font-medium text-zinc-800 hover:text-zinc-950"
            >
              <span>
                Use your own product <span className="font-normal text-zinc-500">(optional)</span>
              </span>
              <Chevron open={ownProductOpen} />
            </button>
            {!ownProductOpen && (
              <p className="mt-1 text-xs text-zinc-500">
                Let AI write a script for your own listing, or just type your script on the right.
              </p>
            )}
          </div>

          {ownProductOpen && (
            <form id="own-product" onSubmit={writeScript} className="space-y-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={clearProduct}
                  disabled={!product.name && !product.description}
                >
                  Clear fields
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

              <div className="space-y-2">
                <button type="submit" className={`${secondaryButton} w-full`} disabled={writing}>
                  {writing
                    ? "Writing script..."
                    : `Write ${LANGUAGES[language].label} script with AI`}
                </button>
                <p className="text-center text-xs text-zinc-500">
                  {keyState.trimmedKey ? "Using your OpenAI key. " : "Needs your own OpenAI key. "}
                  <button
                    type="button"
                    onClick={() => setKeyDialog("openai")}
                    className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
                  >
                    {keyState.trimmedKey ? "Change" : "Add key"}
                  </button>
                </p>
              </div>
            </form>
          )}
        </section>

        <section className="min-w-0 space-y-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-base font-semibold text-zinc-900">2. Script and voice</h2>

          <fieldset>
            <legend className={labelClass}>Language</legend>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => changeLanguage(code)}
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
              onChange={(e) => {
                setScript(e.target.value);
                setScriptFromExample(false);
                if (!e.target.value.trim()) setScriptLanguage(language);
              }}
              placeholder="Pick an example to load its script, or type your own here."
            />
            {script && language !== scriptLanguage && (
              <p className="mt-1.5 text-xs text-amber-700">
                This script is in {LANGUAGES[scriptLanguage].label}. Pick an example or write a new
                script to switch to {LANGUAGES[language].label}.
              </p>
            )}
          </div>

          <ScriptEdits
            script={script}
            language={scriptLanguage}
            apiKey={keyState.trimmedKey}
            canUndo={previousScript !== null}
            onEdited={applyEditedScript}
            onUndo={undoEdit}
            onManageKey={() => setKeyDialog("openai")}
          />

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

          <DeliveryControls
            energy={energy}
            pace={pace}
            onEnergyChange={setEnergy}
            onPaceChange={setPace}
          />

          <button
            type="button"
            className={`${primaryButton} w-full`}
            onClick={generateVoiceover}
            disabled={speaking || !script.trim() || !voiceId}
          >
            {speaking
              ? "Generating voiceover..."
              : audio && (audio.energy !== energy || audio.pace !== pace)
                ? "Generate again with new delivery"
                : "Generate voiceover"}
          </button>

          {audio && (
            <div className="space-y-4 rounded-xl bg-zinc-50 p-4">
              <div className="space-y-3">
                <audio controls src={audio.url} className="w-full" />
                <a href={audio.url} download={audio.filename} className={secondaryButton}>
                  Download MP3
                </a>
              </div>
              <MusicPanel
                key={audio.url}
                voiceBlob={audio.blob}
                fileBase={audio.filename.replace(/\.mp3$/, "")}
                defaultStyle={suggestedMusicStyle(product.tone)}
                elevenLabsKey={elevenLabsKeyState.trimmedKey}
                onManageKey={() => setKeyDialog("elevenlabs")}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={`size-4 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
