import * as XLSX from "xlsx";

export const writeToExcel = (
  objects: any[],
  headers: string[],
  worksheetName: string
): any => {
  const workbook = XLSX.utils.book_new();

  const worksheet = XLSX.utils.json_to_sheet(objects, { header: headers });

  XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

  return XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer"
  });
};
