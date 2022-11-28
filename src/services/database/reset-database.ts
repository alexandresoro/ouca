import { spawn } from "node:child_process";
import { logger } from "../../utils/logger";
import options from "../../utils/options";

const executeResetDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject): void => {
    let stdout = "";
    let stderr = "";

    // TODO check what happens on docker build with the schema path
    const resetProcess = spawn(
      "npx",
      ["prisma", "migrate", "reset", "--skip-generate", "--schema=../prisma/schema.prisma", "--force"],
      {
        env: { ...process.env, DATABASE_URL: options.database.prismaUrl },
      }
    );

    resetProcess.stdout.on("data", (contents) => {
      stdout += contents;
    });
    resetProcess.stderr.on("data", (contents) => {
      stderr += contents;
    });
    resetProcess.on("error", reject).on("close", (code) => {
      if (code === 0) {
        logger.debug(stdout);
        resolve();
      } else {
        reject(new Error(stderr));
      }
    });
  });
};

export const resetDatabase = async (): Promise<void> => {
  try {
    logger.warn("A reset of the database has been requested");
    await executeResetDatabase();
  } catch (error) {
    logger.error("La réinitialisation de la base de données n'a pas pu être effectuée", error);
    return Promise.reject(error);
  }
};
