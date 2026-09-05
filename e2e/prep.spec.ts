import { test, expect } from "@playwright/test";

test("준비 탭에 기본 카테고리 5종과 프로그레스 바가 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=prep");
  await expect(page.getByText(/✅ 여행 준비/)).toBeVisible();
  await expect(page.getByText("예약 관련")).toBeVisible();
  await expect(page.getByText("서류/필수")).toBeVisible();
  await expect(page.getByText("디지털")).toBeVisible();
  await expect(page.getByText("금융")).toBeVisible();
  await expect(page.getByText("패킹리스트")).toBeVisible();
  await expect(page.getByRole("progressbar")).toBeVisible();
});

test("항목을 체크하면 프로그레스가 즉시 바뀐다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=prep");
  const checkbox = page.getByText("렌터카 예약").locator("..").locator('input[type="checkbox"]');
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await expect(page.getByText(/✅ 여행 준비 \(3\/19 완료\)/)).toBeVisible();
});

test("추천 카테고리 버튼으로 새 카테고리를 원터치로 추가할 수 있다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=prep");
  await page.getByRole("button", { name: "🛍️ 쇼핑리스트" }).click();
  await expect(page.getByRole("heading", { name: "🛍️ 쇼핑리스트" })).toBeVisible();
});
