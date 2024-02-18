import { faker } from "@faker-js/faker";
import { type Environment } from "@ou-ca/common/api/entities/environment";
import { type UpsertEnvironmentInput } from "@ou-ca/common/api/environment";
import { Factory } from "fishery";

export const environmentServiceFactory = Factory.define<Environment>(() => {
  return {
    id: faker.string.sample(),
    code: faker.string.alphanumeric(),
    libelle: faker.string.alpha(),
    editable: faker.datatype.boolean(),
    entriesCount: faker.number.int(),
  };
});

export const upsertEnvironmentInputFactory = Factory.define<UpsertEnvironmentInput>(() => {
  return {
    code: faker.string.alphanumeric(),
    libelle: faker.string.alpha(),
  };
});
