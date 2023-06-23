import { toUrlSearchParams } from "./url-search-params";

describe("toUrlSearchParams()", () => {
  test("should handle an undefined object", () => {
    const params = undefined;

    const urlSearchParams = toUrlSearchParams(params);

    expect(urlSearchParams.toString()).toEqual("");
  });

  test("should handle an empty object", () => {
    const params = {};

    const urlSearchParams = toUrlSearchParams(params);

    expect(urlSearchParams.toString()).toEqual("");
  });

  test("should handle a single param object", () => {
    const params = {
      par: "am",
    };

    const urlSearchParams = toUrlSearchParams(params);

    expect(urlSearchParams.toString()).toEqual("par=am");
  });

  test("should handle multiple params object with different types", () => {
    const params = {
      par: "am",
      number: 12,
      boolValue: false,
    };

    const urlSearchParams = toUrlSearchParams(params);

    expect(urlSearchParams.toString()).toEqual("par=am&number=12&boolValue=false");
  });

  test("should filter out undefined properties of an object", () => {
    const params = {
      par: "am",
      hello: undefined,
      number: 12,
      empty: undefined,
    };

    const urlSearchParams = toUrlSearchParams(params);

    expect(urlSearchParams.toString()).toEqual("par=am&number=12");
  });
});
