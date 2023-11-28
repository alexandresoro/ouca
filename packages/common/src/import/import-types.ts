export const IMPORT_OBSERVATEUR = "observateur";
export const IMPORT_DEPARTEMENT = "departement";
export const IMPORT_COMMUNE = "commune";
export const IMPORT_LIEUDIT = "lieudit";
export const IMPORT_METEO = "meteo";
export const IMPORT_CLASSE = "classe";
export const IMPORT_ESPECE = "espece";
export const IMPORT_AGE = "age";
export const IMPORT_SEXE = "sexe";
export const IMPORT_ESTIMATION_NOMBRE = "estimation-nombre";
export const IMPORT_ESTIMATION_DISTANCE = "estimation-distance";
export const IMPORT_COMPORTEMENT = "comportement";
export const IMPORT_MILIEU = "milieu";
export const IMPORT_DONNEE = "donnee";

export const IMPORT_TYPE = [
  IMPORT_OBSERVATEUR,
  IMPORT_DEPARTEMENT,
  IMPORT_COMMUNE,
  IMPORT_LIEUDIT,
  IMPORT_METEO,
  IMPORT_CLASSE,
  IMPORT_ESPECE,
  IMPORT_AGE,
  IMPORT_SEXE,
  IMPORT_ESTIMATION_NOMBRE,
  IMPORT_ESTIMATION_DISTANCE,
  IMPORT_COMPORTEMENT,
  IMPORT_MILIEU,
  IMPORT_DONNEE,
] as const;

export type ImportType = (typeof IMPORT_TYPE)[number];
