interface StatusPillProps {
  status: "success" | "warning" | "error" | "neutral";
  label: string;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  success: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  warning: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  error: { bg: "bg-error/10", text: "text-error", dot: "bg-error" },
  neutral: { bg: "bg-app-bg", text: "text-muted", dot: "bg-muted" },
};

export default function StatusPill({ status, label }: StatusPillProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
}
