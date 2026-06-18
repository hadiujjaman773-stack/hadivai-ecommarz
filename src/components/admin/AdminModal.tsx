"use client";

import { X } from "lucide-react";

interface AdminModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "2xl";
}

const maxWidthClass = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function AdminModal({
  title,
  onClose,
  children,
  footer,
  maxWidth = "2xl",
}: AdminModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="বন্ধ করুন"
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-xl shadow-xl w-full max-w-[calc(100vw-1rem)] ${maxWidthClass[maxWidth]} max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 pr-2 truncate">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 sm:px-6 py-4 min-h-0">
          {children}
        </div>
        {footer && (
          <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-gray-100 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
