import { ChildProcess, spawn } from "child_process";
import * as fs from "fs";
import { promises } from "fs";
import moment from "moment";
import { HttpParameters } from "../http/httpParameters";
import {
  DEFAULT_DATABASE_NAME,
  getSqlConnectionConfiguration
} from "../sql/sql-connection";
import { getExportFolderPath } from "./import";

const DUMP_FOLDER_PATH: string = "/sauvegardes";
const DUMP_FILE_NAME: string = "/sauvegarde_base_naturaliste_";
const SQL_EXTENSION: string = ".sql";

export const saveDatabase = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<{}> => {
  const exportFolderPath = await getExportFolderPath();
  const dumpFolder = exportFolderPath + DUMP_FOLDER_PATH;
  const dumpFile =
    dumpFolder + DUMP_FILE_NAME + moment().format("YYYY-MM-DD") + SQL_EXTENSION;

  // Create dump folder if it does not exist
  if (!fs.existsSync(dumpFolder)) {
    fs.mkdirSync(dumpFolder);
  }

  const dumpResult: string = await executeSqlDump();

  try {
    await promises.writeFile(dumpFile, dumpResult);
    return {
      success: true
    };
  } catch (error) {
    console.error("Le fichier n'a pas pu être écrit.", error);
  }
};

const executeSqlDump = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    const connectionConfig = getSqlConnectionConfiguration();

    const dumpProcess: ChildProcess = spawn("mysqldump", [
      "--user=" + connectionConfig.user,
      "--password=" + connectionConfig.password,
      "--default-character-set=utf8",
      "--skip-triggers",
      DEFAULT_DATABASE_NAME
    ]);

    dumpProcess.stdout.on("data", (contents) => {
      stdout += contents;
    });
    dumpProcess.stderr.on("data", (contents) => {
      stderr += contents;
    });
    dumpProcess.on("error", reject).on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr));
      }
    });
  });
};
