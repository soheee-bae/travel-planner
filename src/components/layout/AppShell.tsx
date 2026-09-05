import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Splash } from "@/components/splash";

/**
 * 모바일 퍼스트 앱 프레임. 모바일에서는 전체 폭을 그대로 쓰고,
 * 태블릿/데스크톱에서는 max-w-md(448px)로 중앙 정렬해 모바일 앱처럼 보이게 한다.
 * body의 --shell-outer 배경이 프레임 바깥(데스크톱 레터박스 영역)에 드러난다.
 */
export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background",
        "md:border-x md:border-border",
        className,
      )}
    >
      {children}
      <Splash />
    </div>
  );
}
