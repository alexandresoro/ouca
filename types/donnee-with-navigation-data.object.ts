import { Donnee } from "./donnee.object";

export type DonneeWithNavigationData = Donnee & {
  previousDonneeId: number | null;
  nextDonneeId: number | null;
  indexDonnee: number;
}
