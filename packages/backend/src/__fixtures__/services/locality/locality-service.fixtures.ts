import { faker } from "@faker-js/faker";
import { type Locality } from "@ou-ca/common/api/entities/locality";
import { type UpsertLocalityInput } from "@ou-ca/common/api/locality";
import { Factory } from "fishery";

export const localityServiceFactory = Factory.define<Locality>(() => {
  return {
    id: faker.string.sample(),
    nom: faker.string.alpha(),
    coordinates: {
      altitude: faker.number.int({ max: 9000, min: -1000 }),
      longitude: faker.number.int({ max: 180, min: -180 }),
      latitude: faker.number.int({ max: 90, min: -90 }),
    },
    townId: faker.string.sample(),
    townCode: faker.number.int(),
    townName: faker.string.alpha(),
    departmentCode: faker.string.alphanumeric(),
    editable: faker.datatype.boolean(),
    inventoriesCount: faker.number.int(),
    entriesCount: faker.number.int(),
  };
});

export const upsertLocalityInputFactory = Factory.define<UpsertLocalityInput>(() => {
  return {
    townId: faker.string.sample(),
    nom: faker.string.alpha(),
    altitude: faker.number.int({ max: 9000, min: -1000 }),
    longitude: faker.number.int({ max: 180, min: -180 }),
    latitude: faker.number.int({ max: 90, min: -90 }),
  };
});
