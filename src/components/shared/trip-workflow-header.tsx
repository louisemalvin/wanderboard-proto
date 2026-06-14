interface TripWorkflowHeaderProps {
  title: string;
  meta: string;
  children?: React.ReactNode;
}

export default function TripWorkflowHeader({
  title,
  meta,
  children,
}: TripWorkflowHeaderProps) {
  return (
    <header className="sticky top-0 z-30 shadow-sm">
      <div className="bg-forest-dark text-white">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
            <p className="mt-0.5 truncate text-xs text-white/72">{meta}</p>
          </div>
          {children ? <div className="flex shrink-0 flex-wrap gap-2">{children}</div> : null}
        </div>
      </div>
    </header>
  );
}
