"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/lib/LiffProvider";
import ProfileHeader from "./components/ProfileHeader";
import BalanceCard from "./components/BalanceCard";
import ModeCard from "./components/ModeCard";

export default function HomePage() {
  const router = useRouter();
  const { isReady, profile, usageState } = useLiff();
  
  const [prices, setPrices] = useState({
    overview: 15,
    question: 2,
    interactive: 25,
    sevenDays: 15
  });

  useEffect(() => {
    if (usageState) {
      setPrices({
        overview: usageState.isFree ? 0 : (usageState.overviewPrice ?? 15),
        question: usageState.isFree ? 0 : (usageState.questionPrice ?? 10),
        interactive: usageState.interactivePrice ?? 25, // default to 25 based on screenshot
        sevenDays: usageState.sevenDaysPrice ?? 15, // default to 15 based on screenshot
      });
    }
  }, [usageState]);

  if (!isReady) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-center p-6">
        <div className="inline-typing-loader mb-4 scale-150"><span></span><span></span><span></span></div>
        <p className="text-[var(--gold)] animate-pulse">กำลังโหลดข้อมูลดวงดาว...</p>
      </div>
    );
  }

  // If no profile, they might not be fully registered yet, but we allow them to see the UI.
  // ProfileHeader and BalanceCard handle empty states gracefully.

  return (
    <div className="flex-1 overflow-y-auto pb-[100px] p-[20px]">
      <ProfileHeader />
      
      <div className="text-center mb-8">
        <h1 className="text-[28px] font-bold text-[var(--gold)] mb-2 uppercase tracking-[3px] text-shadow-sm flex items-center justify-center gap-2">
          <span className="text-[24px]">🔮</span> THAI ASTRO.
        </h1>
        <p className="text-[13px] text-[var(--text-dim)] italic max-w-[280px] mx-auto leading-relaxed">
          &ldquo;ดวงดาวไม่ได้กำหนดชะตาชีวิตของคุณ,<br />แต่ช่วยส่องแสงนำทางให้คุณเดินอย่างมั่นใจ&rdquo;
        </p>
      </div>

      <BalanceCard />

      <div className="flex items-center justify-center gap-4 mb-6 relative">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[rgba(212,175,55,0.3)]"></div>
        <h2 className="text-[16px] font-semibold text-[var(--gold)] tracking-widest whitespace-nowrap">
          บริการของเรา
        </h2>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[rgba(212,175,55,0.3)]"></div>
      </div>

      <div className="mode-grid">
        <ModeCard
          title="ภาพรวมทุกด้าน"
          description="เช็กจังหวะชีวิต 12 ด้าน (งาน เงิน ความรัก ฯลฯ) เหมาะสำหรับการเริ่มต้น"
          icon="🪐"
          price={prices.overview}
          onClick={() => router.push("/form/overview")}
        />
        <ModeCard
          title="ทำนายเฉพาะเรื่อง"
          description="ถามตรงจุด ตอบตรงประเด็น! พิมพ์คำถามเฉพาะเรื่องที่คุณอยากรู้"
          icon="🔍"
          price={prices.question}
          onClick={() => router.push("/form/question")}
        />
        <ModeCard
          title="ปรึกษาเชิงลึก"
          description="ดึงความแม่นยำขั้นสุด! AI จะสัมภาษณ์เพื่อเข้าใจบริบทของคุณก่อนทำนาย"
          icon="💬"
          price={prices.interactive}
          onClick={() => router.push("/form/interactive")}
        />
        <ModeCard
          title="วิเคราะห์ดวง 7 วัน"
          description="เจาะลึก 7 ด้านรายวัน ทำนายล่วงหน้า 7 วันเต็ม โดดเด่นทุกจังหวะ"
          icon="📅"
          price={prices.sevenDays}
          badge="HOT"
          onClick={() => router.push("/form/7days")}
        />
      </div>
    </div>
  );
}
