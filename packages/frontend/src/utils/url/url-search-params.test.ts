import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { toUrlSearchParams } from "./url-search-params";

describe("toUrlSearchParams()", () => {
  test("should handle an undefined object", () => {
    const params = undefined;

    const urlSearchParams = toUrlSearchParams(params);

    assert.equal(urlSearchParams.toString(), "");
  });

  test("should handle an empty object", () => {
    const params = {};

    const urlSearchParams = toUrlSearchParams(params);

    assert.equal(urlSearchParams.toString(), "");
  });

  test("should handle a single param object", () => {
    const params = {
      par: "am",
    };

    const urlSearchParams = toUrlSearchParams(params);

    assert.equal(urlSearchParams.toString(), "par=am");
  });

  test("should handle multiple params object with different types", () => {
    const params = {
      par: "am",
      number: 12,
      boolValue: false,
      arr: [1, 3, 5],
      emptyArr: [],
    };

    const urlSearchParams = toUrlSearchParams(params);

    assert.equal(urlSearchParams.toString(), "par=am&number=12&boolValue=false&arr=1&arr=3&arr=5");
  });

  test("should filter out undefined properties of an object", () => {
    const params = {
      par: "am",
      hello: undefined,
      number: 12,
      empty: undefined,
    };

    const urlSearchParams = toUrlSearchParams(params);

    assert.equal(urlSearchParams.toString(), "par=am&number=12");
  });
});
