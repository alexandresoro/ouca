import { areSetsContainingSameValues, getFormattedDate, getFormattedTime, isIdInListIds, isTimeValid } from "./utils";

test("should validate same values on same object", () => {
  const set = new Set(["bob", 3, true]);

  expect(areSetsContainingSameValues(set, set)).toBe(true);
});

test("should validate same values on same contained values", () => {
  const set1 = new Set(["bob", 3, true]);
  const set2 = new Set([true, 3, "bob", 3, "bob"]);

  expect(areSetsContainingSameValues(set1, set2)).toBe(true);
});

test("should validate different values on different size", () => {
  const set1 = new Set(["bob", 3, true]);
  const set2 = new Set([true, 3, "bob", 3, "bob", false]);

  expect(areSetsContainingSameValues(set1, set2)).toBe(false);
});

test("should validate different values on different values", () => {
  const set1 = new Set(["bob", 3, true]);
  const set2 = new Set([false, 3, "bob", 3, "bob"]);

  expect(areSetsContainingSameValues(set1, set2)).toBe(false);
});

test("should find id in list", () => {
  const set = new Set([3, 7, 2.5, 12]);

  expect(isIdInListIds(set, 12)).toBe(true);
});

test("should not find id in empty list", () => {
  const set = new Set([]);

  expect(isIdInListIds(set, 12)).toBe(false);
});

test("should parse a correctly formatted date", () => {
  expect(getFormattedDate("26/02/2022")).toEqual(new Date(2022, 1, 26));
});

test("should avoid to parse a valid but ambiguous date", () => {
  expect(getFormattedDate("26/02/22")).toBeNull();
});

test("should avoid to parse a date that does not respect the expected format", () => {
  expect(getFormattedDate("26-02-2022")).toBeNull();
});

test("should avoid to handle a non parseable date", () => {
  expect(getFormattedDate("bob")).toBeNull();
});

test("should format a correct time", () => {
  expect(getFormattedTime("11:18")).toEqual("11:18");
});

test("should format alternative formats for correct time", () => {
  expect(getFormattedTime("1118")).toEqual("11:18");
  expect(getFormattedTime("11h18")).toEqual("11:18");
  expect(getFormattedTime("11H18")).toEqual("11:18");
  expect(getFormattedTime("0338")).toEqual("03:38");
});

test("should validate correct formats for time", () => {
  expect(isTimeValid("11:18")).toBe(true);
  expect(isTimeValid("1118")).toBe(true);
  expect(isTimeValid("11h18")).toBe(true);
  expect(isTimeValid("11H18")).toBe(true);
  expect(isTimeValid("03:38")).toBe(true);
});

test("should return null when incorrect format of time", () => {
  expect(getFormattedTime("11:78")).toBeNull();
  expect(getFormattedTime("118")).toBeNull();
  expect(getFormattedTime("11u18")).toBeNull();
  expect(getFormattedTime("-11H18")).toBeNull();
  expect(getFormattedTime("3:38")).toBeNull();
});

test("should invalidate incorrect formats for time", () => {
  expect(isTimeValid("11:78")).toBe(false);
  expect(isTimeValid("118")).toBe(false);
  expect(isTimeValid("11u18")).toBe(false);
  expect(isTimeValid("-11H18")).toBe(false);
  expect(isTimeValid("3:38")).toBe(false);
});
