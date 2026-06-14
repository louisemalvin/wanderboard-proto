"use client";

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

const sizeClasses: Record<string, string> = {
  sm: "text-xs px-3 py-1",
  md: "text-sm px-4 py-1.5",
};

export default function FilterChip({
  label,
  selected = false,
  onClick,
  size = "md",
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest min-h-[44px] ${
        selected
          ? "bg-forest text-white"
          : "bg-app-bg text-ink hover:bg-surface"
      } ${sizeClasses[size]}`}
    >
      {label}
    </button>
  );
}
