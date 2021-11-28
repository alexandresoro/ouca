import { parse } from 'csv-parse/sync';
import { EventEmitter } from "events";
import deburr from "lodash.deburr";
import { DATA_VALIDATION_START, ImportNotifyProgressMessageContent, IMPORT_PROCESS_STARTED, INSERT_DB_START, RETRIEVE_DB_INFO_START } from "../../model/import/import-update-message";
import { logger } from "../../utils/logger";

const COMMENT_PREFIX = "###";

export const IMPORT_PROGRESS_UPDATE_EVENT = "importProgressUpdate";

export const IMPORT_STATUS_UPDATE_EVENT = "importStatusUpdate";

export const IMPORT_COMPLETE_EVENT = "importComplete";

const NOTIFY_PROGRESS_INTERVAL = 500; //ms

export abstract class ImportService extends EventEmitter {

  public importFile = async (fileContent: string): Promise<void> => {

    this.emit(IMPORT_STATUS_UPDATE_EVENT, { type: IMPORT_PROCESS_STARTED });

    if (!fileContent) {
      this.emit(IMPORT_COMPLETE_EVENT, "Le contenu du fichier n'a pas pu être lu");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const content: string[][] = parse(fileContent, {
      delimiter: ";",
      encoding: 'utf-8'
    });

    if (!content) {
      this.emit(IMPORT_COMPLETE_EVENT, "Le contenu du fichier n'a pas pu être lu");
      return;
    }

    const numberOfLines = content.filter((lineTab) => {
      return lineTab.length > 0 && !lineTab[0].startsWith(COMMENT_PREFIX);
    }).length;
    const errors = [] as string[][];
    let validatedEntries = 0;

    this.emit(IMPORT_STATUS_UPDATE_EVENT, { type: RETRIEVE_DB_INFO_START });

    // Retrieve any initialization info needed before validation
    await this.init();

    this.emit(IMPORT_STATUS_UPDATE_EVENT, { type: DATA_VALIDATION_START });

    let lastNotifyDate = Date.now();

    // Validate all entries
    for (const lineTab of content) {
      if (lineTab.length > 0 && !lineTab[0].startsWith(COMMENT_PREFIX)) {

        let errorMessage: string;
        if (lineTab?.length !== this.getNumberOfColumns()) {
          errorMessage = `Le nombre de colonnes de cette ligne est incorrect: ${lineTab.length} colonne(s) au lieu de ${this.getNumberOfColumns()} attendue(s)`;
        } else {
          errorMessage = await this.validateAndPrepareEntity(lineTab);
        }

        if (errorMessage) {
          errors.push(this.buildErrorObject(lineTab, errorMessage));
        }

        validatedEntries++;

        const now = Date.now();
        if (now - lastNotifyDate >= NOTIFY_PROGRESS_INTERVAL) {
          const progressContent: ImportNotifyProgressMessageContent = {
            status: "Validating entries",
            totalEntries: content.length,
            entriesToBeValidated: numberOfLines,
            validatedEntries,
            errors: errors.length
          };
          this.emit(IMPORT_PROGRESS_UPDATE_EVENT, progressContent);
          lastNotifyDate = now;
        }

      }
    }

    this.emit(IMPORT_STATUS_UPDATE_EVENT, { type: INSERT_DB_START });

    // Insert the valid entries in the database
    await this.persistAllValidEntities();

    logger.debug(`Résultat de l'import : ${(numberOfLines - errors.length)}/${numberOfLines} importées avec succès --> ${errors.length} lignes en erreur`);

    if (errors.length > 0) {
      this.emit(IMPORT_COMPLETE_EVENT, errors);
    } else {
      this.emit(IMPORT_COMPLETE_EVENT, null);
    }
  };

  protected abstract getNumberOfColumns(): number;

  protected abstract init(): Promise<void>;

  protected abstract persistAllValidEntities(): Promise<void>;

  protected abstract validateAndPrepareEntity(entityTab: string[]): string | Promise<string>;

  private buildErrorObject = (
    entityTab: string[],
    errorMessage: string
  ): string[] => {
    entityTab.push(errorMessage);
    return entityTab;
  };

  protected compareStrings = (string1: string, string2: string): boolean => {
    if (!string1 && !string2) {
      return true;
    }

    if (!string1 || !string2) {
      return false;
    }

    return deburr(string1.trim()).toLowerCase() === deburr(string2.trim()).toLowerCase();
  }
}
