import { useMemo, useState } from "react";

import { MicButton } from "./MicButton";
import { VoiceInputNote } from "./VoiceInputNote";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500";

interface CreatableSelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  createLabel?: string;
  newValuePlaceholder?: string;
  voice?: boolean;
}

export function CreatableSelectInput({
  value,
  onChange,
  options,
  placeholder = "Select or add new...",
  createLabel = "Add new...",
  newValuePlaceholder = "Enter a new value",
  voice = true,
}: CreatableSelectInputProps) {
  const [isCreating, setIsCreating] = useState(false);

  const selectOptions = useMemo(() => {
    const merged = new Set(
      [...options, ...(value.trim() ? [value.trim()] : [])].filter(Boolean),
    );
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [options, value]);

  if (isCreating) {
    return (
      <div className="space-y-2">
        <div>
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={newValuePlaceholder}
              autoFocus
              className={voice ? `${inputClass} pr-10` : inputClass}
            />
            {voice ? <MicButton value={value} onChange={onChange} /> : null}
          </div>
          {voice ? <VoiceInputNote /> : null}
        </div>
        {selectOptions.length > 0 ? (
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Choose from existing values
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(event) => {
        if (event.target.value === "__create_new__") {
          onChange("");
          setIsCreating(true);
          return;
        }
        onChange(event.target.value);
      }}
      className={inputClass}
    >
      <option value="">{placeholder}</option>
      {selectOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
      <option value="__create_new__">{createLabel}</option>
    </select>
  );
}
