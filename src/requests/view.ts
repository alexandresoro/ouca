import * as _ from "lodash";
import {
  CoordinatesSystem,
  COORDINATES_SYSTEMS_CONFIG
} from "ouca-common/coordinates-system";
import { FlatDonnee } from "ouca-common/flat-donnee.object";
import { HttpParameters } from "../http/httpParameters";
import { findDonneesByCustomizedFilters } from "../sql-api/sql-api-donnee";
import {} from "../sql/sql-queries-utils";
import { writeToExcel } from "../utils/export-excel-utils";

const MAXIMUM_EXCEL_DATA_SUPPORTED = 50000;

const getComportement = (donnee: FlatDonnee, index: number): string => {
  return donnee.comportements.length >= index
    ? donnee.comportements[index - 1].code +
        " - " +
        donnee.comportements[index - 1].libelle
    : "";
};

const getMilieu = (donnee: FlatDonnee, index: number): string => {
  return donnee.milieux.length >= index
    ? donnee.milieux[index - 1].code + " - " + donnee.milieux[index - 1].libelle
    : "";
};

export const getDonneesByCustomizedFilters = async (
  httpParameters: HttpParameters
): Promise<FlatDonnee[]> => {
  return await findDonneesByCustomizedFilters(httpParameters.postData);
};

export const exportDonneesByCustomizedFilters = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const flatDonnees: FlatDonnee[] = await findDonneesByCustomizedFilters(
    httpParameters.postData
  );

  if (flatDonnees.length > MAXIMUM_EXCEL_DATA_SUPPORTED) {
    return Promise.reject({
      reason:
        "Votre recherche comporte plus de " +
        MAXIMUM_EXCEL_DATA_SUPPORTED +
        " données. Merci d'affiner votre recherche (par date...).",
      nonFatal: true
    });
  }

  const objectsToExport = _.map(flatDonnees, (donnee) => {
    const donneeToExportPart1 = {
      ID: donnee.id,
      Observateur: donnee.observateur,
      "Observateurs associés": donnee.associes,
      Date: donnee.date,
      Heure: donnee.heure,
      Durée: donnee.duree,
      Département: donnee.departement,
      "Code commune": donnee.codeCommune,
      "Nom commune": donnee.nomCommune,
      "Lieu-dit": donnee.lieudit,
      "Altitude en mètres": _.isNil(donnee.customizedAltitude)
        ? donnee.altitude
        : donnee.customizedAltitude
    };

    const coordinatesSystem: CoordinatesSystem =
      COORDINATES_SYSTEMS_CONFIG[
        donnee.customizedCoordinatesSystem
          ? donnee.customizedCoordinatesSystem
          : donnee.coordinatesSystem
      ];

    const coordinatesSuffix =
      " en " + coordinatesSystem.unitName + " (" + coordinatesSystem.name + ")";
    donneeToExportPart1["Longitude" + coordinatesSuffix] = _.isNil(
      donnee.customizedLongitude
    )
      ? donnee.longitude
      : donnee.customizedLongitude;
    donneeToExportPart1["Latitude" + coordinatesSuffix] = _.isNil(
      donnee.customizedLatitude
    )
      ? donnee.latitude
      : donnee.customizedLatitude;

    const { ...firstAttributes } = donneeToExportPart1;

    const donneeToExport = {
      ...firstAttributes,
      "Température en °C": donnee.temperature,
      Météo: donnee.meteos,
      Classe: donnee.classe,
      "Code espèce": donnee.codeEspece,
      "Nom francais": donnee.nomFrancais,
      "Nom latin": donnee.nomLatin,
      Sexe: donnee.sexe,
      Âge: donnee.age,
      "Nombre d'individus": donnee.nombre,
      "Estimation du nombre": donnee.estimationNombre,
      "Estimation de la distance": donnee.estimationDistance,
      "Distance en mètres": donnee.distance,
      "Numéro de regroupement": donnee.regroupement,
      "Comportement 1": getComportement(donnee, 1),
      "Comportement 2": getComportement(donnee, 2),
      "Comportement 3": getComportement(donnee, 3),
      "Comportement 4": getComportement(donnee, 4),
      "Comportement 5": getComportement(donnee, 5),
      "Comportement 6": getComportement(donnee, 6),
      "Milieu 1": getMilieu(donnee, 1),
      "Milieu 2": getMilieu(donnee, 2),
      "Milieu 3": getMilieu(donnee, 3),
      "Milieu 4": getMilieu(donnee, 4),
      Commentaires: donnee.commentaire
    };

    return donneeToExport;
  });

  return writeToExcel(objectsToExport, [], "donnees");
};
