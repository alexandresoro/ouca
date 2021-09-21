import { Commune } from "../../model/types/commune.model";
import { CommuneDb } from "../../objects/db/commune-db.object";

export const buildCommuneFromCommuneDb = (communeDb: CommuneDb): Commune => {
  return {
    ...communeDb,
    departementId: communeDb.departement_id
  };
};

export const buildCommunesFromCommunesDb = (
  communesDb: CommuneDb[]
): Commune[] => {
  return communesDb.map((communeDb) => {
    return buildCommuneFromCommuneDb(communeDb);
  });
};
