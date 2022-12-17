import { sql, type DatabasePool } from "slonik";
import { countSchema } from "../common";
import { objectsToKeyValueInsert, objectToKeyValueInsert, objectToKeyValueSet } from "../repository-helpers";
import {
  especeSchema,
  especeWithClasseLibelleSchema,
  type Espece,
  type EspeceCreateInput,
  type EspeceWithClasseLibelle,
} from "./espece-repository-types";

export type EspeceRepositoryDependencies = {
  slonik: DatabasePool;
};

export const buildEspeceRepository = ({ slonik }: EspeceRepositoryDependencies) => {
  const findEspeceById = async (id: number): Promise<Espece | null> => {
    const query = sql.type(especeSchema)`
      SELECT 
        *
      FROM
        basenaturaliste.espece
      WHERE
        id = ${id}
    `;

    return slonik.maybeOne(query);
  };

  const findEspeceByDonneeId = async (donneeId: number | undefined): Promise<Espece | null> => {
    if (!donneeId) {
      return null;
    }

    const query = sql.type(especeSchema)`
      SELECT 
        espece.*
      FROM
        basenaturaliste.espece
      LEFT JOIN basenaturaliste.donnee ON espece.id = donnee.espece_id
      WHERE
      donnee.id = ${donneeId}
    `;

    return slonik.maybeOne(query);
  };

  const findAllEspecesWithClasseLibelle = async (): Promise<readonly EspeceWithClasseLibelle[]> => {
    const query = sql.type(especeWithClasseLibelleSchema)`
    SELECT 
      espece.*,
      classe.libelle as classe_libelle
    FROM
      basenaturaliste.espece
    LEFT JOIN basenaturaliste.classe ON espece.classe_id = classe.id
  `;

    return slonik.any(query);
  };

  const createEspece = async (especeInput: EspeceCreateInput): Promise<Espece> => {
    const query = sql.type(especeSchema)`
      INSERT INTO
        basenaturaliste.espece
        ${objectToKeyValueInsert(especeInput)}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const createEspeces = async (especeInputs: EspeceCreateInput[]): Promise<readonly Espece[]> => {
    const query = sql.type(especeSchema)`
      INSERT INTO
        basenaturaliste.espece
        ${objectsToKeyValueInsert(especeInputs)}
      RETURNING
        *
    `;

    return slonik.many(query);
  };

  const updateEspece = async (especeId: number, especeInput: EspeceCreateInput): Promise<Espece> => {
    const query = sql.type(especeSchema)`
      UPDATE
        basenaturaliste.espece
      SET
        ${objectToKeyValueSet(especeInput)}
      WHERE
        id = ${especeId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const deleteEspeceById = async (especeId: number): Promise<Espece> => {
    const query = sql.type(especeSchema)`
      DELETE
      FROM
        basenaturaliste.espece
      WHERE
        id = ${especeId}
      RETURNING
        *
    `;

    return slonik.one(query);
  };

  const getCountByClasseId = async (classeId: number): Promise<number> => {
    const query = sql.type(countSchema)`
      SELECT 
        COUNT(*)
      FROM
        basenaturaliste.espece
      WHERE
        espece.classe_id = ${classeId}
    `;

    return slonik.oneFirst(query);
  };

  return {
    findEspeceById,
    findEspeceByDonneeId,
    findAllEspecesWithClasseLibelle,
    createEspece,
    createEspeces,
    updateEspece,
    deleteEspeceById,
    getCountByClasseId,
  };
};

export type EspeceRepository = ReturnType<typeof buildEspeceRepository>;
