import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16: middleware.ts → proxy.ts로 이름이 바뀌었고 Node.js 런타임
 * 전용이다. 세션 토큰을 갱신하는 역할만 한다 — 인증 경계가 아니다. 실제
 * 권한 확인은 RLS와 각 Server Component/Route Handler에서 다시 한다.
 *
 * 로그인 UI가 아직 없어서(Phase 10 범위 축소) 보호 경로 리다이렉트는
 * 아직 넣지 않았다 — Auth 화면을 만들 때 여기에 추가한다.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function proxy(request: NextRequest) {
  // 아직 실제 Supabase 프로젝트에 연결하지 않은 상태다(Phase 10 code-ready,
  // MSW가 여전히 활성 데이터 레이어). 환경변수가 없으면 완전히 no-op —
  // 이 가드가 없으면 URL이 빈 문자열인 채로 createServerClient를 호출해
  // 모든 요청에서 앱이 깨진다.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // createServerClient와 getUser() 사이에 다른 로직을 넣지 않는다 — 어기면
  // 간헐적 로그아웃을 디버깅하게 된다(Supabase 공식 경고).
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
