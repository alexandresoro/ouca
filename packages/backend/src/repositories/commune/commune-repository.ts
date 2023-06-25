import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common.js";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectToKeyValueInsert,
  objectToKeyValueSet,
  objectsToKeyValueInsert,
} from "../repository-helpers.js";
import {
  communeSchema,
  communeWithDepartementCodeSchema,
  type Commune,
  type CommuneCreateInput,
  type CommuneFindManyInput,
  type CommuneWithDepartementCode,
} from "./commune-repository-types.js";

export type CommuneRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildCommuneRepository = ({ slonik }: CommuneRepositoryDependencies) => {
  const findCommuneById = async (id: number): Promise<Commune | null> => {
    const query = sql.type(communeSchema)`
      SELECT 
        commune.id::text,
        commune.code,
        commune.nom,
        commune.departement_id::text AS department_id,
        commune.owner_id
      FROM
        basenaturaliste.commune
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findCommuneByLieuDitId = async (lieuditId: number | undefined): Promise<Commune | null> => {
    if (!lieuditId) {
      return null;
    }

    const query = sql.type(communeSchema)`
      SELECT 
        commune.id::text,
        commune.code,
        commune.nom,
        commune.departement_id::text AS department_id,
        commune.owner_id
      FROM
        basenaturaliste.commune
      LEFT JOIN basenaturaliste.lieudit ON commune.id = lieudit.commune_id
      WHERE
        lieudit.id = ${lieuditId}
    `;

    return slonik.maybeOne(query);
  };

  // TODO add search by commune code

  const findCommunes = async ({
    orderBy,
    sortOrder,
    q,
    departmentId,
    offset,
    limit,
  }: CommuneFindManyInput = {}): Promise<readonly Commune[]> => {
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const isSortByNbLieuxDits = orderBy === "nbLieuxDits";
    const isSortByDepartement = orderBy === "departement";
    const nomOrDepartementLike = q ? `%${q}%` : null;
    const nomOrDepartementStarts = q ? `${q}%` : null;
    // If no explicit order is requested and a query is provided, return the matches in the following order:
    // The ones for which code matches with query
    // The ones for which code starts with query
    // The ones for which nom starts with query
    // Then the ones which nom contains the query
    // Then two groups are finally sorted alphabetically
    const matchStartNom = q ? `^${q}` : null;
    const query = sql.type(communeSchema)`
    SELECT 
      commune.id::text,
      commune.code,
      commune.nom,
      commune.departement_id::text AS department_id,
      commune.owner_id
    FROM
      basenaturaliste.commune
    LEFT JOIN
      basenaturaliste.departement ON commune.departement_id = departement.id
    ${
      isSortByNbDonnees || isSortByNbLieuxDits
        ? sql.fragment`
        LEFT JOIN basenaturaliste.lieudit ON commune.id = lieudit.commune_id`
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
      nomOrDepartementLike || departmentId != null
        ? sql.fragment`
      WHERE
    `
        : sql.fragment``
    }
    ${
      nomOrDepartementLike
        ? sql.fragment`
    (commune.nom ILIKE ${nomOrDepartementLike}
    OR CAST(commune.code as VARCHAR) ILIKE ${nomOrDepartementStarts})
    `
        : sql.fragment``
    }
    ${nomOrDepartementLike && departmentId != null ? sql.fragment` AND ` : sql.fragment``}
    ${
      departmentId != null
        ? sql.fragment`
              commune.departement_id = ${departmentId}
        `
        : sql.fragment``
    }
    ${isSortByNbDonnees || isSortByNbLieuxDits ? sql.fragment`GROUP BY commune."id"` : sql.fragment``}
    ${isSortByNbDonnees ? sql.fragment`ORDER BY COUNT(donnee."id")` : sql.fragment``}
    ${isSortByNbLieuxDits ? sql.fragment`ORDER BY COUNT(lieudit."id")` : sql.fragment``}
    ${isSortByDepartement ? sql.fragment`ORDER BY departement."code"` : sql.fragment``}
    ${
      !isSortByNbDonnees && !isSortByNbLieuxDits && !isSortByDepartement && orderBy
        ? sql.fragment`ORDER BY ${sql.identifier([orderBy])}`
        : q
        ? sql.fragment`ORDER BY CAST(commune.code as VARCHAR) = ${q} DESC, CAST(commune.code as VARCHAR) ILIKE ${nomOrDepartementStarts} DESC, (commune.nom ~* ${matchStartNom}) DESC, commune.nom ASC` // If no order provided, return in priority the towns that match by code if q provided
        : sql.fragment``
    }${buildSortOrderFragment({
      orderBy,
      sortOrder,
    })}
    ${buildPaginationFragment({ offset, limit })}
  `;

    return slonik.any(query);
  };

  const getCount = async (q?: string | null, departmentId?: number | null): Promise<number> => {
    const codeLike = q ? `%${q}%` : null;
    const codeStarts = q ? `${q}%` : null;
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.commune
      LEFT JOIN
        basenaturaliste.departement ON commune.departement_id = departement.id
      ${
        codeLike || departmentId != null
          ? sql.fragment`
        WHERE
      `
          : sql.fragment``
      }
      ${
        codeLike
          ? sql.fragment`
                (commune.nom ILIKE ${codeLike}
                OR CAST(commune.code as VARCHAR) ILIKE ${codeStarts})
          `
          : sql.fragment``
      }
      ${codeLike && departmentId != null ? sql.fragment` AND ` : sql.fragment``}
      ${
        departmentId != null
          ? sql.fragment`
                commune.departement_id = ${departmentId}
          `
          : sql.fragment``
      }
    `;

    return slonik.oneFirst(query);
  };

  const getCountByDepartementId = async (departementId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.commune
      WHERE
        commune.departement_id = ${departementId}
    `;

    return slonik.oneFirst(query);
  };

  const findAllCommunesWithDepartementCode = async (): Promise<readonly CommuneWithDepartementCode[]> => {
    const query = sql.type(communeWithDepartementCodeSchema)`
    SELECT 
      commune.id::text,
      commune.code,
      commune.nom,
      commune.departement_id::text AS department_id,
      commune.owner_id,
      departement.code as departement_code
    FROM
      basenaturaliste.commune
    LEFT JOIN basenaturaliste.departement ON commune.departement_id = departement.id
  `;

    return slonik.any(query);
  };

  const createCommune = async (communeInput: CommuneCreateInput): Promise<Commune> => {
    const query = sql.type(communeSchema)`
      INSERT INTO
        basenaturaliste.commune
        ${objectToKeyValueInsert(communeInput)}
      RETURNING
        commune.id::text,
        commune.code,
        commune.nom,
        commune.departement_id::text AS department_id,
        commune.owner_id
    `;

    return slonik.one(query);
  };

  const createCommunes = async (communeInputs: CommuneCreateInput[]): Promise<readonly Commune[]> => {
    const query = sql.type(communeSchema)`
      INSERT INTO
        basenaturaliste.commune
        ${objectsToKeyValueInsert(communeInputs)}
      RETURNING
        commune.id::text,
        commune.code,
        commune.nom,
        commune.departement_id::text AS department_id,
        commune.owner_id
    `;

    return slonik.many(query);
  };

  const updateCommune = async (communeId: number, communeInput: CommuneCreateInput): Promise<Commune> => {
    const query = sql.type(communeSchema)`
      UPDATE
        basenaturaliste.commune
      SET
        ${objectToKeyValueSet(communeInput)}
      WHERE
        id = ${communeId}
      RETURNING
        commune.id::text,
        commune.code,
        commune.nom,
        commune.departement_id::text AS department_id,
        commune.owner_id
    `;

    return slonik.one(query);
  };

  const deleteCommuneById = async (communeId: number): Promise<Commune> => {
    const query = sql.type(communeSchema)`
      DELETE
      FROM
        basenaturaliste.commune
      WHERE
        id = ${communeId}
      RETURNING
        commune.id::text,
        commune.code,
        commune.nom,
        commune.departement_id::text AS department_id,
        commune.owner_id
    `;

    return slonik.one(query);
  };

  return {
    findCommuneById,
    findCommuneByLieuDitId,
    findCommunes,
    getCount,
    getCountByDepartementId,
    findAllCommunesWithDepartementCode,
    createCommune,
    createCommunes,
    updateCommune,
    deleteCommuneById,
  };
};

export type CommuneRepository = ReturnType<typeof buildCommuneRepository>;
