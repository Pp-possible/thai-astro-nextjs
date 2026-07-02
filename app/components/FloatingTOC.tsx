"use client";

import React, { useState, useEffect } from "react";

interface FloatingTOCProps {
  headers: { id: string; text: string }[];
}

export default function FloatingTOC({ headers }: FloatingTOCProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Scroll spy or click outside logic can be added here
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.toc-overlay') && !target.closest('.toc-fab')) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const scrollToRef = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="toc-fab z-50 animate-[tocBounce_2s_ease-in-out_1s]"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "80px",
          left: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--gold-light), var(--gold-dim))",
          boxShadow: "0 4px 15px rgba(212,175,55,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          zIndex: 1000
        }}
      >
        ⭐
      </button>

      {isOpen && (
        <div 
          className="toc-overlay z-40"
          style={{
            position: "fixed",
            bottom: "140px",
            left: "20px",
            width: "250px",
            // Removed solid background to achieve style 1 as requested: "ไม่ต้องมีกรอบสี่เหลี่ยมด้านหลังสารบัญมารองรับ"
            // But we might still want a slight glass blur for readability.
            background: "transparent", 
            backdropFilter: "blur(2px)",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          {headers.map((h, i) => (
            <div
              key={i}
              onClick={() => scrollToRef(h.id)}
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                padding: "8px 16px",
                borderRadius: "20px",
                color: "var(--gold-light)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                border: "1px solid rgba(212,175,55,0.3)",
                width: "fit-content"
              }}
            >
              {h.text}
            </div>
          ))}
        </div>
      )}
      <style jsx global>{`
        @keyframes tocBounce {
          0%, 40%, 80%, 100% { transform: translateY(0) scale(1); }
          20% { transform: translateY(-15px) scale(1.05); }
          60% { transform: translateY(-25px) scale(1.1); }
        }
      `}</style>
    </>
  );
}
