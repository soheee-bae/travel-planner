import { test, expect } from "@playwright/test";

test("메모 탭에 나고야 시드 메모 3건이 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=memo");
  await expect(page.getByText("📝 위시리스트 & 메모")).toBeVisible();
  await expect(page.getByText("현지인 추천 맛집들")).toBeVisible();
  await expect(page.getByText("포토스팟")).toBeVisible();
  await expect(page.getByText("쇼핑 메모")).toBeVisible();
});

test("새 메모를 추가하면 즉시 목록에 나타난다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=memo");
  await page.getByRole("button", { name: "새 메모 추가" }).click();
  await page.getByLabel("제목").fill("테스트 메모");
  await page.getByLabel("내용").fill("자유롭게 적어보는 내용");
  await page.getByRole("dialog").getByRole("button", { name: "추가" }).click();

  await expect(page.getByText("테스트 메모")).toBeVisible();
  await expect(page.getByText("자유롭게 적어보는 내용")).toBeVisible();
});

test("메모를 편집하면 내용이 즉시 갱신된다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=memo");
  // 카드 루트(title <p> 의 조부모)를 정확히 찾아 그 안의 "편집" 버튼만 누른다.
  const card = page.getByText("쇼핑 메모").locator("../..");
  await card.getByRole("button", { name: "편집" }).click();
  await page.getByLabel("제목").fill("수정된 쇼핑 메모");
  await page.getByRole("dialog").getByRole("button", { name: "저장" }).click();

  await expect(page.getByText("수정된 쇼핑 메모")).toBeVisible();
});
