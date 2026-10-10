"use client";

import { useEffect, useState } from "react";
import { OPENAI_KEY_HEADER } from "./openai-key";

const STORAGE_KEY = "product-voice-ads:openai-key";

export type KeyStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "valid" }
  | { state: "invalid"; message: string };

export function useOpenAIKey() {
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
  }, []);

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
      const response = await fetch("/api/openai/verify", {
        method: "POST",
        headers: { [OPENAI_KEY_HEADER]: apiKey.trim() },
      });
      if (response.ok) return setStatus({ state: "valid" });
      const data = await response.json().catch(() => ({}));
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

export type OpenAIKeyState = ReturnType<typeof useOpenAIKey>;
