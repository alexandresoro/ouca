import { NicheurCode } from "../../model/types/nicheur.model";

export interface ComportementDb {
  id: number;
  code: string;
  libelle: string;
  nicheur: NicheurCode;
}
