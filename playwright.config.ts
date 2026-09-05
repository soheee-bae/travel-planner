import { defineConfig, devices } from "@playwright/test";

/**
 * 모바일 퍼스트 앱이므로 모바일 뷰포트 프로파일을 기본으로 둔다
 * (docs/03-environments.md §3.2 — 실기기 테스트가 이 프로젝트에서 특히 중요).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    // 실 백엔드가 붙기 전(Phase 10 이전)에는 e2e도 MSW mock으로 검증한다.
    // NEXT_PUBLIC_* 는 빌드 시점에 인라인되므로 build 명령에도 넣어야 한다.
    command: "NEXT_PUBLIC_ENABLE_MSW=true pnpm build && NEXT_PUBLIC_ENABLE_MSW=true pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
