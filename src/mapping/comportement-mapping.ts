import { Comportement } from "@ou-ca/ouca-model";
import * as _ from "lodash";
import { ComportementDb } from "../objects/db/comportement-db.model";

export const buildComportementFromComportementDb = (
  comportementDb: ComportementDb
): Comportement => {
  return {
    id: comportementDb.id,
    code: comportementDb.code,
    libelle: comportementDb.libelle,
    nicheur: comportementDb.nicheur
  };
};

export const buildComportementsFromComportementsDb = (
  comportementsDb: ComportementDb[]
): Comportement[] => {
  return _.map(comportementsDb, (comportementDb) => {
    return buildComportementFromComportementDb(comportementDb);
  });
};

export const buildComportementDbFromComportement = (
  comportement: Comportement
): ComportementDb => {
  return {
    id: comportement.id,
    code: comportement.code,
    libelle: comportement.libelle,
    nicheur: comportement.nicheur
  };
};
