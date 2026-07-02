"use client";

import React, { useEffect, useState } from "react";

export interface AstroProfile {
  name: string;
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  province: string;
  district: string;
}

interface Props {
  onSelect: (profile: AstroProfile | null) => void;
  refreshTrigger?: number; // Pass this to re-fetch when a new profile is saved
}

export default function SavedProfileSelector({ onSelect, refreshTrigger = 0 }: Props) {
  const [profiles, setProfiles] = useState<AstroProfile[]>([]);
  const [selectedName, setSelectedName] = useState<string>("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("saved_profiles");
      if (saved) {
        setProfiles(JSON.parse(saved));
      } else {
        setProfiles([]);
      }
    } catch (e) {
      console.error("Error reading saved profiles", e);
    }
  }, [refreshTrigger]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedName(val);
    if (!val) {
      onSelect(null);
    } else {
      const found = profiles.find((p) => p.name === val);
      onSelect(found || null);
    }
  };

  const handleDelete = () => {
    if (!selectedName || !confirm(`ต้องการลบข้อมูล "${selectedName}" ใช่หรือไม่?`)) return;
    try {
      let saved = JSON.parse(localStorage.getItem("saved_profiles") || "[]") as AstroProfile[];
      saved = saved.filter((p) => p.name !== selectedName);
      localStorage.setItem("saved_profiles", JSON.stringify(saved));
      setProfiles(saved);
      setSelectedName("");
      onSelect(null);
    } catch (e) {
      console.error("Error deleting profile", e);
    }
  };

  if (profiles.length === 0) return null;

  return (
    <div className="bg-[rgba(201,168,76,0.05)] border border-[var(--gold-dim)] rounded-[var(--radius-sm)] p-4 mb-6 shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]">
      <label className="text-[16px] text-[var(--gold)] font-bold mb-2 block font-[family-name:var(--font-heading-playfair)] tracking-wide">
        ⭐ เลือกข้อมูลที่เคยบันทึกไว้
      </label>
      <div className="flex gap-2">
        <select
          value={selectedName}
          onChange={handleChange}
          className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-sm)] text-[var(--gold-light)] text-[16px] font-[family-name:var(--font-body-sarabun)] p-[12px_14px] outline-none transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] appearance-none"
        >
          <option value="">-- ไม่ใช้ / กรอกใหม่ --</option>
          {profiles.map((p, i) => (
            <option key={i} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        {selectedName && (
          <button
            onClick={handleDelete}
            className="bg-[#2A1654] border border-[var(--glass-border)] rounded-[var(--radius-sm)] text-[#ff4d4f] cursor-pointer px-[10px] text-[16px]"
          >
            ❌ ลบ
          </button>
        )}
      </div>
    </div>
  );
}
