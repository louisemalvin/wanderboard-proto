"use client";

import type { MoriWarning } from "@/lib/ai/mori-schemas";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

const severityConfig: Record<string, { icon: typeof AlertTriangle; className: string }> = {
  info: { icon: Info, className: "border-stone-200 bg-stone-50 text-stone-600" },
  warning: { icon: AlertCircle, className: "border-amber-200 bg-amber-50 text-amber-700" },
  critical: { icon: AlertTriangle, className: "border-red-200 bg-red-50 text-red-700" },
};

interface MoriWarningProps {
  warning: MoriWarning;
}

export default function MoriWarning({ warning }: MoriWarningProps) {
  const config = severityConfig[warning.severity] ?? severityConfig.warning;
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-2 rounded-lg border p-2.5 text-xs ${config.className}`}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="min-w-0">
        <span className="font-medium">{warning.code}</span>
        <p className="mt-0.5">{warning.message}</p>
      </div>
    </div>
  );
}
