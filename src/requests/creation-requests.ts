import { HttpParameters } from "../http/httpParameters";
import { DonneeWithNavigationData } from "../model/types/donnee-with-navigation-data.object";
import { Donnee } from "../model/types/donnee.object";
import { Inventaire } from "../model/types/inventaire.object";
import { PostResponse } from "../model/types/post-response.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { deleteDonneeById, findDonneeByIdWithContext, findExistingDonneeId, findLastDonneeId, findNextRegroupement, persistDonnee, updateInventaireIdForDonnees } from "../services/entities/donnee-service";
import { deleteInventaireById, findExistingInventaireId, findInventaireById, findInventaireIdById, persistInventaire } from "../services/entities/inventaire-service";
import { buildErrorPostResponse, buildPostResponseFromSqlResponse } from "../utils/post-response-utils";

export const saveInventaireRequest = async (
  httpParameters: HttpParameters<Inventaire>
): Promise<PostResponse> => {
  const inventaireToSave = httpParameters.body;

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
    inventaireToSave.id = null;
    sqlResponse = await persistInventaire(inventaireToSave);
  }

  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const saveDonneeRequest = async (
  httpParameters: HttpParameters<Donnee>
): Promise<PostResponse> => {
  const donneeToSave = httpParameters.body;

  // Check if the donnee already exists or not
  const existingDonneeId: number = await findExistingDonneeId(donneeToSave);

  if (existingDonneeId) {
    // The donnee already exists so we return an error
    return buildErrorPostResponse(
      `Cette donnée existe déjà (ID = ${existingDonneeId}).`
    );
  } else {
    const saveDonneeResponse: SqlSaveResponse = await persistDonnee(
      donneeToSave
    );

    return buildPostResponseFromSqlResponse(saveDonneeResponse);
  }
};

export const deleteDonneeRequest = async (
  httpParameters: HttpParameters
): Promise<PostResponse> => {
  const donneeId: number = +httpParameters.query.donneeId;
  const inventaireId: number = +httpParameters.query.inventaireId;

  const sqlResponse: SqlSaveResponse = await deleteDonneeById(
    donneeId,
    inventaireId
  );

  return buildPostResponseFromSqlResponse(sqlResponse);
};

export const getDonneeByIdWithContextRequest = async (
  httpParameters: HttpParameters
): Promise<DonneeWithNavigationData> => {
  const id: number = +httpParameters.query.id;
  return await findDonneeByIdWithContext(id);
};

export const getNextRegroupementRequest = async (): Promise<number> => {
  return await findNextRegroupement();
};

export const getInventaireByIdRequest = async (
  httpParameters: HttpParameters
): Promise<Inventaire> => {
  const inventaireId: number = +httpParameters.query.id;
  return findInventaireById(inventaireId);
};

export const getInventaireIdByIdRequest = async (
  httpParameters: HttpParameters
): Promise<number> => {
  return findInventaireIdById(+httpParameters.query.id);
};

export const getLastDonneeIdRequest = async (): Promise<number> => {
  return findLastDonneeId();
};
