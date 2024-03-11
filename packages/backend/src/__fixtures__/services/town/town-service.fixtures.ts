import { faker } from "@faker-js/faker";
import type { Town } from "@ou-ca/common/api/entities/town";
import type { UpsertTownInput } from "@ou-ca/common/api/town";
import { Factory } from "fishery";

export const townServiceFactory = Factory.define<Town>(() => {
  return {
    id: faker.string.sample(),
    code: faker.number.int(),
    nom: faker.string.alpha(),
    departmentId: faker.string.alpha(),
    editable: faker.datatype.boolean(),
    departmentCode: faker.string.alphanumeric(),
    localitiesCount: faker.number.int(),
    entriesCount: faker.number.int(),
  };
});

export const upsertTownInputFactory = Factory.define<UpsertTownInput>(() => {
  return {
    code: faker.number.int(),
    nom: faker.string.alpha(),
    departmentId: faker.string.alpha(),
  };
});
