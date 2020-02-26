import { CoordinatesSystemType } from "./coordinates-system/coordinates-system.object";

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

  longitude: number;

  latitude: number;

  coordinatesSystem: CoordinatesSystemType;

  customizedAltitude: number | null;

  customizedLongitude: number | null;

  customizedLatitude: number | null;

  customizedCoordinatesSystem: CoordinatesSystemType | null;

  temperature: number | null;

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
