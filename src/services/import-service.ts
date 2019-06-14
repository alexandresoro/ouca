export class ImportService {
  protected message: string;

  private numberOfLines: number;

  private numberOfErrors: number;

  private numberOfSuccess: number;

  protected getNumberOfColumns = () => {
    return -1;
  }

  protected isObjectValid = (objectTab: string[]): boolean => {
    return false;
  }

  private importFile = (): void => {
    this.numberOfLines = 0;
    this.numberOfErrors = 0;
    this.numberOfSuccess = 0;

    // Loop on lines
    this.importLine("test");
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
        this.numberOfSuccess++;
      } else {
        // Display error message
        this.numberOfErrors++;
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
}
