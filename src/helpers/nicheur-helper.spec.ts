import { type NicheurCode, NICHEUR_CERTAIN, NICHEUR_PROBABLE } from "../types/nicheur.model";
import { getHighestNicheurStatus, getNicheurStatusToDisplay } from "./nicheur-helper";

test("should return correct value when no nicheur code provided ", () => {
  const comportementsEmpty: { nicheur?: NicheurCode | null }[] = [];
  expect(getHighestNicheurStatus(comportementsEmpty)).toBe<NicheurCode | null>(null);
});

test("should return correct value with one code provided ", () => {
  const comportementsSingle: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "certain",
    },
  ];
  expect(getHighestNicheurStatus(comportementsSingle)).toBe<NicheurCode | null>("certain");
});

test("should return correct value with similar codes provided ", () => {
  const comportementsSimilar: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "probable",
    },
    {
      nicheur: "probable",
    },
  ];
  expect(getHighestNicheurStatus(comportementsSimilar)).toBe<NicheurCode | null>("probable");
});

test("should return correct value with different codes provided ", () => {
  const comportementsDifferent: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "possible",
    },
    {
      nicheur: "certain",
    },
  ];
  expect(getHighestNicheurStatus(comportementsDifferent)).toBe<NicheurCode | null>("certain");
});

test("should return correct value with a complex case ", () => {
  const comportementsComplex: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "possible",
    },
    {
      nicheur: "probable",
    },
    {
      nicheur: "possible",
    },
    {},
    {
      nicheur: "possible",
    },
  ];
  expect(getHighestNicheurStatus(comportementsComplex)).toBe<NicheurCode | null>("probable");
});

test("should return the default text when no element supplied", () => {
  const comportementsEmpty: { nicheur?: NicheurCode | null }[] = [];
  expect(getNicheurStatusToDisplay(comportementsEmpty, "defaultText")).toBe<string>("defaultText");
});

test("should return the default text when no code supplied", () => {
  const comportementMultiplesEmpty: { nicheur?: NicheurCode | null }[] = [{}, {}, {}];
  expect(getNicheurStatusToDisplay(comportementMultiplesEmpty, "defaultText")).toBe<string>("defaultText");
});

test("should return correct value with one code provided ", () => {
  const comportementsSingle: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "certain",
    },
  ];
  expect(getNicheurStatusToDisplay(comportementsSingle, "defaultText")).toBe<string>(NICHEUR_CERTAIN.name);
});

test("should return correct value with similar codes provided ", () => {
  const comportementsSimilar: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "probable",
    },
    {
      nicheur: "probable",
    },
  ];
  expect(getNicheurStatusToDisplay(comportementsSimilar, "defaultText")).toBe<string>(NICHEUR_PROBABLE.name);
});

test("should return correct value with different codes provided ", () => {
  const comportementsDifferent: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "possible",
    },
    {
      nicheur: "certain",
    },
  ];
  expect(getNicheurStatusToDisplay(comportementsDifferent, "defaultText")).toBe<string>(NICHEUR_CERTAIN.name);
});

test("should return correct value with a complex case ", () => {
  const comportementsComplex: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "possible",
    },
    {
      nicheur: "probable",
    },
    {
      nicheur: "possible",
    },
    {},
    {
      nicheur: "possible",
    },
  ];
  expect(getNicheurStatusToDisplay(comportementsComplex, "defaultText")).toBe<string>(NICHEUR_PROBABLE.name);
});
