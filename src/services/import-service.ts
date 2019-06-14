export class ImportService {
  protected message: string;
  private ERROR_SUFFIX: string = "_erreurs.csv";
  private DETAILS_SUFFIX: string = "_erreurs_explications.csv";
  private END_OF_LINE: string = "\r\n";

  private numberOfLines: number;

  private numberOfErrors: number;

  protected getNumberOfColumns = () => {
    return -1;
  }

  protected isObjectValid = (objectTab: string[]): boolean => {
    return false;
  }

  protected saveObject = (objectTab: string[]): void => {
    // See children
  }

  private importFile = (): string => {
    this.numberOfLines = 0;
    this.numberOfErrors = 0;

    // Loop on lines
    this.importLine("test");

    return (
      "Import terminé: " +
      this.numberOfLines +
      " lignes à importer, " +
      this.numberOfErrors +
      " erreurs."
    );
  }

  private importLine = (line: string): void => {
    this.message = "";

    if (!!line) {
      this.numberOfLines++;

      const objectTab: string[] = line.split(";");

      if (
        this.hasExpectedNumberOfColumns(objectTab) &&
        this.isObjectValid(objectTab)
      ) {
        // Save object
        this.saveObject(objectTab);
      } else {
        // Display error message
        this.numberOfErrors++;
        const errorLine: string = this.buildErrorLine(line);
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
