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
  customizedAltitude: number;
  customizedLongitude: number;
  customizedLatitude: number;
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
