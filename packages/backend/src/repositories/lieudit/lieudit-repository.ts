import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common.js";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectsToKeyValueInsert,
  objectToKeyValueInsert,
  objectToKeyValueSet,
} from "../repository-helpers.js";
import {
  lieuditSchema,
  lieuditWithCommuneAndDepartementCodeSchema,
  type Lieudit,
  type LieuditCreateInput,
  type LieuditFindManyInput,
  type LieuditWithCommuneAndDepartementCode,
} from "./lieudit-repository-types.js";

export type LieuditRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildLieuditRepository = ({ slonik }: LieuditRepositoryDependencies) => {
  const findLieuditById = async (id: number): Promise<Lieudit | null> => {
    const query = sql.type(lieuditSchema)`
      SELECT 
        *
      FROM
        basenaturaliste.lieudit
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findLieuditByInventaireId = async (inventaireId: number | undefined): Promise<Lieudit | null> => {
    if (!inventaireId) {
      return null;
    }

    const query = sql.type(lieuditSchema)`
      SELECT 
        lieudit.*
      FROM
        basenaturaliste.lieudit
      LEFT JOIN basenaturaliste.inventaire ON lieudit.id = inventaire.lieudit_id
      WHERE
        inventaire.id = ${inventaireId}
    `;

    return slonik.maybeOne(query);
  };

  const findLieuxdits = async ({ orderBy, sortOrder, q, offset, limit }: LieuditFindManyInput = {}): Promise<
    readonly Lieudit[]
  > => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const isSortByCodeCommune = orderBy === "codeCommune";
    const isSortByNomCommune = orderBy === "nomCommune";
    const isSortByDepartement = orderBy === "departement";
    const qLike = q ? `%${q}%` : null;
    const query = sql.type(lieuditSchema)`
    SELECT 
      lieudit.*
    FROM
      basenaturaliste.lieudit
    ${
      isSortByCodeCommune || isSortByNomCommune || isSortByDepartement || qLike
        ? sql.fragment`
      LEFT JOIN
        basenaturaliste.commune ON lieudit.commune_id = commune.id`
        : sql.fragment``
    }
    ${
      isSortByDepartement || qLike
        ? sql.fragment`
      LEFT JOIN
        basenaturaliste.departement ON commune.departement_id = departement.id`
        : sql.fragment``
    }
    ${
      isSortByNbDonnees
        ? sql.fragment`
        LEFT JOIN basenaturaliste.inventaire ON lieudit.id = inventaire.lieudit_id
        LEFT JOIN basenaturaliste.donnee ON inventaire.id = donnee.inventaire_id`
        : sql.fragment``
    }
    ${
      qLike
        ? sql.fragment`
        WHERE
          lieudit.nom ILIKE ${qLike}
          OR commune.nom ILIKE ${qLike}
          OR departement.code ILIKE ${qLike}
    `
        : sql.fragment``
    }
    ${isSortByNbDonnees ? sql.fragment`GROUP BY lieudit."id"` : sql.fragment``}
    ${isSortByNbDonnees ? sql.fragment`ORDER BY COUNT(donnee."id")` : sql.fragment``}
    ${isSortByCodeCommune ? sql.fragment`ORDER BY commune."code"` : sql.fragment``}
    ${isSortByNomCommune ? sql.fragment`ORDER BY commune."nom"` : sql.fragment``}
    ${isSortByDepartement ? sql.fragment`ORDER BY departement."code"` : sql.fragment``}
    ${
      !isSortByNbDonnees && !isSortByCodeCommune && !isSortByNomCommune && !isSortByDepartement && orderBy
        ? sql.fragment`ORDER BY ${sql.identifier([orderBy])}`
        : sql.fragment``
    }${buildSortOrderFragment({
      orderBy,
      sortOrder,
    })}
    ${buildPaginationFragment({ offset, limit })}
  `;

    return slonik.any(query);
  };

  const getCount = async (q?: string | null): Promise<number> => {
    const qLike = q ? `%${q}%` : null;
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.lieudit
      LEFT JOIN
        basenaturaliste.commune ON lieudit.commune_id = commune.id
      LEFT JOIN
        basenaturaliste.departement ON commune.departement_id = departement.id
      ${
        qLike
          ? sql.fragment`
              WHERE
                lieudit.nom ILIKE ${qLike}
                OR commune.nom ILIKE ${qLike}
                OR departement.code ILIKE ${qLike}
          `
          : sql.fragment``
      }
    `;

    return slonik.oneFirst(query);
  };

  const getCountByCommuneId = async (communeId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.lieudit
      WHERE
        lieudit.commune_id = ${communeId}
    `;

    return slonik.oneFirst(query);
  };

  const findAllLieuxDitsWithCommuneAndDepartementCode = async (): Promise<
    readonly LieuditWithCommuneAndDepartementCode[]
  > => {
    const query = sql.type(lieuditWithCommuneAndDepartementCodeSchema)`
    SELECT 
      lieudit.*,
      commune.code as commune_code,
      commune.nom as commune_nom,
      departement.code as departement_code
    FROM
      basenaturaliste.lieudit
    LEFT JOIN basenaturaliste.commune ON lieudit.commune_id = commune.id
    LEFT JOIN basenaturaliste.departement ON commune.departement_id = departement.id
  `;

    return slonik.any(query);
  };

  const getCountByDepartementId = async (departementId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.lieudit
      LEFT JOIN
        basenaturaliste.commune ON lieudit.commune_id = commune.id
      WHERE
        commune.departement_id = ${departementId}
    `;

    return slonik.oneFirst(query);
  };

  const createLieudit = async (lieuditInput: LieuditCreateInput): Promise<Lieudit> => {
    const query = sql.type(lieuditSchema)`
      INSERT INTO
        basenaturaliste.lieudit
        ${objectToKeyValueInsert(lieuditInput)}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const createLieuxdits = async (lieuditInputs: LieuditCreateInput[]): Promise<readonly Lieudit[]> => {
    const query = sql.type(lieuditSchema)`
      INSERT INTO
        basenaturaliste.lieudit
        ${objectsToKeyValueInsert(lieuditInputs)}
      RETURNING
        *
    `;

    return slonik.many(query);
  };

  const updateLieudit = async (lieuditId: number, lieuditInput: LieuditCreateInput): Promise<Lieudit> => {
    const query = sql.type(lieuditSchema)`
      UPDATE
        basenaturaliste.lieudit
      SET
        ${objectToKeyValueSet(lieuditInput)}
      WHERE
        id = ${lieuditId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const deleteLieuditById = async (lieuditId: number): Promise<Lieudit> => {
    const query = sql.type(lieuditSchema)`
      DELETE
      FROM
        basenaturaliste.lieudit
      WHERE
        id = ${lieuditId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  return {
    findLieuditById,
    findLieuditByInventaireId,
    findLieuxdits,
    getCount,
    getCountByCommuneId,
    getCountByDepartementId,
    findAllLieuxDitsWithCommuneAndDepartementCode,
    createLieudit,
    createLieuxdits,
    updateLieudit,
    deleteLieuditById,
  };
};

export type LieuditRepository = ReturnType<typeof buildLieuditRepository>;
