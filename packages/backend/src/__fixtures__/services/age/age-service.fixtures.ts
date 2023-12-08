import { faker } from "@faker-js/faker";
import { type UpsertAgeInput } from "@ou-ca/common/api/age";
import { type Age } from "@ou-ca/common/api/entities/age";
import { Factory } from "fishery";

export const ageServiceFactory = Factory.define<Age>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    editable: faker.datatype.boolean(),
    inventoriesCount: faker.number.int(),
    entriesCount: faker.number.int(),
  };
});

export const upsertAgeInputFactory = Factory.define<UpsertAgeInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
