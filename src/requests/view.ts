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
      Altitude: object.altitude,
      Longitude: object.longitude,
      Latitude: object.latitude,
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
      Distance: object.distance,
      Estimation_Distance: object.estimationDistance,
      Regroupement: object.regroupement,
      Code_Comportement_1: getCodeComportement(object, 1),
      Libelle_Comportement_1: getLibelleComportement(object, 1),
      Code_Comportement_2: getCodeComportement(object, 2),
      Libelle_Comportement_2: getLibelleComportement(object, 2),
      Code_Comportement_3: getCodeComportement(object, 3),
      Libelle_Comportement_3: getLibelleComportement(object, 3),
      Code_Comportement_4: getCodeComportement(object, 4),
      Libelle_Comportement_4: getLibelleComportement(object, 4),
      Code_Comportement_5: getCodeComportement(object, 5),
      Libelle_Comportement_5: getLibelleComportement(object, 5),
      Code_Comportement_6: getCodeComportement(object, 6),
      Libelle_Comportement_6: getLibelleComportement(object, 6),
      Code_Milieu_1: getCodeMilieu(object, 1),
      Libelle_Milieu_1: getLibelleMilieu(object, 1),
      Code_Milieu_2: getCodeMilieu(object, 2),
      Libelle_Milieu_2: getLibelleMilieu(object, 2),
      Code_Milieu_3: getCodeMilieu(object, 3),
      Libelle_Milieu_3: getLibelleMilieu(object, 3),
      Code_Milieu_4: getCodeMilieu(object, 4),
      Libelle_Milieu_4: getLibelleMilieu(object, 4),
      Commentaire: object.commentaire
    };
  });

  return writeToExcel(objectsToExport, [], "donnees");
};

const getCodeComportement = (donnee: any, index: number): string => {
  return donnee.comportements.length >= index
    ? donnee.comportements[index - 1].code
    : "";
};

const getLibelleComportement = (donnee: any, index: number): string => {
  return donnee.comportements.length >= index
    ? donnee.comportements[index - 1].libelle
    : "";
};

const getCodeMilieu = (donnee: any, index: number): string => {
  return donnee.milieux.length >= index ? donnee.milieux[index - 1].code : "";
};

const getLibelleMilieu = (donnee: any, index: number): string => {
  return donnee.milieux.length >= index
    ? donnee.milieux[index - 1].libelle
    : "";
};
