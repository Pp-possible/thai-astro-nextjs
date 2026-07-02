"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav({ id }: { id?: string }) {
  const pathname = usePathname();

  const navItems = [
    { label: "หน้าหลัก", icon: "🏠", path: "/" },
    { label: "ประวัติ", icon: "🕒", path: "/history" },
    { label: "ตั้งค่า", icon: "⚙️", path: "/settings" },
  ];

  return (
    <div
      id={id}
      className="bottom-nav fixed bottom-0 left-0 right-0 bg-[rgba(26,16,60,0.85)] backdrop-blur-[20px] border-t border-[var(--glass-border)] p-[12px_24px] flex justify-around items-center z-50"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.label}
            href={item.path}
            className={`nav-item flex flex-col items-center gap-1 cursor-pointer ${
              isActive ? "text-[var(--gold)]" : "text-[var(--text-dim)]"
            }`}
          >
            <div className="text-[24px] leading-none">{item.icon}</div>
            <div className={`text-[11px] ${isActive ? "font-semibold" : "font-normal"}`}>
              {item.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
