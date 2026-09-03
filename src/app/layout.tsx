import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

// 본문·UI 전용. 카드 제목·버튼·탭 라벨·본문은 항상 이 폰트를 쓴다 (DESIGN.md §타이포그래피).
const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// 헤딩 전용. 페이지 타이틀·대형 섹션 헤딩에만 좁게 적용한다.
const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "여행 플래너",
  description: "가고 싶은 곳을 모아두고, 가까운 곳끼리 같은 날에 배치하는 여행 플래너",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ko"
      className={cn("h-full antialiased", "font-sans", notoSansKR.variable, notoSerifKR.variable)}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
