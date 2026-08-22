"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import type { Company } from "../types";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500";

interface CompanyFilterComboboxProps {
  value: string;
  onChange: (companyId: string) => void;
  companies: Company[];
  placeholder?: string;
}

export function CompanyFilterCombobox({
  value,
  onChange,
  companies,
  placeholder = "Search by company...",
}: CompanyFilterComboboxProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedCompany = useMemo(
    () => companies.find((company) => String(company.id) === value),
    [companies, value],
  );

  const displayValue = isOpen
    ? searchQuery
    : (selectedCompany?.companyName ?? "");

  const openDropdown = () => {
    setSearchQuery(selectedCompany?.companyName ?? "");
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const trimmedQuery = searchQuery.trim();

  const filteredCompanies = useMemo(() => {
    if (!trimmedQuery) {
      return companies;
    }

    const lower = trimmedQuery.toLowerCase();
    return companies.filter((company) =>
      company.companyName.toLowerCase().includes(lower),
    );
  }, [companies, trimmedQuery]);

  const handleSelect = (companyId: string) => {
    onChange(companyId);
    closeDropdown();
  };

  return (
    <div ref={containerRef} className="relative sm:min-w-[200px] sm:flex-1">
      <input
        type="text"
        value={displayValue}
        onChange={(event) => {
          setSearchQuery(event.target.value);
          onChange("");
          setIsOpen(true);
        }}
        onFocus={openDropdown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        className={inputClass}
      />

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              onClick={() => handleSelect("")}
              className="w-full px-3 py-2 text-left text-sm text-zinc-500 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              All companies
            </button>
          </li>

          {filteredCompanies.map((company) => (
            <li key={company.id}>
              <button
                type="button"
                role="option"
                aria-selected={String(company.id) === value}
                onClick={() => handleSelect(String(company.id))}
                className="w-full px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {company.companyName}
              </button>
            </li>
          ))}

          {filteredCompanies.length === 0 ? (
            <li className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              No companies found
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
