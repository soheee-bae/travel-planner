import { NextResponse } from "next/server";

const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org";
// Nominatim 이용 정책상 User-Agent 명시가 필수다 (docs/03-environments.md §3.3).
const USER_AGENT = process.env.NOMINATIM_USER_AGENT ?? "travel-planner-dev/0.1 (local development)";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ message: "검색어(q)가 필요합니다." }, { status: 400 });
  }

  const url = new URL("/search", NOMINATIM_BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      // 같은 주소를 반복 검색하는 일이 잦다 — 짧게라도 캐시한다.
      next: { revalidate: 60 * 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ message: "지오코딩 서비스 오류" }, { status: 502 });
    }

    const results = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (results.length === 0) {
      return NextResponse.json({ message: "검색 결과가 없습니다." }, { status: 404 });
    }

    const [first] = results;
    return NextResponse.json({
      lat: Number(first.lat),
      lng: Number(first.lon),
      displayName: first.display_name,
    });
  } catch {
    return NextResponse.json({ message: "지오코딩 요청에 실패했습니다." }, { status: 502 });
  }
}
