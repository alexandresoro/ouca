import { CoordinatesSystemType } from "../coordinates-system/coordinates-system.object";
import { NicheurCode } from "./nicheur.model";

export type DonneesFilter = {
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
  nicheurs: NicheurCode[];
  comportements: number[] | null;
  milieux: number[] | null;
  excelMode: boolean;
  coordinatesSystemType: CoordinatesSystemType;
}

export type DonneesFilterEspece = {
  classes: number[] | null;
  especes: number[] | null;
}

export type DonneesFilterLieudit = {
  departements: number[] | null;
  communes: number[] | null;
  lieuxdits: number[] | null;
}

export type DonneesFilterNombre = {
  nombre: number | null;
  estimationsNombre: number[] | null;
}

export type DonneesFilterDistance = {
  distance: number | null;
  estimationsDistance: number[] | null;
}
