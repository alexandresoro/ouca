import { randomUUID } from 'crypto';
import path from 'path';
import { writeToExcelFile } from '../utils/export-excel-utils';
import { PUBLIC_DIR } from '../utils/paths';
import { findAllDepartements } from "./entities/departement-service";


export const generateDepartementsExport = async (): Promise<string> => {
  const departementsDb = await findAllDepartements({ includeCounts: false });

  const objectsToExport = departementsDb.map((object) => {
    return {
      Département: object.code
    };
  });

  const fileName = randomUUID();
  await writeToExcelFile(objectsToExport, [], "Départements", path.join(PUBLIC_DIR, fileName));
  return fileName;
};