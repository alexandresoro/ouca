import { faker } from "@faker-js/faker";
import { type Weather } from "@ou-ca/common/api/entities/weather";
import { type UpsertWeatherInput } from "@ou-ca/common/api/weather";
import { Factory } from "fishery";

export const weatherServiceFactory = Factory.define<Weather>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    editable: faker.datatype.boolean(),
    inventoriesCount: faker.number.int(),
    entriesCount: faker.number.int(),
  };
});

export const upsertWeatherInputFactory = Factory.define<UpsertWeatherInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
