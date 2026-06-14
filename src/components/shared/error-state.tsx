import { AlertCircle } from "lucide-react";
import Button from "@/components/shared/button";

interface ErrorAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

interface ErrorStateProps {
  title: string;
  message: string;
  actions?: ErrorAction[];
}

export default function ErrorState({
  title,
  message,
  actions,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <AlertCircle className="w-12 h-12 text-muted mb-4" strokeWidth={1.5} />
      <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
      <p className="text-sm text-muted max-w-sm">{message}</p>
      {actions && actions.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {actions.map((action, i) => (
            <Button key={i} variant={action.variant || "secondary"} onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
