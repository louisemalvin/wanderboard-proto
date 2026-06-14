interface CardProps {
  padding?: "sm" | "md" | "lg";
  shadow?: boolean;
  border?: boolean;
  rounded?: "lg" | "xl";
  children: React.ReactNode;
  className?: string;
}

const paddingClasses: Record<string, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const roundedClasses: Record<string, string> = {
  lg: "rounded-lg",
  xl: "rounded-xl",
};

export default function Card({
  padding = "md",
  shadow = false,
  border = true,
  rounded = "xl",
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`bg-surface ${
        border ? "border border-border" : ""
      } ${roundedClasses[rounded]} ${
        shadow ? "shadow-surface" : ""
      } ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
