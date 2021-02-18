import { NicheurCode } from "@ou-ca/ouca-model";

export interface ComportementDb {
  id: number;
  code: string;
  libelle: string;
  nicheur: NicheurCode;
}
