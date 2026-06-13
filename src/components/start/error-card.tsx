"use client";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface ErrorCardProps {
  message: string;
  onRetry: () => void;
  onSampleTrip: () => void;
  onStartEmpty: () => void;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function ErrorCard({
  message,
  onRetry,
  onSampleTrip,
  onStartEmpty,
}: ErrorCardProps) {
  return (
    <div className="w-full rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-red-800">
            {message}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try again
            </button>

            <button
              type="button"
              onClick={onSampleTrip}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DED6CC] bg-[#FFFDFC] px-3.5 py-2 text-xs font-medium text-[#1F2A22] transition-colors hover:bg-[#F7F4EF]"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              Create a sample trip
            </button>

            <button
              type="button"
              onClick={onStartEmpty}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DED6CC] bg-[#FFFDFC] px-3.5 py-2 text-xs font-medium text-[#1F2A22] transition-colors hover:bg-[#F7F4EF]"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Start with an empty board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
