import { Meteo, Prisma } from "@prisma/client";
import { LoggedUser } from "../../types/LoggedUser";
import { createMeteos, findMeteos } from "../entities/meteo-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportMeteoService extends ImportEntiteAvecLibelleService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findMeteos();
  };

  protected getThisEntityName(): string {
    return "Cette météo";
  }

  protected saveEntities = (
    ages: Omit<Meteo, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<Prisma.BatchPayload> => {
    return createMeteos(ages, loggedUser);
  };
}
