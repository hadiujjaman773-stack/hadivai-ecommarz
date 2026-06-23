"use client";

import { ShieldAlert } from "lucide-react";

export function OrderFraudButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs px-2 py-1 rounded border border-amber-200 text-amber-800 hover:bg-amber-50 inline-flex items-center gap-1"
    >
      <ShieldAlert className="w-3.5 h-3.5" aria-hidden />
      Fraud BD চেক
    </button>
  );
}
