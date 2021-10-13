import { Commune } from "../../model/graphql";
import { CommuneDb } from "../../objects/db/commune-db.object";

export const buildCommuneFromCommuneDb = (communeDb: CommuneDb): Omit<Commune, 'departement'> => {
  if (communeDb == null) {
    return null;
  }

  return {
    ...communeDb,
    departementId: communeDb.departement_id
  };
};

