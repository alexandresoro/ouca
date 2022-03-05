import { Comportement, Prisma } from "@prisma/client";
import { LoggedUser } from "../../types/LoggedUser";
import { createComportements, findAllComportements } from "../entities/comportement-service";
import { ImportEntiteAvecLibelleEtCodeService } from "./import-entite-avec-libelle-et-code-service";

export class ImportComportementService extends ImportEntiteAvecLibelleEtCodeService {
  protected init = async (): Promise<void> => {
    this.entitiesToInsert = [];
    this.entities = await findAllComportements();
  };

  protected getAnEntityName(): string {
    return "un comportement";
  }

  protected saveEntities = (
    comportements: Omit<Comportement, "id" | "ownerId">[],
    loggedUser: LoggedUser
  ): Promise<Prisma.BatchPayload> => {
    return createComportements(comportements, loggedUser);
  };
}
