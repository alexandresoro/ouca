import {
  speciesClassSchema,
  type SpeciesClass,
  type SpeciesClassFindManyInput,
} from "@domain/species-class/species-class.js";
import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common.js";
import {
  buildPaginationFragment,
  buildSortOrderFragment,
  objectToKeyValueInsert,
  objectToKeyValueSet,
  objectsToKeyValueInsert,
} from "../repository-helpers.js";
import { type ClasseCreateInput } from "./classe-repository-types.js";

export type ClasseRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildClasseRepository = ({ slonik }: ClasseRepositoryDependencies) => {
  const findClasseById = async (id: number): Promise<SpeciesClass | null> => {
    const query = sql.type(speciesClassSchema)`
      SELECT 
        classe.id::text,
        classe.libelle,
        classe.owner_id
      FROM
        basenaturaliste.classe
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findClasseByEspeceId = async (especeId: number | undefined): Promise<SpeciesClass | null> => {
    if (!especeId) {
      return null;
    }

    const query = sql.type(speciesClassSchema)`
      SELECT 
        classe.id::text,
        classe.libelle,
        classe.owner_id
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
  }: SpeciesClassFindManyInput = {}): Promise<readonly SpeciesClass[]> => {
    const isSortByNbEspeces = orderBy === "nbEspeces";
    const isSortByNbDonnees = orderBy === "nbDonnees";
    const libelleLike = q ? `%${q}%` : null;
    const query = sql.type(speciesClassSchema)`
    SELECT 
      classe.id::text,
      classe.libelle,
      classe.owner_id
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
    WHERE unaccent(libelle) ILIKE unaccent(${libelleLike})
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
    ${isSortByNbDonnees ? sql.fragment`, classe.libelle ASC` : sql.fragment``}
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
                unaccent(libelle) ILIKE unaccent(${libelleLike})
          `
          : sql.fragment``
      }
    `;

    return slonik.oneFirst(query);
  };

  const createClasse = async (classeInput: ClasseCreateInput): Promise<SpeciesClass> => {
    const query = sql.type(speciesClassSchema)`
      INSERT INTO
        basenaturaliste.classe
        ${objectToKeyValueInsert(classeInput)}
      RETURNING
        classe.id::text,
        classe.libelle,
        classe.owner_id
    `;

    return slonik.one(query);
  };

  const createClasses = async (classeInputs: ClasseCreateInput[]): Promise<readonly SpeciesClass[]> => {
    const query = sql.type(speciesClassSchema)`
      INSERT INTO
        basenaturaliste.classe
        ${objectsToKeyValueInsert(classeInputs)}
      RETURNING
        classe.id::text,
        classe.libelle,
        classe.owner_id
    `;

    return slonik.many(query);
  };

  const updateClasse = async (classeId: number, classeInput: ClasseCreateInput): Promise<SpeciesClass> => {
    const query = sql.type(speciesClassSchema)`
      UPDATE
        basenaturaliste.classe
      SET
        ${objectToKeyValueSet(classeInput)}
      WHERE
        id = ${classeId}
      RETURNING
        classe.id::text,
        classe.libelle,
        classe.owner_id
    `;

    return slonik.one(query);
  };

  const deleteClasseById = async (classeId: number): Promise<SpeciesClass | null> => {
    const query = sql.type(speciesClassSchema)`
      DELETE
      FROM
        basenaturaliste.classe
      WHERE
        id = ${classeId}
      RETURNING
        classe.id::text,
        classe.libelle,
        classe.owner_id
    `;

    return slonik.maybeOne(query);
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
