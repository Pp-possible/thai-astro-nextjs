"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/lib/LiffProvider";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Swal from "sweetalert2";
import { N8N_API_URL } from "@/lib/config";

// Matches `getPriceForMode` from index.html
const getPriceForMode = (mode: string) => {
  if (mode === 'overview') return 15;
  if (mode === 'question') return 2;
  if (mode === 'interactive') return 4;
  if (mode === '7days') return 5;
  return 15;
};

export default function FormPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = use(params);
  const { liff, profile } = useLiff();
  const router = useRouter();

  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [province, setProvince] = useState("");
  
  // Normal question state
  const [question, setQuestion] = useState("");

  // Interactive state
  const [interactiveStep, setInteractiveStep] = useState(1);
  const [interactiveChat, setInteractiveChat] = useState<{user: string, ai: string}[]>([
    {user: "", ai: ""}
  ]);
  const [isLoadingNextStep, setIsLoadingNextStep] = useState(false);

  useEffect(() => {
    flatpickr("#birthdate", {
      dateFormat: "d/m/Y",
      allowInput: true,
      onChange: (selectedDates, dateStr) => setDateStr(dateStr),
    });
  }, []);

  const buildInteractiveContext = (upToStep: number) => {
    let context = "";
    for (let i = 0; i < upToStep; i++) {
        const text = interactiveChat[i]?.user || "";
        if (text) context += `ผู้ใช้: ${text}\n`;
        
        const reply = interactiveChat[i]?.ai || "";
        if (reply && i < upToStep - 1) context += `AI: ${reply}\n`;
    }
    return context;
  };

  const handleInteractiveSubmit = async () => {
    const currentInput = interactiveChat[interactiveStep - 1]?.user.trim();
    if (!currentInput) {
        Swal.fire("ข้อผิดพลาด", "กรุณาพิมพ์ข้อมูลก่อนส่ง", "warning");
        return;
    }
    
    if (interactiveStep === 5) {
        Swal.fire("ข้อมูลครบถ้วน", "กดปุ่มเริ่มทำนายด้านล่างได้เลยครับ", "success");
        return;
    }

    setIsLoadingNextStep(true);
    try {
        const context = buildInteractiveContext(interactiveStep);
        const res = await fetch(N8N_API_URL + '/chat-followup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({context: context})
        });
        const data = await res.json();
        
        if (data.success && data.reply) {
            // Update the AI reply for the current step
            const newChat = [...interactiveChat];
            newChat[interactiveStep - 1].ai = data.reply;
            // Add a new empty step
            newChat.push({user: "", ai: ""});
            
            setInteractiveChat(newChat);
            setInteractiveStep(prev => prev + 1);
        } else {
            Swal.fire("ข้อผิดพลาด", "ไม่สามารถวิเคราะห์ข้อมูลได้ ลองใหม่อีกครั้ง", "error");
        }
    } catch (e) {
        Swal.fire("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
    } finally {
        setIsLoadingNextStep(false);
    }
  };

  const handleSubmit = () => {
    if (!dateStr || !province) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณาระบุ วัน/เดือน/ปีเกิด และ จังหวัดที่เกิด",
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

    const price = getPriceForMode(mode);
    if (!profile || (profile.goldBalance ?? 0) < price) {
      Swal.fire({
        icon: "warning",
        title: "ยอด Stars ไม่เพียงพอ!",
        text: `ต้องใช้ ${price} Stars กรุณาเติม Stars`,
        confirmButtonText: "ไปหน้าเติม Stars",
        confirmButtonColor: "#D4AF37",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/topup");
        }
      });
      return;
    }

    const txnId = profile?.userId 
        ? `TXN-${profile.userId.slice(-6)}-${Date.now().toString(36)}`
        : `TXN-${Date.now().toString(36)}`;

    const formattedTime = timeStr || "12:00"; // fallback if needed
    let content = `${dateStr} ${formattedTime} ${province}`;

    if (mode === 'question') {
        content += ` | ${question.trim()}`;
    } else if (mode === 'interactive') {
        let q = buildInteractiveContext(5).replace(/\n/g, " ");
        content += ` | ${q}`;
    } else if (mode === '7days') {
        content += ` | MODE_7DAYS`;
    }

    const msg = `วิเคราะห์ดวงชะตา: ${content} [Ref: ${txnId}] [PRICE:${price}]`;

    if (liff && liff.isLoggedIn()) {
      Swal.fire({
        title: "กำลังส่งข้อมูล...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      liff
        .sendMessages([{ type: "text", text: msg }])
        .then(() => {
          Swal.close();
          liff.closeWindow();
        })
        .catch((err) => {
          console.error("sendMessages error", err);
          Swal.fire("ข้อผิดพลาด", "ไม่สามารถส่งข้อมูลได้", "error");
        });
    } else {
      // Not logged in or testing on web
      Swal.fire("Dev Mode: ส่งข้อมูล (จำลอง)", msg, "info");
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
        <p className="form-hint">เช่น 09:30 (หากไม่ทราบให้เว้นว่างไว้)</p>
        <input
          type="time"
          value={timeStr}
          onChange={(e) => setTimeStr(e.target.value)}
        />
      </div>

      <div className="form-section">
        <label className="form-label">จังหวัดที่เกิด</label>
        <p className="form-hint">พิมพ์จังหวัดที่คุณเกิด</p>
        <input
          type="text"
          placeholder="กรุงเทพมหานคร"
          value={province}
          onChange={(e) => setProvince(e.target.value)}
        />
      </div>

      {(mode === "question" || mode === "interactive") && (
        <div className="form-section mt-8">
          <label className="form-label text-[18px]">
            {mode === "question" ? "คำถามของคุณ" : "ปรึกษาเชิงลึกกับผู้ช่วย AI"}
          </label>
          
          {mode === "question" ? (
            <>
              <div className="question-hint-box text-[14px]">
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
                rows={4}
                className="w-full mt-2"
              ></textarea>
            </>
          ) : (
            <div className="interactive-container mt-4">
              <div className="question-hint-box text-[14px]" style={{ background: "rgba(147, 51, 234, 0.1)", borderColor: "rgba(147, 51, 234, 0.3)" }}>
                <strong>🤖 Step: โหมดสัมภาษณ์โดย AI</strong><br />
                1. <b>เริ่มเรื่อง:</b> พิมพ์ความกังวลตั้งต้นของคุณ<br />
                2. <b>AI สัมภาษณ์:</b> ระบบจะถามกลับเพื่อดึงตัวแปรที่จำเป็น<br />
                3. <b>ยืนยันข้อมูล:</b> เมื่อข้อมูลครบ (สูงสุด 5 คำถาม) ให้กดเริ่มทำนาย
              </div>
              
              <div className="mt-6 flex flex-col gap-4">
                {interactiveChat.map((chat, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <label className="text-[var(--text-color)] font-medium text-[15px]">
                      คำถามที่ {idx + 1} {idx === 4 && "(คำถามสุดท้าย)"}
                    </label>
                    <textarea
                      placeholder={idx === 0 ? "เรื่องที่คุณอยากให้เราช่วยดูวันนี้คืออะไรครับ?" : "ตอบคำถาม AI..."}
                      value={chat.user}
                      onChange={(e) => {
                        const newChat = [...interactiveChat];
                        newChat[idx].user = e.target.value;
                        setInteractiveChat(newChat);
                      }}
                      disabled={interactiveStep > idx + 1}
                      rows={3}
                      className="w-full"
                    />
                    
                    {idx === interactiveStep - 1 && idx < 4 && (
                      <button 
                        className="btn-secondary w-full py-2 mt-1" 
                        onClick={handleInteractiveSubmit}
                        disabled={isLoadingNextStep}
                      >
                        {isLoadingNextStep ? "⏳ กำลังวิเคราะห์..." : "ส่งคำตอบ & รับคำถามถัดไป"}
                      </button>
                    )}

                    {chat.ai && (
                      <div className="p-4 rounded-[12px] bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)] mt-2">
                        <span className="text-[var(--gold)] font-semibold mb-1 block">🤖 AI ถามกลับ:</span>
                        <p className="text-[14px] leading-relaxed">{chat.ai}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bottom-bar">
        <button 
           onClick={handleSubmit} 
           className="btn-primary"
           disabled={mode === 'interactive' && (interactiveStep < 5 && interactiveChat[interactiveStep-1]?.user.length === 0)}
        >
          ✨ {mode === "interactive" ? "ส่งข้อมูล & เริ่มทำนาย" : "เริ่มทำนาย"}
        </button>
      </div>
    </div>
  );
}
