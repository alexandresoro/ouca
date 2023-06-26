import { type SpeciesSearchParams } from "@ou-ca/common/api/species";
import { type NicheurCode } from "@ou-ca/common/types/nicheur.model";
import { sql, type IdentifierSqlToken } from "slonik";

export type SearchCriteria = {
  entryId?: number;
  observerIds?: number[];
  temperature?: number | null;
  weatherIds?: number[];
  associateIds?: number[];
  time?: string;
  duration?: string;
  classIds?: number[];
  speciesIds?: number[];
  departmentIds?: number[];
  townIds?: number[];
  localityIds?: number[];
  number?: number;
  numberEstimateIds?: number[];
  sexIds?: number[];
  ageIds?: number[];
  distance?: number | null;
  distanceEstimateIds?: number[];
  regroupment?: number;
  fromDate?: string | null;
  toDate?: string | null;
  comment?: string;
  breeders?: NicheurCode[];
  behaviorIds?: number[];
  environmentIds?: number[];
};

export const reshapeSearchCriteria = (
  params: Omit<SpeciesSearchParams, "q" | "pageNumber" | "pageSize" | "orderBy" | "sortOrder">
): SearchCriteria => {
  const {
    entryId,
    observerIds,
    temperature,
    weatherIds,
    associateIds,
    time,
    duration,
    classIds,
    speciesIds,
    departmentIds,
    townIds,
    localityIds,
    number,
    numberEstimateIds,
    sexIds,
    ageIds,
    distance,
    distanceEstimateIds,
    regroupment,
    fromDate,
    toDate,
    comment,
    breeders,
    behaviorIds,
    environmentIds,
  } = params;

  return {
    entryId: entryId ? parseInt(entryId) : undefined,
    observerIds: observerIds?.map((id) => parseInt(id)) ?? undefined,
    temperature,
    weatherIds: weatherIds?.map((id) => parseInt(id)) ?? undefined,
    associateIds: associateIds?.map((id) => parseInt(id)) ?? undefined,
    time,
    duration,
    classIds: classIds?.map((id) => parseInt(id)) ?? undefined,
    speciesIds: speciesIds?.map((id) => parseInt(id)) ?? undefined,
    departmentIds: departmentIds?.map((id) => parseInt(id)) ?? undefined,
    townIds: townIds?.map((id) => parseInt(id)) ?? undefined,
    localityIds: localityIds?.map((id) => parseInt(id)) ?? undefined,
    number,
    numberEstimateIds: numberEstimateIds?.map((id) => parseInt(id)) ?? undefined,
    sexIds: sexIds?.map((id) => parseInt(id)) ?? undefined,
    ageIds: ageIds?.map((id) => parseInt(id)) ?? undefined,
    distance,
    distanceEstimateIds: distanceEstimateIds?.map((id) => parseInt(id)) ?? undefined,
    regroupment,
    fromDate,
    toDate,
    comment,
    breeders,
    behaviorIds: behaviorIds?.map((id) => parseInt(id)) ?? undefined,
    environmentIds: environmentIds?.map((id) => parseInt(id)) ?? undefined,
  };
};

const getIdentifierForCriteria = (criteriaName: keyof NonNullable<SearchCriteria>): IdentifierSqlToken => {
  switch (criteriaName) {
    case "ageIds":
      return sql.identifier(["donnee", "age_id"]);
    case "associateIds":
      return sql.identifier(["inventaire_associe", "observateur_id"]);
    case "classIds":
      return sql.identifier(["espece", "classe_id"]);
    case "comment":
      return sql.identifier(["donnee", "commentaire"]);
    case "townIds":
      return sql.identifier(["lieudit", "commune_id"]);
    case "behaviorIds":
      return sql.identifier(["donnee_comportement", "comportement_id"]);
    case "departmentIds":
      return sql.identifier(["commune", "departement_id"]);
    case "distance":
      return sql.identifier(["donnee", "distance"]);
    case "duration":
      return sql.identifier(["inventaire", "duree"]);
    case "speciesIds":
      return sql.identifier(["donnee", "espece_id"]);
    case "distanceEstimateIds":
      return sql.identifier(["donnee", "estimation_distance_id"]);
    case "numberEstimateIds":
      return sql.identifier(["donnee", "estimation_nombre_id"]);
    case "fromDate":
      return sql.identifier(["inventaire", "date"]);
    case "time":
      return sql.identifier(["inventaire", "heure"]);
    case "entryId":
      return sql.identifier(["donnee", "id"]);
    case "localityIds":
      return sql.identifier(["inventaire", "lieudit_id"]);
    case "weatherIds":
      return sql.identifier(["inventaire_meteo", "meteo_id"]);
    case "environmentIds":
      return sql.identifier(["donnee_milieu", "milieu_id"]);
    case "breeders":
      return sql.identifier(["comportement", "nicheur"]);
    case "number":
      return sql.identifier(["donnee", "nombre"]);
    case "observerIds":
      return sql.identifier(["inventaire", "observateur_id"]);
    case "regroupment":
      return sql.identifier(["donnee", "regroupement"]);
    case "sexIds":
      return sql.identifier(["donnee", "sexe_id"]);
    case "temperature":
      return sql.identifier(["inventaire", "temperature"]);
    case "toDate":
      return sql.identifier(["inventaire", "date"]);
  }
};

const getOperatorForCriteria = (criteriaName: keyof NonNullable<SearchCriteria>) => {
  switch (criteriaName) {
    case "comment":
      return sql.fragment`~*`;
    case "fromDate":
      return sql.fragment`>=`;
    case "toDate":
      return sql.fragment`<=`;
    default:
      return undefined;
  }
};

export const buildSearchCriteriaParameters = (searchCriteria: NonNullable<SearchCriteria>) => {
  return Object.entries(searchCriteria)
    .filter((criteria): criteria is [keyof SearchCriteria, NonNullable<SearchCriteria[keyof SearchCriteria]>] => {
      return criteria?.[1] != null;
    })
    .map(([criteriaName, criteriaValue]) => {
      const identifierCriteria = getIdentifierForCriteria(criteriaName);
      const comperatorOperator = getOperatorForCriteria(criteriaName);
      return [identifierCriteria, criteriaValue, comperatorOperator] as const;
    });
};
