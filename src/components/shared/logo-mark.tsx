import Link from "next/link";

interface LogoMarkProps {
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<string, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

export default function LogoMark({ size = "md" }: LogoMarkProps) {
  return (
    <Link
      href="/home"
      className={`font-display tracking-tight text-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-dark ${sizeClasses[size]}`}
    >
      Wanderboard
    </Link>
  );
}
