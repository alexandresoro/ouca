import { HttpParameters } from "../http/httpParameters";
import { DonneeWithNavigationData } from "../model/types/donnee-with-navigation-data.object";
import { Donnee } from "../model/types/donnee.object";
import { Inventaire } from "../model/types/inventaire.object";
import { PostResponse } from "../model/types/post-response.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { deleteDonneeById, findDonneeByIdWithContext, findExistingDonneeId, findLastDonneeId, findNextRegroupement, persistDonnee, updateInventaireIdForDonnees } from "../sql-api/sql-api-donnee";
import { deleteInventaireById, findExistingInventaireId, findInventaireById, findInventaireIdById, persistInventaire } from "../sql-api/sql-api-inventaire";
import { buildErrorPostResponse, buildPostResponseFromSqlResponse } from "../utils/post-response-utils";

export const saveInventaire = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const inventaireToSave: Inventaire = httpParameters.postData;

  let sqlResponse: SqlSaveResponse;

  const existingId: number = await findExistingInventaireId(inventaireToSave);

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
  const existingDonneeId: number = await findExistingDonneeId(donneeToSave);

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

export const getDonneeByIdWithContext = async (
  httpParameters: HttpParameters
): Promise<DonneeWithNavigationData> => {
  const id: number = +httpParameters.queryParameters.id;
  return await findDonneeByIdWithContext(id);
};

export const getNextRegroupement = async (): Promise<number> => {
  return await findNextRegroupement();
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
