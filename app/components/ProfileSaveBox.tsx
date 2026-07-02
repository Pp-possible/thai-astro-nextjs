"use client";

import React, { useState } from "react";
import { AstroProfile } from "./SavedProfileSelector";

interface Props {
  currentProfileData: Omit<AstroProfile, "name">;
  onSaved: () => void;
}

export default function ProfileSaveBox({ currentProfileData, onSaved }: Props) {
  const [profileName, setProfileName] = useState("");

  const handleSave = () => {
    const trimmed = profileName.trim();
    if (!trimmed) {
      alert("กรุณาตั้งชื่อโปรไฟล์ก่อนบันทึก");
      return;
    }
    
    // Check if data is somewhat complete (e.g. day and month are present)
    if (!currentProfileData.day || !currentProfileData.month) {
      alert("กรุณากรอกข้อมูลวันเดือนปีเกิดให้ครบถ้วนก่อนบันทึก");
      return;
    }

    try {
      let saved = JSON.parse(localStorage.getItem("saved_profiles") || "[]") as AstroProfile[];
      
      // Remove if exists
      saved = saved.filter(p => p.name !== trimmed);
      
      // Add new
      const newProfile: AstroProfile = {
        name: trimmed,
        ...currentProfileData
      };
      
      saved.push(newProfile);
      localStorage.setItem("saved_profiles", JSON.stringify(saved));
      setProfileName("");
      onSaved();
      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
    } catch (e) {
      console.error("Error saving profile", e);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  return (
    <div className="bg-[rgba(251,191,36,0.08)] border border-[var(--glass-border)] rounded-[var(--radius-sm)] p-3 mb-6 mt-2">
      <label className="text-[14px] text-[var(--gold)] font-semibold mb-2 block">
        💾 บันทึกข้อมูลที่กำลังกรอกนี้เก็บไว้ใช้ครั้งหน้า
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder="ตั้งชื่อ (เช่น ตัวเอง, แฟน)"
          className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-sm)] text-[var(--gold-light)] text-[16px] font-[family-name:var(--font-body-sarabun)] px-[14px] py-[8px] outline-none transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] appearance-none"
        />
        <button
          onClick={handleSave}
          className="bg-[var(--surface3)] text-[var(--gold-light)] border border-[var(--gold-dim)] px-[12px] rounded-[var(--radius-sm)] text-[15px] cursor-pointer whitespace-nowrap font-[family-name:var(--font-heading-playfair)] transition-all hover:bg-[var(--gold-dim)] hover:text-[#1A1200]"
        >
          บันทึก
        </button>
      </div>
    </div>
  );
}
