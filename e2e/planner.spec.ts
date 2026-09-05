import { test, expect } from "@playwright/test";

test("플래너 탭은 Day1이 기본으로 활성화되고 해당 일정이 시트에 보인다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=planner");
  await expect(page.getByRole("button", { name: "Day1" })).toHaveClass(/bg-primary/);
  await expect(page.getByText("아츠타 호라이켄 마츠자카야점")).toBeVisible();
});

test("Day2로 전환하면 순서대로 장소가 보이고 이동시간 pill이 표시된다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=planner");
  await page.getByRole("button", { name: "Day2" }).click();

  const list = page.locator("text=코메다 커피 사카에 니시키 3초메점");
  await expect(list).toBeVisible();
  await expect(page.getByText("지브리 파크")).toBeVisible();
  await expect(page.getByText(/🚶 ~\d+분/)).toBeVisible();
});

test("전체 보기에서 자동 배치 버튼이 보이고, 미배정 장소를 지도에서 눌러 Day에 배정할 수 있다", async ({
  page,
}) => {
  await page.goto("/trips/trip_nagoya?tab=planner");
  await page.getByRole("button", { name: "전체" }).click();
  await expect(page.getByRole("button", { name: "자동 배치" })).toBeVisible();

  await page.getByRole("button", { name: "도요타 박물관" }).click();
  await expect(page.getByText("도요타 박물관을")).toBeVisible();
  await page.getByRole("button", { name: "Day1에 추가" }).click();

  await page.getByRole("button", { name: "Day1" }).click();
  await expect(page.getByText("도요타 박물관")).toBeVisible();
});

test("Day2 안에서 카드를 드래그해 순서를 바꿀 수 있다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=planner");
  await page.getByRole("button", { name: "Day2" }).click();
  await page.getByRole("button", { name: "일정 시트 펼치기" }).click();

  const cards = page.locator('[aria-label$="순서 변경 (드래그)"]');
  await expect(cards).toHaveCount(2);

  const first = cards.nth(0); // 코메다 커피 (orderIndex 0)
  const second = cards.nth(1); // 지브리 파크 (orderIndex 1)

  const firstBox = (await first.boundingBox())!;
  const secondBox = (await second.boundingBox())!;

  const startX = firstBox.x + firstBox.width / 2;
  const startY = firstBox.y + firstBox.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // dnd-kit PointerSensor의 activationConstraint(delay:200, tolerance:8)를
  // 만족시키기 위해 지연 후 임계값보다 크게, 여러 단계로 이동한다.
  await page.waitForTimeout(250);
  await page.mouse.move(startX, startY + 15, { steps: 5 });
  await page.waitForTimeout(50);
  await page.mouse.move(startX, secondBox.y + secondBox.height + 20, { steps: 15 });
  await page.waitForTimeout(150);
  await page.mouse.up();
  await page.waitForTimeout(150);

  // 순서가 바뀌었으면 "지브리 파크"가 리스트에서 "코메다 커피"보다 먼저 나온다.
  const listText = await page.locator('[role="tabpanel"]').last().innerText();
  const ghibliIndex = listText.indexOf("지브리 파크");
  const komedaIndex = listText.indexOf("코메다 커피");
  expect(ghibliIndex).toBeGreaterThan(-1);
  expect(komedaIndex).toBeGreaterThan(-1);
  expect(ghibliIndex).toBeLessThan(komedaIndex);
});

test("시트 핸들을 누르면 펼침/접힘 상태가 바뀐다", async ({ page }) => {
  await page.goto("/trips/trip_nagoya?tab=planner");
  const handle = page.getByRole("button", { name: "일정 시트 펼치기" });
  await expect(handle).toBeVisible();
  await handle.click();
  await expect(page.getByRole("button", { name: "일정 시트 접기" })).toBeVisible();
});
