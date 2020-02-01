export interface FlatDonnee {
  id: number;
  inventaireId: number;
  observateur: string;
  associes: string;
  date: Date;
  heure: string;
  duree: string;
  departement: string;
  codeCommune: number;
  nomCommune: string;
  lieudit: string;
  altitude: number;
  longitudeL2E: number;
  latitudeL2E: number;
  longitudeL93: number;
  latitudeL93: number;
  longitudeGPS: number;
  latitudeGPS: number;
  customizedAltitude: number;
  customizedLongitudeL2E: number;
  customizedLatitudeL2E: number;
  customizedLongitudeL93: number;
  customizedLatitudeL93: number;
  customizedLongitudeGPS: number;
  customizedLatitudeGPS: number;
  temperature: number;
  meteos: string;
  classe: string;
  codeEspece: string;
  nomFrancais: string;
  nomLatin: string;
  sexe: string;
  age: string;
  estimationNombre: string;
  nombre: number | null;
  estimationDistance: string;
  distance: number | null;
  regroupement: number | null;
  comportements: FlatDonneeComportement[];
  milieux: FlatDonneeMilieu[];
  commentaire: string;
}

export interface FlatDonneeComportement {
  code: string;
  libelle: string;
}

export interface FlatDonneeMilieu {
  code: string;
  libelle: string;
}
