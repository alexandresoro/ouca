import { NicheurCode } from "@ou-ca/ouca-model/nicheur.model";

export interface ComportementDb {
  id: number;
  code: string;
  libelle: string;
  nicheur: NicheurCode;
}
