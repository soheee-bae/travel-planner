export interface ParsedMapLink {
  lat: number;
  lng: number;
  name?: string;
}

const SHORTENED_HOSTS = ["maps.app.goo.gl", "goo.gl", "naver.me"];

function isShortened(url: URL): boolean {
  return SHORTENED_HOSTS.some((host) => url.hostname === host);
}

/**
 * Google/네이버 지도 공유 URL에서 좌표(+가능하면 장소명)를 뽑는다.
 * 리다이렉트를 따라가지 않고 URL 문자열 패턴만 본다 — 실제 리다이렉트
 * 해석은 route handler에서 fetch(redirect:'manual')로 처리한다.
 */
export function parseMapLink(rawUrl: string): ParsedMapLink | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  // Google Maps: /maps/place/장소명/@37.123,127.456,17z 형태
  const atMatch = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const [, lat, lng] = atMatch;
    const placeMatch = url.pathname.match(/\/place\/([^/@]+)/);
    return {
      lat: Number(lat),
      lng: Number(lng),
      name: placeMatch ? decodeURIComponent(placeMatch[1]).replace(/\+/g, " ") : undefined,
    };
  }

  // Google Maps: ?q=37.123,127.456 또는 ?query=37.123,127.456
  const qParam = url.searchParams.get("q") ?? url.searchParams.get("query");
  const qMatch = qParam?.match(/^(-?\d+\.\d+),(-?\d+\.\d+)$/);
  if (qMatch) {
    return { lat: Number(qMatch[1]), lng: Number(qMatch[2]) };
  }

  // 네이버 지도: ?lat=..&lng=.. 또는 ?c=lng,lat,... (좌표 순서가 반대)
  const naverLat = url.searchParams.get("lat");
  const naverLng = url.searchParams.get("lng");
  if (naverLat && naverLng) {
    return { lat: Number(naverLat), lng: Number(naverLng) };
  }
  const cParam = url.searchParams.get("c");
  if (cParam) {
    const parts = cParam.split(",");
    if (parts.length >= 2) {
      return { lat: Number(parts[1]), lng: Number(parts[0]) };
    }
  }

  return null;
}

export function isShortenedMapLink(rawUrl: string): boolean {
  try {
    return isShortened(new URL(rawUrl));
  } catch {
    return false;
  }
}
