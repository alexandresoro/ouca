import { getHumanFriendlyTimeFromMinutes, getMinutesFromTime } from "./time-format-convert.js";

describe("getMinutesFromTime", () => {
  test("should parse HH:mm format", () => {
    expect(getMinutesFromTime("11:12")).toEqual(672);
    expect(getMinutesFromTime("0:25")).toEqual(25);
  });

  test("should parse HHhmm format", () => {
    expect(getMinutesFromTime("1h35")).toEqual(95);
    expect(getMinutesFromTime("0h25")).toEqual(25);
  });

  test("should parse HHHmm format", () => {
    expect(getMinutesFromTime("15H22")).toEqual(922);
    expect(getMinutesFromTime("0H25")).toEqual(25);
  });

  test("should parse minutes format", () => {
    expect(getMinutesFromTime("1023")).toEqual(1023);
    expect(getMinutesFromTime("145")).toEqual(145);
    expect(getMinutesFromTime("15")).toEqual(15);
    expect(getMinutesFromTime("6")).toEqual(6);
  });

  test("should return NaN for values that do no match any pattern", () => {
    expect(getMinutesFromTime("H13")).toEqual(NaN);
    expect(getMinutesFromTime("h13")).toEqual(NaN);
    expect(getMinutesFromTime("2:91")).toEqual(NaN);
    expect(getMinutesFromTime("2H91")).toEqual(NaN);
    expect(getMinutesFromTime("9h91")).toEqual(NaN);
    expect(getMinutesFromTime("15o32")).toEqual(NaN);
    expect(getMinutesFromTime("15H223")).toEqual(NaN);
    expect(getMinutesFromTime("15:223")).toEqual(NaN);
    expect(getMinutesFromTime("99bb")).toEqual(NaN);
    expect(getMinutesFromTime("fail")).toEqual(NaN);
    expect(getMinutesFromTime(":34")).toEqual(NaN);
    expect(getMinutesFromTime("6321")).toEqual(NaN);
    expect(getMinutesFromTime("14.38")).toEqual(NaN);
    expect(getMinutesFromTime("6,35")).toEqual(NaN);
  });
});

describe("getHumanFriendlyTimeFromMinutes", () => {
  test("should parse minutes format", () => {
    expect(getHumanFriendlyTimeFromMinutes(1023)).toEqual("17:03");
    expect(getHumanFriendlyTimeFromMinutes(145)).toEqual("02:25");
    expect(getHumanFriendlyTimeFromMinutes(15)).toEqual("00:15");
    expect(getHumanFriendlyTimeFromMinutes(6)).toEqual("00:06");
  });

  test("should reject minutes that are not valid", () => {
    expect(() => getHumanFriendlyTimeFromMinutes(15332)).toThrowError();
    expect(() => getHumanFriendlyTimeFromMinutes(-1)).toThrowError();
    expect(() => getHumanFriendlyTimeFromMinutes(4.7)).toThrowError();
    expect(() => getHumanFriendlyTimeFromMinutes(7 / 3)).toThrowError();
    expect(() => getHumanFriendlyTimeFromMinutes(Math.PI)).toThrowError();
  });
});
