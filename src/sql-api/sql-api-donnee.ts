import * as _ from "lodash";
import { getQueryToFindAllComportements } from "../sql/sql-queries-comportement";
import { getQueryToFindDonneesByCriterion } from "../sql/sql-queries-donnee";
import { getQueryToFindAllMeteos } from "../sql/sql-queries-meteo";
import { getQueryToFindAllMilieux } from "../sql/sql-queries-milieu";
import { getQueryToFindAllAssocies } from "../sql/sql-queries-observateur";
import { SqlConnection } from "./sql-connection";

export const findDonneesByCustomizedFilters = async (
  filters: any
): Promise<any[]> => {
  const results = await SqlConnection.query(
    getQueryToFindDonneesByCriterion(filters) +
      getQueryToFindAllAssocies() +
      getQueryToFindAllMeteos() +
      getQueryToFindAllComportements() +
      getQueryToFindAllMilieux()
  );

  const donnees: any[] = results[0];
  const associesByDonnee: any[] = results[1];
  const meteosByDonnee: any[] = results[2];
  const comportementsByDonnee: any[] = results[3];
  const milieuxByDonnee: any[] = results[4];

  const mapDonnees: { [key: number]: any } = {};
  _.forEach(donnees, (donnee: any) => {
    donnee.associes = "";
    donnee.meteos = "";
    donnee.comportements = [];
    donnee.milieux = [];
    mapDonnees[donnee.id] = donnee;
  });

  _.forEach(associesByDonnee, (associe: any) => {
    if (mapDonnees[associe.donneeId]) {
      if (mapDonnees[associe.donneeId].associes === "") {
        mapDonnees[associe.donneeId].associes = associe.libelle;
      } else {
        mapDonnees[associe.donneeId].associes += ", " + associe.libelle;
      }
    }
  });

  _.forEach(meteosByDonnee, (meteo: any) => {
    if (mapDonnees[meteo.donneeId]) {
      if (mapDonnees[meteo.donneeId].meteos === "") {
        mapDonnees[meteo.donneeId].meteos = meteo.libelle;
      } else {
        mapDonnees[meteo.donneeId].meteos += ", " + meteo.libelle;
      }
    }
  });

  _.forEach(comportementsByDonnee, (comportement: any) => {
    if (mapDonnees[comportement.donneeId]) {
      mapDonnees[comportement.donneeId].comportements.push({
        code: comportement.code,
        libelle: comportement.libelle
      });
    }
  });

  _.forEach(milieuxByDonnee, (milieu: any) => {
    if (mapDonnees[milieu.donneeId]) {
      mapDonnees[milieu.donneeId].milieux.push({
        code: milieu.code,
        libelle: milieu.libelle
      });
    }
  });

  return donnees;
};
