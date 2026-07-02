"use client";

export const runtime = 'edge';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/lib/LiffProvider";
import Swal from "sweetalert2";
import { N8N_API_URL } from "@/lib/config";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Thai } from "flatpickr/dist/l10n/th.js";

// Import lucide icons
import { 
  Send, User, MapPin, Calendar, Clock, 
  HelpCircle, MessageCircle, AlertCircle, ChevronLeft
} from "lucide-react";

export default function FormPage({ params }: { params: Promise<{ mode: string }> }) {
  const router = useRouter();
  const { liff, isReady, profile, usageState } = useLiff();
  const [mode, setMode] = useState<string>("");

  useEffect(() => {
    params.then(p => setMode(p.mode));
  }, [params]);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    unknownTime: false,
    province: "กรุงเทพมหานคร",
    question: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interactiveStep, setInteractiveStep] = useState(1);
  const [interactiveChat, setInteractiveChat] = useState<{sender: 'bot'|'user', text: string}[]>([]);
  const [interactiveInput, setInteractiveInput] = useState("");
  const [txnId, setTxnId] = useState("");

  const getPrice = () => {
    if (!usageState) return mode === 'overview' ? 15 : (mode === 'interactive' ? 25 : (mode === '7days' ? 15 : 10));
    if (mode === 'overview') return usageState.isFree ? 0 : (usageState.overviewPrice ?? 15);
    if (mode === 'question') return usageState.questionPrice ?? 10;
    if (mode === 'interactive') return usageState.interactivePrice ?? 25;
    if (mode === '7days') return usageState.sevenDaysPrice ?? 15;
    return 0;
  };

  const getModeTitle = () => {
    if (mode === 'overview') return "ภาพรวมทุกด้าน";
    if (mode === 'question') return "ทำนายเฉพาะเรื่อง";
    if (mode === 'interactive') return "ปรึกษาเชิงลึก";
    if (mode === '7days') return "วิเคราะห์ดวง 7 วัน";
    return "";
  };

  const price = getPrice();

  useEffect(() => {
    if (typeof window !== "undefined" && document.getElementById("f-date")) {
      flatpickr("#f-date", {
        locale: Thai,
        dateFormat: "d/m/Y",
        disableMobile: true,
        onChange: (selectedDates, dateStr) => setFormData(prev => ({ ...prev, date: dateStr }))
      });
    }
  }, [mode]);

  const generateTxnId = () => {
    return 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleInteractiveSubmit = async () => {
    if (!interactiveInput.trim()) return;
    const userMsg = interactiveInput.trim();
    setInteractiveChat(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInteractiveInput("");
    setIsSubmitting(true);

    try {
      const res = await fetch(N8N_API_URL + '/chat-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.userId || 'unknown',
          txnId: txnId,
          step: interactiveStep,
          answer: userMsg
        })
      });

      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      
      setInteractiveChat(prev => [...prev, { sender: 'bot', text: data.reply || data.question }]);
      
      if (data.isFinished || interactiveStep >= 5) {
        // Send final string to LINE
        if (liff && liff.isLoggedIn()) {
          const finalString = `วิเคราะห์ดวงชะตา: ${formData.date} ${formData.unknownTime ? 'ไม่ทราบเวลา' : formData.time} ${formData.province} | ปรึกษาเชิงลึกเสร็จสิ้น [Ref: ${txnId}] [PRICE:${price}]`;
          await liff.sendMessages([{ type: "text", text: finalString }]);
          liff.closeWindow();
        } else {
          Swal.fire("สำเร็จ", "ส่งข้อมูลเรียบร้อย (จำลอง)", "success");
        }
      } else {
        setInteractiveStep(prev => prev + 1);
      }
    } catch (e) {
      console.error(e);
      setInteractiveChat(prev => [...prev, { sender: 'bot', text: 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitForm = async () => {
    if (!formData.date) {
      Swal.fire("แจ้งเตือน", "กรุณาระบุ วัน/เดือน/ปีเกิด", "warning");
      return;
    }
    if (!formData.unknownTime && !formData.time) {
      Swal.fire("แจ้งเตือน", "กรุณาระบุ เวลาเกิด หรือเลือก 'ไม่ทราบเวลาเกิด'", "warning");
      return;
    }
    if (mode === 'question' && formData.question.trim().length < 10) {
      Swal.fire("แจ้งเตือน", "กรุณาระบุคำถามให้ละเอียดขึ้น (อย่างน้อย 10 ตัวอักษร)", "warning");
      return;
    }

    const currentBalance = profile?.goldBalance || 0;
    if (currentBalance < price) {
      Swal.fire({
        title: "Stars ไม่พอ",
        text: `บริการนี้ใช้ ${price} Stars แต่คุณมี ${currentBalance} Stars`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "เติม Stars",
        cancelButtonText: "ยกเลิก"
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/topup");
        }
      });
      return;
    }

    setIsSubmitting(true);
    const newTxnId = generateTxnId();
    setTxnId(newTxnId);

    const timeStr = formData.unknownTime ? 'ไม่ทราบเวลา' : formData.time;
    let textToSend = `วิเคราะห์ดวงชะตา: ${formData.date} ${timeStr} ${formData.province}`;
    
    if (mode === 'overview') {
      textToSend += ` | ภาพรวมทุกด้าน [Ref: ${newTxnId}] [PRICE:${price}]`;
    } else if (mode === '7days') {
      textToSend += ` | วิเคราะห์ 7 วัน [Ref: ${newTxnId}] [PRICE:${price}]`;
    } else if (mode === 'question') {
      textToSend += ` | ${formData.question.trim()} [Ref: ${newTxnId}] [PRICE:${price}]`;
    }

    if (mode === 'interactive') {
      // For interactive, we start the chat phase instead of closing immediately
      setIsSubmitting(false);
      setInteractiveChat([{ sender: 'bot', text: 'สวัสดีครับ เพื่อความแม่นยำในการทำนาย ขอทราบเพิ่มเติมว่า ปัจจุบันสถานการณ์เรื่องที่คุณอยากรู้เป็นอย่างไรบ้างครับ?' }]);
      return;
    }

    // Send to LINE
    if (liff && liff.isLoggedIn()) {
      try {
        await liff.sendMessages([{ type: "text", text: textToSend }]);
        liff.closeWindow();
      } catch (e) {
        console.error(e);
        Swal.fire("ข้อผิดพลาด", "ไม่สามารถส่งข้อความได้", "error");
        setIsSubmitting(false);
      }
    } else {
      Swal.fire("สำเร็จ", `ส่งข้อความจำลอง: \n${textToSend}`, "success");
      setIsSubmitting(false);
    }
  };

  if (!isReady || !mode) return <div className="p-6 text-center text-white">กำลังโหลด...</div>;

  return (
    <div className="flex-1 overflow-y-auto pb-[100px] p-[20px]">
      <button onClick={() => router.back()} className="back-btn mb-6 flex items-center gap-1">
        <ChevronLeft size={24} /> <span>กลับ</span>
      </button>

      <div className="header mb-8 text-center">
        <h1 className="text-[26px] font-bold text-[var(--gold)] drop-shadow-md">
          {getModeTitle()}
        </h1>
        <p className="text-[14px] text-[var(--text-dim)] mt-2 bg-[rgba(0,0,0,0.2)] inline-block px-4 py-1 rounded-full border border-[var(--glass-border)]">
          {price === 0 ? '✨ ฟรี ไม่มีค่าใช้จ่าย' : `✨ ${price} Stars`}
        </p>
      </div>

      <div className="form-section bg-[rgba(255,255,255,0.03)] p-6 rounded-[24px] border border-[var(--glass-border)] shadow-lg backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(212,175,55,0.1)_0%,transparent_70%)] blur-xl"></div>
        
        <div className="form-group mb-5">
          <label className="form-label flex items-center gap-2">
             <Calendar size={18} className="text-[var(--gold-dim)]" /> 
             วัน/เดือน/ปีเกิด
          </label>
          <input 
            type="text" 
            id="f-date" 
            className="form-control" 
            placeholder="เลือกวันที่" 
            readOnly
          />
        </div>

        <div className="form-group mb-5">
          <label className="form-label flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
               <Clock size={18} className="text-[var(--gold-dim)]" /> 
               เวลาเกิด
            </div>
            <label className="flex items-center gap-2 text-[13px] font-normal cursor-pointer text-[var(--text-dim)]">
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[var(--gold)]"
                checked={formData.unknownTime} 
                onChange={(e) => setFormData(prev => ({ ...prev, unknownTime: e.target.checked, time: "" }))} 
              />
              ไม่ทราบเวลา
            </label>
          </label>
          <input 
            type="time" 
            className="form-control" 
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            disabled={formData.unknownTime}
            style={{ opacity: formData.unknownTime ? 0.5 : 1 }}
          />
        </div>

        <div className="form-group mb-5">
          <label className="form-label flex items-center gap-2">
             <MapPin size={18} className="text-[var(--gold-dim)]" /> 
             จังหวัดที่เกิด
          </label>
          <select 
            className="form-control appearance-none" 
            value={formData.province}
            onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
          >
             <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
             <option value="กระบี่">กระบี่</option>
             <option value="กาญจนบุรี">กาญจนบุรี</option>
             <option value="กาฬสินธุ์">กาฬสินธุ์</option>
             <option value="กำแพงเพชร">กำแพงเพชร</option>
             <option value="ขอนแก่น">ขอนแก่น</option>
             <option value="จันทบุรี">จันทบุรี</option>
             <option value="ฉะเชิงเทรา">ฉะเชิงเทรา</option>
             <option value="ชลบุรี">ชลบุรี</option>
             <option value="ชัยนาท">ชัยนาท</option>
             <option value="ชัยภูมิ">ชัยภูมิ</option>
             <option value="ชุมพร">ชุมพร</option>
             <option value="เชียงราย">เชียงราย</option>
             <option value="เชียงใหม่">เชียงใหม่</option>
             <option value="ตรัง">ตรัง</option>
             <option value="ตราด">ตราด</option>
             <option value="ตาก">ตาก</option>
             <option value="นครนายก">นครนายก</option>
             <option value="นครปฐม">นครปฐม</option>
             <option value="นครพนม">นครพนม</option>
             <option value="นครราชสีมา">นครราชสีมา</option>
             <option value="นครศรีธรรมราช">นครศรีธรรมราช</option>
             <option value="นครสวรรค์">นครสวรรค์</option>
             <option value="นนทบุรี">นนทบุรี</option>
             <option value="นราธิวาส">นราธิวาส</option>
             <option value="น่าน">น่าน</option>
             <option value="บึงกาฬ">บึงกาฬ</option>
             <option value="บุรีรัมย์">บุรีรัมย์</option>
             <option value="ปทุมธานี">ปทุมธานี</option>
             <option value="ประจวบคีรีขันธ์">ประจวบคีรีขันธ์</option>
             <option value="ปราจีนบุรี">ปราจีนบุรี</option>
             <option value="ปัตตานี">ปัตตานี</option>
             <option value="พระนครศรีอยุธยา">พระนครศรีอยุธยา</option>
             <option value="พังงา">พังงา</option>
             <option value="พัทลุง">พัทลุง</option>
             <option value="พิจิตร">พิจิตร</option>
             <option value="พิษณุโลก">พิษณุโลก</option>
             <option value="เพชรบุรี">เพชรบุรี</option>
             <option value="เพชรบูรณ์">เพชรบูรณ์</option>
             <option value="แพร่">แพร่</option>
             <option value="พะเยา">พะเยา</option>
             <option value="ภูเก็ต">ภูเก็ต</option>
             <option value="มหาสารคาม">มหาสารคาม</option>
             <option value="มุกดาหาร">มุกดาหาร</option>
             <option value="แม่ฮ่องสอน">แม่ฮ่องสอน</option>
             <option value="ยะลา">ยะลา</option>
             <option value="ยโสธร">ยโสธร</option>
             <option value="ร้อยเอ็ด">ร้อยเอ็ด</option>
             <option value="ระนอง">ระนอง</option>
             <option value="ระยอง">ระยอง</option>
             <option value="ราชบุรี">ราชบุรี</option>
             <option value="ลพบุรี">ลพบุรี</option>
             <option value="ลำปาง">ลำปาง</option>
             <option value="ลำพูน">ลำพูน</option>
             <option value="เลย">เลย</option>
             <option value="ศรีสะเกษ">ศรีสะเกษ</option>
             <option value="สกลนคร">สกลนคร</option>
             <option value="สงขลา">สงขลา</option>
             <option value="สตูล">สตูล</option>
             <option value="สมุทรปราการ">สมุทรปราการ</option>
             <option value="สมุทรสงคราม">สมุทรสงคราม</option>
             <option value="สมุทรสาคร">สมุทรสาคร</option>
             <option value="สระแก้ว">สระแก้ว</option>
             <option value="สระบุรี">สระบุรี</option>
             <option value="สิงห์บุรี">สิงห์บุรี</option>
             <option value="สุโขทัย">สุโขทัย</option>
             <option value="สุพรรณบุรี">สุพรรณบุรี</option>
             <option value="สุราษฎร์ธานี">สุราษฎร์ธานี</option>
             <option value="สุรินทร์">สุรินทร์</option>
             <option value="หนองคาย">หนองคาย</option>
             <option value="หนองบัวลำภู">หนองบัวลำภู</option>
             <option value="อ่างทอง">อ่างทอง</option>
             <option value="อำนาจเจริญ">อำนาจเจริญ</option>
             <option value="อุดรธานี">อุดรธานี</option>
             <option value="อุตรดิตถ์">อุตรดิตถ์</option>
             <option value="อุทัยธานี">อุทัยธานี</option>
             <option value="อุบลราชธานี">อุบลราชธานี</option>
             <option value="ต่างประเทศ">ต่างประเทศ (ระบุไม่ได้)</option>
          </select>
        </div>

        {mode === 'question' && (
          <div className="form-group mb-5">
            <label className="form-label flex items-center gap-2">
               <HelpCircle size={18} className="text-[var(--gold-dim)]" /> 
               คำถามของคุณ (ระบุให้ชัดเจน)
            </label>
            <textarea 
              className="form-control min-h-[100px] resize-none" 
              placeholder="เช่น ตอนนี้กำลังรอสัมภาษณ์งานบริษัท A จะมีโอกาสได้ไหมครับ"
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
            ></textarea>
          </div>
        )}

        {interactiveChat.length > 0 && mode === 'interactive' && (
          <div className="mt-6 border-t border-[var(--glass-border)] pt-6">
            <h3 className="text-[var(--gold)] font-bold mb-4 flex items-center gap-2">
              <MessageCircle size={20} /> แชทปรึกษา (ขั้นที่ {interactiveStep}/5)
            </h3>
            <div className="flex flex-col gap-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
              {interactiveChat.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[14px] leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[var(--gold)] text-black rounded-tr-sm' 
                      : 'bg-[rgba(255,255,255,0.1)] text-white rounded-tl-sm border border-[var(--glass-border)]'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                className="form-control !mb-0 flex-1" 
                placeholder="พิมพ์ตอบกลับ..." 
                value={interactiveInput}
                onChange={(e) => setInteractiveInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInteractiveSubmit()}
              />
              <button 
                onClick={handleInteractiveSubmit}
                disabled={isSubmitting || !interactiveInput.trim()}
                className="bg-[var(--gold)] text-black w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-[#ffe380] transition-colors"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        )}

      </div>

      {interactiveChat.length === 0 && (
        <div className="bottom-bar mt-6 flex justify-center">
          <button 
            onClick={submitForm} 
            className="btn-primary w-full max-w-[300px] flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="inline-typing-loader"><span></span><span></span><span></span></div>
                กำลังประมวลผล...
              </>
            ) : (
              "เริ่มทำนาย ✨"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
