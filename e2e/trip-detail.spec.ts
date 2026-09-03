import { test, expect } from "@playwright/test";

test("나고야 여행 상세에 6탭이 보이고 개요 탭에 숙소·교통편이 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya");
  await expect(page.getByText("나고야 여행 플래너")).toBeVisible();

  const tablist = page.getByRole("tablist", { name: "여행 상세 탭" });
  await expect(tablist).toBeVisible();
  for (const label of ["개요", "플래너", "리스트", "비용", "준비", "메모"]) {
    await expect(tablist.getByRole("tab", { name: label })).toBeVisible();
  }

  await expect(page.getByText("호텔 악텔 나고야 니시키")).toBeVisible();
  await expect(page.getByText(/인천.*나고야/)).toBeVisible();
});

test("탭을 전환하면 URL이 ?tab= 으로 바뀌고 해당 콘텐츠가 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya");
  await page.getByRole("tab", { name: "메모" }).click();
  await expect(page).toHaveURL(/\?tab=memo/);
  await expect(page.getByText("📝 위시리스트 & 메모")).toBeVisible();

  await page.getByRole("tab", { name: "개요" }).click();
  await expect(page).not.toHaveURL(/\?tab=/);
});

test("숙소 추가 다이얼로그로 숙소를 추가하면 즉시 목록에 반영된다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya");
  await page.getByRole("button", { name: "숙소 추가" }).click();
  await page.getByLabel("숙소명").fill("테스트 게스트하우스");
  await page.getByLabel("체크인", { exact: true }).fill("2026-11-06");
  await page.getByLabel("체크아웃", { exact: true }).fill("2026-11-08");
  await page.getByRole("button", { name: "추가" }).click();

  await expect(page.getByText("테스트 게스트하우스")).toBeVisible();
});
