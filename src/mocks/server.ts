import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

/** Vitest 등 Node 테스트 환경에서 사용 (Phase 1-09에서 연결). */
export const server = setupServer(...handlers);
