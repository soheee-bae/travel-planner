import { test, expect } from "@playwright/test";

test("/ 은 /trips 로 리다이렉트된다", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/trips$/);
});

test("랜딩에 여행 카드 목록과 하단 내비게이션이 보인다", async ({ page }) => {
  await page.goto("/trips");
  await expect(page.getByRole("heading", { name: "나의 여행" })).toBeVisible();
  await expect(page.getByText("제주도 여행")).toBeVisible();
  await expect(page.getByText("오사카 여행")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "주요 내비게이션" })).toBeVisible();
  await expect(page.getByRole("link", { name: "여행 추가" })).toBeVisible();
});

test("카드를 탭하면 상세로 이동하고, 뒤로가면 목록으로 돌아온다", async ({ page }) => {
  await page.goto("/trips");
  await page.getByText("제주도 여행").click();
  await expect(page).toHaveURL(/\/trips\/trip_jeju$/);
  await expect(page.getByRole("heading", { name: /제주도 여행/ })).toBeVisible();

  await page.getByRole("link", { name: "여행 목록" }).click();
  await expect(page).toHaveURL(/\/trips$/);
});
