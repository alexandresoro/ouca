import { uniqueNamesGenerator } from "unique-names-generator";
import adjectives from "./dictionaries/adjectives.json";
import animals from "./dictionaries/animals.json";

export const generateUniqueNickname = (name: string): string => {
  return uniqueNamesGenerator({
    dictionaries: [animals, adjectives],
    separator: " ",
    style: "capital",
    length: 2,
    seed: name,
  });
};
