import * as _ from "lodash";
import { getQueryToFindAllComportements } from "../sql/sql-queries-comportement";
import { getQueryToFindDonneesByCriterion } from "../sql/sql-queries-donnee";
import { getQueryToFindAllMeteos } from "../sql/sql-queries-meteo";
import { getQueryToFindAllMilieux } from "../sql/sql-queries-milieu";
import { getQueryToFindAllAssocies } from "../sql/sql-queries-observateur";
import { SqlConnection } from "./sql-connection";
import { FlatDonnee } from "basenaturaliste-model/flat-donnee.object";
import { AssocieByDonnee } from "../objects/associe-by-donnee.object";
import { MilieuByDonnee } from "../objects/milieu-by-donnee.object";
import { ComportementByDonnee } from "../objects/comportement-by-donnee.object";
import { MeteoByDonnee } from "../objects/meteo-by-donnee.object";
import { DonneesFilter } from "basenaturaliste-model/donnees-filter.object";

export const findDonneesByCustomizedFilters = async (
  filter: DonneesFilter
): Promise<FlatDonnee[]> => {
  const results = await SqlConnection.query(
    getQueryToFindDonneesByCriterion(filter) +
      getQueryToFindAllAssocies() +
      getQueryToFindAllMeteos() +
      getQueryToFindAllComportements() +
      getQueryToFindAllMilieux()
  );

  const donnees: FlatDonnee[] = results[0];
  const associesByDonnee: AssocieByDonnee[] = results[1];
  const meteosByDonnee: MeteoByDonnee[] = results[2];
  const comportementsByDonnee: ComportementByDonnee[] = results[3];
  const milieuxByDonnee: MilieuByDonnee[] = results[4];

  const mapDonnees: { [key: number]: FlatDonnee } = {};
  _.forEach(donnees, (donnee: FlatDonnee) => {
    donnee.associes = "";
    donnee.meteos = "";
    donnee.comportements = [];
    donnee.milieux = [];
    mapDonnees[donnee.id] = donnee;
  });

  _.forEach(associesByDonnee, (associe: AssocieByDonnee) => {
    if (mapDonnees[associe.donneeId]) {
      if (mapDonnees[associe.donneeId].associes === "") {
        mapDonnees[associe.donneeId].associes = associe.libelle;
      } else {
        mapDonnees[associe.donneeId].associes += ", " + associe.libelle;
      }
    }
  });

  _.forEach(meteosByDonnee, (meteo: MeteoByDonnee) => {
    if (mapDonnees[meteo.donneeId]) {
      if (mapDonnees[meteo.donneeId].meteos === "") {
        mapDonnees[meteo.donneeId].meteos = meteo.libelle;
      } else {
        mapDonnees[meteo.donneeId].meteos += ", " + meteo.libelle;
      }
    }
  });

  _.forEach(comportementsByDonnee, (comportement: ComportementByDonnee) => {
    if (mapDonnees[comportement.donneeId]) {
      mapDonnees[comportement.donneeId].comportements.push({
        code: comportement.code,
        libelle: comportement.libelle
      });
    }
  });

  _.forEach(milieuxByDonnee, (milieu: MilieuByDonnee) => {
    if (mapDonnees[milieu.donneeId]) {
      mapDonnees[milieu.donneeId].milieux.push({
        code: milieu.code,
        libelle: milieu.libelle
      });
    }
  });

  return donnees;
};
