import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Component / Route Handler 전용 클라이언트. Next.js 16에서
 * cookies()는 비동기다. Server Component에서는 쿠키를 쓸 수 없으므로
 * setAll을 try/catch로 감싼다 — 세션 갱신은 proxy.ts가 담당한다
 * (docs/03-environments.md §3.6).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서 호출된 경우 — proxy.ts가 세션을 갱신하므로
            // 여기서는 무시해도 안전하다.
          }
        },
      },
    },
  );
}
