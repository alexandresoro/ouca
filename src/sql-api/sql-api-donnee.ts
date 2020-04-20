import { format } from "date-fns";
import * as _ from "lodash";
import { DonneeWithNavigationData } from "ouca-common/donnee-with-navigation-data.object";
import { Donnee } from "ouca-common/donnee.object";
import { DonneesFilter } from "ouca-common/donnees-filter.object";
import { FlatDonnee } from "ouca-common/flat-donnee.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { FlatDonneeWithMinimalData } from "../objects/flat-donnee-with-minimal-data.object";
import { SqlSaveResponse } from "../objects/sql-save-response.object";
import {
  queryToFindAllComportementsByDonneeId,
  queryToFindComportementsIdsByDonneeId
} from "../sql/sql-queries-comportement";
import {
  queryToCountDonneesByInventaireId,
  queryToFindDonneeById,
  queryToFindDonneeIdsByAllAttributes,
  queryToFindDonneeIndexById,
  queryToFindDonneesByCriterion,
  queryToFindLastDonneeId,
  queryToFindLastRegroupement,
  queryToFindNextDonneeIdByCurrentDonneeId,
  queryToFindNumberOfDonneesByDonneeEntityId,
  queryToFindPreviousDonneeIdByCurrentDonneeId,
  queryToUpdateDonneesInventaireId
} from "../sql/sql-queries-donnee";
import {
  queryToFindAllMeteosByDonneeId,
  queryToFindMetosByInventaireId
} from "../sql/sql-queries-meteo";
import {
  queryToFindAllMilieuxByDonneeId,
  queryToFindMilieuxIdsByDonneeId
} from "../sql/sql-queries-milieu";
import {
  queryToFindAllAssociesByDonneeId,
  queryToFindAssociesByInventaireId
} from "../sql/sql-queries-observateur";
import {
  DB_SAVE_MAPPING,
  queriesToSaveListOfEntities,
  queryToDeleteAnEntityByAttribute,
  queryToSaveEntity
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
import { deleteEntityById } from "./sql-api-common";
import { deleteInventaireById } from "./sql-api-inventaire";

export const buildDonneeFromFlatDonneeWithMinimalData = async (
  flatDonnee: FlatDonneeWithMinimalData
): Promise<Donnee> => {
  if (!!flatDonnee && !!flatDonnee.id && !!flatDonnee.inventaireId) {
    const [
      associesIdsByInventaireId,
      meteosIdsByInventaireId,
      comportementsIdsByDonneeId,
      milieuxIdsByDonneeId,
      nbDonneesByInventaireId
    ] = await Promise.all([
      queryToFindAssociesByInventaireId(flatDonnee.inventaireId),
      queryToFindMetosByInventaireId(flatDonnee.inventaireId),
      queryToFindComportementsIdsByDonneeId(flatDonnee.id),
      queryToFindMilieuxIdsByDonneeId(flatDonnee.id),
      queryToFindNumberOfDonneesByDonneeEntityId(
        INVENTAIRE_ID,
        flatDonnee.inventaireId
      )
    ]);

    const inventaire: Inventaire = {
      id: flatDonnee.inventaireId,
      observateurId: flatDonnee.observateurId,
      associesIds: mapAssociesIds(associesIdsByInventaireId),
      date: flatDonnee.date,
      heure: flatDonnee.heure,
      duree: flatDonnee.duree,
      lieuditId: flatDonnee.lieuditId,
      customizedAltitude: flatDonnee.altitude,
      coordinates: !_.isNil(flatDonnee.longitude)
        ? {
            longitude: flatDonnee.longitude,
            latitude: flatDonnee.latitude,
            system: flatDonnee.coordinatesSystem,
            isTransformed: false
          }
        : null,
      temperature: flatDonnee.temperature,
      meteosIds: mapMeteosIds(meteosIdsByInventaireId),
      nbDonnees: nbDonneesByInventaireId[0].nb
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
      comportementsIds: mapComportementsIds(comportementsIdsByDonneeId),
      milieuxIds: mapMilieuxIds(milieuxIdsByDonneeId),
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
    await Promise.all([
      queryToDeleteAnEntityByAttribute(
        TABLE_DONNEE_COMPORTEMENT,
        DONNEE_ID,
        donneeToSave.id
      ),
      queryToDeleteAnEntityByAttribute(
        TABLE_DONNEE_MILIEU,
        DONNEE_ID,
        donneeToSave.id
      )
    ]);
  }

  const saveDonneeResponse: SqlSaveResponse = await queryToSaveEntity(
    TABLE_DONNEE,
    {
      ...donneeToSave,
      dateCreation: format(new Date(), DATE_WITH_TIME_PATTERN)
    },
    DB_SAVE_MAPPING.donnee
  );

  // If it is an update we take the existing ID else we take the inserted ID
  const savedDonneeId: number = donneeToSave.id
    ? donneeToSave.id
    : saveDonneeResponse.insertId;

  // Save the comportements
  if (donneeToSave.comportementsIds.length > 0) {
    await queriesToSaveListOfEntities(
      TABLE_DONNEE_COMPORTEMENT,
      savedDonneeId,
      donneeToSave.comportementsIds
    );
  }

  // Save the milieux
  if (donneeToSave.milieuxIds.length > 0) {
    await queriesToSaveListOfEntities(
      TABLE_DONNEE_MILIEU,
      savedDonneeId,
      donneeToSave.milieuxIds
    );
  }

  return saveDonneeResponse;
};

export const updateInventaireIdForDonnees = async (
  oldInventaireId: number,
  newInventaireId: number
): Promise<SqlSaveResponse> => {
  return await queryToUpdateDonneesInventaireId(
    oldInventaireId,
    newInventaireId
  );
};

export const findExistingDonneeId = async (donnee: Donnee): Promise<number> => {
  const response = await queryToFindDonneeIdsByAllAttributes(donnee);

  const eligibleDonneeIds: number[] = getArrayFromObjects<{ id: number }>(
    response,
    ID
  );

  for (const id of eligibleDonneeIds) {
    // Compare the comportements and the milieux
    const [comportements, milieux] = await Promise.all([
      queryToFindComportementsIdsByDonneeId(id),
      queryToFindMilieuxIdsByDonneeId(id)
    ]);

    const comportementsIds: number[] = getArrayFromObjects(
      comportements,
      "comportementId"
    );
    const milieuxIds: number[] = getArrayFromObjects(milieux, "milieuId");

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
  const ids = await queryToFindLastDonneeId();
  return ids && ids[0]?.id ? ids[0].id : null;
};

export const findDonneesByCustomizedFilters = async (
  filter: DonneesFilter
): Promise<FlatDonnee[]> => {
  const donnees: FlatDonnee[] = await queryToFindDonneesByCriterion(filter);

  const donneesIds: number[] = _.map(donnees, (donnee) => {
    return donnee.id;
  });

  const [associes, meteos, comportements, milieux] = donneesIds.length
    ? await Promise.all([
        queryToFindAllAssociesByDonneeId(donneesIds),
        queryToFindAllMeteosByDonneeId(donneesIds),
        queryToFindAllComportementsByDonneeId(donneesIds),
        queryToFindAllMilieuxByDonneeId(donneesIds)
      ])
    : [[], [], [], []];

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
  const numbers = await queryToCountDonneesByInventaireId(inventaireId);
  return numbers && numbers[0]?.nbDonnees ? numbers[0].nbDonnees : 0;
};

export const deleteDonneeById = async (
  donneeId: number,
  inventaireId: number
): Promise<SqlSaveResponse> => {
  if (donneeId) {
    // First delete the donnee
    const sqlResponse: SqlSaveResponse = await deleteEntityById(
      TABLE_DONNEE,
      donneeId
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

const findNextDonneeIdByCurrentDonneeId = async (
  currentDonneeId: number
): Promise<number> => {
  const ids = await queryToFindNextDonneeIdByCurrentDonneeId(currentDonneeId);
  return ids && ids[0]?.id ? ids[0].id : null;
};

const findPreviousDonneeIdByCurrentDonneeId = async (
  currentDonneeId: number
): Promise<number> => {
  const ids = await queryToFindPreviousDonneeIdByCurrentDonneeId(
    currentDonneeId
  );
  return ids && ids[0]?.id ? ids[0].id : null;
};

const findDonneeIndexById = async (id: number): Promise<number> => {
  const ids = await queryToFindDonneeIndexById(id);

  return ids && ids[0]?.nbDonnees ? ids[0].nbDonnees : null;
};

const findDonneeById = async (id: number): Promise<Donnee> => {
  const flatDonnees = await queryToFindDonneeById(id);
  if (!flatDonnees || !flatDonnees[0]?.id) {
    return null;
  }
  return await buildDonneeFromFlatDonneeWithMinimalData(flatDonnees[0]);
};

export const findDonneeByIdWithContext = async (
  donneeId: number
): Promise<DonneeWithNavigationData> => {
  const [
    donnee,
    previousDonneeId,
    nextDonneeId,
    donneeIndex
  ] = await Promise.all([
    findDonneeById(donneeId),
    findPreviousDonneeIdByCurrentDonneeId(donneeId),
    findNextDonneeIdByCurrentDonneeId(donneeId),
    findDonneeIndexById(donneeId)
  ]);

  return {
    ...donnee,
    previousDonneeId: previousDonneeId,
    nextDonneeId: nextDonneeId,
    indexDonnee: donneeIndex
  };
};

export const findNextRegroupement = async (): Promise<number> => {
  const regroupements = await queryToFindLastRegroupement();
  return regroupements && regroupements[0]?.regroupement
    ? regroupements[0]?.regroupement + 1
    : 1;
};
