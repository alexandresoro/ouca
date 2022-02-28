import { parseISO8601AsUTCDate } from "./time-utils";

test("should parse as UTC a valid date", () => {
  const date = "2022-02-28";
  expect(parseISO8601AsUTCDate(date)).toEqual(new Date(Date.UTC(2022, 1, 28)));
});
