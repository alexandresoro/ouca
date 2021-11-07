import { utils, write, writeFile } from "xlsx";

export const writeToExcel = (
  objects: unknown[],
  headers: string[],
  worksheetName: string
): unknown => {
  const workbook = utils.book_new();

  const worksheet = utils.json_to_sheet(objects, {
    header: headers,
    dateNF: "dd/mm/yyyy"
  });

  utils.book_append_sheet(workbook, worksheet, worksheetName);

  return write(workbook, {
    bookType: "xlsx",
    type: "buffer"
  });
};

export const writeToExcelFile = (
  objects: unknown[],
  headers: string[],
  worksheetName: string,
  fileName: string
): unknown => {
  const workbook = utils.book_new();

  const worksheet = utils.json_to_sheet(objects, {
    header: headers,
    dateNF: "dd/mm/yyyy"
  });

  utils.book_append_sheet(workbook, worksheet, worksheetName);

  return writeFile(workbook, fileName, {
    bookType: "xlsx",
  });
};
