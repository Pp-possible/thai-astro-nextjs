"use client";

import React from "react";
import { useLiff } from "@/lib/LiffProvider";

export default function BalanceCard({ id }: { id?: string }) {
  // In the real app, we fetch balance from API. For now, it's mocked or managed via context/props.
  // We'll just display a static UI or a placeholder until the API is hooked up.
  const balance = 0; // TODO: fetch from API

  return (
    <div
      id={id}
      className="balance-card bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.03)] backdrop-blur-[16px] border border-[var(--glass-border)] rounded-[24px] p-[28px_24px] mb-[32px] flex flex-col items-center shadow-[0_12px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] relative overflow-hidden"
    >
      <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-[radial-gradient(circle,rgba(212,175,55,0.2)_0%,transparent_70%)] blur-[20px]"></div>
      <div className="text-[15px] text-[var(--gold-light)] mb-2 font-semibold tracking-wider uppercase">
        ยอดคงเหลือ
      </div>
      <div
        className="gold-balance text-[42px] font-bold text-[var(--text)] mb-6 text-shadow-md leading-none"
        style={{ fontFamily: "var(--font-heading-playfair)" }}
      >
        <span className="text-[28px] mr-2">⭐️</span>
        <span id="goldBalance">{balance}</span>
      </div>
      <button
        onClick={() => alert("ระบบเติมเงินกำลังอยู่ระหว่างการพัฒนา")} // TODO: connect to payment
        className="btn-primary"
      >
        + เติม Stars
      </button>
    </div>
  );
}
