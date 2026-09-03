import { tripHandlers } from "@/mocks/handlers/trips";
import { overviewHandlers } from "@/mocks/handlers/overview";
import { placesHandlers } from "@/mocks/handlers/places";
import { expensesHandlers } from "@/mocks/handlers/expenses";
import { checklistsHandlers } from "@/mocks/handlers/checklists";

export const handlers = [
  ...tripHandlers,
  ...overviewHandlers,
  ...placesHandlers,
  ...expensesHandlers,
  ...checklistsHandlers,
];
