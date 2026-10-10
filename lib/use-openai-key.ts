"use client";

import { useEffect, useState } from "react";
import { ELEVENLABS_KEY_HEADER } from "./elevenlabs-key";
import { OPENAI_KEY_HEADER } from "./openai-key";

type KeyConfig = { storageKey: string; header: string; verifyUrl: string };

const OPENAI: KeyConfig = {
  storageKey: "product-voice-ads:openai-key",
  header: OPENAI_KEY_HEADER,
  verifyUrl: "/api/openai/verify",
};

const ELEVENLABS: KeyConfig = {
  storageKey: "product-voice-ads:elevenlabs-key",
  header: ELEVENLABS_KEY_HEADER,
  verifyUrl: "/api/elevenlabs/verify",
};

export type KeyStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "valid"; message?: string }
  | { state: "invalid"; message: string };

export function useOpenAIKey() {
  return useStoredApiKey(OPENAI);
}

export function useElevenLabsKey() {
  return useStoredApiKey(ELEVENLABS);
}

function useStoredApiKey({ storageKey: STORAGE_KEY, header, verifyUrl }: KeyConfig) {
  const [apiKey, setApiKeyState] = useState("");
  const [remember, setRememberState] = useState(false);
  const [status, setStatus] = useState<KeyStatus>({ state: "idle" });

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    // localStorage only exists in the browser, so the saved key can't be part of the server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApiKeyState(saved);
    setRememberState(true);
  }, [STORAGE_KEY]);

  function setApiKey(value: string) {
    setApiKeyState(value);
    setStatus({ state: "idle" });
    if (remember && value.trim()) window.localStorage.setItem(STORAGE_KEY, value.trim());
    else window.localStorage.removeItem(STORAGE_KEY);
  }

  function setRemember(value: boolean) {
    setRememberState(value);
    if (value && apiKey.trim()) window.localStorage.setItem(STORAGE_KEY, apiKey.trim());
    else window.localStorage.removeItem(STORAGE_KEY);
  }

  function forget() {
    window.localStorage.removeItem(STORAGE_KEY);
    setApiKeyState("");
    setRememberState(false);
    setStatus({ state: "idle" });
  }

  async function verify() {
    setStatus({ state: "checking" });
    try {
      const response = await fetch(verifyUrl, {
        method: "POST",
        headers: { [header]: apiKey.trim() },
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        return setStatus({
          state: "valid",
          message: typeof data.message === "string" ? data.message : undefined,
        });
      }
      setStatus({
        state: "invalid",
        message: typeof data.error === "string" ? data.error : `Check failed (${response.status}).`,
      });
    } catch {
      setStatus({ state: "invalid", message: "Could not reach the server to check the key." });
    }
  }

  return {
    apiKey,
    trimmedKey: apiKey.trim(),
    setApiKey,
    remember,
    setRemember,
    forget,
    verify,
    status,
  };
}

export type ApiKeyState = ReturnType<typeof useStoredApiKey>;
