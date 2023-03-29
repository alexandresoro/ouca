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
  classeSchema,
  type Classe,
  type ClasseCreateInput,
  type ClasseFindManyInput,
} from "./classe-repository-types.js";

export type ClasseRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildClasseRepository = ({ slonik }: ClasseRepositoryDependencies) => {
  const findClasseById = async (id: number): Promise<Classe | null> => {
    const query = sql.type(classeSchema)`
      SELECT 
        *
      FROM
        basenaturaliste.classe
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findClasseByEspeceId = async (especeId: number | undefined): Promise<Classe | null> => {
    if (!especeId) {
      return null;
    }

    const query = sql.type(classeSchema)`
      SELECT 
        classe.*
      FROM
        basenaturaliste.classe
      LEFT JOIN basenaturaliste.espece ON classe.id = espece.classe_id
      WHERE
        espece.id = ${especeId}
    `;

    return slonik.maybeOne(query);
  };

  const findClasses = async ({
    orderBy,
    sortOrder,
    q,
    offset,
    limit,
  }: ClasseFindManyInput = {}): Promise<readonly Classe[]> => {
    const isSortByNbEspeces = orderBy === "nbEspeces";
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(classeSchema)`
    SELECT 
      classe.*
    FROM
      basenaturaliste.classe
    ${
      isSortByNbEspeces || isSortByNbDonnees
        ? sql.fragment`
        LEFT JOIN basenaturaliste.espece ON classe.id = espece.classe_id`
        : sql.fragment``
    }
    ${
      isSortByNbDonnees
        ? sql.fragment`
        LEFT JOIN basenaturaliste.donnee ON espece.id = donnee.espece_id`
        : sql.fragment``
    }
    ${
      libelleLike
        ? sql.fragment`
    WHERE libelle ILIKE ${libelleLike}
    `
        : sql.fragment``
    }
    ${isSortByNbEspeces || isSortByNbDonnees ? sql.fragment`GROUP BY classe."id"` : sql.fragment``}
    ${isSortByNbEspeces ? sql.fragment`ORDER BY COUNT(espece."id")` : sql.fragment``}
    ${isSortByNbDonnees ? sql.fragment`ORDER BY COUNT(donnee."id")` : sql.fragment``}
    ${
      !isSortByNbDonnees && !isSortByNbEspeces && orderBy
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
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.classe
      ${
        libelleLike
          ? sql.fragment`
              WHERE
                libelle ILIKE ${libelleLike}
          `
          : sql.fragment``
      }
    `;

    return slonik.oneFirst(query);
  };

  const createClasse = async (classeInput: ClasseCreateInput): Promise<Classe> => {
    const query = sql.type(classeSchema)`
      INSERT INTO
        basenaturaliste.classe
        ${objectToKeyValueInsert(classeInput)}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const createClasses = async (classeInputs: ClasseCreateInput[]): Promise<readonly Classe[]> => {
    const query = sql.type(classeSchema)`
      INSERT INTO
        basenaturaliste.classe
        ${objectsToKeyValueInsert(classeInputs)}
      RETURNING
        *
    `;

    return slonik.many(query);
  };

  const updateClasse = async (classeId: number, classeInput: ClasseCreateInput): Promise<Classe> => {
    const query = sql.type(classeSchema)`
      UPDATE
        basenaturaliste.classe
      SET
        ${objectToKeyValueSet(classeInput)}
      WHERE
        id = ${classeId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const deleteClasseById = async (classeId: number): Promise<Classe> => {
    const query = sql.type(classeSchema)`
      DELETE
      FROM
        basenaturaliste.classe
      WHERE
        id = ${classeId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  return {
    findClasseById,
    findClasseByEspeceId,
    findClasses,
    getCount,
    createClasse,
    createClasses,
    updateClasse,
    deleteClasseById,
  };
};

export type ClasseRepository = ReturnType<typeof buildClasseRepository>;
