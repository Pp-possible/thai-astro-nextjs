import React from "react";
import Link from "next/link";

interface ModeCardProps {
  id?: string;
  icon: string;
  title: string;
  desc: string;
  link: string;
  priceType: "free" | "paid" | "peak" | "hipeak";
  priceAmount: number;
}

export default function ModeCard({
  id,
  icon,
  title,
  desc,
  link,
  priceType,
  priceAmount,
}: ModeCardProps) {
  return (
    <Link id={id} href={link} className="mode-card group block rounded-[20px] p-[20px_16px] text-left relative overflow-hidden transition-all duration-300">
      <div className="mode-icon text-[32px] mb-4 bg-[rgba(212,175,55,0.1)] w-[50px] h-[50px] flex items-center justify-center rounded-[14px] text-[var(--gold-light)] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="mode-title text-[17px] mb-1 font-bold text-[var(--gold)]" style={{ fontFamily: "var(--font-heading-playfair)" }}>
        {title}
      </div>
      <div className="mode-desc text-[13px] mb-3 text-[var(--text-muted)] line-clamp-2 leading-relaxed">
        {desc}
      </div>
      <div className={`price-tag ${priceType}`}>
        {priceAmount === 0 ? "⭐️ ฟรี" : `⭐️ ${priceAmount}`}
      </div>
    </Link>
  );
}
