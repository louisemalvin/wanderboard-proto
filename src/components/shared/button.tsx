"use client";

import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

const variantClasses: Record<string, string> = {
  primary: "bg-forest-dark text-white hover:bg-forest-dark-hover",
  secondary: "bg-surface text-ink border border-border hover:bg-app-bg",
  ghost: "bg-transparent text-ink hover:bg-app-bg",
};

const sizeClasses: Record<string, string> = {
  sm: "min-h-9 text-xs px-3",
  md: "min-h-[44px] text-sm px-4",
};

export default function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon: Icon,
  children,
  onClick,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
}
