export class ImportService {
  protected message: string;

  importLine = (line: string): void => {
    this.message = "";

    if (!!line) {
      const objectTab: string[] = line.split(";");
      if (
        this.hasExpectedNumberOfColumns(objectTab) &&
        this.isObjectValid(objectTab)
      ) {
        // Save object
      } else {
        // Display error message
      }
    }
  }

  protected getNumberOfColumns = () => {
    return -1;
  }

  protected isObjectValid = (objectTab: string[]): boolean => {
    return false;
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
