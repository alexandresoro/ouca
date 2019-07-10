import { Lieudit } from "basenaturaliste-model/lieudit.object";
import { SqlConnection } from "../sql-api/sql-connection";
import { getQueryToFindLieuditByCommuneIdAndNom } from "../sql/sql-queries-lieudit";
import { mapLieudit } from "../utils/mapping-utils";

export const getLieuditByCommuneIdAndNom = async (
  communeId: number,
  nom: string
): Promise<Lieudit> => {
  const results = await SqlConnection.query(
    getQueryToFindLieuditByCommuneIdAndNom(communeId, nom)
  );

  let lieudit: Lieudit = null;

  if (results && results[0] && results[0].id) {
    lieudit = mapLieudit(results[0]);
  }

  return lieudit;
};
