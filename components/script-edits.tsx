"use client";

import { useState } from "react";
import type { LanguageCode } from "@/lib/languages";
import { OPENAI_KEY_HEADER } from "@/lib/openai-key";

const QUICK_EDITS = [
  {
    label: "Shorter",
    instruction: "Make it noticeably shorter, about two thirds of the current length.",
  },
  {
    label: "Punchier",
    instruction: "Make it punchier and more energetic, with shorter sentences.",
  },
  {
    label: "More urgent",
    instruction:
      "Add a sense of urgency so listeners want to act now, without inventing discounts or deadlines.",
  },
  {
    label: "Simpler words",
    instruction: "Use simpler, everyday words that are easy to understand when heard once.",
  },
];

type Props = {
  script: string;
  language: LanguageCode;
  apiKey: string;
  canUndo: boolean;
  onEdited: (script: string) => void;
  onUndo: () => void;
  onManageKey: () => void;
};

export function ScriptEdits({
  script,
  language,
  apiKey,
  canUndo,
  onEdited,
  onUndo,
  onManageKey,
}: Props) {
  const [instruction, setInstruction] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function applyEdit(text: string) {
    if (!apiKey) return onManageKey();
    setError(null);
    setEditing(true);
    try {
      const response = await fetch("/api/script/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json", [OPENAI_KEY_HEADER]: apiKey },
        body: JSON.stringify({ script, language, instruction: text }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? `Edit failed (${response.status}).`);
      onEdited(data.script);
      setInstruction("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEditing(false);
    }
  }

  const disabled = editing || !script.trim();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-800">
          Quick edits <span className="font-normal text-zinc-500">(AI)</span>
        </p>
        {canUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={editing}
            className="text-xs font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
          >
            Undo edit
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_EDITS.map((edit) => (
          <button
            key={edit.label}
            type="button"
            onClick={() => applyEdit(edit.instruction)}
            disabled={disabled}
            className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {edit.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (instruction.trim()) void applyEdit(instruction.trim());
        }}
        className="flex gap-2"
      >
        <input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder='Or say what to change, e.g. "mention free delivery in Lagos"'
          maxLength={300}
          aria-label="Edit instruction"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
        />
        <button
          type="submit"
          disabled={disabled || !instruction.trim()}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {editing ? "Editing..." : "Apply"}
        </button>
      </form>

      {error && <p className="text-xs text-red-700">{error}</p>}
      <p className="text-xs text-zinc-500">
        {apiKey ? "Using your OpenAI key. " : "Edits need your own OpenAI key. "}
        <button
          type="button"
          onClick={onManageKey}
          className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
        >
          {apiKey ? "Change" : "Add key"}
        </button>
      </p>
    </div>
  );
}
