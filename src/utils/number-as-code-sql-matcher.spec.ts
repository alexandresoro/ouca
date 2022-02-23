import numberAsCodeSqlMatcher from "./number-as-code-sql-matcher";

test("should handle null or undefined inputs", () => {
  expect(numberAsCodeSqlMatcher(null)).toEqual<string[]>([]);
  expect(numberAsCodeSqlMatcher(undefined)).toEqual<string[]>([]);
});

test("should handle inputs with invalid lengths", () => {
  expect(numberAsCodeSqlMatcher("")).toEqual<string[]>([]);
  expect(numberAsCodeSqlMatcher("12345678")).toEqual<string[]>([]);
});

test("should handle string that is not a number", () => {
  expect(numberAsCodeSqlMatcher("z")).toEqual<string[]>([]);
});

test("should handle single digit string", () => {
  expect(numberAsCodeSqlMatcher("3")).toEqual<string[]>(["3", "03", "003", "0003"]);
});

test("should handle double digit string", () => {
  expect(numberAsCodeSqlMatcher("18")).toEqual<string[]>(["18", "018", "0018"]);
});

test("should handle triple digit string", () => {
  expect(numberAsCodeSqlMatcher("645")).toEqual<string[]>(["645", "0645"]);
});

test("should handle quadruple digit string", () => {
  expect(numberAsCodeSqlMatcher("7291")).toEqual<string[]>(["7291"]);
});
