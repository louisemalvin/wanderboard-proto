"use client";

interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
}

export default function SegmentedControl({
  options,
  value,
  onChange,
  fullWidth = false,
}: SegmentedControlProps) {
  return (
    <div
      role="radiogroup"
      className={`${fullWidth ? "flex w-full" : "inline-flex"} rounded-lg bg-app-bg p-0.5`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={`min-h-[44px] min-w-0 flex-1 px-4 text-sm font-medium rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
              isSelected
                ? "bg-forest text-white shadow-sm"
                : "bg-transparent text-ink hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
