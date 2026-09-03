export type MapProvider = "naver" | "google";

/**
 * 국가코드로 지도 제공자를 결정한다. 한국(KR)은 Naver, 그 외는 Google.
 * Phase 6에서 실제 제공자를 붙일 때 이 함수 하나만 참조한다 (docs/09 D4 —
 * 어댑터 인터페이스 먼저, 구현은 1개부터).
 */
export function getMapProvider(countryCode: string): MapProvider {
  return countryCode.toUpperCase() === "KR" ? "naver" : "google";
}
