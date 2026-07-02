"use client";

import React from "react";

export default function AstroLoader({
  show = true,
  text = "กำลังโหลด...",
}: {
  show?: boolean;
  text?: string;
}) {
  if (!show) return null;

  return (
    <div
      id="loading"
      className="fixed inset-0 bg-[#0d0a1af2] backdrop-blur-md z-[999] flex flex-col items-center justify-center gap-6"
    >
      <div className="astro-loader relative w-[100px] h-[100px] flex items-center justify-center">
        <div className="core text-[40px] z-10 drop-shadow-[0_0_20px_var(--gold)] text-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-float">
          🔮
        </div>
        <div className="ring ring1 absolute rounded-full border-[2px] border-transparent w-full h-full border-t-[var(--gold)] border-b-[rgba(212,175,55,0.2)] animate-spin-slow"></div>
        <div className="ring ring2 absolute rounded-full border-[2px] border-transparent w-[75%] h-[75%] border-l-[var(--gold-light)] border-r-[rgba(255,255,255,0.1)] animate-spin-slow-reverse"></div>
        <div className="ring ring3 absolute rounded-full border-[2px] border-transparent w-[50%] h-[50%] border-t-[var(--gold)] border-b-[var(--gold)] border-dotted animate-spin-normal"></div>
      </div>
      <p className="text-[20px] text-[var(--gold-light)] font-[family-name:var(--font-heading-playfair)] tracking-widest text-shadow-[0_2px_10px_rgba(212,175,55,0.5)] font-bold mt-[10px] animate-pulse">
        {text}
      </p>
    </div>
  );
}
