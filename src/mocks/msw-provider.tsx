"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * 개발 환경에서는 기본으로 MSW를 켠다 (실 백엔드가 아직 없음, Phase 10 전까지).
 * `.env.local`에 NEXT_PUBLIC_ENABLE_MSW=false 를 명시하면 끌 수 있고,
 * 프로덕션 빌드에서는 항상 꺼진다.
 */
const shouldEnableMSW =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_MSW !== "false";

export function MSWProvider({ children }: { children: ReactNode }) {
  // MSW가 필요 없으면 즉시 렌더. 필요하면 워커 등록이 끝날 때까지 자식을
  // 렌더하지 않는다 — 등록 전에 나간 첫 fetch가 가로채이지 않는 걸 막는다.
  const [ready, setReady] = useState(!shouldEnableMSW);

  useEffect(() => {
    if (!shouldEnableMSW) return;
    let mounted = true;
    import("@/mocks/browser").then(({ worker }) => {
      worker.start({ onUnhandledRequest: "bypass" }).then(() => {
        if (mounted) setReady(true);
      });
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
