import { type Commune, type Departement, type Meteo, type Observateur } from "../../../gql/graphql";

export type UpsertInventoryInput = {
  id: number | null;
  observer: Observateur | null;
  associateObservers: Observateur[];
  date: string | null;
  time?: string | null;
  duration?: string | null;
  department?: Departement | null;
  town?: Commune | null;
  customLatitude?: string | null;
  customLongitude?: string | null;
  customAltitude?: string | null;
  temperature?: string | null;
  weathers: Meteo[];
};
