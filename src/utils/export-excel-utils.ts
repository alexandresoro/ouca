import * as XLSX from "xlsx";

export const writeToExcel = (
  objects: unknown[],
  headers: string[],
  worksheetName: string
): unknown => {
  const workbook = XLSX.utils.book_new();

  const worksheet = XLSX.utils.json_to_sheet(objects, {
    header: headers,
    dateNF: "dd/mm/yyyy"
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

  return XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer"
  });
};
