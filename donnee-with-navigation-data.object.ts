import { Donnee } from "./donnee.object";

export interface DonneeWithNavigationData {
  donnee: Donnee;
  previousDonnee: Donnee | null;
  nextDonnee: Donnee | null;
  indexDonnee: number;
}
