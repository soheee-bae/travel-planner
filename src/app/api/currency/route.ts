import { NextResponse } from "next/server";

// api.frankfurter.app 은 301 리다이렉트를 반환한다. 정식 호스트는 .dev다
// (docs/09-open-decisions.md D11 — 직접 호출로 검증됨).
const FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v1";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from")?.toUpperCase();
  const to = searchParams.get("to")?.toUpperCase();

  if (!from || !to) {
    return NextResponse.json({ message: "from, to 파라미터가 필요합니다." }, { status: 400 });
  }

  if (from === to) {
    return NextResponse.json({ from, to, rate: 1, date: null });
  }

  try {
    const url = new URL(`${FRANKFURTER_BASE_URL}/latest`);
    url.searchParams.set("base", from);
    url.searchParams.set("symbols", to);

    // 환율은 ECB 기준 영업일 1회 갱신이라 하루 캐시로 충분하다.
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) {
      return NextResponse.json({ message: "환율 서비스 오류" }, { status: 502 });
    }

    const data = (await res.json()) as { date: string; rates: Record<string, number> };
    const rate = data.rates[to];
    if (rate == null) {
      return NextResponse.json({ message: `${to} 환율을 찾을 수 없습니다.` }, { status: 404 });
    }

    return NextResponse.json({ from, to, rate, date: data.date });
  } catch {
    return NextResponse.json({ message: "환율 요청에 실패했습니다." }, { status: 502 });
  }
}
