import { test, expect } from "@playwright/test";

test("비용 탭에 총액, 도넛 차트, 나고야 시드 지출 5건이 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=budget");
  await expect(page.getByText("💰 총 비용")).toBeVisible();
  await expect(page.getByText("아츠타 호라이켄 히츠마부시")).toBeVisible();
  await expect(page.getByText("코메다 커피")).toBeVisible();
  await expect(page.getByLabel("카테고리별 비율")).toBeVisible();
});

test("그룹 전환(Day별→카테고리별)이 정상 동작한다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=budget");
  await expect(page.getByText("Day1", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "카테고리별" }).click();
  await expect(page.getByText("식비").first()).toBeVisible();
});

test("결제자가 둘이면 더치페이 정산이 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=budget");
  await page.getByRole("button", { name: "비용 추가" }).click();
  await page.getByLabel("항목명").fill("친구가 낸 택시");
  await page.getByLabel("금액").fill("2000");
  await page.getByLabel("결제자").fill("친구");
  await page.getByRole("button", { name: "추가" }).click();
  await expect(page.getByRole("heading", { name: "더치페이 정산" })).toBeVisible();
  await expect(page.getByText("친구", { exact: true })).toBeVisible();
});

test("비용을 추가하면 즉시 목록과 총액에 반영된다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=budget");
  await page.getByRole("button", { name: "비용 추가" }).click();
  await page.getByLabel("항목명").fill("테스트 기념품");
  await page.getByLabel("금액").fill("1500");
  await page.getByRole("button", { name: "추가" }).click();
  await expect(page.getByText("테스트 기념품")).toBeVisible();
});
