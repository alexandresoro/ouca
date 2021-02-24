import deburr from "lodash.deburr";
import Papa from "papaparse";
import { logger } from "../../utils/logger";

const COMMENT_PREFIX = "###";

export abstract class ImportService {

  public importFile = async (fileContent: string): Promise<string> => {
    if (!fileContent) {
      return "Le contenu du fichier n'a pas pu être lu";
    }

    const content: { data: string[][] } = Papa.parse<string[]>(fileContent, {
      delimiter: ";",
      encoding: "UTF-8"
    });

    if (!content.data) {
      return "Le contenu du fichier n'a pas pu être lu";
    }

    let numberOfLines = 0;
    let numberOfErrors = 0;
    const errors = [];

    await this.init();

    for (const lineTab of content.data) {
      if (lineTab.length > 0 && !lineTab[0].startsWith(COMMENT_PREFIX)) {
        numberOfLines++;

        const errorMessage = await this.importLine(lineTab);

        if (errorMessage) {
          numberOfErrors++;
          errors.push(this.buildErrorObject(lineTab, errorMessage));
        }
      }
    }

    logger.info(`Résultat de l'import : ${(numberOfLines - numberOfErrors)}/${numberOfLines} importées avec succès --> ${numberOfErrors} lignes en erreur`);

    if (errors.length > 0) {
      return Papa.unparse(errors, {
        delimiter: ";",
        encoding: "UTF-8"
      });
    } else {
      return "Aucune erreur pendant l'import";
    }
  };

  protected abstract getNumberOfColumns(): number;

  protected abstract init(): Promise<void>;

  protected abstract importEntity(entityTab: string[]): Promise<string>;

  private importLine = async (entityTab: string[]): Promise<string> => {
    if (entityTab?.length !== this.getNumberOfColumns()) {
      return `Le nombre de colonnes de cette ligne est incorrect: ${entityTab.length} colonne(s) au lieu de ${this.getNumberOfColumns()} attendue(s)`;
    } else {
      return await this.importEntity(entityTab);
    }
  };

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
