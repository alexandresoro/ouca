import { Commune } from "basenaturaliste-model/commune.object";
import { Espece } from "basenaturaliste-model/espece.object";
import { EstimationNombre } from "basenaturaliste-model/estimation-nombre.object";
import { Inventaire } from "basenaturaliste-model/inventaire.object";
import { Lieudit } from "basenaturaliste-model/lieudit.object";
import * as _ from "lodash";
import { LieuditDb } from "../objects/db/lieudit-db.object";
import { CommuneDb } from "../objects/db/commune-db.object";

export const mapAssociesIds = (associesDb: any): number[] => {
  return _.map(associesDb, (associeDb) => {
    return associeDb.associeId;
  });
};

export const mapMeteosIds = (meteosDb: any): number[] => {
  return _.map(meteosDb, (meteoDb) => {
    return meteoDb.meteoId;
  });
};

export const mapComportementsIds = (comportementsDb: any): number[] => {
  return _.map(comportementsDb, (comportementDb) => {
    return comportementDb.comportementId;
  });
};

export const mapMilieuxIds = (milieuxDds: any): number[] => {
  return _.map(milieuxDds, (milieuDb) => {
    return milieuDb.milieuId;
  });
};

export const buildCommuneFromCommuneDb = (communeDb: CommuneDb): Commune => {
  return {
    id: communeDb.id,
    departementId: communeDb.departement_id,
    code: communeDb.code,
    nom: communeDb.nom
  };
};

export const buildCommunesFromCommunesDb = (
  communesDb: CommuneDb[]
): Commune[] => {
  return _.map(communesDb, (communeDb) => {
    return buildCommuneFromCommuneDb(communeDb);
  });
};

export const buildLieuditFromLieuditDb = (lieuditDb: LieuditDb): Lieudit => {
  return {
    id: lieuditDb.id,
    communeId: lieuditDb.commune_id,
    nom: lieuditDb.nom,
    altitude: lieuditDb.altitude,
    longitude: lieuditDb.longitude,
    latitude: lieuditDb.latitude,
    coordinatesL2E: {
      altitude: lieuditDb.altitude,
      longitude: lieuditDb.longitude,
      latitude: lieuditDb.latitude
    },
    coordinatesL93: {
      altitude: null,
      longitude: null,
      latitude: null
    },
    coordinatesGPS: {
      altitude: null,
      longitude: null,
      latitude: null
    }
  };
};

export const buildLieuxditsFromLieuxditsDb = (
  lieuxditsDb: LieuditDb[]
): Lieudit[] => {
  return _.map(lieuxditsDb, (lieuditDb) => {
    return buildLieuditFromLieuditDb(lieuditDb);
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

export const mapEspeces = (especesDb: any): Espece[] => {
  return _.map(especesDb, (especeDb) => {
    return mapEspece(especeDb);
  });
};

export const mapEstimationNombre = (estimationDb: any): EstimationNombre => {
  const { non_compte, ...otherParams } = estimationDb;
  return {
    ...otherParams,
    nonCompte: estimationDb.non_compte
  };
};

export const mapEstimationsNombre = (
  estimationsDb: any
): EstimationNombre[] => {
  return _.map(estimationsDb, (estimationDb) => {
    return mapEstimationNombre(estimationDb);
  });
};

export const mapInventaire = (inventaireDb: any): Inventaire => {
  const { observateur_id, lieudit_id, ...otherParams } = inventaireDb;
  return {
    ...otherParams,
    observateurId: inventaireDb.observateur_id,
    lieuditId: inventaireDb.lieudit_id
  };
};
