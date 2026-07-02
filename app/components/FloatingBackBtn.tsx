"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  href?: string;
  label?: string;
  showOnScroll?: boolean;
}

export default function FloatingBackBtn({ href = "/", label = "กลับ", showOnScroll = true }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(!showOnScroll);

  useEffect(() => {
    if (!showOnScroll) return;

    const handleScroll = () => {
      if (window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showOnScroll]);

  const handleClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed top-[15px] left-[15px] bg-[var(--surface2)] text-[var(--gold)] border border-[var(--gold-dim)] rounded-[50px] px-[20px] py-[10px] font-[family-name:var(--font-heading-playfair)] text-[16px] font-bold shadow-[0_4px_15px_rgba(0,0,0,0.5)] cursor-pointer z-[9999] transition-all duration-300 backdrop-blur-[5px] hover:bg-[var(--gold-dim)] hover:text-[#1A1200] hover:-translate-y-[2px] ${
        visible ? "opacity-100 block" : "opacity-0 hidden"
      }`}
    >
      <span className="mr-2">←</span>
      {label}
    </button>
  );
}
