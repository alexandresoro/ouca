import { format } from "date-fns";
import * as _ from "lodash";
import { buildCoordinates } from "ouca-common/coordinates-system";
import { Donnee } from "ouca-common/donnee.object";
import { DonneesFilter } from "ouca-common/donnees-filter.object";
import { FlatDonnee } from "ouca-common/flat-donnee.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { FlatDonneeWithMinimalData } from "../objects/flat-donnee-with-minimal-data.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  getQueryToFindAllComportements,
  getQueryToFindComportementsIdsByDonneeId
} from "../sql/sql-queries-comportement";
import {
  getQueryToCountDonneesByInventaireId,
  getQueryToFindDonneeIdsByAllAttributes,
  getQueryToFindDonneesByCriterion,
  getQueryToFindLastDonneeId,
  getQueryToFindNextDonneeByCurrentDonneeId,
  getQueryToFindNumberOfDonneesByDoneeeEntityId,
  getQueryToFindPreviousDonneeByCurrentDonneeId,
  getQueryToUpdateDonneesInventaireId
} from "../sql/sql-queries-donnee";
import {
  getQueryToFindAllMeteos,
  getQueryToFindMetosByInventaireId
} from "../sql/sql-queries-meteo";
import {
  getQueryToFindAllMilieux,
  getQueryToFindMilieuxIdsByDonneeId
} from "../sql/sql-queries-milieu";
import {
  getQueryToFindAllAssocies,
  getQueryToFindAssociesByInventaireId
} from "../sql/sql-queries-observateur";
import {
  DB_SAVE_MAPPING,
  getDeleteEntityByAttributeQuery,
  getDeleteEntityByIdQuery,
  getSaveEntityQuery,
  getSaveListOfEntitesQueries
} from "../sql/sql-queries-utils";
import {
  DATE_WITH_TIME_PATTERN,
  DONNEE_ID,
  ID,
  INVENTAIRE_ID,
  SEPARATOR_COMMA,
  TABLE_DONNEE,
  TABLE_DONNEE_COMPORTEMENT,
  TABLE_DONNEE_MILIEU
} from "../utils/constants";
import {
  mapAssociesIds,
  mapComportementsIds,
  mapMeteosIds,
  mapMilieuxIds
} from "../utils/mapping-utils";
import {
  areArraysContainingSameValues,
  getArrayFromObjects
} from "../utils/utils";
import { deleteInventaireById } from "./sql-api-inventaire";
import { SqlConnection } from "./sql-connection";

export const buildDonneeFromFlatDonneeWithMinimalData = async (
  flatDonnee: FlatDonneeWithMinimalData
): Promise<Donnee> => {
  if (!!flatDonnee && !!flatDonnee.id && !!flatDonnee.inventaireId) {
    const listsResults = await SqlConnection.query(
      getQueryToFindAssociesByInventaireId(flatDonnee.inventaireId) +
        getQueryToFindMetosByInventaireId(flatDonnee.inventaireId) +
        getQueryToFindComportementsIdsByDonneeId(flatDonnee.id) +
        getQueryToFindMilieuxIdsByDonneeId(flatDonnee.id) +
        getQueryToFindNumberOfDonneesByDoneeeEntityId(
          INVENTAIRE_ID,
          flatDonnee.inventaireId
        )
    );

    const inventaire: Inventaire = {
      id: flatDonnee.inventaireId,
      observateurId: flatDonnee.observateurId,
      associesIds: mapAssociesIds(listsResults[0]),
      date: flatDonnee.date,
      heure: flatDonnee.heure,
      duree: flatDonnee.duree,
      lieuditId: flatDonnee.lieuditId,
      customizedAltitude: flatDonnee.altitude,
      coordinates: buildCoordinates(
        flatDonnee.coordinatesSystem,
        flatDonnee.longitude,
        flatDonnee.latitude
      ),
      temperature: flatDonnee.temperature,
      meteosIds: mapMeteosIds(listsResults[1]),
      nbDonnees: listsResults[4][0].nbDonnees
    };

    const donnee: Donnee = {
      id: flatDonnee.id,
      inventaireId: flatDonnee.inventaireId,
      inventaire,
      especeId: flatDonnee.especeId,
      sexeId: flatDonnee.sexeId,
      ageId: flatDonnee.ageId,
      estimationNombreId: flatDonnee.estimationNombreId,
      nombre: flatDonnee.nombre,
      estimationDistanceId: flatDonnee.estimationDistanceId,
      distance: flatDonnee.distance,
      regroupement: flatDonnee.regroupement,
      comportementsIds: mapComportementsIds(listsResults[2]),
      milieuxIds: mapMilieuxIds(listsResults[3]),
      commentaire: flatDonnee.commentaire
    };
    return donnee;
  } else {
    return null;
  }
};

export const persistDonnee = async (
  donneeToSave: Donnee
): Promise<SqlSaveResponse> => {
  if (donneeToSave.id) {
    // It is an update: we delete the current comportements
    // and milieux to insert later the updated ones
    await SqlConnection.query(
      getDeleteEntityByAttributeQuery(
        TABLE_DONNEE_COMPORTEMENT,
        DONNEE_ID,
        donneeToSave.id
      ) +
        getDeleteEntityByAttributeQuery(
          TABLE_DONNEE_MILIEU,
          DONNEE_ID,
          donneeToSave.id
        )
    );
  }

  const saveDonneeResponse: SqlSaveResponse = await SqlConnection.query(
    getSaveEntityQuery(
      TABLE_DONNEE,
      {
        ...donneeToSave,
        dateCreation: format(new Date(), DATE_WITH_TIME_PATTERN)
      },
      DB_SAVE_MAPPING.donnee
    )
  );

  // If it is an update we take the existing ID else we take the inserted ID
  const savedDonneeId: number = donneeToSave.id
    ? donneeToSave.id
    : saveDonneeResponse.insertId;

  // Save the comportements
  if (donneeToSave.comportementsIds.length > 0) {
    await SqlConnection.query(
      getSaveListOfEntitesQueries(
        TABLE_DONNEE_COMPORTEMENT,
        savedDonneeId,
        donneeToSave.comportementsIds
      )
    );
  }

  // Save the milieux
  if (donneeToSave.milieuxIds.length > 0) {
    await SqlConnection.query(
      getSaveListOfEntitesQueries(
        TABLE_DONNEE_MILIEU,
        savedDonneeId,
        donneeToSave.milieuxIds
      )
    );
  }

  return saveDonneeResponse;
};

export const getExistingDonneeId = async (
  donnee: Donnee
): Promise<number | null> => {
  const response = await SqlConnection.query(
    getQueryToFindDonneeIdsByAllAttributes(donnee)
  );

  const eligibleDonneeIds: number[] = getArrayFromObjects(response, ID);

  for (const id of eligibleDonneeIds) {
    // Compare the comportements and the milieux
    const response = await SqlConnection.query(
      getQueryToFindComportementsIdsByDonneeId(id) +
        getQueryToFindMilieuxIdsByDonneeId(id)
    );

    const comportementsIds: number[] = getArrayFromObjects(
      response[0],
      "comportementId"
    );
    const milieuxIds: number[] = getArrayFromObjects(response[1], "milieuId");

    if (
      id !== donnee.id &&
      areArraysContainingSameValues(
        comportementsIds,
        donnee.comportementsIds
      ) &&
      areArraysContainingSameValues(milieuxIds, donnee.milieuxIds)
    ) {
      return id;
    }
  }

  return null;
};

export const findLastDonneeId = async (): Promise<number> => {
  const result = await SqlConnection.query(getQueryToFindLastDonneeId());
  return result && result[0] ? result[0].id : null;
};

export const updateInventaireIdForDonnees = async (
  oldInventaireId: number,
  newInventaireId: number
): Promise<SqlSaveResponse> => {
  return await SqlConnection.query(
    getQueryToUpdateDonneesInventaireId(oldInventaireId, newInventaireId)
  );
};
export const findDonneesByCustomizedFilters = async (
  filter: DonneesFilter
): Promise<FlatDonnee[]> => {
  const donnees: any[] = await SqlConnection.query(
    getQueryToFindDonneesByCriterion(filter)
  );

  const donneesIds: number[] = _.map(donnees, (donnee) => {
    return donnee.id;
  });

  const [
    associes,
    meteos,
    comportements,
    milieux
  ]: any[][] = await Promise.all([
    donnees.length
      ? SqlConnection.query(getQueryToFindAllAssocies(donneesIds))
      : [],
    donnees.length
      ? SqlConnection.query(getQueryToFindAllMeteos(donneesIds))
      : [],
    donnees.length
      ? SqlConnection.query(getQueryToFindAllComportements(donneesIds))
      : [],
    donnees.length
      ? SqlConnection.query(getQueryToFindAllMilieux(donneesIds))
      : []
  ]);

  const [
    associesByDonnee,
    meteosByDonnee,
    comportementsByDonnee,
    milieuxByDonnee
  ]: { [key: number]: any }[] = _.map(
    [associes, meteos, comportements, milieux],
    (table) => {
      return _.groupBy(table, (tableElement) => {
        return tableElement.donneeId;
      });
    }
  );

  _.forEach(donnees, (donnee: FlatDonnee) => {
    donnee.associes = _.map(
      associesByDonnee[donnee.id],
      (associe) => associe.libelle
    ).join(SEPARATOR_COMMA);
    donnee.meteos = _.map(
      meteosByDonnee[donnee.id],
      (meteo) => meteo.libelle
    ).join(SEPARATOR_COMMA);
    donnee.comportements = _.map(
      comportementsByDonnee[donnee.id],
      (comportement) => {
        return {
          code: comportement.code,
          libelle: comportement.libelle
        };
      }
    );
    donnee.milieux = _.map(milieuxByDonnee[donnee.id], (milieu) => {
      return {
        code: milieu.code,
        libelle: milieu.libelle
      };
    });
  });

  return donnees;
};

const countDonneesByInventaireId = async (
  inventaireId: number
): Promise<number> => {
  const result = await SqlConnection.query(
    getQueryToCountDonneesByInventaireId(inventaireId)
  );
  return result[0].nbDonnees;
};

export const deleteDonneeById = async (
  donneeId: number,
  inventaireId: number
): Promise<SqlSaveResponse> => {
  if (donneeId) {
    // First delete the donnee
    const sqlResponse: SqlSaveResponse = await SqlConnection.query(
      getDeleteEntityByIdQuery(TABLE_DONNEE, donneeId)
    );

    // Check how many donnees the inventaire has after the deletion
    const nbDonnees = await countDonneesByInventaireId(inventaireId);

    if (nbDonnees === 0) {
      // If the inventaire has no more donnees then we remove the inventaire
      deleteInventaireById(inventaireId);
    }

    return sqlResponse;
  }
};

export const findNextDonneeByCurrentDonneeId = async (
  currentDonneeId: number
): Promise<Donnee> => {
  const donneeResult = await SqlConnection.query(
    getQueryToFindNextDonneeByCurrentDonneeId(currentDonneeId)
  );

  return buildDonneeFromFlatDonneeWithMinimalData(donneeResult[0]);
};

export const findPreviousDonneeByCurrentDonneeId = async (
  currentDonneeId: number
): Promise<Donnee> => {
  const donneeResult = await SqlConnection.query(
    getQueryToFindPreviousDonneeByCurrentDonneeId(currentDonneeId)
  );

  return buildDonneeFromFlatDonneeWithMinimalData(donneeResult[0]);
};
