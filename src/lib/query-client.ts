import { QueryClient, isServer } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 5초 안에는 재요청 없이 캐시를 그대로 보여준다.
        staleTime: 5 * 1000,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * 서버에서는 요청마다 새 QueryClient (RSC 간 상태 공유 금지).
 * 브라우저에서는 모듈 싱글턴 (Suspense와 함께 쓸 때 재생성 방지).
 * TanStack Query의 Next.js App Router 공식 패턴.
 */
export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
