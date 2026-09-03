"use client";

import { useEffect, useState, type ReactNode } from "react";

declare global {
  interface Window {
    __mswWorkerStarted?: boolean;
  }
}

/**
 * 개발 환경에서는 기본으로 MSW를 켠다 (실 백엔드가 아직 없음, Phase 10 전까지).
 * `.env.local`에 NEXT_PUBLIC_ENABLE_MSW=false 를 명시하면 끌 수 있고,
 * 프로덕션 빌드에서는 기본으로 꺼진다 — 단, e2e 테스트처럼 프로덕션 빌드로
 * mock을 켜야 할 때는 빌드 시점에 NEXT_PUBLIC_ENABLE_MSW=true 로 명시하면
 * 켜진다(playwright.config.ts webServer 참고). NEXT_PUBLIC_* 는 빌드 시점에
 * 인라인되므로 런타임에 바꿀 수 없다.
 */
const shouldEnableMSW =
  process.env.NEXT_PUBLIC_ENABLE_MSW === "true" ||
  (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_MSW !== "false");

export function MSWProvider({ children }: { children: ReactNode }) {
  // MSW가 필요 없으면, 또는 이 브라우저 탭에서 이미 워커가 등록되어 있으면
  // (Fast Refresh로 모듈이 다시 평가될 때 재등록을 막기 위함) 즉시 렌더한다.
  // 그 외에는 워커 등록이 끝날 때까지 자식을 렌더하지 않는다 — 등록 전에
  // 나간 첫 fetch가 가로채이지 않는 걸 막기 위해서다.
  const [ready, setReady] = useState(
    () => !shouldEnableMSW || (typeof window !== "undefined" && window.__mswWorkerStarted === true),
  );

  useEffect(() => {
    if (!shouldEnableMSW || ready) return;

    let mounted = true;
    const markStarted = () => {
      if (!mounted) return;
      window.__mswWorkerStarted = true;
      setReady(true);
    };

    import("@/mocks/browser")
      .then(({ worker }) => worker.start({ onUnhandledRequest: "bypass" }))
      .then(markStarted)
      .catch((error: unknown) => {
        // Fast Refresh로 이미 등록된 서비스 워커에 다시 등록을 시도하면
        // 실패할 수 있다. 이 경우 워커가 이미 동작 중이라고 보고 계속한다.
        console.warn("[MSW] worker.start() 실패 (이미 실행 중일 수 있음):", error);
        markStarted();
      });

    return () => {
      mounted = false;
    };
  }, [ready]);

  if (!ready) return null;
  return <>{children}</>;
}
