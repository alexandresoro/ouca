import Papa from "papaparse";
import { ImportResponse } from "../../basenaturaliste-model/import-response.object";

export abstract class ImportService {
  protected message: string;

  private numberOfLines: number;

  private numberOfErrors: number;

  private errors: string[][];

  public importFile = async (fileContent: string): Promise<ImportResponse> => {
    this.numberOfLines = 0;
    this.numberOfErrors = 0;
    this.errors = [];

    if (!fileContent) {
      return {
        isSuccessful: false,
        reasonForFailure: "Le contenu du fichier n'a pas pu être lu"
      };
    }

    const content = Papa.parse(fileContent);

    if (!!content.data) {
      for (const lineTab of content.data) {
        await this.importLine(lineTab);
      }
    } else {
      return {
        isSuccessful: false,
        reasonForFailure: "Le contenu du fichier n'a pas pu être parsé"
      };
    }

    return {
      isSuccessful: true,
      numberOfLinesExtracted: this.numberOfLines,
      numberOfLinesFailedToImport: this.numberOfErrors,
      errors: this.errors
    };
  }

  protected abstract getNumberOfColumns(): number;

  protected abstract createEntity(entityTab: string[]): Promise<boolean>;

  private importLine = async (entityTab: string[]): Promise<void> => {
    this.message = "";

    if (!!entityTab) {
      this.numberOfLines++;

      if (this.hasExpectedNumberOfColumns(entityTab)) {
        await this.createEntity(entityTab);
      }

      if (this.message) {
        // Display error message
        this.numberOfErrors++;
        this.errors.push(this.buildErrorObject(entityTab));
      }
    }
  }

  private hasExpectedNumberOfColumns = (entityTab: string[]): boolean => {
    if (!!entityTab && entityTab.length === this.getNumberOfColumns()) {
      return true;
    } else {
      this.message =
        "Le nombre de colonnes de cette ligne est incorrect: " +
        entityTab.length +
        " colonne(s) au lieu de " +
        this.getNumberOfColumns() +
        " attendue(s)";

      return false;
    }
  }

  private buildErrorObject = (entityTab: string[]): string[] => {
    entityTab.push(this.message);
    return entityTab;
  }
}
