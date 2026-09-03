import { NextResponse } from "next/server";
import { isShortenedMapLink, parseMapLink } from "@/lib/map-link-parser";

const MAX_REDIRECT_HOPS = 3;

/** 단축 URL(maps.app.goo.gl, naver.me 등)을 실제 지도 URL로 풀어낸다. */
async function resolveRedirect(url: string): Promise<string> {
  let current = url;
  for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop++) {
    const res = await fetch(current, { redirect: "manual" });
    const location = res.headers.get("location");
    if (!location) return current;
    current = new URL(location, current).toString();
    if (!isShortenedMapLink(current)) return current;
  }
  return current;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url")?.trim();

  if (!rawUrl) {
    return NextResponse.json({ message: "url 파라미터가 필요합니다." }, { status: 400 });
  }

  try {
    const resolvedUrl = isShortenedMapLink(rawUrl) ? await resolveRedirect(rawUrl) : rawUrl;
    const parsed = parseMapLink(resolvedUrl);

    if (!parsed) {
      return NextResponse.json(
        { message: "이 지도 링크에서 좌표를 찾지 못했습니다. 직접 입력해 주세요." },
        { status: 422 },
      );
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ message: "링크를 확인하지 못했습니다." }, { status: 502 });
  }
}
