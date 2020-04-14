import { DonneeWithNavigationData } from "ouca-common/donnee-with-navigation-data.object";
import { Donnee } from "ouca-common/donnee.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { PostResponse } from "ouca-common/post-response.object";
import { HttpParameters } from "../http/httpParameters";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  buildDonneeFromFlatDonneeWithMinimalData,
  deleteDonneeById,
  findLastDonneeId,
  findNextDonneeByCurrentDonneeId,
  findPreviousDonneeByCurrentDonneeId,
  getExistingDonneeId,
  persistDonnee,
  updateInventaireIdForDonnees
} from "../sql-api/sql-api-donnee";
import {
  deleteInventaireById,
  findInventaireById,
  findInventaireIdById,
  getExistingInventaireId,
  persistInventaire
} from "../sql-api/sql-api-inventaire";
import { SqlConnection } from "../sql-api/sql-connection";
import {
  getQueryToFindDonneeById,
  getQueryToFindDonneeIndexById,
  getQueryToFindLastRegroupement,
  getQueryToFindNextDonneeByCurrentDonneeId,
  getQueryToFindPreviousDonneeByCurrentDonneeId
} from "../sql/sql-queries-donnee";
import {
  buildErrorPostResponse,
  buildPostResponseFromSqlResponse
} from "../utils/post-response-utils";

export const saveInventaire = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const inventaireToSave: Inventaire = httpParameters.postData;

  let sqlResponse: SqlSaveResponse;

  const existingId: number = await getExistingInventaireId(inventaireToSave);

  if (existingId) {
    // A similar inventaire already exists
    // We use it instead of creating a duplicated inventaire

    if (inventaireToSave.id) {
      // We update the inventaire ID for the donnees and we delete the duplicated inventaire
      await updateInventaireIdForDonnees(inventaireToSave.id, existingId);
      await deleteInventaireById(inventaireToSave.id);
    }

    sqlResponse = {
      insertId: existingId,
      warningStatus: null,
      affectedRows: 0
    };
  } else {
    // Save the inventaire
    sqlResponse = await persistInventaire(inventaireToSave);
  }

  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const saveDonnee = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const donneeToSave: Donnee = httpParameters.postData;

  // Check if the donnee already exists or not
  const existingDonneeId: number = await getExistingDonneeId(donneeToSave);

  if (existingDonneeId) {
    // The donnee already exists so we return an error
    return buildErrorPostResponse(
      "Cette donnée existe déjà (ID = " + existingDonneeId + ")."
    );
  } else {
    const saveDonneeResponse: SqlSaveResponse = await persistDonnee(
      donneeToSave
    );

    return buildPostResponseFromSqlResponse(saveDonneeResponse);
  }
};

export const deleteDonnee = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const donneeId: number = +httpParameters.queryParameters.donneeId;
  const inventaireId: number = +httpParameters.queryParameters.inventaireId;

  const sqlResponse: SqlSaveResponse = await deleteDonneeById(
    donneeId,
    inventaireId
  );

  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const getNextDonnee = async (
  httpParameters: HttpParameters
): Promise<Donnee> => {
  const donneeId: number = +httpParameters.queryParameters.id;
  return findNextDonneeByCurrentDonneeId(donneeId);
};

export const getPreviousDonnee = async (
  httpParameters: HttpParameters
): Promise<Donnee> => {
  const donneeId: number = +httpParameters.queryParameters.id;
  return findPreviousDonneeByCurrentDonneeId(donneeId);
};

export const getDonneeByIdWithContext = async (
  httpParameters: HttpParameters
): Promise<DonneeWithNavigationData> => {
  const id: number = +httpParameters.queryParameters.id;
  const results = await SqlConnection.query(
    getQueryToFindDonneeById(id) +
      getQueryToFindPreviousDonneeByCurrentDonneeId(id) +
      getQueryToFindNextDonneeByCurrentDonneeId(id) +
      getQueryToFindDonneeIndexById(id)
  );

  const donnee = await buildDonneeFromFlatDonneeWithMinimalData(results[0][0]);

  return {
    ...donnee,
    previousDonneeId: results[1][0] ? results[1][0].id : null,
    nextDonneeId: results[2][0] ? results[2][0].id : null,
    indexDonnee:
      !!results[3] && !!results[3][0] ? results[3][0].nbDonnees : null
  };
};

export const getNextRegroupement = async (): Promise<number> => {
  const results = await SqlConnection.query(getQueryToFindLastRegroupement());
  return (results[0].regroupement as number) + 1;
};

export const getInventaireById = async (
  httpParameters: HttpParameters
): Promise<Inventaire> => {
  const inventaireId: number = +httpParameters.queryParameters.id;
  return findInventaireById(inventaireId);
};

export const getInventaireIdById = async (
  httpParameters: HttpParameters
): Promise<number> => {
  return findInventaireIdById(+httpParameters.queryParameters.id);
};

export const getLastDonneeId = async (): Promise<number> => {
  return findLastDonneeId();
};
