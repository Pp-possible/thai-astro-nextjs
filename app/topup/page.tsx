"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/lib/LiffProvider";
import Swal from "sweetalert2";
import { N8N_API_URL } from "@/lib/config";
import Image from "next/image";
import { Copy } from "lucide-react";

export default function TopupPage() {
  const router = useRouter();
  const { liff, profile } = useLiff();
  
  const [selectedPackage, setSelectedPackage] = useState<{ price: number, gold: number } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const packages = [
    { price: 149, gold: 10, title: "✨ 10 Stars", desc: "แพ็กเกจเริ่มต้น สำหรับลองถามคำถาม" },
    { price: 289, gold: 20, title: "✨ 20 Stars", desc: "แพ็กเกจสุดคุ้ม ใช้งานได้ยาวนานกว่า" }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCopyPromptPay = async () => {
    await navigator.clipboard.writeText("0968940847"); // Example PromptPay from index, I will check later if it differs
    Swal.fire({
      title: "คัดลอกสำเร็จ",
      text: "พร้อมเพย์ 0968940847",
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    });
  };

  const submitSlip = async () => {
    if (!selectedPackage) {
      Swal.fire("แจ้งเตือน", "กรุณาเลือกแพ็กเกจที่ต้องการ", "warning");
      return;
    }
    if (!selectedFile) {
      Swal.fire("แจ้งเตือน", "กรุณาอัปโหลดสลิป", "warning");
      return;
    }

    const userId = profile?.userId || (liff && liff.isLoggedIn() ? liff.getDecodedIDToken()?.sub : "demo-user");
    if (!userId) {
      Swal.fire("ข้อผิดพลาด", "ไม่พบข้อมูลผู้ใช้ (LINE User ID)", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const displayName = profile?.displayName || (liff && liff.isLoggedIn() ? liff.getDecodedIDToken()?.name : "User");
      formData.append("userId", userId);
      formData.append("displayName", displayName as string);
      formData.append("image", selectedFile);
      formData.append("expectedAmount", selectedPackage.price.toString());
      formData.append("expectedGold", selectedPackage.gold.toString());

      const res = await fetch(N8N_API_URL + "/verify-slip", {
        method: "POST",
        body: formData
      });
      
      const result = await res.json();
      if (res.ok && result.success) {
        Swal.fire("สำเร็จ", `เติม Stars สำเร็จ! ได้รับ ${result.goldAdded} Stars`, "success").then(() => {
          // Ideally fetch profile again, but a page reload or router.push will re-trigger the layout logic
          window.location.href = "/";
        });
      } else {
        Swal.fire("ข้อผิดพลาด", result.message || "สลิปไม่ถูกต้อง หรือถูกใช้งานไปแล้ว", "error");
      }
    } catch (e) {
      console.error(e);
      Swal.fire("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-[100px] p-[20px]">
      <button onClick={() => router.back()} className="back-btn mb-6">
        <span className="text-[26px]">←</span>
        <span>กลับ</span>
      </button>

      <div className="header mb-8 text-center">
        <h1>เติม Stars ✨</h1>
        <p className="text-[15px] text-[var(--text-dim)] mt-1">
          เลือกแพ็กเกจที่ต้องการและอัปโหลดสลิป
        </p>
      </div>

      {!selectedPackage ? (
        <div className="flex flex-col gap-4">
          {packages.map((pkg, idx) => (
            <div 
              key={idx} 
              className="mode-card flex flex-col items-start cursor-pointer transition-transform active:scale-95"
              style={{ borderColor: idx === 1 ? "var(--gold)" : "var(--gold-dim)" }}
              onClick={() => setSelectedPackage(pkg)}
            >
              <div className="mode-title">{pkg.title}</div>
              <div className="mode-desc mb-4">{pkg.desc}</div>
              <div className="price-tag paid" style={idx === 1 ? { background: "rgba(201,168,76,0.3)" } : {}}>
                {pkg.price} บาท
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="slip-upload-section">
          <div className="mb-6 p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)] text-center">
            <h3 className="font-semibold text-[var(--gold)] mb-2">คุณเลือกแพ็กเกจ: {selectedPackage.title}</h3>
            <p className="text-[18px]">ยอดชำระ: <strong className="text-white">{selectedPackage.price} บาท</strong></p>
            <button 
                onClick={() => setSelectedPackage(null)} 
                className="mt-2 text-[13px] text-[var(--text-dim)] underline"
            >
              เปลี่ยนแพ็กเกจ
            </button>
          </div>

          <div className="mb-8 p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)] flex flex-col items-center text-center">
            <div className="w-[100px] h-[100px] bg-white rounded-[12px] mb-3 flex items-center justify-center p-2">
               <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/PromptPay-logo.png" alt="PromptPay" className="w-full h-auto object-contain" />
            </div>
            <p className="text-[15px] text-[var(--text-dim)]">สแกน QR Code หรือโอนผ่านพร้อมเพย์</p>
            <div className="mt-3 bg-[rgba(0,0,0,0.2)] py-2 px-4 rounded-full font-mono text-[18px] text-white flex items-center gap-2">
              096-894-0847
              <button onClick={handleCopyPromptPay} className="text-[var(--gold)] hover:scale-110 transition-transform">
                 <Copy size={18} />
              </button>
            </div>
            <p className="text-[13px] text-[var(--text-dim)] mt-2">นายกฤษณัฐ นาคทอง (ธ.กสิกรไทย)</p>
          </div>

          <div className="form-section text-center">
            <label className="form-label !text-center">อัปโหลดสลิปที่โอนเงินแล้ว</label>
            <div className="mt-4 flex flex-col items-center justify-center border-2 border-dashed border-[var(--glass-border)] rounded-xl p-6 bg-[rgba(255,255,255,0.02)] cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-colors relative">
               <input 
                 type="file" 
                 accept="image/*" 
                 onChange={handleFileChange}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               />
               
               {previewUrl ? (
                 <img src={previewUrl} alt="Slip preview" className="max-h-[300px] rounded-lg shadow-lg object-contain" />
               ) : (
                 <div className="flex flex-col items-center opacity-70">
                    <div className="text-[40px] mb-2">📸</div>
                    <p className="text-[14px]">แตะเพื่อเลือกรูปสลิป</p>
                 </div>
               )}
            </div>
          </div>

          <div className="bottom-bar">
            <button 
              onClick={submitSlip} 
              className="btn-primary flex justify-center items-center gap-2"
              disabled={isSubmitting || !selectedFile}
            >
              {isSubmitting ? (
                <>
                  <div className="inline-typing-loader"><span></span><span></span><span></span></div>
                  กำลังตรวจสอบสลิป...
                </>
              ) : (
                "ยืนยันการเติม Stars ✨"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
