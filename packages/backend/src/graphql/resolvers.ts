import { type IResolvers } from "mercurius";
import { type Services } from "../services/services.js";
import {
  type Classe,
  type Commune,
  type Departement,
  type LieuDit,
  type Meteo,
  type Observateur,
} from "./generated/graphql-types.js";

export const buildResolvers = ({
  classeService,
  communeService,
  departementService,
  lieuditService,
  meteoService,
  observateurService,
}: Services): IResolvers => {
  return {
    Query: {
      searchDonnees: (): Record<string, never> => {
        return {};
      },
    },
    Commune: {
      departement: async (parent, args, { user }): Promise<Departement | null> => {
        const department = await departementService.findDepartementOfCommuneId(
          parent?.id ? `${parent.id}` : undefined,
          user
        );
        if (!department) {
          return null;
        }
        return {
          ...department,
          id: parseInt(department.id),
        };
      },
    },
    Espece: {
      classe: async (parent, args, { user }): Promise<Classe | null> => {
        const speciesClass = await classeService.findClasseOfEspeceId(parent?.id ? `${parent?.id}` : undefined, user);
        if (!speciesClass) {
          return null;
        }
        return {
          ...speciesClass,
          id: parseInt(speciesClass.id),
        };
      },
    },
    Inventaire: {
      observateur: async (parent, args, { user }): Promise<Observateur | null> => {
        const observer = await observateurService.findObservateurOfInventaireId(parent?.id, user);
        if (!observer) {
          return null;
        }
        return {
          ...observer,
          id: parseInt(observer.id),
        };
      },
      associes: async (parent, args, { user }): Promise<Observateur[]> => {
        const associates = await observateurService.findAssociesOfInventaireId(parent?.id, user);
        return associates.map((associate) => {
          return {
            ...associate,
            id: parseInt(associate.id),
          };
        });
      },
      lieuDit: async (parent, args, { user }): Promise<Omit<LieuDit, "commune"> | null> => {
        const locality = await lieuditService.findLieuDitOfInventaireId(parent?.id, user);
        if (!locality) {
          return null;
        }
        return {
          ...locality,
          id: parseInt(locality.id),
          altitude: locality.coordinates.altitude,
          longitude: locality.coordinates.longitude,
          latitude: locality.coordinates.latitude,
          coordinatesSystem: "gps",
        };
      },
      meteos: async (parent, args, { user }): Promise<Meteo[]> => {
        const weathers = await meteoService.findMeteosOfInventaireId(parent?.id, user);
        return weathers.map((weather) => {
          return {
            ...weather,
            id: parseInt(weather.id),
          };
        });
      },
    },
    LieuDit: {
      commune: async (parent, args, { user }): Promise<Omit<Commune, "departement"> | null> => {
        const town = await communeService.findCommuneOfLieuDitId(parent?.id ? `${parent.id}` : undefined, user);
        if (!town) {
          return null;
        }
        return {
          ...town,
          id: parseInt(town.id),
        };
      },
    },
  };
};
