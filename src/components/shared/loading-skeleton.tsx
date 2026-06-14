interface LoadingSkeletonProps {
  variant?: "text" | "card" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export default function LoadingSkeleton({
  variant = "text",
  width,
  height,
  lines = 3,
}: LoadingSkeletonProps) {
  const baseClass = "bg-muted/20 motion-reduce:animate-none animate-pulse";

  if (variant === "circle") {
    return (
      <div
        className={`${baseClass} rounded-full`}
        style={{
          width: width ?? 48,
          height: height ?? 48,
        }}
      />
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`${baseClass} rounded-xl`}
        style={{
          width: width ?? "100%",
          height: height ?? 120,
        }}
      />
    );
  }

  if (variant === "rect") {
    return (
      <div
        className={`${baseClass} rounded-lg`}
        style={{
          width: width ?? "100%",
          height: height ?? 80,
        }}
      />
    );
  }

  // text variant
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${baseClass} rounded h-3`}
          style={{
            width: i === lines - 1 ? "60%" : "100%",
          }}
        />
      ))}
    </div>
  );
}
