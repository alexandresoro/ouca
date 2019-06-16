import { ImportResponse } from "basenaturaliste-model/import-response.object";
import * as _ from "lodash";
import Papa from "papaparse";

export abstract class ImportService {
  protected message: string;
  private ERROR_SUFFIX: string = "_erreurs.csv";
  private DETAILS_SUFFIX: string = "_erreurs_explications.csv";
  private END_OF_LINE: string = "\r\n";

  private numberOfLines: number;

  private numberOfErrors: number;

  public importFile = (fileContent: string): ImportResponse => {
    this.numberOfLines = 0;
    this.numberOfErrors = 0;

    const content = Papa.parse(fileContent);

    if (!!content.data) {
      _.forEach(content.data, (lineTab: any[]) => {
        this.importLine(lineTab);
      });
    }

    return {
      isSuccessful: true,
      numberOfLinesExtracted: content.data.length
    };
  }

  protected abstract getNumberOfColumns(): number;

  protected abstract isObjectValid(objectTab: string[]): boolean;

  protected abstract saveObject(objectTab: string[]): void;

  private importLine = (objectTab: string[]): void => {
    this.message = "";

    if (!!objectTab) {
      this.numberOfLines++;

      if (
        this.hasExpectedNumberOfColumns(objectTab) &&
        this.isObjectValid(objectTab)
      ) {
        // Save object
        this.saveObject(objectTab);
      } else {
        // Display error message
        this.numberOfErrors++;
        // const errorLine: string = this.buildErrorLine(line);
      }
    }
  }

  private hasExpectedNumberOfColumns = (objectTab: string[]): boolean => {
    if (!!objectTab && objectTab.length === this.getNumberOfColumns()) {
      return true;
    } else {
      this.message =
        "Le nombre de colonnes de cette ligne est incorrect: " +
        objectTab.length +
        " colonnes au lieu de " +
        this.getNumberOfColumns() +
        " attendues";

      return false;
    }
  }

  private buildErrorLine = (line: string): string => {
    return this.message + ";" + line;
  }
}
