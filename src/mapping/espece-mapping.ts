import { Espece } from "../model/types/espece.model";
import { EspeceDb } from "../objects/db/espece-db.object";

export const buildEspeceFromEspeceDb = (especeDb: EspeceDb): Espece => {
  return {
    id: especeDb.id,
    classeId: especeDb.classe_id,
    code: especeDb.code,
    nomFrancais: especeDb.nom_francais,
    nomLatin: especeDb.nom_latin
  };
};

export const buildEspecesFromEspecesDb = (especesDb: EspeceDb[]): Espece[] => {
  return especesDb.map((especeDb) => {
    return buildEspeceFromEspeceDb(especeDb);
  });
};
