"use client";

import type { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: "default" | "subtle";
  disabled?: boolean;
  active?: boolean;
}

const variantClasses: Record<string, string> = {
  default: "text-ink hover:bg-surface",
  subtle: "text-muted hover:bg-surface",
};

export default function IconButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  disabled = false,
  active = false,
}: IconButtonProps) {
  const baseClass =
    "inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:opacity-50 disabled:cursor-not-allowed";

  if (active) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClass} bg-forest text-white`}
      >
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClasses[variant]}`}
    >
      <Icon className="w-5 h-5" strokeWidth={1.5} />
    </button>
  );
}
