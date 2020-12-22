import Papa from "papaparse";

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
        delimiter: ";",
        encoding: "UTF-8"
      });
    } else {
      return "Aucune erreur pendant l'import";
    }
  };

  protected abstract getNumberOfColumns(): number;

  protected abstract async init(): Promise<void>;

  protected abstract async importEntity(entityTab: string[]): Promise<string>;

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
}
