export const ID = "id";
export const DONNEE_ID = "donnee_id";
export const INVENTAIRE_ID = "inventaire_id";
export const METEO_ID = "meteo_id";
export const OBSERVATEUR_ID = "observateur_id";
export const NB_DONNEES = "nbDonnees";
export const NB_COMMUNES = "nbCommunes";
export const NB_LIEUXDITS = "nbLieuxdits";
export const NB_ESPECES = "nbEspeces";

export const TABLE_OBSERVATEUR = "observateur";
export const TABLE_DEPARTEMENT = "departement";
export const TABLE_COMMUNE = "commune";
export const TABLE_LIEUDIT = "lieudit";
export const TABLE_METEO = "meteo";
export const TABLE_CLASSE = "classe";
export const TABLE_ESPECE = "espece";
export const TABLE_AGE = "age";
export const TABLE_SEXE = "sexe";
export const TABLE_ESTIMATION_NOMBRE = "estimation_nombre";
export const TABLE_ESTIMATION_DISTANCE = "estimation_distance";
export const TABLE_COMPORTEMENT = "comportement";
export const TABLE_MILIEU = "milieu";
export const TABLE_INVENTAIRE = "inventaire";
export const TABLE_INVENTAIRE_METEO = "inventaire_meteo";
export const TABLE_INVENTAIRE_ASSOCIE = "inventaire_associe";
export const TABLE_DONNEE = "donnee";
export const TABLE_DONNEE_COMPORTEMENT = "donnee_comportement";
export const TABLE_DONNEE_MILIEU = "donnee_milieu";
export const TABLE_SETTINGS = "settings";
export const TABLE_VERSION = "version";

export const IMPORT_TABLES = [TABLE_OBSERVATEUR, TABLE_DEPARTEMENT, TABLE_COMMUNE, TABLE_LIEUDIT, TABLE_METEO, TABLE_CLASSE, TABLE_ESPECE, TABLE_AGE, TABLE_SEXE, TABLE_ESTIMATION_NOMBRE, TABLE_ESTIMATION_DISTANCE, TABLE_COMPORTEMENT, TABLE_MILIEU, TABLE_DONNEE] as const;

export type ImportableTable = typeof IMPORT_TABLES[number];

export const COLUMN_CODE = "code";
export const COLUMN_ESPECE_ID = "espece_id";
export const COLUMN_LIBELLE = "libelle";
export const COLUMN_NOM = "nom";

export const ORDER_ASC = "ASC";
export const ORDER_DESC = "DESC";

export const KEY_DEFAULT_OBSERVATEUR_ID = "default_observateur_id";
export const KEY_DEFAULT_DEPARTEMENT_ID = "default_departement_id";
export const KEY_DEFAULT_AGE_ID = "default_age_id";
export const KEY_DEFAULT_SEXE_ID = "default_sexe_id";
export const KEY_DEFAULT_ESTIMATION_NOMBRE_ID = "default_estimation_nombre_id";
export const KEY_DEFAULT_NOMBRE = "default_nombre";
export const KEY_ARE_ASSOCIES_DISPLAYED = "are_associes_displayed";
export const KEY_IS_METEO_DISPLAYED = "is_meteo_displayed";
export const KEY_IS_DISTANCE_DISPLAYED = "is_distance_displayed";
export const KEY_IS_REGROUPEMENT_DISPLAYED = "is_regroupement_displayed";
export const KEY_COORDINATES_SYSTEM = "coordinates_system";

export const SEPARATOR_COMMA = ", ";

export const DATE_PATTERN = "yyyy-MM-dd";
export const DATE_WITH_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
