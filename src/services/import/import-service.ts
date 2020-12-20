import Papa from "papaparse";

const COMMENT_PREFIX = "###";

export abstract class ImportService {

  message: string;

  public importFile = async (fileContent: string): Promise<string> => {
    if (!fileContent) {
      return "Le contenu du fichier n'a pas pu être lu";
    }

    const content = Papa.parse<string[]>(fileContent, {
      delimiter: ";",
      encoding: "UTF-8"
    });

    if (!content.data) {
      return "Le contenu du fichier n'a pas pu être lu";
    }

    const numberOfLines = 0;
    let numberOfErrors = 0;
    const errors = [];

    await this.init();

    for (const lineTab of content.data) {
      if (lineTab.length > 0 && !lineTab[0].startsWith(COMMENT_PREFIX)) {
        const errorMessage = await this.importLine(lineTab);

        if (errorMessage) {
          numberOfErrors++;
          errors.push(this.buildErrorObject(lineTab, errorMessage));
        }
      }
    }

    console.log(
      `Résultat de l'import : ${(numberOfLines - numberOfErrors)}/${numberOfLines} importées avec succès --> ${numberOfErrors} lignes en erreur`
    );

    if (errors.length > 0) {
      return Papa.unparse(errors, {
        delimiter: ";"
      });
    } else {
      return "Aucune erreur pendant l'import";
    }
  };

  protected abstract getNumberOfColumns(): number;

  protected createEntity = (entityTab: string[]): Promise<boolean> => {
    return null;
  };

  protected init = async (): Promise<void> => {
    // TO DO catch errors
  };

  private importLine = async (entityTab: string[]): Promise<string> => {
    if (entityTab?.length === this.getNumberOfColumns()) {
      await this.createEntity(entityTab);
      return "toto";
    } else {
      return `Le nombre de colonnes de cette ligne est incorrect: ${entityTab.length} colonne(s) au lieu de ${this.getNumberOfColumns()} attendue(s)`;
    }
  };

  private buildErrorObject = (
    entityTab: string[],
    errorMessage: string
  ): string[] => {
    entityTab.push(errorMessage);
    return entityTab;
  };
}
