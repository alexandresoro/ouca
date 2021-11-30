import { CoordinatesSystem, Inventaire, Meteo, Observateur, Prisma } from "@prisma/client";
import { format, parse } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { CoordinatesSystemType, InputInventaire, MutationUpsertInventaireArgs, UpsertInventaireFailureReason } from "../../model/graphql";
import { InventaireCompleteWithIds } from "../../objects/db/inventaire-db.object";
import prisma from "../../sql/prisma";
import { queryToGetAllInventairesWithIds } from "../../sql/sql-queries-inventaire";
import { queryToSaveListOfEntities } from "../../sql/sql-queries-utils";
import { DATE_PATTERN, DATE_WITH_TIME_PATTERN, TABLE_INVENTAIRE, TABLE_INVENTAIRE_ASSOCIE, TABLE_INVENTAIRE_METEO } from "../../utils/constants";
import { insertMultipleEntitiesAndReturnIdsNoCheck } from "./entity-service";

export type InventaireWithRelations = Omit<Inventaire, 'date' | 'latitude' | 'longitude' | 'altitude' | 'coordinates_system'> & {
  observateur: Observateur
  customizedCoordinates?: {
    altitude: number,
    latitude: number,
    longitude: number,
    system: CoordinatesSystem
  }
  date: string // Formatted as yyyy-MM-dd
  associes: Observateur[]
  meteos: Meteo[]
};

const COMMON_INVENTAIRE_INCLUDE = {
  observateur: true,
  inventaire_associe: {
    select: {
      observateur: true
    }
  },
  inventaire_meteo: {
    select: {
      meteo: true
    }
  }
}

type InventaireRelatedTablesFields = {
  inventaire_associe: {
    observateur: Observateur
  }[]
  inventaire_meteo: {
    meteo: Meteo
  }[]
}

type InventaireResolvedFields = {
  observateur: Observateur
}

export const normalizeInventaire = <
  T extends InventaireRelatedTablesFields
>(inventaire: T): Omit<T, 'inventaire_associe' | 'inventaire_meteo'> & {
  associes: Observateur[]
  meteos: Meteo[]
} => {

  if (inventaire == null) {
    return null;
  }
  const { inventaire_associe, inventaire_meteo, ...restInventaire } = inventaire;
  const associesArray = inventaire_associe.map((inventaire_associe) => {
    return inventaire_associe?.observateur;
  });
  const meteosArray = inventaire_meteo.map((inventaire_meteo) => {
    return inventaire_meteo?.meteo;
  });

  return {
    ...restInventaire,
    associes: associesArray,
    meteos: meteosArray
  }
}

const normalizeInventaireComplete = <
  T extends Inventaire & InventaireRelatedTablesFields & InventaireResolvedFields
>(inventaire: T): InventaireWithRelations => {

  if (inventaire == null) {
    return null;
  }

  const { altitude, latitude, longitude, coordinates_system, date, ...restInventaire } = inventaire;

  const customizedCoordinates = (coordinates_system != null && altitude != null && latitude != null && longitude != null)
    ? {
      customizedCoordinates: {
        altitude,
        latitude: latitude.toNumber(),
        longitude: longitude.toNumber(),
        system: coordinates_system
      }
    }
    : {};

  const inventaireWithoutAssociesMeteos = normalizeInventaire(restInventaire);

  return {
    ...inventaireWithoutAssociesMeteos,
    ...customizedCoordinates,
    date: format(date, DATE_PATTERN),
  }
}

export const findInventaire = async (
  id: number
): Promise<InventaireWithRelations> => {
  return prisma.inventaire.findUnique({
    include: COMMON_INVENTAIRE_INCLUDE,
    where: {
      id
    }
  }).then(normalizeInventaireComplete);
};

export const findInventaireOfDonneeId = async (donneeId: number): Promise<Inventaire | null> => {
  return prisma.donnee.findUnique({
    where: {
      id: donneeId
    },
  }).inventaire();
};

export const findExistingInventaire = async (
  inventaire: InputInventaire
): Promise<Inventaire | null> => {

  const inventaireCandidates = await prisma.inventaire.findMany({
    where: {
      observateurId: inventaire.observateurId,
      date: zonedTimeToUtc(parse(inventaire.date, DATE_PATTERN, new Date()), 'UTC'),
      heure: inventaire.heure ?? null,
      duree: inventaire.duree ?? null,
      lieuDitId: inventaire.lieuDitId,
      altitude: inventaire.altitude ?? null,
      latitude: inventaire.latitude ?? null,
      longitude: inventaire.longitude ?? null,
      temperature: inventaire.temperature ?? null,
      ...(inventaire.associesIds != null ? {
        inventaire_associe: {
          every: {
            observateur_id: {
              in: inventaire.associesIds
            }
          },
        }
      } : {}),
      ...(inventaire.meteosIds != null ? {
        inventaire_meteo: {
          every: {
            meteo_id: {
              in: inventaire.meteosIds
            }
          },
        }
      } : {})
    },
    include: {
      inventaire_associe: true,
      inventaire_meteo: true
    }
  });

  // At this point the candidates are the ones that match all parameters and for which each associe+meteo is in the required list
  // However, we did not check yet that this candidates have exactly the requested associes/meteos as they can have additional ones

  return inventaireCandidates?.filter((inventaireEntity) => {
    const matcherAssociesLength = inventaire?.associesIds?.length ?? 0;
    const matcherMeteosLength = inventaire?.meteosIds?.length ?? 0;

    const areAssociesSameLength = (inventaireEntity.inventaire_associe?.length === matcherAssociesLength);
    const areMeteosSameLength = (inventaireEntity.inventaire_meteo?.length === matcherMeteosLength);

    return areAssociesSameLength && areMeteosSameLength;
  })?.[0] ?? null;
};

export const findAllInventairesWithIds = async (): Promise<InventaireCompleteWithIds[]> => {
  return queryToGetAllInventairesWithIds();
}

export const findAllInventaires = async (): Promise<InventaireWithRelations[]> => {
  return prisma.inventaire.findMany({
    include: COMMON_INVENTAIRE_INCLUDE,
  }).then((inventaires) => {
    return inventaires.map(normalizeInventaireComplete)
  });
}

export const upsertInventaire = async (
  args: MutationUpsertInventaireArgs
): Promise<InventaireWithRelations> => {
  const { id, data, migrateDonneesIfMatchesExistingInventaire = false } = args;

  // Check if an exact same inventaire already exists or not
  const existingInventaire = await findExistingInventaire(data);

  if (existingInventaire) {
    // The inventaire we wish to upsert has already an existing equivalent
    // So now it depends on what we wished to do initially

    if (id && !migrateDonneesIfMatchesExistingInventaire) {
      // This is the tricky case
      // We had an existing inventaire A that we expected to update
      // Meanwhile we found that the new values correspond to another already inventaire B
      // So we should not update inventaire A but we should provide as feedback that we did not update it
      // because it is already corresponding to B.
      // With this information, it is up to the caller to react accordingly 
      // (e.g. ask all donnees from inventaire B to be moved to A),
      // but this is not up to this upsert method to take this initiave
      const upsertInventaireFailureReason: UpsertInventaireFailureReason = {
        inventaireExpectedToBeUpdated: id,
        correspondingInventaireFound: existingInventaire.id
      }
      return Promise.reject(upsertInventaireFailureReason);
    }

    if (id) {
      // In that case, the user explicitely requested that the donnees of inventaire A 
      // should now be linked to inventaire B if matches

      // We update the inventaire ID for the donnees and we delete the duplicated inventaire
      await prisma.donnee.updateMany({
        where: {
          inventaireId: id
        },
        data: {
          inventaireId: existingInventaire?.id
        }
      });
      await prisma.inventaire.delete({
        where: {
          id
        }
      })
    }


    // We wished to create an inventaire but we already found one,
    // so we won't create anything and simply return the existing one
    return prisma.inventaire.findUnique({
      where: {
        id: existingInventaire.id
      },
      include: COMMON_INVENTAIRE_INCLUDE
    }).then(normalizeInventaireComplete);

  } else {
    // The inventaire we wish to upsert does not have an equivalent existing one
    // In that case, we proceed as a classic upsert

    const { associesIds, meteosIds, date, ...restData } = data;

    const associesMap = associesIds?.map((associeId) => {
      return {
        observateur_id: associeId
      }
    }) ?? [];

    const meteosMap = meteosIds?.map((meteoId) => {
      return {
        meteo_id: meteoId
      }
    }) ?? [];

    if (id) {
      // Update an existing inventaire
      return prisma.inventaire.update({
        where: { id },
        include: COMMON_INVENTAIRE_INCLUDE,
        data: {
          ...restData,
          coordinates_system: (restData?.altitude != null && restData?.latitude != null && restData?.longitude != null) ? CoordinatesSystemType.Gps : null,
          date: zonedTimeToUtc(parse(date, DATE_PATTERN, new Date()), 'UTC'),
          inventaire_associe: {
            deleteMany: {
              inventaire_id: id
            },
            create: associesMap
          },
          inventaire_meteo: {
            deleteMany: {
              inventaire_id: id
            },
            create: meteosMap
          }
        }
      }).then(normalizeInventaireComplete);

    } else {
      // Create a new inventaire
      return prisma.inventaire.create({
        data: {
          ...restData,
          coordinates_system: (restData?.altitude != null && restData?.latitude != null && restData?.longitude != null) ? CoordinatesSystemType.Gps : null,
          date: zonedTimeToUtc(parse(date, DATE_PATTERN, new Date()), 'UTC'),
          date_creation: new Date(),
          inventaire_associe: {
            create: associesMap
          },
          inventaire_meteo: {
            create: meteosMap
          }
        },
        include: COMMON_INVENTAIRE_INCLUDE
      }).then(normalizeInventaireComplete);
    }

  }
};

export const insertInventaires = async (
  inventaires: InventaireCompleteWithIds[]
): Promise<{ id: number }[]> => {

  const inventairesWithCreationTime = inventaires.map((inventaire) => {
    const { id, meteos_ids, associes_ids, ...inventaireOthers } = inventaire;

    return {
      ...inventaireOthers,
      date_creation: format(new Date(), DATE_WITH_TIME_PATTERN)
    }
  });

  // Insert all donnees, and retrieve their insertion id, to be able to map with meteos and associes
  const insertedIds = await insertMultipleEntitiesAndReturnIdsNoCheck(TABLE_INVENTAIRE, inventairesWithCreationTime);

  const meteosMapping = inventaires.map<[number, number[]]>((inventaire, index) => {
    return inventaire.meteos_ids.size ? [insertedIds[index].id, [...inventaire.meteos_ids]] : null;
  }).filter(mapping => mapping);

  const associesMapping = inventaires.map<[number, number[]]>((inventaire, index) => {
    return inventaire.associes_ids.size ? [insertedIds[index].id, [...inventaire.associes_ids]] : null;
  }).filter(mapping => mapping);

  if (meteosMapping.length) {
    await queryToSaveListOfEntities(
      TABLE_INVENTAIRE_METEO,
      meteosMapping
    );
  }

  if (associesMapping.length) {
    await queryToSaveListOfEntities(
      TABLE_INVENTAIRE_ASSOCIE,
      associesMapping
    );
  }

  return insertedIds;
};

export const createInventaires = async (
  inventaires: Omit<InputInventaire, 'id'>[],
  coordinatesSystem: CoordinatesSystemType
): Promise<Prisma.BatchPayload> => {
  return prisma.inventaire.createMany({
    data: inventaires.map((inventaire) => {

      const { associesIds, meteosIds, date, ...restInventaire } = inventaire;

      const associesMap = associesIds?.map((associeId) => {
        return {
          observateur_id: associeId
        }
      }) ?? [];

      const meteosMap = meteosIds?.map((meteoId) => {
        return {
          meteo_id: meteoId
        }
      }) ?? [];

      return {
        ...restInventaire,
        date: zonedTimeToUtc(parse(date, DATE_PATTERN, new Date()), 'UTC'),
        date_creation: new Date(),
        coordinates_system: coordinatesSystem ?? null,
        inventaire_associe: {
          create: associesMap
        },
        inventaire_meteo: {
          create: meteosMap
        }
      }
    })
  });
};