import { faker } from "@faker-js/faker";
import { type UpsertAgeInput } from "@ou-ca/common/api/age";
import { Factory } from "fishery";

export const upsertAgeInputFactory = Factory.define<UpsertAgeInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
