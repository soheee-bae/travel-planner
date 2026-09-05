"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export const TRIP_TABS = ["overview", "planner", "places", "budget", "prep", "memo"] as const;
export type TripTab = (typeof TRIP_TABS)[number];

const DEFAULT_TAB: TripTab = "overview";

function isTripTab(value: string | null): value is TripTab {
  return !!value && (TRIP_TABS as readonly string[]).includes(value);
}

/**
 * 여행 디테일의 6탭은 라우트 전환이 아니라 쿼리스트링(?tab=)으로 다룬다.
 * 지도 인스턴스·스크롤 위치가 유지되고 스와이프 제스처를 완전히 통제할 수
 * 있다 (docs/01-architecture.md §1.3).
 */
export function useTripTab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const tab: TripTab = isTripTab(tabParam) ? tabParam : DEFAULT_TAB;

  const setTab = useCallback(
    (next: TripTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === DEFAULT_TAB) {
        params.delete("tab");
      } else {
        params.set("tab", next);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { tab, setTab };
}
