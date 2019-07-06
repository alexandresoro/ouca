import { ChildProcess, spawn } from "child_process";
import * as fs from "fs";
import { promises } from "fs";
import * as _ from "lodash";
import moment from "moment";
import { HttpParameters } from "../http/httpParameters";
import { getExportFolderPath } from "../sql-api/sql-api-common";
import {
  DEFAULT_DATABASE_NAME,
  getSqlConnectionConfiguration
} from "../sql-api/sql-connection";

const DUMP_FOLDER_PATH: string = "/sauvegardes";
const DUMP_FILE_NAME: string = "/sauvegarde_base_naturaliste_";
const SQL_EXTENSION: string = ".sql";

export const saveDatabase = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters,
  isDockerMode: boolean
): Promise<{}> => {
  let dumpFolder: string = DUMP_FOLDER_PATH;

  if (!isDockerMode) {
    const exportFolderPath = await getExportFolderPath();
    dumpFolder = exportFolderPath + dumpFolder;
  }

  const dumpFile =
    dumpFolder + DUMP_FILE_NAME + moment().format("YYYY-MM-DD") + SQL_EXTENSION;

  // Create dump folder if it does not exist
  if (!fs.existsSync(dumpFolder)) {
    fs.mkdirSync(dumpFolder);
  }

  const dumpResult: string = await executeSqlDump(isDockerMode);

  try {
    await promises.writeFile(dumpFile, dumpResult);
    return {
      success: true
    };
  } catch (error) {
    console.error("Le fichier n'a pas pu être écrit.", error);
  }
};

const executeSqlDump = async (isRemoteDump: boolean): Promise<string> => {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    const connectionConfig = getSqlConnectionConfiguration();

    let commonDumpParams: string[] = [
      "--user=" + connectionConfig.user,
      "--password=" + connectionConfig.password,
      "--default-character-set=utf8",
      "--skip-triggers",
      DEFAULT_DATABASE_NAME
    ];

    if (isRemoteDump) {
      commonDumpParams = _.concat(
        "--host=" + connectionConfig.host,
        "--port=" + connectionConfig.port,
        commonDumpParams
      );
    }

    const dumpProcess: ChildProcess = spawn("mysqldump", commonDumpParams);

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
