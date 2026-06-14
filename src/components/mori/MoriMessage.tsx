"use client";

interface MoriMessageProps {
  message: string;
  onDismiss?: () => void;
}

export default function MoriMessage({ message, onDismiss }: MoriMessageProps) {
  if (!message) return null;

  return (
    <div className="relative rounded-xl border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-2.5">
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-md text-[color:var(--wb-muted)] transition-colors hover:bg-black/5 hover:text-[color:var(--wb-ink)]"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <p className={`text-sm leading-relaxed text-[color:var(--wb-ink)] ${onDismiss ? "pr-5" : ""}`}>
        {message}
      </p>
    </div>
  );
}
