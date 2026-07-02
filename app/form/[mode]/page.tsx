"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/lib/LiffProvider";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Swal from "sweetalert2";

export default function FormPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = use(params);
  const { liff, profile } = useLiff();
  const router = useRouter();

  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [province, setProvince] = useState("");
  const [question, setQuestion] = useState("");

  useEffect(() => {
    flatpickr("#birthdate", {
      dateFormat: "d/m/Y",
      allowInput: true,
      onChange: (selectedDates, dateStr) => setDateStr(dateStr),
    });
  }, []);

  const handleSubmit = () => {
    if (!dateStr || !province) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณาระบุ วันเกิด และ จังหวัดที่เกิด",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    if (mode === "question" && !question.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณาระบุ คำถามที่ต้องการให้หมอดูทำนาย",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    // In Next.js, we might send this data to an API, but since the original system
    // uses liff.sendMessages to trigger the LINE bot, we'll keep that behavior.
    const textData = [
      `cmd:predict:${mode}`,
      `date:${dateStr}`,
      `time:${timeStr || "-"}`,
      `province:${province}`,
    ];
    if (mode === "question" || mode === "interactive") {
      textData.push(`question:${question}`);
    }

    if (liff && liff.isLoggedIn()) {
      liff
        .sendMessages([{ type: "text", text: textData.join("|") }])
        .then(() => {
          if (mode === "interactive") {
             // Let the bot reply in LINE, but if there's a chat interface, we might redirect there.
             // Originally, interactive mode just sent a message.
             liff.closeWindow();
          } else {
             liff.closeWindow();
          }
        })
        .catch((err) => {
          console.error("sendMessages error", err);
          Swal.fire("ข้อผิดพลาด", "ไม่สามารถส่งข้อมูลได้", "error");
        });
    } else {
      // Not logged in or testing on web
      Swal.fire("จำลองการส่งข้อมูล", textData.join("|"), "info");
    }
  };

  const titles: Record<string, string> = {
    overview: "ภาพรวมทุกด้าน 🪐",
    question: "ทำนายเฉพาะเรื่อง 🔍",
    interactive: "ปรึกษาเชิงลึก 💬",
    "7days": "วิเคราะห์ดวง 7 วัน 📅",
  };

  return (
    <div className="flex-1 overflow-y-auto pb-[100px] p-[20px]">
      <button onClick={() => router.back()} className="back-btn mb-6">
        <span className="text-[26px]">←</span>
        <span>กลับ</span>
      </button>

      <div className="header mb-8 text-center">
        <h1>{titles[mode] || "กรอกข้อมูล"}</h1>
        <p className="text-[15px] text-[var(--text-dim)] mt-1">
          กรุณาระบุข้อมูลเพื่อความแม่นยำ
        </p>
      </div>

      <div className="form-section">
        <label className="form-label">วัน/เดือน/ปีเกิด</label>
        <p className="form-hint">เช่น 15/04/2535</p>
        <input
          id="birthdate"
          type="text"
          placeholder="เลือกวันเกิดของคุณ"
          readOnly
        />
      </div>

      <div className="form-section">
        <label className="form-label">เวลาเกิด (ไม่บังคับ)</label>
        <p className="form-hint">หากไม่ทราบ ระบบจะคำนวณแบบค่ากลาง</p>
        <input
          type="text"
          placeholder="เช่น 09.30"
          value={timeStr}
          onChange={(e) => setTimeStr(e.target.value)}
        />
      </div>

      <div className="form-section">
        <label className="form-label">จังหวัดที่เกิด</label>
        <p className="form-hint">เลือกจังหวัดที่คุณเกิด</p>
        <input
          type="text"
          placeholder="กรุงเทพมหานคร"
          value={province}
          onChange={(e) => setProvince(e.target.value)}
        />
      </div>

      {(mode === "question" || mode === "interactive") && (
        <div className="form-section">
          <label className="form-label">
            {mode === "question" ? "คำถามของคุณ" : "ปรึกษาเชิงลึกกับผู้ช่วย AI"}
          </label>
          {mode === "question" ? (
            <>
              <div className="question-hint-box">
                <span className="font-heading font-semibold tracking-wider text-[16px] block mb-1">
                  💡 คำแนะนำการตั้งคำถาม:
                </span>
                เพื่อให้ได้คำทำนายที่แม่นยำที่สุด ควรกำหนดระยะเวลาหรือระบุเรื่องราวให้ชัดเจน<br />
                <br />
                • <span className="text-[var(--gold)]">ดี:</span> "ภายใน 3 เดือนนี้ จะได้งานใหม่ไหม?"<br />
                • <span className="text-[var(--text-dim)]">ไม่ดี:</span> "จะรวยไหม?" (กว้างเกินไป)
              </div>
              <textarea
                placeholder="พิมพ์คำถามของคุณที่นี่..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              ></textarea>
            </>
          ) : (
            <>
              <div className="question-hint-box" style={{ background: "rgba(147, 51, 234, 0.1)", borderColor: "rgba(147, 51, 234, 0.3)" }}>
                <strong>🤖 Step: โหมดสัมภาษณ์โดย AI</strong><br />
                1. <b>เริ่มเรื่อง:</b> พิมพ์คำถามหรือความกังวลตั้งต้นของคุณ<br />
                2. <b>AI สัมภาษณ์:</b> ระบบจะถามกลับเพื่อดึงตัวแปรที่จำเป็น<br />
                3. <b>ยืนยันข้อมูล:</b> เมื่อข้อมูลครบถ้วน ให้กดไปขั้นตอนถัดไปเพื่อทำนายผล
              </div>
              <textarea
                placeholder="พิมพ์เรื่องที่คุณอยากปรึกษาที่นี่..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              ></textarea>
            </>
          )}
        </div>
      )}

      <div className="bottom-bar">
        <button onClick={handleSubmit} className="btn-primary">
          ✨ {mode === "interactive" ? "ส่งข้อมูล & เริ่มทำนาย" : "เริ่มทำนาย"}
        </button>
      </div>
    </div>
  );
}
