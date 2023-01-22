import { sql, type IdentifierSqlToken } from "slonik";
import { type SearchDonneeCriteria } from "../graphql/generated/graphql-types.js";

export type SearchCriteria = SearchDonneeCriteria;

const getIdentifierForCriteria = (criteriaName: keyof NonNullable<SearchCriteria>): IdentifierSqlToken => {
  switch (criteriaName) {
    case "ages":
      return sql.identifier(["donnee", "age_id"]);
    case "associes":
      return sql.identifier(["inventaire_associe", "observateur_id"]);
    case "classes":
      return sql.identifier(["espece", "classe_id"]);
    case "commentaire":
      return sql.identifier(["donnee", "commentaire"]);
    case "communes":
      return sql.identifier(["lieudit", "commune_id"]);
    case "comportements":
      return sql.identifier(["donnee_comportement", "comportement_id"]);
    case "departements":
      return sql.identifier(["commune", "departement_id"]);
    case "distance":
      return sql.identifier(["donnee", "distance"]);
    case "duree":
      return sql.identifier(["inventaire", "duree"]);
    case "especes":
      return sql.identifier(["donnee", "espece_id"]);
    case "estimationsDistance":
      return sql.identifier(["donnee", "estimation_distance_id"]);
    case "estimationsNombre":
      return sql.identifier(["donnee", "estimation_nombre_id"]);
    case "fromDate":
      return sql.identifier(["inventaire", "date"]);
    case "heure":
      return sql.identifier(["inventaire", "heure"]);
    case "id":
      return sql.identifier(["donnee", "id"]);
    case "lieuxdits":
      return sql.identifier(["inventaire", "lieudit_id"]);
    case "meteos":
      return sql.identifier(["inventaire_meteo", "meteo_id"]);
    case "milieux":
      return sql.identifier(["donnee_milieu", "milieu_id"]);
    case "nicheurs":
      return sql.identifier(["comportement", "nicheur"]);
    case "nombre":
      return sql.identifier(["donnee", "nombre"]);
    case "observateurs":
      return sql.identifier(["inventaire", "observateur_id"]);
    case "regroupement":
      return sql.identifier(["donnee", "regroupement"]);
    case "sexes":
      return sql.identifier(["donnee", "sexe_id"]);
    case "temperature":
      return sql.identifier(["inventaire", "temperature"]);
    case "toDate":
      return sql.identifier(["inventaire", "date"]);
  }
};

const getOperatorForCriteria = (criteriaName: keyof NonNullable<SearchCriteria>) => {
  switch (criteriaName) {
    case "commentaire":
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
