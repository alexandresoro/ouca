import { type SearchCriteria } from "@domain/search/search-criteria.js";
import { type SpeciesSearchParams } from "@ou-ca/common/api/species";
import { type IdentifierSqlToken, sql } from "slonik";

export const reshapeSearchCriteria = (
  params: Omit<SpeciesSearchParams, "q" | "pageNumber" | "pageSize" | "orderBy" | "sortOrder">,
): SearchCriteria | undefined => {
  const {
    entryId,
    inventoryId,
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

  const reshapedSearchCriteria = {
    entryId: entryId ? Number.parseInt(entryId) : undefined,
    inventoryId: inventoryId ? Number.parseInt(inventoryId) : undefined,
    observerIds: observerIds?.map((id) => Number.parseInt(id)) ?? undefined,
    temperature,
    weatherIds: weatherIds?.map((id) => Number.parseInt(id)) ?? undefined,
    associateIds: associateIds?.map((id) => Number.parseInt(id)) ?? undefined,
    time,
    duration,
    classIds: classIds?.map((id) => Number.parseInt(id)) ?? undefined,
    speciesIds: speciesIds?.map((id) => Number.parseInt(id)) ?? undefined,
    departmentIds: departmentIds?.map((id) => Number.parseInt(id)) ?? undefined,
    townIds: townIds?.map((id) => Number.parseInt(id)) ?? undefined,
    localityIds: localityIds?.map((id) => Number.parseInt(id)) ?? undefined,
    number,
    numberEstimateIds: numberEstimateIds?.map((id) => Number.parseInt(id)) ?? undefined,
    sexIds: sexIds?.map((id) => Number.parseInt(id)) ?? undefined,
    ageIds: ageIds?.map((id) => Number.parseInt(id)) ?? undefined,
    distance,
    distanceEstimateIds: distanceEstimateIds?.map((id) => Number.parseInt(id)) ?? undefined,
    regroupment,
    fromDate,
    toDate,
    comment,
    breeders,
    behaviorIds: behaviorIds?.map((id) => Number.parseInt(id)) ?? undefined,
    environmentIds: environmentIds?.map((id) => Number.parseInt(id)) ?? undefined,
  };

  const areSearchCriteriaDefined = Object.values(reshapedSearchCriteria).filter((v) => v !== undefined).length > 0;

  return areSearchCriteriaDefined ? reshapedSearchCriteria : undefined;
};

const getIdentifierForCriteria = (criteriaName: keyof SearchCriteria): IdentifierSqlToken => {
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
    case "inventoryId":
      return sql.identifier(["donnee", "inventaire_id"]);
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

const getOperatorForCriteria = (criteriaName: keyof SearchCriteria) => {
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

export const buildSearchCriteriaParameters = (searchCriteria: SearchCriteria) => {
  return Object.entries(searchCriteria)
    .filter(
      (criteria): criteria is [keyof SearchCriteria, Exclude<SearchCriteria[keyof SearchCriteria], undefined>] => {
        return criteria?.[1] !== undefined;
      },
    )
    .map(([criteriaName, criteriaValue]) => {
      const identifierCriteria = getIdentifierForCriteria(criteriaName);
      const comperatorOperator = getOperatorForCriteria(criteriaName);
      return [identifierCriteria, criteriaValue, comperatorOperator] as const;
    });
};
