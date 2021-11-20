import { HttpParameters } from "../http/httpParameters";
import { Donnee } from "../model/types/donnee.object";
import { Inventaire } from "../model/types/inventaire.object";
import { PostResponse } from "../model/types/post-response.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import { findExistingDonnee, persistDonnee, updateInventaireIdForDonnees } from "../services/entities/donnee-service";
import { deleteInventaireById, findExistingInventaireId, persistInventaire } from "../services/entities/inventaire-service";
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
  httpParameters: HttpParameters<Required<Donnee>>
): Promise<PostResponse> => {
  const donneeToSave = httpParameters.body;

  // Check if the donnee already exists or not
  const existingDonnee = await findExistingDonnee(donneeToSave);

  if (existingDonnee) {
    // The donnee already exists so we return an error
    return buildErrorPostResponse(
      `Cette donnée existe déjà (ID = ${existingDonnee.id}).`
    );
  } else {
    const saveDonneeResponse: SqlSaveResponse = await persistDonnee(
      donneeToSave
    );

    return buildPostResponseFromSqlResponse(saveDonneeResponse);
  }
};
