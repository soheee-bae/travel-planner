import { test, expect } from "@playwright/test";

test("리스트 탭에 카테고리 필터와 나고야 시드 장소 4건이 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=places");
  await expect(page.getByText("지브리 파크")).toBeVisible();
  await expect(page.getByText("아츠타 호라이켄 마츠자카야점")).toBeVisible();
  await expect(page.getByText("도요타 박물관")).toBeVisible();

  const filterBar = page.getByRole("tablist", { name: "카테고리 필터" });
  await filterBar.getByRole("tab", { name: /관광/ }).click();
  await expect(page.getByText("지브리 파크")).toBeVisible();
  await expect(page.getByText("아츠타 호라이켄 마츠자카야점")).not.toBeVisible();
});

test("장소를 추가하면 즉시 리스트에 나타난다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=places");
  await page.getByRole("button", { name: "장소 추가" }).click();
  await page.getByLabel("장소명").fill("나고야성");
  await page.getByRole("button", { name: "추가" }).click();
  await expect(page.getByText("나고야성")).toBeVisible();
});

test("선택 모드에서 Day에 일괄 배정할 수 있다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=places");
  await page.getByRole("button", { name: "선택" }).click();
  await page.getByRole("checkbox", { name: "도요타 박물관 선택" }).check();
  await page.getByRole("button", { name: "Day1에 추가" }).click();
  await expect(page.getByText("1개 선택됨")).not.toBeVisible();
});

test("선택 모드로 여러 장소를 한 번에 삭제할 수 있다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=places");
  await page.getByRole("button", { name: "선택" }).click();
  await page.getByRole("checkbox", { name: "도요타 박물관 선택" }).check();
  await expect(page.getByText("1개 선택됨")).toBeVisible();

  await page.getByRole("button", { name: "삭제" }).click();
  await expect(page.getByText("도요타 박물관")).not.toBeVisible();
});
