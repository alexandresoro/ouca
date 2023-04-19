import { type Commune, type Departement, type Meteo, type Observateur } from "../../../gql/graphql";

export type UpsertInventoryInput = {
  id: number | null;
  observer: Observateur | null;
  associateObservers: Observateur[];
  date: string;
  time?: string;
  duration?: string;
  department?: Departement | null;
  town?: Commune | null;
  latitude: string;
  longitude: string;
  altitude: string;
  temperature?: string;
  weathers: Meteo[];
};
