import { test, expect } from "@playwright/test";

test("여행 추가 FAB로 생성 폼에 진입해 새 여행을 만들면 상세로 이동한다", async ({ page }) => {
  await page.goto("/trips");
  await page.getByRole("link", { name: "여행 추가" }).click();
  await expect(page).toHaveURL(/\/trips\/new$/);

  await page.getByLabel("여행 이름").fill("타이베이 여행");
  await page.getByLabel("여행지").fill("타이베이");
  await page.locator("#startDate").fill("2027-01-10");
  await page.locator("#endDate").fill("2027-01-12");
  await page.getByRole("button", { name: "여행 만들기" }).click();

  await expect(page).toHaveURL(/\/trips\/[^/]+$/);
  await expect(page.getByRole("heading", { name: /타이베이 여행/ })).toBeVisible();

  await page.getByRole("link", { name: "여행 목록" }).click();
  await expect(page.getByText("타이베이 여행")).toBeVisible();
});
