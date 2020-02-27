import * as _ from "lodash";
import { Commune } from "ouca-common/commune.object";
import { Espece } from "ouca-common/espece.object";
import { EstimationNombre } from "ouca-common/estimation-nombre.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { Lieudit } from "ouca-common/lieudit.object";
import { CommuneDb } from "../objects/db/commune-db.object";
import { LieuditDb } from "../objects/db/lieudit-db.object";

export const mapAssociesIds = (associesDb: any): number[] => {
  return _.map(associesDb, associeDb => {
    return associeDb.associeId;
  });
};

export const mapMeteosIds = (meteosDb: any): number[] => {
  return _.map(meteosDb, meteoDb => {
    return meteoDb.meteoId;
  });
};

export const mapComportementsIds = (comportementsDb: any): number[] => {
  return _.map(comportementsDb, comportementDb => {
    return comportementDb.comportementId;
  });
};

export const mapMilieuxIds = (milieuxDds: any): number[] => {
  return _.map(milieuxDds, milieuDb => {
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
  return _.map(communesDb, communeDb => {
    return buildCommuneFromCommuneDb(communeDb);
  });
};

export const buildLieuditFromLieuditDb = (lieuditDb: LieuditDb): Lieudit => {
  return {
    id: lieuditDb.id,
    communeId: lieuditDb.commune_id,
    nom: lieuditDb.nom,
    altitude: lieuditDb.altitude,
    coordinatesL2E: {
      longitude: lieuditDb.longitude,
      latitude: lieuditDb.latitude
    },
    coordinatesL93: {
      longitude: null,
      latitude: null
    },
    coordinatesGPS: {
      longitude: null,
      latitude: null
    }
  };
};

export const buildLieuxditsFromLieuxditsDb = (
  lieuxditsDb: LieuditDb[]
): Lieudit[] => {
  return _.map(lieuxditsDb, lieuditDb => {
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
  return _.map(especesDb, especeDb => {
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
  return _.map(estimationsDb, estimationDb => {
    return mapEstimationNombre(estimationDb);
  });
};

export const mapInventaire = (inventaireDb: any): Inventaire => {
  const { observateur_id, lieudit_id, ...otherParams } = inventaireDb;
  return {
    ...otherParams,
    observateurId: observateur_id,
    lieuditId: lieudit_id
  };
};
