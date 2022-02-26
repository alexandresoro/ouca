import counterReducer from "./counterReducer";

test("should correctly sum elements", () => {
  expect(counterReducer(3, 6)).toBe(9);
});
