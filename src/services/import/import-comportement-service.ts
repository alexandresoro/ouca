import { Comportement, Prisma } from "@prisma/client";
import { createComportements, findAllComportements } from "../entities/comportement-service";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service";

export class ImportComportementService extends ImportEntiteAvecLibelleEtCodeService {
  protected getTableName(): string {
    throw new Error("Method not implemented.");
  }
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAllComportements();
  };

  protected getAnEntityName(): string {
    return "un comportement";
  }

  protected saveEntities = (comportements: Omit<Comportement, 'id'>[]): Promise<Prisma.BatchPayload> => {
    return createComportements(comportements);
  };
}
