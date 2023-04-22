import {
  type Commune,
  type Departement,
  type LieuDit,
  type ListLocalitiesAutocompleteQuery,
  type ListTownsAutocompleteQuery,
  type Meteo,
  type Observateur,
} from "../../../gql/graphql";

export type UpsertInventoryInput = {
  id: number | null;
  observer: Observateur | null;
  associateObservers: Observateur[];
  date: string;
  time?: string;
  duration?: string;
  department?: Departement | null;
  town?: Pick<Commune, keyof NonNullable<NonNullable<ListTownsAutocompleteQuery["communes"]>["data"]>[number]> | null;
  locality: Pick<
    LieuDit,
    keyof NonNullable<NonNullable<ListLocalitiesAutocompleteQuery["lieuxDits"]>["data"]>[number]
  > | null;
  latitude: string;
  longitude: string;
  altitude: string;
  temperature?: string;
  weathers: Meteo[];
};
