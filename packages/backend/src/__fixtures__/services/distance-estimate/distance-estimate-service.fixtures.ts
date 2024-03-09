import { faker } from "@faker-js/faker";
import type { UpsertDistanceEstimateInput } from "@ou-ca/common/api/distance-estimate";
import type { DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate";
import { Factory } from "fishery";

export const distanceEstimateServiceFactory = Factory.define<DistanceEstimate>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    editable: faker.datatype.boolean(),
    entriesCount: faker.number.int(),
  };
});

export const upsertDistanceEstimateInputFactory = Factory.define<UpsertDistanceEstimateInput>(() => {
  return {
    libelle: faker.string.alpha(),
  };
});
