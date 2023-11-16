import { type Generated } from "kysely";

export type Locality = {
  id: Generated<number>;
  communeId: number;
  nom: string;
  altitude: number;
  longitude: number;
  latitude: number;
  ownerId: string | null;
};
