import { Donnee } from "./donnee.object";

export interface DonneeWithNavigationData extends Donnee {
  previousDonneeId: number | null;
  nextDonneeId: number | null;
  indexDonnee: number;
}
