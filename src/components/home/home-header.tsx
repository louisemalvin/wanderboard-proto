import Link from "next/link";

export default function HomeHeader() {
  return (
    <header className="flex items-center justify-between bg-[color:var(--wb-forest)] px-10 py-4">
      <Link
        href="/"
        className="font-display text-xl tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Wanderboard
      </Link>
    </header>
  );
}
