import { createBrowserClient } from "@supabase/ssr";

/**
 * 브라우저 전용 클라이언트. CRUD는 여기서 Supabase로 직접 나간다 — RLS가
 * 인증 경계다(docs/01-architecture.md §1.1). Phase 10 code-ready 상태이며
 * 실제 프로젝트 URL/키가 없으면 호출 시 에러를 던진다(런타임에만 실패,
 * 빌드는 막지 않는다) — 지금은 MSW가 여전히 활성 데이터 레이어다.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
