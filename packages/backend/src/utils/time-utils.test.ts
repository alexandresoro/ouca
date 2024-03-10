import assert from "node:assert/strict";
import test from "node:test";
import { parseISO8601AsUTCDate } from "./time-utils.js";

test("should parse as UTC a valid date", () => {
  const date = "2022-02-28";
  assert.deepStrictEqual(parseISO8601AsUTCDate(date), new Date(Date.UTC(2022, 1, 28)));
});
