import * as _ from "lodash";
import { HttpParameters } from "../http/httpParameters";
import { findDonneesByCustomizedFilters } from "../sql-api/sql-api-donnee";
import {} from "../sql/sql-queries-utils";
import { writeToExcel } from "../utils/export-excel-utils";

export const getDonneesByCustomizedFilters = async (
  httpParameters: HttpParameters
): Promise<any> => {
  return await findDonneesByCustomizedFilters(httpParameters.postData);
};

export const exportDonneesByCustomizedFilters = async (
  httpParameters: HttpParameters
): Promise<any> => {
  const donnees = await findDonneesByCustomizedFilters(httpParameters.postData);

  const objectsToExport = _.map(donnees, (object) => {
    return {
      ID: object.id,
      Observateur: object.observateur,
      Observateurs_Associes: object.associes,
      Date: object.date,
      Heure: object.heure,
      Duree: object.duree,
      Departement: object.departement,
      Code_Commune: object.codeCommune,
      Nom_Commune: object.nomCommune,
      Lieudit: object.lieudit,
      Altitude: object.customizedAltitude
        ? object.customizedAltitude
        : object.altitude,
      Longitude: object.customizedLongitude
        ? object.customizedLongitude
        : object.longitude,
      Latitude: object.customizedLatitude
        ? object.customizedLatitude
        : object.latitude,
      Temperature: object.temperature,
      Meteo: object.meteos,
      Classe: object.classe,
      Code_Espece: object.codeEspece,
      Nom_Francais: object.nomFrancais,
      Nom_Latin: object.nomLatin,
      Sexe: object.sexe,
      Age: object.age,
      Nombre: object.nombre,
      Estimation_Nombre: object.estimationNombre,
      Estimation_Distance: object.estimationDistance,
      Distance: object.distance,
      Regroupement: object.regroupement,
      Comportement_1: getComportement(object, 1),
      Comportement_2: getComportement(object, 2),
      Comportement_3: getComportement(object, 3),
      Comportement_4: getComportement(object, 4),
      Comportement_5: getComportement(object, 5),
      Comportement_6: getComportement(object, 6),
      Milieu_1: getMilieu(object, 1),
      Milieu_2: getMilieu(object, 2),
      Milieu_3: getMilieu(object, 3),
      Milieu_4: getMilieu(object, 4),
      Commentaire: object.commentaire
    };
  });

  return writeToExcel(objectsToExport, [], "donnees");
};

const getComportement = (donnee: any, index: number): string => {
  return donnee.comportements.length >= index
    ? donnee.comportements[index - 1].code +
        " - " +
        donnee.comportements[index - 1].libelle
    : "";
};

const getMilieu = (donnee: any, index: number): string => {
  return donnee.milieux.length >= index
    ? donnee.milieux[index - 1].code + " - " + donnee.milieux[index - 1].libelle
    : "";
};
