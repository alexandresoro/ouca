import { ChildProcess, spawn } from "child_process";
import * as _ from "lodash";
import moment from "moment";
import { HttpParameters } from "../http/httpParameters";
import {
  DEFAULT_DATABASE_NAME,
  getSqlConnectionConfiguration
} from "../sql-api/sql-connection";

const DUMP_FILE_NAME: string = "sauvegarde_base_naturaliste_";
const SQL_EXTENSION: string = ".sql";

const executeSqlDump = async (isRemoteDump: boolean): Promise<string> => {
  return new Promise((resolve, reject): void => {
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

export const saveDatabase = async (
  httpParameters: HttpParameters,
  isDockerMode: boolean
): Promise<string> => {
  try {
    return await executeSqlDump(isDockerMode);
  } catch (error) {
    console.error(
      "L'extraction de la base de données n'a pas pu être effectuée",
      error
    );
    return Promise.reject(error);
  }
};

export const saveDatabaseFileName = (): string => {
  return DUMP_FILE_NAME + moment().format("YYYY-MM-DD") + SQL_EXTENSION;
};
