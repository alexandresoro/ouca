import { type Entry, type EntryCreateInput, type EntryFindManyInput, entrySchema } from "@domain/entry/entry.js";
import type { SearchCriteria } from "@domain/search/search-criteria.js";
import { kysely } from "@infrastructure/kysely/kysely.js";
import { countSchema } from "@infrastructure/repositories/common.js";
import { getOrderByIdentifier } from "@infrastructure/repositories/entry/entry-repository-helper.js";
import { reshapeRawEntry } from "@infrastructure/repositories/entry/entry-repository-reshape.js";
import { withSearchCriteria } from "@infrastructure/repositories/search-criteria.js";
import { type OperandExpression, type SqlBool, sql } from "kysely";
import { z } from "zod";
import { areSetsContainingSameValues } from "../../../utils/utils.js";

export const buildEntryRepository = () => {
  const findEntryById = async (id: string): Promise<Entry | null> => {
    const entryResult = await kysely
      .selectFrom("donnee")
      .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
      .leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId")
      .select([
        sql<string>`donnee.id::text`.as("id"),
        sql<string>`donnee.inventaire_id::text`.as("inventaireId"),
        sql<string>`donnee.espece_id::text`.as("especeId"),
        sql<string>`donnee.sexe_id::text`.as("sexeId"),
        sql<string>`donnee.age_id::text`.as("ageId"),
        sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
        "nombre",
        sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
        "distance",
        "commentaire",
        "regroupement",
        "dateCreation",
        sql<string[]>`array_remove(array_agg(donnee_comportement.comportement_id::text), NULL)`.as("behaviorIds"),
        sql<string[]>`array_remove(array_agg(donnee_milieu.milieu_id::text), NULL)`.as("environmentIds"),
      ])
      .where("donnee.id", "=", Number.parseInt(id))
      .groupBy("donnee.id")
      .executeTakeFirst();

    return entryResult ? entrySchema.parse(reshapeRawEntry(entryResult)) : null;
  };

  const findExistingEntry = async (criteria: EntryCreateInput): Promise<Entry | null> => {
    const entryResultWithoutLinks = await kysely
      .selectFrom("donnee")
      .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
      .leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId")
      .select([
        sql<string>`donnee.id::text`.as("id"),
        sql<string>`donnee.inventaire_id::text`.as("inventaireId"),
        sql<string>`donnee.espece_id::text`.as("especeId"),
        sql<string>`donnee.sexe_id::text`.as("sexeId"),
        sql<string>`donnee.age_id::text`.as("ageId"),
        sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
        "nombre",
        sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
        "distance",
        "commentaire",
        "regroupement",
        "dateCreation",
        sql<string[]>`array_remove(array_agg(donnee_comportement.comportement_id::text), NULL)`.as("behaviorIds"),
        sql<string[]>`array_remove(array_agg(donnee_milieu.milieu_id::text), NULL)`.as("environmentIds"),
      ])
      .where((eb) => {
        const clause: OperandExpression<SqlBool>[] = [];

        clause.push(eb("donnee.inventaireId", "=", Number.parseInt(criteria.inventoryId)));
        clause.push(eb("donnee.especeId", "=", Number.parseInt(criteria.speciesId)));
        clause.push(eb("donnee.sexeId", "=", Number.parseInt(criteria.sexId)));
        clause.push(eb("donnee.ageId", "=", Number.parseInt(criteria.ageId)));
        clause.push(eb("donnee.estimationNombreId", "=", Number.parseInt(criteria.numberEstimateId)));

        if (criteria.number != null) {
          clause.push(eb("donnee.nombre", "=", criteria.number));
        } else {
          clause.push(eb("donnee.nombre", "is", null));
        }

        if (criteria.distanceEstimateId != null) {
          clause.push(eb("donnee.estimationDistanceId", "=", Number.parseInt(criteria.distanceEstimateId)));
        } else {
          clause.push(eb("donnee.estimationDistanceId", "is", null));
        }

        if (criteria.distance != null) {
          clause.push(eb("donnee.distance", "=", criteria.distance));
        } else {
          clause.push(eb("donnee.distance", "is", null));
        }

        if (criteria.comment != null) {
          clause.push(eb("donnee.commentaire", "=", criteria.comment));
        } else {
          clause.push(eb("donnee.commentaire", "is", null));
        }

        if (criteria.grouping != null) {
          clause.push(eb("donnee.regroupement", "=", criteria.grouping));
        } else {
          clause.push(eb("donnee.regroupement", "is", null));
        }

        return eb.and(clause);
      })
      .groupBy("donnee.id")
      .execute();

    if (entryResultWithoutLinks.length === 0) {
      return null;
    }

    const entryResult = entryResultWithoutLinks.filter((entry) => {
      return (
        areSetsContainingSameValues(new Set(entry.behaviorIds), new Set(criteria.behaviorIds)) &&
        areSetsContainingSameValues(new Set(entry.environmentIds), new Set(criteria.environmentIds))
      );
    });

    if (entryResult.length === 0) {
      return null;
    }

    return entrySchema.parse(reshapeRawEntry(entryResult[0]));
  };

  const findEntries = async ({
    orderBy,
    sortOrder,
    searchCriteria,
    offset,
    limit,
  }: EntryFindManyInput = {}): Promise<Entry[]> => {
    let queryEntry = kysely
      .selectFrom("donnee")
      .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
      .leftJoin("comportement", "donnee_comportement.comportementId", "comportement.id")
      .leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId")
      .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
      .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
      .leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId")
      .leftJoin("lieudit", "inventaire.lieuditId", "lieudit.id")
      .leftJoin("commune", "lieudit.communeId", "commune.id")
      .leftJoin("departement", "commune.departementId", "departement.id")
      .leftJoin("espece", "donnee.especeId", "espece.id")
      .leftJoin("age", "donnee.ageId", "age.id")
      .leftJoin("sexe", "donnee.sexeId", "sexe.id")
      .select([
        sql<string>`donnee.id::text`.as("id"),
        sql<string>`donnee.inventaire_id::text`.as("inventaireId"),
        sql<string>`donnee.espece_id::text`.as("especeId"),
        sql<string>`donnee.sexe_id::text`.as("sexeId"),
        sql<string>`donnee.age_id::text`.as("ageId"),
        sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
        "donnee.nombre",
        sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
        "donnee.distance",
        "donnee.commentaire",
        "donnee.regroupement",
        "donnee.dateCreation",
        sql<string[]>`array_remove(array_agg(donnee_comportement.comportement_id::text), NULL)`.as("behaviorIds"),
        sql<string[]>`array_remove(array_agg(donnee_milieu.milieu_id::text), NULL)`.as("environmentIds"),
      ]);

    if (searchCriteria != null) {
      queryEntry = queryEntry.where(withSearchCriteria(searchCriteria));
    }

    queryEntry = queryEntry.groupBy("donnee.id");

    const orderByIdentifier = getOrderByIdentifier(orderBy);
    if (orderByIdentifier != null) {
      queryEntry = queryEntry.groupBy(orderByIdentifier).orderBy(orderByIdentifier, sortOrder ?? undefined);
    }

    queryEntry = queryEntry
      .orderBy("donnee.dateCreation", sortOrder ?? undefined)
      .orderBy("donnee.id", sortOrder ?? undefined);

    if (offset) {
      queryEntry = queryEntry.offset(offset);
    }
    if (limit) {
      queryEntry = queryEntry.limit(limit);
    }

    const entriesResult = await queryEntry.execute();

    return z.array(entrySchema).parse(entriesResult.map((entry) => reshapeRawEntry(entry)));
  };

  const getCount = async (criteria?: SearchCriteria | null): Promise<number> => {
    let query = kysely
      .selectFrom("donnee")
      .leftJoin("espece", "donnee.especeId", "espece.id")
      .leftJoin("classe", "espece.classeId", "classe.id")
      .leftJoin("donnee_comportement", "donnee.id", "donnee_comportement.donneeId")
      .leftJoin("comportement", "donnee_comportement.comportementId", "comportement.id")
      .leftJoin("donnee_milieu", "donnee.id", "donnee_milieu.donneeId")
      .leftJoin("milieu", "donnee_milieu.milieuId", "milieu.id")
      .leftJoin("inventaire", "donnee.inventaireId", "inventaire.id")
      .leftJoin("lieudit", "inventaire.lieuditId", "lieudit.id")
      .leftJoin("commune", "lieudit.communeId", "commune.id")
      .leftJoin("inventaire_meteo", "inventaire.id", "inventaire_meteo.inventaireId")
      .leftJoin("inventaire_associe", "inventaire.id", "inventaire_associe.inventaireId")
      .select((eb) => eb.fn.count("donnee.id").distinct().as("count"));

    if (criteria != null) {
      query = query.where(withSearchCriteria(criteria));
    }

    const countResult = await query.executeTakeFirstOrThrow();

    return countSchema.parse(countResult).count;
  };

  const createEntry = async (entryInput: EntryCreateInput): Promise<Entry> => {
    const createdEntry = await kysely.transaction().execute(async (trx) => {
      const entryResult = await trx
        .insertInto("donnee")
        .values({
          inventaireId: Number.parseInt(entryInput.inventoryId),
          especeId: Number.parseInt(entryInput.speciesId),
          sexeId: Number.parseInt(entryInput.sexId),
          ageId: Number.parseInt(entryInput.ageId),
          estimationNombreId: Number.parseInt(entryInput.numberEstimateId),
          nombre: entryInput.number,
          estimationDistanceId:
            entryInput.distanceEstimateId != null ? Number.parseInt(entryInput.distanceEstimateId) : null,
          distance: entryInput.distance,
          commentaire: entryInput.comment,
          regroupement: entryInput.grouping,
          dateCreation: new Date(),
        })
        .returning([
          sql<string>`donnee.id::text`.as("id"),
          sql<string>`donnee.inventaire_id::text`.as("inventaireId"),
          sql<string>`donnee.espece_id::text`.as("especeId"),
          sql<string>`donnee.sexe_id::text`.as("sexeId"),
          sql<string>`donnee.age_id::text`.as("ageId"),
          sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
          "nombre",
          sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
          "distance",
          "commentaire",
          "regroupement",
          "dateCreation",
        ])
        .executeTakeFirstOrThrow();

      let behaviorIdsResult: { comportementId: string }[] = [];
      if (entryInput.behaviorIds.length) {
        behaviorIdsResult = await trx
          .insertInto("donnee_comportement")
          .values(
            entryInput.behaviorIds.map((behaviorId) => {
              return { donneeId: Number.parseInt(entryResult.id), comportementId: Number.parseInt(behaviorId) };
            }),
          )
          .returning(sql<string>`donnee_comportement.comportement_id::text`.as("comportementId"))
          .execute();
      }

      let environmentIdsResult: { milieuId: string }[] = [];
      if (entryInput.environmentIds.length) {
        environmentIdsResult = await trx
          .insertInto("donnee_milieu")
          .values(
            entryInput.environmentIds.map((environmentId) => {
              return { donneeId: Number.parseInt(entryResult.id), milieuId: Number.parseInt(environmentId) };
            }),
          )
          .returning(sql<string>`donnee_milieu.milieu_id::text`.as("milieuId"))
          .execute();
      }

      return {
        ...entryResult,
        behaviorIds: behaviorIdsResult.map((behaviorId) => behaviorId.comportementId),
        environmentIds: environmentIdsResult.map((environmentId) => environmentId.milieuId),
      };
    });

    return entrySchema.parse(reshapeRawEntry(createdEntry));
  };

  const updateEntry = async (entryId: string, entryInput: EntryCreateInput): Promise<Entry> => {
    const updatedEntry = await kysely.transaction().execute(async (trx) => {
      const entryResult = await trx
        .updateTable("donnee")
        .set({
          inventaireId: Number.parseInt(entryInput.inventoryId),
          especeId: Number.parseInt(entryInput.speciesId),
          sexeId: Number.parseInt(entryInput.sexId),
          ageId: Number.parseInt(entryInput.ageId),
          estimationNombreId: Number.parseInt(entryInput.numberEstimateId),
          nombre: entryInput.number,
          estimationDistanceId:
            entryInput.distanceEstimateId != null ? Number.parseInt(entryInput.distanceEstimateId) : null,
          distance: entryInput.distance,
          commentaire: entryInput.comment,
          regroupement: entryInput.grouping,
        })
        .where("id", "=", Number.parseInt(entryId))
        .returning([
          sql<string>`donnee.id::text`.as("id"),
          sql<string>`donnee.inventaire_id::text`.as("inventaireId"),
          sql<string>`donnee.espece_id::text`.as("especeId"),
          sql<string>`donnee.sexe_id::text`.as("sexeId"),
          sql<string>`donnee.age_id::text`.as("ageId"),
          sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
          "nombre",
          sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
          "distance",
          "commentaire",
          "regroupement",
          "dateCreation",
        ])
        .executeTakeFirstOrThrow();

      await kysely.deleteFrom("donnee_comportement").where("donneeId", "=", Number.parseInt(entryId)).execute();

      let behaviorIdsResult: { comportementId: string }[] = [];
      if (entryInput.behaviorIds.length) {
        behaviorIdsResult = await trx
          .insertInto("donnee_comportement")
          .values(
            entryInput.behaviorIds.map((behaviorId) => {
              return { donneeId: Number.parseInt(entryResult.id), comportementId: Number.parseInt(behaviorId) };
            }),
          )
          .returning(sql<string>`donnee_comportement.comportement_id::text`.as("comportementId"))
          .execute();
      }

      await kysely.deleteFrom("donnee_milieu").where("donneeId", "=", Number.parseInt(entryId)).execute();

      let environmentIdsResult: { milieuId: string }[] = [];
      if (entryInput.environmentIds.length) {
        environmentIdsResult = await trx
          .insertInto("donnee_milieu")
          .values(
            entryInput.environmentIds.map((environmentId) => {
              return { donneeId: Number.parseInt(entryResult.id), milieuId: Number.parseInt(environmentId) };
            }),
          )
          .returning(sql<string>`donnee_milieu.milieu_id::text`.as("milieuId"))
          .execute();
      }

      return {
        ...entryResult,
        behaviorIds: behaviorIdsResult.map((behaviorId) => behaviorId.comportementId),
        environmentIds: environmentIdsResult.map((environmentId) => environmentId.milieuId),
      };
    });

    return entrySchema.parse(reshapeRawEntry(updatedEntry));
  };

  const deleteEntryById = async (entryId: string): Promise<Entry | null> => {
    const behaviorIdsResult = await kysely
      .selectFrom("donnee_comportement")
      .select(sql<string>`comportement_id::text`.as("comportementId"))
      .where("donneeId", "=", Number.parseInt(entryId))
      .execute();

    const environmentIdsResult = await kysely
      .selectFrom("donnee_milieu")
      .select(sql<string>`milieu_id::text`.as("milieuId"))
      .where("donneeId", "=", Number.parseInt(entryId))
      .execute();

    const deletedEntry = await kysely
      .deleteFrom("donnee")
      .where("id", "=", Number.parseInt(entryId))
      .returning([
        sql<string>`donnee.id::text`.as("id"),
        sql<string>`donnee.inventaire_id::text`.as("inventaireId"),
        sql<string>`donnee.espece_id::text`.as("especeId"),
        sql<string>`donnee.sexe_id::text`.as("sexeId"),
        sql<string>`donnee.age_id::text`.as("ageId"),
        sql<string>`donnee.estimation_nombre_id::text`.as("estimationNombreId"),
        "nombre",
        sql<string>`donnee.estimation_distance_id::text`.as("estimationDistanceId"),
        "distance",
        "commentaire",
        "regroupement",
        "dateCreation",
      ])
      .executeTakeFirst();

    return deletedEntry
      ? entrySchema.parse(
          reshapeRawEntry({
            ...deletedEntry,
            behaviorIds: behaviorIdsResult.map((behaviorId) => behaviorId.comportementId),
            environmentIds: environmentIdsResult.map((environmentId) => environmentId.milieuId),
          }),
        )
      : null;
  };

  const findLatestGrouping = async (): Promise<number | null> => {
    const result = await kysely
      .selectFrom("donnee")
      .select((eb) => eb.fn.max("regroupement").as("grouping"))
      .executeTakeFirstOrThrow();

    return result.grouping;
  };

  const updateAssociatedInventory = async (currentInventoryId: string, newInventoryId: string): Promise<void> => {
    await kysely
      .updateTable("donnee")
      .set({
        inventaireId: Number.parseInt(newInventoryId),
      })
      .where("inventaireId", "=", Number.parseInt(currentInventoryId))
      .execute();
  };

  return {
    findEntryById,
    findExistingEntry,
    findEntries,
    getCount,
    createEntry,
    updateEntry,
    deleteEntryById,
    findLatestGrouping,
    updateAssociatedInventory,
  };
};
