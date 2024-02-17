import { type NicheurCode } from "@ou-ca/common/types/nicheur.model";

export type ComportementCreateInput = {
  code: string;
  libelle: string;
  nicheur?: NicheurCode | null;
  owner_id?: string | null;
};
