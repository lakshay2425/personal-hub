"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { readJsonFile } from "@/lib/export/readJsonFile";

import { ConfirmDialog } from "./ui/ConfirmDialog";

type ImportButtonProps<T> = {
  onValidate: (data: unknown) => T;
  onImport: (data: T) => Promise<void>;
  onImported?: () => void;
  label?: string;
  className?: string;
};

export function ImportButton<T>({
  onValidate,
  onImport,
  onImported,
  label = "Import",
  className,
}: ImportButtonProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<T | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await readJsonFile(file);
      const validated = onValidate(parsed);
      setPendingData(validated);
      setIsConfirmOpen(true);
    } catch {
      toast.error("Invalid backup file");
      resetInput();
    }
  };

  const handleCloseConfirm = () => {
    if (isImporting) return;
    setIsConfirmOpen(false);
    setPendingData(null);
    resetInput();
  };

  const handleConfirm = async () => {
    if (pendingData === null) return;

    setIsImporting(true);
    try {
      await onImport(pendingData);
      toast.success("Data imported successfully");
      setIsConfirmOpen(false);
      setPendingData(null);
      resetInput();
      onImported?.();
    } catch {
      toast.error("Invalid backup file");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isImporting}
        className={
          className ??
          "rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }
      >
        {label}
      </button>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirm}
        title="Import data"
        message="This will replace ALL existing data. Are you sure?"
        confirmLabel="Import"
        loadingLabel="Importing..."
        isLoading={isImporting}
      />
    </>
  );
}
