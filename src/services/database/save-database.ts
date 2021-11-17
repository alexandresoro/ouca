import { ChildProcess, spawn } from "child_process";
import { format } from "date-fns";
import { promises } from "fs";
import path from "path";
import { DATE_PATTERN } from "../../utils/constants";
import { logger } from "../../utils/logger";
import options from "../../utils/options";
import { PUBLIC_DIR } from "../../utils/paths";

const DUMP_FILE_NAME = "sauvegarde_base_naturaliste_";
const SQL_EXTENSION = ".sql";

const executeSqlDump = async (): Promise<string> => {
  return new Promise((resolve, reject): void => {
    let stdout = "";
    let stderr = "";

    const dumpParams: string[] = [
      `--user=${options.dbUser}`,
      `--password=${options.dbPassword}`,
      "--default-character-set=utf8",
      "--skip-triggers",
      `--host=${options.dbHost}`,
      `--port=${options.dbPort}`,
      options.dbName
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

const getDatabaseFileName = (): string => {
  return DUMP_FILE_NAME + format(new Date(), DATE_PATTERN) + SQL_EXTENSION;
};

export const saveDatabaseRequest = async (): Promise<string> => {
  try {
    const dumpString = await executeSqlDump();
    const fileName = getDatabaseFileName();

    await promises.writeFile(path.join(PUBLIC_DIR, fileName), dumpString);

    return fileName;
  } catch (error) {
    logger.error(
      "L'extraction de la base de données n'a pas pu être effectuée",
      error
    );
    return Promise.reject(error);
  }
};