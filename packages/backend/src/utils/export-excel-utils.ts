// eslint-disable-next-line import/default
import exceljs from "exceljs";
// eslint-disable-next-line import/no-named-as-default-member
const { stream } = exceljs;

export const writeToExcelFile = async (
  objects: { [key: string]: unknown }[],
  worksheetName: string,
  fileName: string
): Promise<void> => {
  const workbook = new stream.xlsx.WorkbookWriter({
    filename: fileName,
    useStyles: true,
  });

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

  sheet.commit();
  await workbook.commit();
};
