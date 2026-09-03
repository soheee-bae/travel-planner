const EARTH_RADIUS_M = 6371000;
const WALK_SPEED_KMH = 4.5;
const DETOUR_FACTOR = 1.3; // 직선거리 대비 실제 보행거리 보정 (docs/06 §6.5)

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

/** 두 좌표 사이의 직선거리(m). Haversine 공식. */
export function haversineDistanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_M * c;
}

/**
 * 실제 라우팅 API(Phase 9 이전)가 없을 때의 도보 소요시간 추정.
 * `~5분`처럼 물결 접두로 추정값임을 표시한다(docs/04 §4.6) — 여기서는
 * 분(number)만 반환하고, 표시할 때 접두를 붙인다.
 */
export function estimateWalkMinutes(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const meters = haversineDistanceMeters(a, b) * DETOUR_FACTOR;
  const minutes = (meters / 1000 / WALK_SPEED_KMH) * 60;
  return Math.max(1, Math.round(minutes));
}

/**
 * 경도 1도의 실제 거리는 위도에 따라 달라진다 — 위도 35도 부근(나고야·
 * 오사카)에서 경도 1도는 위도 1도의 약 0.82배 거리다. 클러스터링 전에
 * 이 보정을 하지 않으면 동서 방향으로 부당하게 뭉친다(docs/06 §6.4).
 */
export function projectForClustering(
  point: { lat: number; lng: number },
  centerLat: number,
): { x: number; y: number } {
  return {
    x: point.lng * Math.cos(toRadians(centerLat)),
    y: point.lat,
  };
}
