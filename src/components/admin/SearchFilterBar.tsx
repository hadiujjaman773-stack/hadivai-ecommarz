"use client";

import { Search } from "lucide-react";

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  placeholder = "খুঁজুন...",
  children,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:items-center">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          className="input-field input-field-search text-base w-full"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {children && (
        <div className="flex flex-wrap gap-2 shrink-0 sm:w-auto [&_select]:input-field [&_select]:py-2 [&_select]:text-sm [&_select]:w-full [&_select]:sm:w-28 [&_select]:md:w-32">
          {children}
        </div>
      )}
    </div>
  );
}
