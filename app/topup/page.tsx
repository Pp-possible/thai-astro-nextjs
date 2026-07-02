"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/lib/LiffProvider";
import Swal from "sweetalert2";
import { N8N_API_URL } from "@/lib/config";
import Image from "next/image";
import { Copy, Download } from "lucide-react";

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
    await navigator.clipboard.writeText("0968940847");
    Swal.fire({
      title: "คัดลอกสำเร็จ",
      text: "พร้อมเพย์ 0968940847",
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    });
  };

  const saveQRCode = async () => {
    if (!selectedPackage) return;
    
    // Check if running in LINE LIFF (in-app browser)
    const isLine = navigator.userAgent.includes('Line');
    if (isLine) {
      Swal.fire({
        title: "คำแนะนำ",
        text: 'กรุณา "กดค้างที่รูป QR Code" แล้วเลือก "บันทึกรูปภาพ" (Save Image) เพื่อบันทึกลงเครื่องครับ',
        icon: "info"
      });
      return;
    }

    try {
      const imgPath = `/${selectedPackage.price === 149 ? 'qr_149.jpg' : 'qr_289.jpg'}`;
      const response = await fetch(imgPath);
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `QR_AstroBot_${selectedPackage.price}_THB.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      Swal.fire({
        title: "สำเร็จ",
        text: "บันทึก QR Code ลงเครื่องแล้ว",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (e) {
      console.error(e);
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถดาวน์โหลดรูปภาพได้ กรุณากดค้างที่รูปแล้วกดบันทึก", "error");
    }
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
          // Re-route home to refresh profile data
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
      <button onClick={() => router.back()} className="back-btn mb-6 flex items-center gap-1">
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
          <div className="mb-6 p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)] text-center shadow-lg backdrop-blur-md">
            <h3 className="font-[family-name:var(--font-heading-playfair)] font-semibold text-[var(--gold)] mb-2 text-xl">
              คุณเลือกแพ็กเกจ: {selectedPackage.title}
            </h3>
            <p className="text-[18px]">ยอดชำระ: <strong className="text-white text-xl">{selectedPackage.price} บาท</strong></p>
            <button 
                onClick={() => {
                  setSelectedPackage(null);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }} 
                className="mt-4 text-[14px] text-[var(--text-dim)] underline hover:text-[var(--gold)] transition-colors"
            >
              เปลี่ยนแพ็กเกจ
            </button>
          </div>

          <div className="mb-8 p-6 rounded-xl bg-[#0D0A1A] border-2 border-[var(--gold)] shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_0_10px_rgba(201,168,76,0.2)] flex flex-col items-center text-center">
            <div className="w-full max-w-[260px] bg-white rounded-[4px] mb-4 flex items-center justify-center overflow-hidden">
               <img 
                 src={`/${selectedPackage.price === 149 ? 'qr_149.jpg' : 'qr_289.jpg'}`}
                 alt="QR Code" 
                 className="w-full h-auto object-contain" 
               />
            </div>
            
            <button 
              className="bg-[rgba(255,255,255,0.1)] border border-[var(--glass-border)] text-white px-4 py-2 rounded-full font-[family-name:var(--font-body-sarabun)] text-[15px] flex items-center gap-2 mb-4 hover:bg-[rgba(255,255,255,0.2)] transition-colors"
              onClick={saveQRCode}
            >
              <Download size={18} />
              บันทึกรูป QR
            </button>
            
            <p className="text-[15px] text-[var(--text-dim)]">สแกน QR Code เพื่อชำระเงิน หรือโอนผ่านพร้อมเพย์ด้านล่าง</p>
            <div className="mt-4 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] py-2 px-5 rounded-full font-mono text-[18px] text-[var(--gold-light)] flex items-center gap-3">
              096-894-0847
              <button onClick={handleCopyPromptPay} className="text-[var(--gold)] hover:scale-110 hover:text-white transition-all p-1" title="คัดลอกเบอร์พร้อมเพย์">
                 <Copy size={18} />
              </button>
            </div>
            <p className="text-[14px] text-[var(--text-dim)] mt-3 bg-[rgba(255,255,255,0.05)] px-3 py-1 rounded-full border border-[var(--glass-border)]">นายกฤษณัฐ นาคทอง (ธ.กสิกรไทย)</p>
          </div>

          <div className="form-section text-center mb-8">
            <label className="form-label !text-center text-[16px]">อัปโหลดสลิปที่โอนเงินแล้ว</label>
            <div className="mt-4 flex flex-col items-center justify-center border-2 border-dashed border-[var(--gold-dim)] rounded-xl p-2 bg-[rgba(255,255,255,0.02)] cursor-pointer hover:bg-[rgba(201,168,76,0.05)] transition-colors relative min-h-[150px]">
               <input 
                 type="file" 
                 accept="image/*" 
                 onChange={handleFileChange}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
               />
               
               {previewUrl ? (
                 <img src={previewUrl} alt="Slip preview" className="max-h-[300px] w-full object-contain rounded-lg shadow-lg border border-[var(--gold-dim)]" />
               ) : (
                 <div className="flex flex-col items-center opacity-80 pointer-events-none my-6">
                    <div className="text-[40px] mb-2 drop-shadow-md">📸</div>
                    <p className="text-[15px] font-[family-name:var(--font-body-sarabun)] text-[var(--gold-light)]">แตะเพื่อเลือกรูปสลิป</p>
                 </div>
               )}
            </div>
          </div>

          <div className="bottom-bar mt-4">
            <button 
              onClick={submitSlip} 
              className="btn-primary w-full max-w-[300px] mx-auto flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
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
