import { Milieu, Prisma } from "@prisma/client";
import { createMilieux, findAllMilieux } from "../entities/milieu-service";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service";

export class ImportMilieuService extends ImportEntiteAvecLibelleEtCodeService {

  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAllMilieux();
  };

  protected getAnEntityName(): string {
    return "un milieu";
  }

  protected saveEntities = (milieux: Omit<Milieu, 'id'>[]): Promise<Prisma.BatchPayload> => {
    return createMilieux(milieux);
  };
}
