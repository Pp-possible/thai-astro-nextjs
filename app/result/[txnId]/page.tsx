"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getPrediction } from "@/lib/api";
import FloatingTOC from "../../components/FloatingTOC";
import TopAppBar from "../../components/TopAppBar";

export default function ResultPage({ params }: { params: Promise<{ txnId: string }> }) {
  const { txnId } = use(params);
  const router = useRouter();
  const [markdown, setMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [headers, setHeaders] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPrediction(txnId);
        if (data && data.content) {
          setMarkdown(data.content);
          extractHeaders(data.content);
        } else {
          setMarkdown("ไม่พบข้อมูลคำทำนาย");
        }
      } catch (error) {
        setMarkdown("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [txnId]);

  const extractHeaders = (md: string) => {
    // Extract ### and ## headers
    const regex = /^(#{2,3})\s+(.+)$/gm;
    let match;
    const extracted: { id: string; text: string }[] = [];
    let counter = 0;
    while ((match = regex.exec(md)) !== null) {
      const text = match[2].replace(/\*/g, "").trim(); // remove bold markers if any
      const id = `heading-${counter++}`;
      extracted.push({ id, text });
    }
    setHeaders(extracted);
  };

  // Custom renderer to attach IDs to headers so TOC can scroll to them
  let headerCounter = 0;
  const components = {
    h2: ({ node, children, ...props }: any) => {
      const id = `heading-${headerCounter++}`;
      return <h2 id={id} className="text-2xl font-bold text-[var(--gold)] mt-8 mb-4 border-b border-[var(--glass-border)] pb-2" style={{fontFamily: "var(--font-heading-playfair)"}} {...props}>{children}</h2>;
    },
    h3: ({ node, children, ...props }: any) => {
      const id = `heading-${headerCounter++}`;
      return <h3 id={id} className="text-xl font-semibold text-[var(--gold-light)] mt-6 mb-3" {...props}>{children}</h3>;
    },
    p: ({ node, children, ...props }: any) => (
      <p className="text-[15px] leading-relaxed text-[var(--text)] mb-4" {...props}>{children}</p>
    ),
    strong: ({ node, children, ...props }: any) => (
      <strong className="text-[var(--gold-light)] font-semibold" {...props}>{children}</strong>
    ),
    ul: ({ node, children, ...props }: any) => (
      <ul className="list-disc pl-6 mb-4 space-y-2 text-[var(--text)]" {...props}>{children}</ul>
    ),
    li: ({ node, children, ...props }: any) => (
      <li className="pl-1" {...props}>{children}</li>
    )
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <div className="text-[var(--gold)] text-4xl mb-4 animate-spin">🔮</div>
        <div className="text-[var(--text-dim)] font-body">กำลังแปลความหมายจากดวงดาว...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-[100px]">
      <TopAppBar />
      <div className="p-[20px]">
        <button onClick={() => router.push("/")} className="back-btn mb-6">
          <span className="text-[26px]">←</span>
          <span>กลับหน้าหลัก</span>
        </button>

        <div className="result-card bg-[rgba(255,255,255,0.03)] border border-[var(--glass-border)] rounded-[20px] p-[24px] backdrop-blur-md">
          {/* We must reset headerCounter before every render of ReactMarkdown to align with extractHeaders */}
          {(() => { headerCounter = 0; return null; })()}
          <ReactMarkdown components={components}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>

      {headers.length > 0 && <FloatingTOC headers={headers} />}
    </div>
  );
}

export const runtime = 'edge';
