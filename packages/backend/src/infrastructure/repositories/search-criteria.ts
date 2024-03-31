import type { SearchCriteria } from "@domain/search/search-criteria.js";
import type { Database } from "@infrastructure/kysely/kysely.js";
import escapeStringRegexp from "escape-string-regexp";
import type { ExpressionBuilder, OperandExpression, SqlBool } from "kysely";

export const withSearchCriteria = (searchCriteria: SearchCriteria) => {
  return (
    eb: ExpressionBuilder<
      Database,
      | "espece"
      | "donnee"
      | "inventaire"
      | "inventaire_meteo"
      | "inventaire_associe"
      | "commune"
      | "lieudit"
      | "donnee_comportement"
      | "donnee_milieu"
      | "comportement"
    >,
  ) => {
    const expressions: OperandExpression<SqlBool>[] = [];

    if (searchCriteria.entryId != null) {
      expressions.push(eb("donnee.id", "=", searchCriteria.entryId));
    }

    if (searchCriteria.inventoryId != null) {
      expressions.push(eb("donnee.inventaireId", "=", Number.parseInt(searchCriteria.inventoryId)));
    }

    if (searchCriteria.observerIds?.length) {
      expressions.push(eb("inventaire.observateurId", "in", searchCriteria.observerIds.map(Number.parseInt)));
    }

    if (searchCriteria.temperature != null) {
      expressions.push(eb("inventaire.temperature", "=", searchCriteria.temperature));
    }

    if (searchCriteria.weatherIds?.length) {
      expressions.push(eb("inventaire_meteo.meteoId", "in", searchCriteria.weatherIds.map(Number.parseInt)));
    }

    if (searchCriteria.associateIds?.length) {
      expressions.push(eb("inventaire_associe.observateurId", "in", searchCriteria.associateIds.map(Number.parseInt)));
    }

    if (searchCriteria.time != null) {
      expressions.push(eb("inventaire.heure", "=", searchCriteria.time));
    }

    if (searchCriteria.duration != null) {
      expressions.push(eb("inventaire.duree", "=", searchCriteria.duration));
    }

    if (searchCriteria.classIds?.length) {
      expressions.push(eb("espece.classeId", "in", searchCriteria.classIds.map(Number.parseInt)));
    }

    if (searchCriteria.speciesIds?.length) {
      expressions.push(eb("donnee.especeId", "in", searchCriteria.speciesIds.map(Number.parseInt)));
    }

    if (searchCriteria.departmentIds?.length) {
      expressions.push(eb("commune.departementId", "in", searchCriteria.departmentIds.map(Number.parseInt)));
    }

    if (searchCriteria.townIds?.length) {
      expressions.push(eb("lieudit.communeId", "in", searchCriteria.townIds.map(Number.parseInt)));
    }

    if (searchCriteria.localityIds?.length) {
      expressions.push(eb("inventaire.lieuditId", "in", searchCriteria.localityIds.map(Number.parseInt)));
    }

    if (searchCriteria.number != null) {
      expressions.push(eb("donnee.nombre", "=", searchCriteria.number));
    }

    if (searchCriteria.numberEstimateIds?.length) {
      expressions.push(eb("donnee.estimationNombreId", "in", searchCriteria.numberEstimateIds.map(Number.parseInt)));
    }

    if (searchCriteria.sexIds?.length) {
      expressions.push(eb("donnee.sexeId", "in", searchCriteria.sexIds.map(Number.parseInt)));
    }

    if (searchCriteria.ageIds?.length) {
      expressions.push(eb("donnee.ageId", "in", searchCriteria.ageIds.map(Number.parseInt)));
    }

    if (searchCriteria.distance != null) {
      expressions.push(eb("donnee.distance", "=", searchCriteria.distance));
    }

    if (searchCriteria.distanceEstimateIds?.length) {
      expressions.push(
        eb("donnee.estimationDistanceId", "in", searchCriteria.distanceEstimateIds.map(Number.parseInt)),
      );
    }

    if (searchCriteria.regroupment != null) {
      expressions.push(eb("donnee.regroupement", "=", searchCriteria.regroupment));
    }

    if (searchCriteria.fromDate != null) {
      expressions.push(eb("inventaire.date", ">=", new Date(searchCriteria.fromDate)));
    }

    if (searchCriteria.toDate != null) {
      expressions.push(eb("inventaire.date", "<=", new Date(searchCriteria.toDate)));
    }

    if (searchCriteria.comment != null) {
      expressions.push(eb("donnee.commentaire", "~*", escapeStringRegexp(searchCriteria.comment)));
    }

    if (searchCriteria.breeders?.length) {
      expressions.push(eb("comportement.nicheur", "in", searchCriteria.breeders));
    }

    if (searchCriteria.behaviorIds?.length) {
      expressions.push(eb("donnee_comportement.comportementId", "in", searchCriteria.behaviorIds.map(Number.parseInt)));
    }

    if (searchCriteria.environmentIds?.length) {
      expressions.push(eb("donnee_milieu.milieuId", "in", searchCriteria.environmentIds.map(Number.parseInt)));
    }

    return eb.and(expressions);
  };
};
