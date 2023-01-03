import { sql, type IdentifierSqlToken } from "slonik";
import { buildAndClause } from "../repository-helpers";
import { type InventaireFindMatchingInput } from "./inventaire-repository-types";

export const buildFindMatchingInventaireClause = (criteria: InventaireFindMatchingInput) => {
  if (!criteria) {
    return sql.fragment``;
  }

  const andClause = Object.entries(criteria)
    .filter(
      (
        criteria
      ): criteria is [
        keyof InventaireFindMatchingInput,
        NonNullable<InventaireFindMatchingInput[keyof InventaireFindMatchingInput]>
      ] => {
        return criteria?.[1] != null;
      }
    )
    .map(([criteriaName, criteriaValue]) => {
      let identifierCriteria: IdentifierSqlToken;
      switch (criteriaName) {
        case "associesIds":
          identifierCriteria = sql.identifier(["inventaire_associe", "observateur_id"]);
          break;
        case "meteosIds":
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
