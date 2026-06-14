"use client";

import Image from "next/image";

interface ContextualTipCardProps {
  tip: string;
}

export default function ContextualTipCard({ tip }: ContextualTipCardProps) {
  return (
    <div className="bg-[#E7F1E8] border border-[#BFCDBF] rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
          <Image
            src="/mori.png"
            alt="Mori"
            width={20}
            height={20}
            className="w-5 h-5 rounded-full"
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-forest uppercase tracking-wider mb-1">
            Mori
          </p>
          <p className="text-sm text-ink/85 leading-relaxed">{tip}</p>
        </div>
      </div>
    </div>
  );
}
