import { CoordinatesSystemType } from "./coordinates-system";

export interface DonneesFilter {
  id: number | null;
  observateurs: number[] | null;
  temperature: number | null;
  meteos: number[] | null;
  associes: number[] | null;
  heure: string | null;
  duree: string | null;
  especeGroup: DonneesFilterEspece;
  lieuditGroup: DonneesFilterLieudit;
  nombreGroup: DonneesFilterNombre;
  sexes: number[] | null;
  ages: number[] | null;
  distanceGroup: DonneesFilterDistance;
  regroupement: number | null;
  fromDate: Date | null;
  toDate: Date | null;
  commentaire: string | null;
  comportements: number[] | null;
  milieux: number[] | null;
  excelMode: boolean;
  coordinatesSystemType: CoordinatesSystemType;
}

export interface DonneesFilterEspece {
  classes: number[] | null;
  especes: number[] | null;
}

export interface DonneesFilterLieudit {
  departements: number[] | null;
  communes: number[] | null;
  lieuxdits: number[] | null;
}

export interface DonneesFilterNombre {
  nombre: number | null;
  estimationsNombre: number[] | null;
}

export interface DonneesFilterDistance {
  distance: number | null;
  estimationsDistance: number[] | null;
}
