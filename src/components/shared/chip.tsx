interface ChipProps {
  label: string;
  color?: "forest" | "clay" | "amber" | "neutral";
  size?: "sm" | "md";
}

const colorClasses: Record<string, string> = {
  forest: "bg-forest-surface text-forest",
  clay: "bg-clay text-ink",
  amber: "bg-amber-50 text-amber-800",
  neutral: "bg-app-bg text-muted",
};

const sizeClasses: Record<string, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
};

export default function Chip({ label, color = "neutral", size = "sm" }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorClasses[color]} ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
}
