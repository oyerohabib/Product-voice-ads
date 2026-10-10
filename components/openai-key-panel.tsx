"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ApiKeyState } from "@/lib/use-openai-key";

export type KeyProvider = "openai" | "elevenlabs";

const COPY: Record<
  KeyProvider,
  { title: string; description: string; placeholder: string; getKeyUrl: string }
> = {
  openai: {
    title: "Your OpenAI key",
    description:
      "Writing and editing scripts with AI uses your own OpenAI key, billed to your OpenAI account. It is sent with your requests and never stored on the server. Voiceovers don't need it.",
    placeholder: "sk-...",
    getKeyUrl: "https://platform.openai.com/api-keys",
  },
  elevenlabs: {
    title: "Your ElevenLabs key",
    description:
      'Background music uses the ElevenLabs Music API, which needs a paid ElevenLabs plan (Starter or above). Your key is only used for music, billed to your ElevenLabs account, and never stored on the server. Give it the "Music Generation" permission.',
    placeholder: "sk_...",
    getKeyUrl: "https://elevenlabs.io/app/settings/api-keys",
  },
};

type Props = {
  provider: KeyProvider;
  keyState: ApiKeyState;
  open: boolean;
  onClose: () => void;
};

export function ApiKeyDialog({ provider, keyState, open, onClose }: Props) {
  const { apiKey, trimmedKey, setApiKey, remember, setRemember, forget, verify, status } = keyState;
  const copy = COPY[provider];
  const titleId = useId();
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      aria-labelledby={titleId}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-white p-0 shadow-xl backdrop:bg-zinc-900/40"
    >
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 id={titleId} className="text-base font-semibold text-zinc-900">
              {copy.title}
            </h2>
            <KeyBadge status={status} hasKey={Boolean(trimmedKey)} />
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="-m-1 rounded-md p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-zinc-600">{copy.description}</p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <input
              type={visible ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={copy.placeholder}
              autoComplete="off"
              spellCheck={false}
              aria-label={`${provider === "openai" ? "OpenAI" : "ElevenLabs"} API key`}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2 pr-16 pl-3 font-mono text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute inset-y-0 right-2 my-auto h-7 rounded-md px-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
            >
              {visible ? "Hide" : "Show"}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={verify}
              disabled={!trimmedKey || status.state === "checking"}
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status.state === "checking" ? "Checking..." : "Check key"}
            </button>
            <button
              type="button"
              onClick={forget}
              disabled={!apiKey}
              className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Forget
            </button>
          </div>
        </div>

        {status.state === "invalid" && <p className="text-xs text-red-700">{status.message}</p>}
        {status.state === "valid" && status.message && (
          <p className="text-xs text-emerald-700">{status.message}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="inline-flex items-center gap-2 text-zinc-700">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-3.5 rounded border-zinc-300 accent-zinc-900"
            />
            Remember on this device
          </label>
          <a
            href={copy.getKeyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-700 underline underline-offset-4 hover:text-zinc-900"
          >
            Get an API key
          </a>
        </div>

        <div className="flex justify-end border-t border-zinc-100 pt-4">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  );
}

function KeyBadge({ status, hasKey }: { status: ApiKeyState["status"]; hasKey: boolean }) {
  const [label, className] =
    status.state === "valid"
      ? ["Key works", "bg-emerald-50 text-emerald-800 ring-emerald-200"]
      : status.state === "invalid"
        ? ["Key problem", "bg-red-50 text-red-800 ring-red-200"]
        : status.state === "checking"
          ? ["Checking", "bg-white text-zinc-700 ring-zinc-200"]
          : hasKey
            ? ["Not checked", "bg-amber-50 text-amber-800 ring-amber-200"]
            : ["No key", "bg-white text-zinc-600 ring-zinc-200"];

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${className}`}
    >
      {label}
    </span>
  );
}
