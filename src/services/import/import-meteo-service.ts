import { Meteo, Prisma } from "@prisma/client";
import { createMeteos, findAllMeteos } from "../entities/meteo-service";
import { ImportEntiteAvecLibelleService } from "./import-entite-avec-libelle-service";

export class ImportMeteoService extends ImportEntiteAvecLibelleService {
  protected getTableName(): string {
    throw new Error("Method not implemented.");
  }
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAllMeteos();
  };

  protected getThisEntityName(): string {
    return "Cette météo";
  }

  protected saveEntities = (ages: Omit<Meteo, 'id'>[]): Promise<Prisma.BatchPayload> => {
    return createMeteos(ages);
  };
}
