import { type Observer, type ObserverCreateInput } from "@domain/observer/observer.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const observerFactory = Factory.define<Observer>(() => {
  return {
    id: faker.string.sample(),
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
    inventoriesCount: faker.number.int(),
    entriesCount: faker.number.int(),
  };
});

export const observerCreateInputFactory = Factory.define<ObserverCreateInput>(() => {
  return {
    libelle: faker.string.alpha(),
    ownerId: faker.string.uuid(),
  };
});
