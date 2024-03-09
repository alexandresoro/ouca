import { type SpeciesFindManyInput } from "@domain/species/species.js";
import escapeStringRegexp from "escape-string-regexp";
import { type IdentifierSqlToken, sql } from "slonik";
import { buildAndClause } from "../repository-helpers.js";
import { buildSearchCriteriaParameters } from "../search-criteria.js";

export const buildQClause = (q: string) => {
  return sql.fragment`
    espece.code ~* ${escapeStringRegexp(q)}
    OR unaccent(espece.nom_francais) ~* unaccent(${escapeStringRegexp(q)})
    OR unaccent(espece.nom_latin) ~* unaccent(${escapeStringRegexp(q)})
  `;
};

export const buildSearchEspeceClause = ({ q, searchCriteria }: Pick<SpeciesFindManyInput, "q" | "searchCriteria">) => {
  const searchCriteriaAndParameters = searchCriteria ? buildSearchCriteriaParameters(searchCriteria) : [];
  const builtSearchCriteriaAndParameters = buildAndClause(searchCriteriaAndParameters);

  if (builtSearchCriteriaAndParameters) {
    return sql.fragment`WHERE ${builtSearchCriteriaAndParameters}${
      q ? sql.fragment` AND (${buildQClause(q)})` : sql.fragment``
    }`;
  }

  return q ? sql.fragment`WHERE ${buildQClause(q)}` : sql.fragment``;
};

export const buildOrderByIdentifier = (
  orderBy: Omit<NonNullable<SpeciesFindManyInput["orderBy"]>, "nbDonnees">
): IdentifierSqlToken => {
  switch (orderBy) {
    case "id":
      return sql.identifier(["espece", "id"]);
    case "code":
      return sql.identifier(["espece", "code"]);
    case "nomClasse":
      return sql.identifier(["classe", "libelle"]);
    case "nomFrancais":
      return sql.identifier(["espece", "nom_francais"]);
    case "nomLatin":
      return sql.identifier(["espece", "nom_latin"]);
    default:
      throw new Error();
  }
};
