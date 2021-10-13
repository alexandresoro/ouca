import { Commune } from "../../model/graphql";
import { CommuneDb } from "../../objects/db/commune-db.object";

export const buildCommuneFromCommuneDb = (communeDb: CommuneDb): Omit<Commune, 'departement'> => {
  return {
    ...communeDb,
    departementId: communeDb.departement_id
  };
};

export const buildCommunesFromCommunesDb = (
  communesDb: CommuneDb[]
): Omit<Commune, 'departement'>[] => {
  return communesDb.map((communeDb) => {
    return buildCommuneFromCommuneDb(communeDb);
  });
};
