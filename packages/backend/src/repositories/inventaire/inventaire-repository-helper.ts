import { sql, type IdentifierSqlToken } from "slonik";
import { buildAndClause } from "../repository-helpers.js";
import { type InventaireFindManyInput, type InventaireFindMatchingInput } from "./inventaire-repository-types.js";

export const buildFindMatchingInventaireClause = (criteria: InventaireFindMatchingInput) => {
  if (!criteria) {
    return sql.fragment``;
  }

  const andClause = Object.entries(criteria)
    .filter((criteria) => {
      return criteria?.[1] !== undefined;
    })
    .map(([criteriaName, criteriaValue]) => {
      let identifierCriteria: IdentifierSqlToken;
      switch (criteriaName) {
        case "associateIds":
          identifierCriteria = sql.identifier(["inventaire_associe", "observateur_id"]);
          break;
        case "weatherIds":
          identifierCriteria = sql.identifier(["inventaire_meteo", "meteo_id"]);
          break;
        case "observateur_id":
          identifierCriteria = sql.identifier(["inventaire", "observateur_id"]);
          break;
        default:
          identifierCriteria = sql.identifier([criteriaName]);
          break;
      }
      return [identifierCriteria, criteriaValue] as const;
    });

  const builtClause = buildAndClause(andClause);

  if (!builtClause) {
    return sql.fragment``;
  }

  return sql.fragment`WHERE ${builtClause}`;
};

export const buildOrderByIdentifier = (orderBy: InventaireFindManyInput["orderBy"]): IdentifierSqlToken => {
  switch (orderBy) {
    case "creationDate":
      return sql.identifier(["inventaire", "date_creation"]);
    default:
      throw new Error();
  }
};
