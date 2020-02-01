import * as _ from "lodash";
import { HttpParameters } from "../http/httpParameters";
import { findDonneesByCustomizedFilters } from "../sql-api/sql-api-donnee";
import {} from "../sql/sql-queries-utils";
import { writeToExcel } from "../utils/export-excel-utils";
import { FlatDonnee } from "basenaturaliste-model/flat-donnee.object";

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
  const donnees: FlatDonnee[] = await findDonneesByCustomizedFilters(
    httpParameters.postData
  );

  if (donnees.length > MAXIMUM_EXCEL_DATA_SUPPORTED) {
    return Promise.reject({
      reason:
        "Votre recherche comporte plus de " +
        MAXIMUM_EXCEL_DATA_SUPPORTED +
        " données. Merci d'affiner votre recherche (par date...).",
      nonFatal: true
    });
  }

  const objectsToExport = _.map(donnees, (object) => {
    return {
      ID: object.id,
      Observateur: object.observateur,
      "Observateurs associés": object.associes,
      Date: object.date,
      Heure: object.heure,
      Durée: object.duree,
      Département: object.departement,
      "Code commune": object.codeCommune,
      "Nom commune": object.nomCommune,
      "Lieu-dit": object.lieudit,
      Altitude: object.customizedAltitude
        ? object.customizedAltitude
        : object.altitude,
      "Longitude (Lambert II étendu)": object.customizedLongitudeL2E
        ? object.customizedLongitudeL2E
        : object.longitudeL2E,
      "Latitude (Lambert II étendu)": object.customizedLatitudeL2E
        ? object.customizedLatitudeL2E
        : object.latitudeL2E,
      Température: object.temperature,
      Météo: object.meteos,
      Classe: object.classe,
      "Code espèce": object.codeEspece,
      "Nom francais": object.nomFrancais,
      "Nom latin": object.nomLatin,
      Sexe: object.sexe,
      Age: object.age,
      Nombre: object.nombre,
      "Estimation du nombre": object.estimationNombre,
      "Estimation de la distance": object.estimationDistance,
      "Distance (mètres)": object.distance,
      Regroupement: object.regroupement,
      "Comportement 1": getComportement(object, 1),
      "Comportement 2": getComportement(object, 2),
      "Comportement 3": getComportement(object, 3),
      "Comportement 4": getComportement(object, 4),
      "Comportement 5": getComportement(object, 5),
      "Comportement 6": getComportement(object, 6),
      "Milieu 1": getMilieu(object, 1),
      "Milieu 2": getMilieu(object, 2),
      "Milieu 3": getMilieu(object, 3),
      "Milieu 4": getMilieu(object, 4),
      Commentaire: object.commentaire
    };
  });

  return writeToExcel(objectsToExport, [], "donnees");
};
