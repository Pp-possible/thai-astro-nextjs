"use client";

import React from "react";
import { useLiff } from "@/lib/LiffProvider";

export default function TopAppBar({ id }: { id?: string }) {
  const { profile } = useLiff();

  return (
    <div
      id={id}
      className="top-app-bar flex justify-between items-center p-[20px_20px_10px]"
    >
      <div className="brand-logo flex items-center gap-2" style={{ fontFamily: "var(--font-heading-playfair)", fontSize: "24px", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.1em" }}>
        <span style={{ fontSize: "28px" }}>🔮</span> THAI ASTRO.
      </div>
      <div className="profile-chip flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] backdrop-blur-md shadow-md">
        {profile?.pictureUrl && (
          <img
            src={profile.pictureUrl}
            alt="Profile"
            className="w-[28px] h-[28px] rounded-full object-cover border border-[var(--gold-dim)]"
          />
        )}
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-[var(--gold-light)] leading-tight">
            {profile?.displayName || "Loading..."}
          </span>
          <span className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">
            USER
          </span>
        </div>
      </div>
    </div>
  );
}
