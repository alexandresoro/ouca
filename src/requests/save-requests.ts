import { ChildProcess, spawn } from "child_process";
import { format } from "date-fns";
import {
  getSqlConnectionConfiguration
} from "../sql/sql-connection";
import { DATE_PATTERN } from "../utils/constants";
import { logger } from "../utils/logger";

const DUMP_FILE_NAME = "sauvegarde_base_naturaliste_";
const SQL_EXTENSION = ".sql";

const executeSqlDump = async (): Promise<string> => {
  return new Promise((resolve, reject): void => {
    let stdout = "";
    let stderr = "";

    const connectionConfig = getSqlConnectionConfiguration();

    const dumpParams: string[] = [
      `--user=${connectionConfig.user}`,
      `--password=${connectionConfig.password}`,
      "--default-character-set=utf8",
      "--skip-triggers",
      `--host=${connectionConfig.host}`,
      `--port=${connectionConfig.port}`,
      connectionConfig.database
    ];

    const dumpProcess: ChildProcess = spawn("mysqldump", dumpParams);

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

export const saveDatabaseRequest = async (): Promise<string> => {
  try {
    return await executeSqlDump();
  } catch (error) {
    logger.error(
      "L'extraction de la base de données n'a pas pu être effectuée",
      error
    );
    return Promise.reject(error);
  }
};

export const saveDatabaseFileNameRequest = (): string => {
  return DUMP_FILE_NAME + format(new Date(), DATE_PATTERN) + SQL_EXTENSION;
};
