import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

export const DOWNLOAD_ENDPOINT = "/download";

// The folder that is mapped to the download endpoint
export const PUBLIC_DIR = "./public";

export const PUBLIC_DIR_PATH = path.join(process.cwd(), PUBLIC_DIR);

export const IMPORT_DIR = "./uploads";

export const IMPORTS_DIR_PATH = path.join(process.cwd(), IMPORT_DIR);

export const IMPORT_REPORTS_DIR = "/importReports";

export const LOGS_DIR = "./logs";

export const checkAndCreateFolders = () => {
  // Create a public dir if does not exist
  // Used to serve some static content
  if (!existsSync(PUBLIC_DIR_PATH)) {
    mkdirSync(PUBLIC_DIR_PATH);
  }

  // Create the folder that contains importReports if does not exist
  if (!existsSync(path.join(PUBLIC_DIR, IMPORT_REPORTS_DIR))) {
    mkdirSync(path.join(PUBLIC_DIR, IMPORT_REPORTS_DIR));
  }

  // Create uploads dir if does not exist
  // Used to handle imports
  if (!existsSync(IMPORTS_DIR_PATH)) {
    mkdirSync(IMPORTS_DIR_PATH);
  }

  // Create logs dir if does not exist
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR);
  }
};
