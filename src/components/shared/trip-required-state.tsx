import Link from "next/link";
import LogoMark from "@/components/shared/logo-mark";

interface TripRequiredStateProps {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export default function TripRequiredState({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: TripRequiredStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center shadow-surface">
        <div className="mx-auto mb-5 flex justify-center">
          <LogoMark size="md" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={primaryHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-forest-dark px-4 text-sm font-medium text-white transition-colors hover:bg-forest-dark-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-dark"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-app-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-dark"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
