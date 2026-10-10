"use client";

import {
  ENERGIES,
  ENERGY_LABELS,
  PACES,
  PACE_LABELS,
  type Energy,
  type Pace,
} from "@/lib/delivery";

type Props = {
  energy: Energy;
  pace: Pace;
  onEnergyChange: (energy: Energy) => void;
  onPaceChange: (pace: Pace) => void;
};

export function DeliveryControls({ energy, pace, onEnergyChange, onPaceChange }: Props) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 block text-sm font-medium text-zinc-800">Delivery</legend>
      <Segmented
        label="Energy"
        options={ENERGIES}
        labels={ENERGY_LABELS}
        value={energy}
        onChange={onEnergyChange}
      />
      <Segmented
        label="Pace"
        options={PACES}
        labels={PACE_LABELS}
        value={pace}
        onChange={onPaceChange}
      />
    </fieldset>
  );
}

function Segmented<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-3 rounded-lg bg-zinc-100 p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={`rounded-md px-2 py-1.5 text-xs font-medium transition sm:text-sm ${
            value === option
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}
