import moment from "moment";
import { HttpParameters } from "../http/httpParameters";
import { getExportFolderPath } from "./import";

const DUMP_FOLDER_PATH: string = "/sauvegardes";
const DUMP_FILE_NAME: string = "/sauvegarde_base_naturaliste_";
const SQL_EXTENSION: string = ".sql";

export const saveDatabase = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<boolean> => {
  const exportFolderPath = await getExportFolderPath();

  const fs = require("fs");

  const dumpFolder = exportFolderPath + DUMP_FOLDER_PATH;
  const dumpFile =
    dumpFolder + DUMP_FILE_NAME + moment().format("YYYY-MM-DD") + SQL_EXTENSION;

  // Create dump folder if it does not exist
  if (!fs.existsSync(dumpFolder)) {
    fs.mkdirSync(dumpFolder);
  }

  // Remove dump file if it exists
  await fs.unlink(dumpFile, (err) => {
    if (err) {
      if (err.code === "ENOENT") {
        console.log("Le fichier " + err.path + " n'existe pas.");
      } else {
        console.error(err);
        return false;
      }
    }
  });

  // Create a dump of the database
  // TODO

  return false;
};
