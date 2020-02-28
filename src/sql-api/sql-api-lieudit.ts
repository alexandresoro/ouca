import { Lieudit } from "ouca-common/lieudit.object";
import { buildLieuditFromLieuditDb } from "../mapping/lieudit-mapping";
import { SqlConnection } from "../sql-api/sql-connection";
import { getQueryToFindLieuditByCommuneIdAndNom } from "../sql/sql-queries-lieudit";

export const getLieuditByCommuneIdAndNom = async (
  communeId: number,
  nom: string
): Promise<Lieudit> => {
  const results = await SqlConnection.query(
    getQueryToFindLieuditByCommuneIdAndNom(communeId, nom)
  );

  let lieudit: Lieudit = null;

  if (results && results[0] && results[0].id) {
    lieudit = buildLieuditFromLieuditDb(results[0]);
  }

  return lieudit;
};
