import { sql, type IdentifierSqlToken } from "slonik";
import { buildAndClause } from "../repository-helpers.js";
import { buildSearchCriteriaParameters } from "../search-criteria.js";
import { type DonneeFindManyInput, type DonneeFindMatchingInput } from "./donnee-repository-types.js";

export const buildFindMatchingDonneeClause = (criteria: DonneeFindMatchingInput) => {
  if (!criteria) {
    return sql.fragment``;
  }

  const andClause = Object.entries(criteria)
    .filter(
      (
        criteria
      ): criteria is [
        keyof DonneeFindMatchingInput,
        NonNullable<DonneeFindMatchingInput[keyof DonneeFindMatchingInput]>
      ] => {
        return criteria?.[1] != null;
      }
    )
    .map(([criteriaName, criteriaValue]) => {
      let identifierCriteria: IdentifierSqlToken;
      switch (criteriaName) {
        case "comportementsIds":
          identifierCriteria = sql.identifier(["donnee_comportement", "comportement_id"]);
          break;
        case "milieuxIds":
          identifierCriteria = sql.identifier(["donnee_milieu", "milieu_id"]);
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

export const buildSearchCriteriaClause = (searchCriteria: DonneeFindManyInput["searchCriteria"]) => {
  if (!searchCriteria) {
    return sql.fragment``;
  }

  const andClause = buildSearchCriteriaParameters(searchCriteria);

  const builtClause = buildAndClause(andClause);

  if (!builtClause) {
    return sql.fragment``;
  }

  return sql.fragment`WHERE ${builtClause}`;
};

export const buildOrderByIdentifier = (orderBy: NonNullable<DonneeFindManyInput["orderBy"]>): IdentifierSqlToken => {
  switch (orderBy) {
    case "id":
      return sql.identifier(["donnee", "id"]);
    case "age":
      return sql.identifier(["age", "libelle"]);
    case "codeCommune":
      return sql.identifier(["commune", "code"]);
    case "codeEspece":
      return sql.identifier(["espece", "code"]);
    case "date":
      return sql.identifier(["inventaire", "date"]);
    case "departement":
      return sql.identifier(["departement", "code"]);
    case "duree":
      return sql.identifier(["inventaire", "duree"]);
    case "heure":
      return sql.identifier(["inventaire", "heure"]);
    case "lieuDit":
      return sql.identifier(["lieudit", "nom"]);
    case "nomCommune":
      return sql.identifier(["commune", "nom"]);
    case "nomFrancais":
      return sql.identifier(["espece", "nom_francais"]);
    case "nombre":
      return sql.identifier(["donnee", "nombre"]);
    case "observateur":
      return sql.identifier(["observateur", "libelle"]);
    case "sexe":
      return sql.identifier(["sexe", "libelle"]);
  }
};
