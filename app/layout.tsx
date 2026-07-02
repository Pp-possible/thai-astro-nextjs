import type { Metadata } from "next";
import { Playfair_Display, Charmonman, Sarabun } from "next/font/google";
import { LiffProvider } from "@/lib/LiffProvider";
import "./compiled.css";

const playfair = Playfair_Display({
  variable: "--font-heading-playfair",
  subsets: ["latin"],
});

const charmonman = Charmonman({
  variable: "--font-heading-charm",
  weight: ["400", "700"],
  subsets: ["latin", "thai"],
});

const sarabun = Sarabun({
  variable: "--font-body-sarabun",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
});

export const metadata: Metadata = {
  title: "Thai Astro Bot",
  description: "Advanced AI Astrology Bot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${playfair.variable} ${charmonman.variable} ${sarabun.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <LiffProvider liffId={process.env.NEXT_PUBLIC_LIFF_ID || ""}>
          {children}
        </LiffProvider>
      </body>
    </html>
  );
}
