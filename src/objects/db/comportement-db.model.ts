import { NicheurCode } from "ouca-common/nicheur.model";

export interface ComportementDb {
  id: number;
  code: string;
  libelle: string;
  nicheur: NicheurCode;
}
