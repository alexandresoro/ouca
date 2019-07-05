import Papa from "papaparse";
import { EntiteSimple } from "../basenaturaliste-model/entite-simple.object";
import { ImportResponse } from "../basenaturaliste-model/import-response.object";
import { SqlConnection } from "../sql/sql-connection";
import { DB_SAVE_MAPPING, getSaveEntityQuery } from "../sql/sql-queries-utils";
import { TABLE_OBSERVATEUR } from "../utils/constants";

export abstract class ImportService {
  protected message: string;

  private ERROR_SUFFIX: string = "_erreurs.csv";

  private numberOfLines: number;

  private numberOfErrors: number;

  private errors: string[][];

  public importFile = async (fileContent: string): Promise<ImportResponse> => {
    this.numberOfLines = 0;
    this.numberOfErrors = 0;
    this.errors = [];

    const content = Papa.parse(fileContent);

    if (!!content.data) {
      for (const lineTab of content.data) {
        await this.importLine(lineTab);
      }
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
    // console.log("### Line to import", entityTab);
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
        console.log("ERREUR", this.message);
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
