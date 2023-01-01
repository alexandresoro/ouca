import { type CoordinatesSystem, type Inventaire as InventairePrisma } from "@prisma/client";
import { format } from "date-fns";
import { type Logger } from "pino";
import { type DatabasePool } from "slonik";
import {
  CoordinatesSystemType,
  type MutationUpsertInventaireArgs,
  type UpsertInventaireFailureReason,
} from "../../graphql/generated/graphql-types";
import { type DonneeRepository } from "../../repositories/donnee/donnee-repository";
import { type InventaireRepository } from "../../repositories/inventaire/inventaire-repository";
import { type Inventaire } from "../../repositories/inventaire/inventaire-repository-types";
import { type Meteo } from "../../repositories/meteo/meteo-repository-types";
import { type Observateur } from "../../repositories/observateur/observateur-repository-types";
import prisma from "../../sql/prisma";
import { type LoggedUser } from "../../types/User";
import { DATE_PATTERN } from "../../utils/constants";
import { parseISO8601AsUTCDate } from "../../utils/time-utils";
import { validateAuthorization } from "./authorization-utils";
import { reshapeInputInventaireUpsertData } from "./inventaire-service-reshape";

type InventaireServiceDependencies = {
  logger: Logger;
  slonik: DatabasePool;
  inventaireRepository: InventaireRepository;
  donneeRepository: DonneeRepository;
};

export const buildInventaireService = ({
  slonik,
  inventaireRepository,
  donneeRepository,
}: InventaireServiceDependencies) => {
  const findInventaire = async (id: number, loggedUser: LoggedUser | null): Promise<Inventaire | null> => {
    validateAuthorization(loggedUser);

    const inventaire = await inventaireRepository.findInventaireById(id);

    return inventaire;
  };

  const findInventaireOfDonneeId = async (
    donneeId: number | undefined,
    loggedUser: LoggedUser | null
  ): Promise<Inventaire | null> => {
    validateAuthorization(loggedUser);

    return inventaireRepository.findInventaireByDonneeId(donneeId);
  };

  const findAllInventaires = async (): Promise<Inventaire[]> => {
    const inventaires = await inventaireRepository.findInventaires();

    return [...inventaires];
  };

  const upsertInventaire = async (
    args: MutationUpsertInventaireArgs,
    loggedUser: LoggedUser | null
  ): Promise<Inventaire | InventaireWithRelations> => {
    validateAuthorization(loggedUser);

    const { id, data, migrateDonneesIfMatchesExistingInventaire = false } = args;
    const { associesIds, meteosIds } = data;

    // Check if an exact same inventaire already exists or not
    const existingInventaire = await inventaireRepository.findExistingInventaire({
      ...reshapeInputInventaireUpsertData(data),
      associesIds: associesIds ?? [],
      meteosIds: meteosIds ?? [],
    });

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
          correspondingInventaireFound: existingInventaire.id,
        };
        return Promise.reject(upsertInventaireFailureReason);
      }

      if (id) {
        // In that case, the user explicitely requested that the donnees of inventaire A
        // should now be linked to inventaire B if matches

        // We update the inventaire ID for the donnees and we delete the duplicated inventaire
        await slonik.transaction(async (transactionConnection) => {
          await donneeRepository.updateAssociatedInventaire(id, existingInventaire.id, transactionConnection);
          await inventaireRepository.deleteInventaireById(id, transactionConnection);
        });
      }

      // We wished to create an inventaire but we already found one,
      // so we won't create anything and simply return the existing one
      return existingInventaire;
    } else {
      // The inventaire we wish to upsert does not have an equivalent existing one
      // In that case, we proceed as a classic upsert

      const { date, ...restData } = data;

      const associesMap =
        associesIds?.map((associeId) => {
          return {
            observateur_id: associeId,
          };
        }) ?? [];

      const meteosMap =
        meteosIds?.map((meteoId) => {
          return {
            meteo_id: meteoId,
          };
        }) ?? [];

      if (id) {
        // Update an existing inventaire
        return prisma.inventaire
          .update({
            where: { id },
            include: COMMON_INVENTAIRE_INCLUDE,
            data: {
              ...restData,
              coordinates_system:
                restData?.altitude != null && restData?.latitude != null && restData?.longitude != null
                  ? CoordinatesSystemType.Gps
                  : null,
              date: parseISO8601AsUTCDate(date),
              inventaire_associe: {
                deleteMany: {
                  inventaire_id: id,
                },
                create: associesMap,
              },
              inventaire_meteo: {
                deleteMany: {
                  inventaire_id: id,
                },
                create: meteosMap,
              },
            },
          })
          .then(normalizeInventaireComplete);
      } else {
        // Create a new inventaire
        return prisma.inventaire
          .create({
            data: {
              ...restData,
              coordinates_system:
                restData?.altitude != null && restData?.latitude != null && restData?.longitude != null
                  ? CoordinatesSystemType.Gps
                  : null,
              date: parseISO8601AsUTCDate(date),
              date_creation: new Date(),
              inventaire_associe: {
                create: associesMap,
              },
              inventaire_meteo: {
                create: meteosMap,
              },
              ownerId: loggedUser.id,
            },
            include: COMMON_INVENTAIRE_INCLUDE,
          })
          .then(normalizeInventaireComplete);
      }
    }
  };

  return {
    findInventaire,
    findInventaireOfDonneeId,
    findAllInventaires,
    upsertInventaire,
  };
};

export type InventaireService = ReturnType<typeof buildInventaireService>;

export type InventaireWithRelations = Omit<
  InventairePrisma,
  "date" | "latitude" | "longitude" | "altitude" | "coordinates_system"
> & {
  observateur: Observateur;
  customizedCoordinates?: {
    altitude: number;
    latitude: number;
    longitude: number;
    system: CoordinatesSystem;
  };
  date: string; // Formatted as yyyy-MM-dd
  associes: Observateur[];
  meteos: Meteo[];
};

const COMMON_INVENTAIRE_INCLUDE = {
  observateur: true,
  inventaire_associe: {
    select: {
      observateur: true,
    },
  },
  inventaire_meteo: {
    select: {
      meteo: true,
    },
  },
};

type InventaireRelatedTablesFields = {
  inventaire_associe: {
    observateur: Observateur;
  }[];
  inventaire_meteo: {
    meteo: Meteo;
  }[];
};

type InventaireResolvedFields = {
  observateur: Observateur;
};

export const normalizeInventaire = <T extends InventaireRelatedTablesFields>(
  inventaire: T
): Omit<T, "inventaire_associe" | "inventaire_meteo"> & {
  associes: Observateur[];
  meteos: Meteo[];
} => {
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
    meteos: meteosArray,
  };
};

const normalizeInventaireComplete = <
  T extends InventairePrisma & InventaireRelatedTablesFields & InventaireResolvedFields
>(
  inventaire: T
): InventaireWithRelations => {
  const { altitude, latitude, longitude, coordinates_system, date, ...restInventaire } = inventaire;

  const customizedCoordinates =
    coordinates_system != null && altitude != null && latitude != null && longitude != null
      ? {
          customizedCoordinates: {
            altitude,
            latitude: latitude.toNumber(),
            longitude: longitude.toNumber(),
            system: coordinates_system,
          },
        }
      : {};

  const inventaireWithoutAssociesMeteos = normalizeInventaire(restInventaire);

  return {
    ...inventaireWithoutAssociesMeteos,
    ...customizedCoordinates,
    date: format(date, DATE_PATTERN),
  };
};
