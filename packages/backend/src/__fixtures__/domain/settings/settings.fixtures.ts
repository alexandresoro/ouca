import type { Settings } from "@domain/settings/settings.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const settingsFactory = Factory.define<Settings>(() => {
  return {
    id: faker.string.sample(),
    defaultObservateurId: faker.string.sample(),
    defaultDepartementId: faker.string.sample(),
    defaultAgeId: faker.string.sample(),
    defaultSexeId: faker.string.sample(),
    defaultEstimationNombreId: faker.string.sample(),
    defaultNombre: faker.number.int(),
    areAssociesDisplayed: faker.datatype.boolean(),
    isMeteoDisplayed: faker.datatype.boolean(),
    isDistanceDisplayed: faker.datatype.boolean(),
    isRegroupementDisplayed: faker.datatype.boolean(),
    userId: faker.string.uuid(),
  };
});
