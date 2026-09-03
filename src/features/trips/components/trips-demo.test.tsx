import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { server } from "@/mocks/server";
import { TripsDemo } from "@/features/trips/components/trips-demo";

/**
 * P1-08 완료 조건("mock으로 CRUD 왕복이 동작")을 자동화된 테스트로 고정한다.
 * msw/node로 fetch를 가로채므로 실제 브라우저 없이 같은 핸들러를 검증한다.
 */
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TripsDemo />
    </QueryClientProvider>,
  );
}

describe("TripsDemo", () => {
  it("초기 목 데이터를 불러와 보여준다", async () => {
    renderWithQueryClient();
    expect(await screen.findByText(/제주도 여행/)).toBeInTheDocument();
    expect(screen.getByText(/오사카 여행/)).toBeInTheDocument();
  });

  it("추가하면 즉시(낙관적) 목록에 나타나고, 삭제하면 사라진다", async () => {
    const user = userEvent.setup();
    renderWithQueryClient();
    await screen.findByText(/제주도 여행/);

    const input = screen.getByLabelText("새 여행 제목");
    await user.type(input, "테스트 여행");
    await user.click(screen.getByRole("button", { name: "추가" }));

    expect(await screen.findByText(/테스트 여행/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "테스트 여행 삭제" }));
    await waitFor(() => {
      expect(screen.queryByText(/테스트 여행/)).not.toBeInTheDocument();
    });
  });
});
