import moment from "moment";
import mysqldump from "mysqldump";
import { HttpParameters } from "../http/httpParameters";
import { getSqlConnectionConfiguration } from "../sql/sql-connection";
import { getExportFolderPath } from "./import";
export const saveDatabase = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const exportFolderPath = await getExportFolderPath();

  const fs = require("fs");
  const folder = exportFolderPath + "/sauvegardes";
  const exportFile =
    folder +
    "/sauvegarde_basenaturaliste_" +
    moment().format("YYYY-MM-DD") +
    ".sql";

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  fs.unlink(exportFile, (err) => {
    if (err) {
      console.error(err);
    } 
    const sqlConfiguration = getSqlConnectionConfiguration();
    mysqldump({
      connection: {
        host: sqlConfiguration.host,
        user: sqlConfiguration.user,
        password: sqlConfiguration.password,
        database: sqlConfiguration.database
      },
      dumpToFile: exportFile
    });
  });

  
};
