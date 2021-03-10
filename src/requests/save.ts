import { ChildProcess, spawn } from "child_process";
import { format } from "date-fns";
import {
  DEFAULT_DATABASE_NAME,
  getSqlConnectionConfiguration
} from "../sql-api/sql-connection";
import { DATE_PATTERN } from "../utils/constants";
import { options } from "../utils/options";

const DUMP_FILE_NAME = "sauvegarde_base_naturaliste_";
const SQL_EXTENSION = ".sql";

const executeSqlDump = async (isRemoteDump: boolean): Promise<string> => {
  return new Promise((resolve, reject): void => {
    let stdout = "";
    let stderr = "";

    const connectionConfig = getSqlConnectionConfiguration();

    let commonDumpParams: string[] = [
      `--user=${connectionConfig.user}`,
      `--password=${connectionConfig.password}`,
      "--default-character-set=utf8",
      "--skip-triggers",
      DEFAULT_DATABASE_NAME
    ];

    if (isRemoteDump) {
      commonDumpParams = commonDumpParams.concat(
        `--host=${connectionConfig.host}`,
        `--port=${connectionConfig.port}`
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

export const saveDatabase = async (): Promise<string> => {
  try {
    return await executeSqlDump(options.docker);
  } catch (error) {
    console.error(
      "L'extraction de la base de données n'a pas pu être effectuée",
      error
    );
    return Promise.reject(error);
  }
};

export const saveDatabaseFileName = (): string => {
  return DUMP_FILE_NAME + format(new Date(), DATE_PATTERN) + SQL_EXTENSION;
};
