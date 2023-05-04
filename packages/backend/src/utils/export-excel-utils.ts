import exceljs from "exceljs";

export const writeExcelToBuffer = async (
  objects: { [key: string]: unknown }[],
  worksheetName: string
): Promise<exceljs.Buffer> => {
  // eslint-disable-next-line import/no-named-as-default-member
  const workbook = new exceljs.Workbook();
  const sheet = workbook.addWorksheet(worksheetName);
  if (objects?.length) {
    sheet.columns = Object.keys(objects[0]).map((column) => {
      return {
        header: column,
        key: column,
        ...(column === "Date"
          ? {
              style: {
                numFmt: "dd/mm/yyyy",
              },
            }
          : {}),
      };
    });
    objects.forEach((object) => {
      sheet.addRow(object).commit();
    });
  }
  return workbook.xlsx.writeBuffer();
};
