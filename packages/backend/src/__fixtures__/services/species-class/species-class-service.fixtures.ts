import { faker } from "@faker-js/faker";
import type { SpeciesClass } from "@ou-ca/common/api/entities/species-class";
import type { UpsertClassInput } from "@ou-ca/common/api/species-class";
import { Factory } from "fishery";

export const speciesClassServiceFactory = Factory.define<SpeciesClass>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    editable: faker.datatype.boolean(),
    speciesCount: faker.number.int(),
    entriesCount: faker.number.int(),
  };
});

export const upsertSpeciesClassInputFactory = Factory.define<UpsertClassInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
