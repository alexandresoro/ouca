import { Commune } from "basenaturaliste-model/commune.object";
import { Espece } from "basenaturaliste-model/espece.object";
import { EstimationNombre } from "basenaturaliste-model/estimation-nombre.object";
import { Lieudit } from "basenaturaliste-model/lieudit.object";
import * as _ from "lodash";

export const mapCommunes = (communesDb: any): Commune[] => {
  return _.map(communesDb, (communeDb) => {
    return mapCommune(communeDb);
  });
};

export const mapCommune = (communeDb: any): Commune => {
  const { departement_id, ...otherParams } = communeDb;
  return {
    ...otherParams,
    departementId: communeDb.departement_id
  };
};

export const mapLieuxdits = (lieuxditsDb: any): Lieudit[] => {
  return _.map(lieuxditsDb, (lieuditDb) => {
    return mapLieudit(lieuditDb);
  });
};

export const mapLieudit = (lieuditDb: any): Lieudit => {
  const { commune_id, ...otherParams } = lieuditDb;
  return {
    ...otherParams,
    communeId: lieuditDb.commune_id
  };
};

export const mapEspeces = (especesDb: any): Espece[] => {
  return _.map(especesDb, (especeDb) => {
    return mapEspece(especeDb);
  });
};

export const mapEspece = (especeDb: any): Espece => {
  const { classe_id, nom_francais, nom_latin, ...otherParams } = especeDb;
  return {
    ...otherParams,
    classeId: especeDb.classe_id,
    nomFrancais: especeDb.nom_francais,
    nomLatin: especeDb.nom_latin
  };
};

export const mapEstimationsNombre = (
  estimationsDb: any
): EstimationNombre[] => {
  return _.map(estimationsDb, (estimationDb) => {
    return mapEstimationNombre(estimationDb);
  });
};

export const mapEstimationNombre = (estimationDb: any): EstimationNombre => {
  const { non_compte, ...otherParams } = estimationDb;
  return {
    ...otherParams,
    nonCompte: estimationDb.non_compte
  };
};
