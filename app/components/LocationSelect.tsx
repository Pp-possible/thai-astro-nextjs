"use client";

import React, { useState, useEffect, useRef } from "react";
import { PROVINCE_DATA } from "../lib/provinceData";

interface LocationSelectProps {
  provinceValue: string;
  districtValue: string;
  onProvinceChange: (val: string) => void;
  onDistrictChange: (val: string) => void;
}

export default function LocationSelect({
  provinceValue,
  districtValue,
  onProvinceChange,
  onDistrictChange,
}: LocationSelectProps) {
  // Provinces
  const allProvinces = Object.keys(PROVINCE_DATA);
  const [provSearch, setProvSearch] = useState(provinceValue);
  const [provList, setProvList] = useState<string[]>([]);
  const [showProvDrop, setShowProvDrop] = useState(false);

  // Districts
  const [distSearch, setDistSearch] = useState(districtValue);
  const [distList, setDistList] = useState<string[]>([]);
  const [showDistDrop, setShowDistDrop] = useState(false);

  const provRef = useRef<HTMLDivElement>(null);
  const distRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (provRef.current && !provRef.current.contains(event.target as Node)) {
        setShowProvDrop(false);
      }
      if (distRef.current && !distRef.current.contains(event.target as Node)) {
        setShowDistDrop(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync external values when changed (e.g. from SavedProfile)
  useEffect(() => {
    setProvSearch(provinceValue);
  }, [provinceValue]);

  useEffect(() => {
    setDistSearch(districtValue);
  }, [districtValue]);

  // Province handlers
  const handleProvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setProvSearch(val);
    onProvinceChange(""); // clear actual selected until they click
    onDistrictChange("");
    setDistSearch("");

    if (!val) {
      setProvList(allProvinces);
    } else {
      setProvList(allProvinces.filter((p) => p.includes(val)));
    }
    setShowProvDrop(true);
  };

  const selectProvince = (p: string) => {
    setProvSearch(p);
    onProvinceChange(p);
    setShowProvDrop(false);
    
    // Clear district when province changes
    onDistrictChange("");
    setDistSearch("");
  };

  const clearProvince = () => {
    setProvSearch("");
    onProvinceChange("");
    setDistSearch("");
    onDistrictChange("");
    setShowProvDrop(false);
  };

  // District handlers
  const handleDistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDistSearch(val);
    onDistrictChange(""); // clear actual until click

    if (!provinceValue || !PROVINCE_DATA[provinceValue]) return;
    const availableDists = Object.keys(PROVINCE_DATA[provinceValue]);
    
    if (!val) {
      setDistList(availableDists);
    } else {
      setDistList(availableDists.filter((d) => d.includes(val)));
    }
    setShowDistDrop(true);
  };

  const selectDistrict = (d: string) => {
    setDistSearch(d);
    onDistrictChange(d);
    setShowDistDrop(false);
  };

  const clearDistrict = () => {
    setDistSearch("");
    onDistrictChange("");
    setShowDistDrop(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] mb-[12px]">
      {/* Province */}
      <div className="flex flex-col relative" ref={provRef}>
        <label className="text-[14px] text-[var(--text-dim)] mb-[4px] font-[family-name:var(--font-heading-playfair)]">จังหวัดบ้านเกิด</label>
        <div className="relative">
          <input
            type="text"
            value={provSearch}
            onChange={handleProvChange}
            onFocus={() => {
              setProvList(provSearch ? allProvinces.filter(p => p.includes(provSearch)) : allProvinces);
              setShowProvDrop(true);
            }}
            placeholder="พิมพ์ชื่อจังหวัด..."
            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-sm)] text-[var(--gold-light)] text-[16px] font-[family-name:var(--font-body-sarabun)] p-[12px_14px] outline-none transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] focus:border-[var(--gold)] focus:bg-[var(--glass-bg-hover)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),_0_0_12px_rgba(212,175,55,0.3)] appearance-none"
          />
          {provSearch && (
            <button
              type="button"
              onClick={clearProvince}
              className="absolute right-[12px] top-1/2 -translate-y-1/2 bg-transparent border-none text-[var(--gold-dim)] text-[20px] cursor-pointer p-[4px] leading-[1] hover:text-[var(--gold)] transition-colors"
            >
              ×
            </button>
          )}
          {showProvDrop && (
            <ul className="absolute z-[100] top-[calc(100%+6px)] left-0 right-0 bg-[rgba(26,16,60,0.9)] backdrop-blur-[12px] border border-[var(--glass-border)] rounded-[var(--radius-sm)] max-h-[180px] overflow-y-auto shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
              {provList.length > 0 ? (
                provList.map((p) => (
                  <li
                    key={p}
                    onClick={() => selectProvince(p)}
                    className="list-none p-[12px_16px] cursor-pointer text-[16px] transition-all border-b border-[rgba(255,255,255,0.02)] hover:bg-[rgba(201,168,76,0.15)] hover:text-[var(--gold-light)] hover:pl-[20px]"
                  >
                    {p}
                  </li>
                ))
              ) : (
                <li className="list-none p-[12px_16px] text-[var(--text-muted)] italic cursor-default">ไม่พบจังหวัด</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* District */}
      <div className="flex flex-col relative" ref={distRef}>
        <label className="text-[14px] text-[var(--text-dim)] mb-[4px] font-[family-name:var(--font-heading-playfair)]">อำเภอเกิด</label>
        <div className="relative">
          <input
            type="text"
            value={distSearch}
            onChange={handleDistChange}
            onFocus={() => {
              if (provinceValue && PROVINCE_DATA[provinceValue]) {
                const available = Object.keys(PROVINCE_DATA[provinceValue]);
                setDistList(distSearch ? available.filter(d => d.includes(distSearch)) : available);
                setShowDistDrop(true);
              }
            }}
            placeholder={provinceValue ? "พิมพ์ชื่ออำเภอ..." : "โปรดเลือกจังหวัดก่อน"}
            disabled={!provinceValue}
            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-sm)] text-[var(--gold-light)] text-[16px] font-[family-name:var(--font-body-sarabun)] p-[12px_14px] outline-none transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] focus:border-[var(--gold)] focus:bg-[var(--glass-bg-hover)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),_0_0_12px_rgba(212,175,55,0.3)] appearance-none disabled:opacity-50"
          />
          {distSearch && (
            <button
              type="button"
              onClick={clearDistrict}
              className="absolute right-[12px] top-1/2 -translate-y-1/2 bg-transparent border-none text-[var(--gold-dim)] text-[20px] cursor-pointer p-[4px] leading-[1] hover:text-[var(--gold)] transition-colors"
            >
              ×
            </button>
          )}
          {showDistDrop && provinceValue && (
            <ul className="absolute z-[100] top-[calc(100%+6px)] left-0 right-0 bg-[rgba(26,16,60,0.9)] backdrop-blur-[12px] border border-[var(--glass-border)] rounded-[var(--radius-sm)] max-h-[180px] overflow-y-auto shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
              {distList.length > 0 ? (
                distList.map((d) => (
                  <li
                    key={d}
                    onClick={() => selectDistrict(d)}
                    className="list-none p-[12px_16px] cursor-pointer text-[16px] transition-all border-b border-[rgba(255,255,255,0.02)] hover:bg-[rgba(201,168,76,0.15)] hover:text-[var(--gold-light)] hover:pl-[20px]"
                  >
                    {d}
                  </li>
                ))
              ) : (
                <li className="list-none p-[12px_16px] text-[var(--text-muted)] italic cursor-default">ไม่พบอำเภอ</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
