import { sql, type IdentifierSqlToken } from "slonik";
import { buildAndClause } from "../repository-helpers";
import { type DonneeFindManyInput } from "./donnee-repository-types";

const getIdentifierForCriteria = (
  criteriaName: keyof NonNullable<DonneeFindManyInput["searchCriteria"]>
): IdentifierSqlToken => {
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

const getOperatorForCriteria = (criteriaName: keyof NonNullable<DonneeFindManyInput["searchCriteria"]>) => {
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

export const buildSearchCriteriaClause = (searchCriteria: DonneeFindManyInput["searchCriteria"]) => {
  if (!searchCriteria) {
    return sql.fragment``;
  }

  const andClause = Object.entries(searchCriteria)
    .filter(
      (
        criteria
      ): criteria is [keyof typeof searchCriteria, NonNullable<typeof searchCriteria[keyof typeof searchCriteria]>] => {
        return criteria?.[1] != null;
      }
    )
    .map(([criteriaName, criteriaValue]) => {
      const identifierCriteria = getIdentifierForCriteria(criteriaName);
      const comperatorOperator = getOperatorForCriteria(criteriaName);
      return [identifierCriteria, criteriaValue, comperatorOperator] as const;
    });

  return buildAndClause(andClause);
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
