import type { InventoryFindManyInput } from "@domain/inventory/inventory.js";
import { type DatabasePool, type DatabaseTransactionConnection, sql } from "slonik";
import { z } from "zod";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectToKeyValueInsert,
  objectToKeyValueSet,
} from "../repository-helpers.js";
import { buildFindMatchingInventaireClause, buildOrderByIdentifier } from "./inventaire-repository-helper.js";
import { reshapeRawInventaire } from "./inventaire-repository-reshape.js";
import {
  type Inventaire,
  type InventaireCreateInput,
  type InventaireFindMatchingInput,
  inventaireSchema,
} from "./inventaire-repository-types.js";

export type InventaireRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildInventaireRepository = ({ slonik }: InventaireRepositoryDependencies) => {
  const findInventoryIndex = async (
    id: number,
    {
      orderBy,
      sortOrder,
    }: {
      orderBy: NonNullable<InventoryFindManyInput["orderBy"]>;
      sortOrder: NonNullable<InventoryFindManyInput["sortOrder"]>;
    },
  ): Promise<number | null> => {
    const query = sql.type(
      z.object({
        rowNumber: z.bigint().transform((v) => Number(v)),
      }),
    )`
      SELECT
	      row_number
      FROM (
	      SELECT
		      id,
		      ROW_NUMBER() OVER (
            ${sql.fragment`ORDER BY ${buildOrderByIdentifier(orderBy)}`}${buildSortOrderFragment({
              orderBy,
              sortOrder,
            })}
          )
	      FROM
		      basenaturaliste.inventaire) AS rown
      WHERE
	      id = ${id}
    `;

    return slonik.maybeOneFirst(query);
  };

  const findInventaires = async ({
    orderBy,
    sortOrder,
    offset,
    limit,
  }: InventoryFindManyInput = {}): Promise<readonly Inventaire[]> => {
    const query = sql.type(inventaireSchema)`
      SELECT 
        inventaire.id::text,
        inventaire.observateur_id,
        inventaire.date,
        inventaire.heure,
        inventaire.duree,
        inventaire.lieudit_id,
        inventaire.altitude,
        inventaire.longitude,
        inventaire.latitude,
        inventaire.temperature,
        inventaire.date_creation,
        inventaire.owner_id
      FROM
        basenaturaliste.inventaire
      ${
        orderBy
          ? sql.fragment`
      ORDER BY ${buildOrderByIdentifier(orderBy)}`
          : sql.fragment`ORDER BY inventaire.id DESC`
      }${buildSortOrderFragment({
        orderBy,
        sortOrder,
      })}
      ${buildPaginationFragment({ offset, limit })}
    `;

    const rawInventories = await slonik.any(query);

    return rawInventories.map((inventory) => reshapeRawInventaire(inventory));
  };

  const findExistingInventaire = async (criteria: InventaireFindMatchingInput): Promise<Inventaire | null> => {
    const { associateIds, weatherIds } = criteria;

    // TODO the match is a bit too wide, meaning that a missing/null criteria will have no
    // associated where clause, but we can consider this as acceptable
    const query = sql.type(inventaireSchema)`
      SELECT
        inventaire.id::text,
        inventaire.observateur_id,
        inventaire.date,
        inventaire.heure,
        inventaire.duree,
        inventaire.lieudit_id,
        inventaire.altitude,
        inventaire.longitude,
        inventaire.latitude,
        inventaire.temperature,
        inventaire.date_creation,
        inventaire.owner_id
      FROM
        basenaturaliste.inventaire
      LEFT JOIN
	      basenaturaliste.inventaire_associe ON inventaire_associe.inventaire_id = inventaire.id
      LEFT JOIN
	      basenaturaliste.inventaire_meteo ON inventaire_meteo.inventaire_id = inventaire.id
      ${buildFindMatchingInventaireClause(criteria)}
      GROUP BY inventaire.id
      HAVING 
        COUNT(DISTINCT inventaire_associe.observateur_id) = ${associateIds?.length ?? 0}
        AND COUNT(DISTINCT inventaire_meteo.meteo_id) = ${weatherIds?.length ?? 0}
      LIMIT 1
    `;

    const rawInventaire = await slonik.maybeOne(query);

    return reshapeRawInventaire(rawInventaire);
  };

  const createInventaire = async (
    inventaireInput: InventaireCreateInput,
    transaction?: DatabaseTransactionConnection,
  ): Promise<Inventaire> => {
    const query = sql.type(inventaireSchema)`
      INSERT INTO
        basenaturaliste.inventaire
        ${objectToKeyValueInsert({ ...inventaireInput, date_creation: "NOW()" })}
      RETURNING
        inventaire.id::text,
        inventaire.observateur_id,
        inventaire.date,
        inventaire.heure,
        inventaire.duree,
        inventaire.lieudit_id,
        inventaire.altitude,
        inventaire.longitude,
        inventaire.latitude,
        inventaire.temperature,
        inventaire.date_creation,
        inventaire.owner_id
    `;

    const rawInventaire = await (transaction ?? slonik).one(query);

    return reshapeRawInventaire(rawInventaire);
  };

  const updateInventaire = async (
    inventoryId: number,
    inventaireInput: InventaireCreateInput,
    transaction?: DatabaseTransactionConnection,
  ): Promise<Inventaire> => {
    const query = sql.type(inventaireSchema)`
      UPDATE
        basenaturaliste.inventaire
      SET
        ${objectToKeyValueSet(inventaireInput)}
      WHERE
        id = ${inventoryId}
      RETURNING
        inventaire.id::text,
        inventaire.observateur_id,
        inventaire.date,
        inventaire.heure,
        inventaire.duree,
        inventaire.lieudit_id,
        inventaire.altitude,
        inventaire.longitude,
        inventaire.latitude,
        inventaire.temperature,
        inventaire.date_creation,
        inventaire.owner_id
    `;

    const rawInventaire = await (transaction ?? slonik).one(query);

    return reshapeRawInventaire(rawInventaire);
  };

  return {
    findInventoryIndex,
    findInventaires,
    findExistingInventaire,
    createInventaire,
    updateInventaire,
  };
};

export type InventaireRepository = ReturnType<typeof buildInventaireRepository>;
