import { test, expect } from "@playwright/test";

test("랜딩(임시 화면)이 모바일 뷰포트에서 로드된다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "여행 플래너" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "주요 내비게이션" })).toBeVisible();
});
