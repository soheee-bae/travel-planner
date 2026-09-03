"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BottomNavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

/**
 * 앱 최상위 하단 네비게이션 (모바일 앱 패턴). 여행 디테일 내부의 6탭
 * (개요/플래너/리스트/비용/준비/메모, Phase 4)과는 별개의 컴포넌트다.
 */
export function BottomNav({ items }: { items: BottomNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 내비게이션"
      className={cn(
        "sticky bottom-0 z-40 flex border-t border-border bg-card",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
