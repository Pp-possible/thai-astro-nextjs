"use client";

import React, { useEffect } from "react";
import { useLiff } from "@/lib/LiffProvider";
import TopAppBar from "./components/TopAppBar";
import BalanceCard from "./components/BalanceCard";
import ModeCard from "./components/ModeCard";
import BottomNav from "./components/BottomNav";
import AstroLoader from "./components/AstroLoader";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function Home() {
  const { isReady, liffError, usageState } = useLiff();

  useEffect(() => {
    // Only run tour if LIFF is ready and tutorial is not done
    if (isReady && !localStorage.getItem("tutorial_done")) {
      const driverObj = driver({
        showProgress: true,
        nextBtnText: 'ต่อไป ➔',
        prevBtnText: '← กลับ',
        doneBtnText: 'ปิด ✕',
        progressText: '{{current}} / {{total}}',
        allowClose: true,
        steps: [
          { element: '#tour-profile', popover: { title: 'ข้อมูลของคุณ', description: 'แสดงชื่อโปรไฟล์และบทบาทของคุณในระบบ' } },
          { element: '#tour-balance', popover: { title: 'ยอด Stars คงเหลือ', description: 'Stars ใช้สำหรับแลกบริการดูดวงต่างๆ คุณสามารถกดปุ่ม "+ เติม Stars" ได้ที่นี่' } },
          { element: '#tour-card-overview', popover: { title: '1. ภาพรวมทุกด้าน', description: 'โหมดนี้ใช้สำหรับเช็กดวงชะตาภาพรวมแบบครอบคลุมทั้ง 12 ด้าน (งาน เงิน ความรัก ฯลฯ) เหมาะสำหรับการเช็กพื้นดวงประจำปีหรือช่วงเวลาที่สนใจ' } },
          { element: '#tour-card-question', popover: { title: '2. ทำนายเฉพาะเรื่อง', description: 'โหมดนี้สำหรับคนที่มีคำถามในใจชัดเจน พิมพ์คำถามลงไปได้เลย แล้วระบบจะให้คำตอบแบบตรงจุดและเจาะจงเฉพาะเรื่องที่คุณถาม' } },
          { element: '#tour-card-interactive', popover: { title: '3. ปรึกษาเชิงลึก', description: 'โหมดที่แม่นยำสูงสุด! AI จะทำตัวเป็นหมอดู สัมภาษณ์และสอบถามบริบทแวดล้อมของคุณเพิ่มเติมก่อน เพื่อให้ได้คำทำนายที่ตรงกับสถานการณ์จริงที่สุด' } },
          { element: '#tour-card-7days', popover: { title: '4. วิเคราะห์ดวง 7 วัน', description: 'โหมดนี้เหมาะสำหรับเตรียมตัวล่วงหน้า ระบบจะวิเคราะห์ดวงทั้ง 7 ด้านแบบรายวัน เพื่อให้คุณรู้ว่า 7 วันข้างหน้าจะต้องรับมือกับเรื่องอะไรบ้าง' } },
          { element: '#tour-nav', popover: { title: 'เมนูนำทาง', description: 'คุณสามารถสลับหน้าจอระหว่างหน้าหลักและหน้าเติม Stars ได้อย่างรวดเร็วผ่านแถบด้านล่างนี้' } }
        ],
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep() || confirm("ต้องการปิดคำแนะนำการใช้งานใช่หรือไม่?")) {
            localStorage.setItem('tutorial_done', 'true');
            driverObj.destroy();
          }
        }
      });
      setTimeout(() => { driverObj.drive(); }, 400);
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <AstroLoader />
        <div className="text-[var(--text-dim)] font-body mt-4">กำลังเชื่อมต่อ...</div>
      </div>
    );
  }

  if (liffError) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center text-red-400">
        <p>Error initializing LINE LIFF: {liffError}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-[100px]">
      <TopAppBar id="tour-profile" />

      <div className="p-[0_20px]">
        <div className="text-center py-4 text-[16px] text-[var(--text-dim)] leading-relaxed italic">
          "ดวงดาวไม่ได้กำหนดชะตาชีวิตของคุณ,<br />
          แต่ช่วยส่องแสงนำทางให้คุณเดินอย่างมั่นใจ"
        </div>

        <BalanceCard id="tour-balance" />

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[var(--gold-dim)] opacity-80"></div>
          <h3 className="text-[18px] font-semibold text-[var(--text)]" style={{ fontFamily: "var(--font-heading-playfair)" }}>
            บริการของเรา
          </h3>
          <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[var(--gold-dim)] opacity-80"></div>
        </div>

        <div id="tour-services" className="grid grid-cols-2 gap-3 py-2">
          <ModeCard
            id="tour-card-overview"
            icon="🪐"
            title="ภาพรวมทุกด้าน"
            desc="เช็กจังหวะชีวิต 12 ด้าน (งาน เงิน ความรัก ฯลฯ) เหมาะสำหรับดูภาพรวมพื้นดวง"
            link="/form/overview"
            priceType={usageState?.isFree ? "free" : "paid"}
            priceAmount={15}
          />
          <ModeCard
            id="tour-card-question"
            icon="🔍"
            title="ทำนายเฉพาะเรื่อง"
            desc="ถามตรงจุด ตอบตรงประเด็น! พิมพ์คำถามเฉพาะเรื่องที่อยากรู้ให้ระบบทำนายทันที"
            link="/form/question"
            priceType="paid"
            priceAmount={10}
          />
          <ModeCard
            id="tour-card-interactive"
            icon="💬"
            title="ปรึกษาเชิงลึก"
            desc="ดึงความแม่นยำขั้นสุด! AI จะสัมภาษณ์เพื่อเข้าใจบริบทของคุณก่อนเริ่มทำนาย"
            link="/form/interactive"
            priceType="paid"
            priceAmount={25}
          />
          <ModeCard
            id="tour-card-7days"
            icon="📅"
            title="วิเคราะห์ดวง 7 วัน"
            desc="เจาะลึก 7 ด้านรายวัน ทำนายล่วงหน้า 7 วันเต็ม โดดเด่นทุกมิติทั้งภายในภายนอก"
            link="/form/7days"
            priceType="paid"
            priceAmount={15}
          />
        </div>
      </div>

      <BottomNav id="tour-nav" />
    </div>
  );
}
