import * as _ from "lodash";
import { HttpParameters } from "../http/httpParameters";
import { SqlConnection } from "../sql-api/sql-connection";
import {
  getFindAllAssociesQuery,
  getFindAllComportementsQuery,
  getFindAllDonneesQuery,
  getFindAllMeteosQuery,
  getFindAllMilieuxQuery
} from "../sql/sql-queries-utils";

export const getDonnees = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  if (isMockDatabaseMode) {
    return null;
  } else {
    const results = await SqlConnection.query(
      getFindAllDonneesQuery() +
        getFindAllAssociesQuery() +
        getFindAllMeteosQuery() +
        getFindAllComportementsQuery() +
        getFindAllMilieuxQuery()
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
      if (mapDonnees[associe.donneeId].associes === "") {
        mapDonnees[associe.donneeId].associes = associe.libelle;
      } else {
        mapDonnees[associe.donneeId].associes += ", " + associe.libelle;
      }
    });

    _.forEach(meteosByDonnee, (meteo: any) => {
      if (mapDonnees[meteo.donneeId].meteos === "") {
        mapDonnees[meteo.donneeId].meteos = meteo.libelle;
      } else {
        mapDonnees[meteo.donneeId].meteos += ", " + meteo.libelle;
      }
    });

    _.forEach(comportementsByDonnee, (comportement: any) => {
      mapDonnees[comportement.donnee_id].comportements.push({
        code: comportement.code,
        libelle: comportement.libelle
      });
    });

    _.forEach(milieuxByDonnee, (milieu: any) => {
      mapDonnees[milieu.donnee_id].milieux.push({
        code: milieu.code,
        libelle: milieu.libelle
      });
    });

    return donnees;
  }
};
