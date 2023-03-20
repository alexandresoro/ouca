import { existsSync, mkdirSync } from "node:fs";

export const DOWNLOAD_ENDPOINT = "/download";

// The folder that is mapped to the download endpoint
const PUBLIC_DIR = "./public";

export const PUBLIC_DIR_PATH = new URL(`../${PUBLIC_DIR}`, import.meta.url);

const IMPORT_DIR = "uploads";

export const IMPORTS_DIR_PATH = new URL(`../${IMPORT_DIR}`, import.meta.url);

export const IMPORT_REPORTS_DIR = "importReports";

export const IMPORT_REPORTS_DIR_PATH = new URL(`${PUBLIC_DIR_PATH.toString()}/${IMPORT_REPORTS_DIR}`);

export const checkAndCreateFolders = () => {
  // Create a public dir if does not exist
  // Used to serve some static content
  if (!existsSync(PUBLIC_DIR_PATH)) {
    mkdirSync(PUBLIC_DIR_PATH);
  }

  // Create the folder that contains importReports if does not exist
  if (!existsSync(IMPORT_REPORTS_DIR_PATH)) {
    mkdirSync(IMPORT_REPORTS_DIR_PATH);
  }

  // Create uploads dir if does not exist
  // Used to handle imports
  if (!existsSync(IMPORTS_DIR_PATH)) {
    mkdirSync(IMPORTS_DIR_PATH);
  }
};
