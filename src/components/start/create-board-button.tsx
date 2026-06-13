"use client";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface CreateBoardButtonProps {
  onCreate: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function CreateBoardButton({
  onCreate,
  isLoading,
  disabled = false,
}: CreateBoardButtonProps) {
  return (
    <button
      type="button"
      onClick={onCreate}
      disabled={disabled || isLoading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2E6F40] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#245A34] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Creating your board...
        </>
      ) : (
        "Create board"
      )}
    </button>
  );
}
