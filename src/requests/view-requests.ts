import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import path from "path";
import { HttpParameters } from "../http/httpParameters";
import { COORDINATES_SYSTEMS_CONFIG } from "../model/coordinates-system/coordinates-system-list.object";
import { CoordinatesSystemType } from "../model/coordinates-system/coordinates-system.object";
import { DonneesFilter } from "../model/types/donnees-filter.object";
import { FlatDonnee } from "../model/types/flat-donnee.object";
import { findDonneesByCustomizedFilters } from "../services/entities/donnee-service";
import { writeToExcelFile } from "../utils/export-excel-utils";
import { PUBLIC_DIR } from "../utils/paths";

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

export const exportDonneesByCustomizedFiltersRequest = async (
  httpParameters: HttpParameters<DonneesFilter>
): Promise<unknown> => {
  const flatDonnees = await findDonneesByCustomizedFilters(
    httpParameters.body
  );

  const coordinatesSystemType: CoordinatesSystemType = httpParameters.body.coordinatesSystemType;
  const coordinatesSystem = COORDINATES_SYSTEMS_CONFIG[coordinatesSystemType];
  const coordinatesSuffix =
    " en " + coordinatesSystem.unitName + " (" + coordinatesSystem.name + ")";

  const objectsToExport = flatDonnees.map((donnee) => {
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
      "Lieu-dit": donnee.lieudit
    };

    donneeToExportPart1["Latitude" + coordinatesSuffix] =
      donnee.latitude ?? "Non supporté";

    donneeToExportPart1["Longitude" + coordinatesSuffix] =
      donnee.longitude ?? "Non supporté";

    const { ...firstAttributes } = donneeToExportPart1;

    const donneeToExport = {
      ...firstAttributes,
      "Altitude en mètres": donnee.altitude,
      "Température en °C": donnee.temperature,
      Météo: donnee.meteos,
      Classe: donnee.classe,
      "Code espèce": donnee.codeEspece,
      "Nom francais": donnee.nomFrancais,
      "Nom scientifique": donnee.nomLatin,
      Sexe: donnee.sexe,
      Âge: donnee.age,
      "Nombre d'individus": donnee.nombre,
      "Estimation du nombre": donnee.estimationNombre,
      "Estimation de la distance": donnee.estimationDistance,
      "Distance en mètres": donnee.distance,
      "Numéro de regroupement": donnee.regroupement,
      Nicheur: !donnee.nicheur ? "" : donnee.nicheur,
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

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, "donnees", path.join(PUBLIC_DIR, fileName));
  return readFileSync(path.join(PUBLIC_DIR, fileName));
};
