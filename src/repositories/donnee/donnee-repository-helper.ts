import { sql, type IdentifierSqlToken } from "slonik";
import { type DonneeFindManyInput } from "./donnee-repository-types";

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
