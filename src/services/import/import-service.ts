import Papa from "papaparse";

export abstract class ImportService {
  protected message: string;

  private numberOfLines: number;

  private numberOfErrors: number;

  private errors: string[][];

  public importFile = async (fileContent: string): Promise<string> => {
    this.numberOfLines = 0;
    this.numberOfErrors = 0;
    this.errors = [];

    if (!fileContent) {
      return "Le contenu du fichier n'a pas pu être lu";
    }

    const content = Papa.parse(fileContent, {
      delimiter: ";"
    });

    if (content.data) {
      for (const lineTab of content.data) {
        await this.importLine(lineTab);
      }
    } else {
      return "Le contenu du fichier n'a pas pu être lu";
    }

    if (this.errors.length > 0) {
      return Papa.unparse(this.errors);
    } else {
      return "Aucune erreur pendant l'import";
    }
  };

  protected abstract getNumberOfColumns(): number;

  protected abstract createEntity(entityTab: string[]): Promise<boolean>;

  private importLine = async (entityTab: string[]): Promise<void> => {
    this.message = "";

    if (entityTab) {
      this.numberOfLines++;

      if (this.hasExpectedNumberOfColumns(entityTab)) {
        await this.createEntity(entityTab);
      }
      console.log(entityTab, entityTab.length, this.message);

      if (this.message) {
        // Display error message
        this.numberOfErrors++;
        this.errors.push(this.buildErrorObject(entityTab));
      }
    }
  };

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
  };

  private buildErrorObject = (entityTab: string[]): string[] => {
    entityTab.push(this.message);
    return entityTab;
  };
}
