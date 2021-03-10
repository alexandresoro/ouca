import { EntiteAvecLibelle } from "./entite-avec-libelle.object";

export type Observateur = EntiteAvecLibelle & {
  libelle: string;
}
