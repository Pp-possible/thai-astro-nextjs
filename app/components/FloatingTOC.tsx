"use client";

import React, { useState, useEffect } from "react";

interface FloatingTOCProps {
  items: { id: string; title: string }[];
}

export default function FloatingTOC({ items }: FloatingTOCProps) {
  const [open, setOpen] = useState(false);

  // Close TOC when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (open) setOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [open]);

  const toggleTOC = () => setOpen(!open);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <>
      <div 
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/50 z-[98] transition-opacity duration-300 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      />
      
      <div 
        className={`fixed bottom-[80px] left-[20px] flex flex-col gap-[10px] z-[99] transition-all duration-300 max-h-[70vh] overflow-y-auto pr-[10px] ${open ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-[20px] invisible'}`}
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="bg-[rgba(42,27,84,0.9)] border border-[var(--gold-dim)] backdrop-blur-[10px] px-[15px] py-[10px] rounded-[25px] text-[14px] text-white whitespace-nowrap shadow-[0_4px_15px_rgba(0,0,0,0.5)] cursor-pointer transition-all hover:bg-[var(--gold-dim)] hover:text-black active:bg-[var(--gold-dim)] active:text-black"
          >
            {item.title}
          </div>
        ))}
      </div>

      <div 
        onClick={toggleTOC}
        className="fixed bottom-[20px] left-[20px] w-[50px] h-[50px] rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dim)] text-[#1A1200] text-[24px] flex justify-center items-center shadow-[0_4px_15px_rgba(212,175,55,0.4)] cursor-pointer z-[100] transition-transform active:scale-90"
      >
        ☰
      </div>
    </>
  );
}
