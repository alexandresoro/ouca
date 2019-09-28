import { PostResponse } from "basenaturaliste-model/post-response.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";

export const buildPostResponseFromSqlResponse = (
  sqlResponse: SqlSaveResponse
): PostResponse => {
  if (
    (!sqlResponse.insertId || sqlResponse.insertId < 1) &&
    (!sqlResponse.affectedRows || sqlResponse.affectedRows < 1)
  ) {
    return {
      isSuccess: false,
      message: "Erreur lors de l'appel à la base de données"
    };
  }

  return {
    isSuccess: true,
    message: "",
    insertId:
      sqlResponse.insertId && sqlResponse.insertId > 0
        ? sqlResponse.insertId
        : null
  };
};

export const buildErrorPostResponse = (message: string): PostResponse => {
  return {
    isSuccess: false,
    message: message
  };
};
