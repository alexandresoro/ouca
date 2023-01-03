import { sql, type IdentifierSqlToken } from "slonik";
import { buildAndClause } from "../repository-helpers";
import { buildSearchCriteriaParameters } from "../search-criteria";
import { type EspeceFindManyInput } from "./espece-repository-types";

export const buildQClause = (q: string) => {
  return sql.fragment`
    espece.code ~* ${q}
    OR espece.nom_francais ~* ${q}
    OR espece.nom_latin ~* ${q}
  `;
};

export const buildSearchEspeceClause = ({ q, searchCriteria }: Pick<EspeceFindManyInput, "q" | "searchCriteria">) => {
  const searchCriteriaAndParameters = searchCriteria ? buildSearchCriteriaParameters(searchCriteria) : [];
  const builtSearchCriteriaAndParameters = buildAndClause(searchCriteriaAndParameters);

  if (builtSearchCriteriaAndParameters) {
    return sql.fragment`WHERE ${builtSearchCriteriaAndParameters}${
      q ? sql.fragment` AND (${buildQClause(q)})` : sql.fragment``
    }`;
  } else {
    return q ? sql.fragment`WHERE ${buildQClause(q)}` : sql.fragment``;
  }
};

export const buildOrderByIdentifier = (
  orderBy: Omit<NonNullable<EspeceFindManyInput["orderBy"]>, "nbDonnees">
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
