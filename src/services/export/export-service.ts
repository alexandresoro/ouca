import { Age } from "basenaturaliste-model/age.object";
import { EntiteSimple } from "basenaturaliste-model/entite-simple.object";
import * as _ from "lodash";
import * as XLSX from "xlsx";

export interface ExcelColumnProperties {
  key: string;
  columnName: string;
  dataType: string;
}

export class ExportService {
  fields: ExcelColumnProperties[] = [
    { key: "libelle", columnName: "Âge", dataType: "s" }
  ];

  private ALPHA: string[] = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z"
  ];

  public writeToExcel = (
    objects: any[],
    fields: ExcelColumnProperties[],
    worksheetName: string
  ): any => {
    /*
    const self = this;

    try {
      const lineNumber: number = 1;
      const worksheetColumns: any[] = [];

      _.forEach(fields, () => {
        worksheetColumns.push({ wch: 25 });
      });

      // Create tehe workbook
      const workbook: XLSX.WorkBook = {
        SheetNames: [spreadsheetName],
        Sheets: {
          [spreadsheetName]: {
            "!ref": "A1:",
            "!cols": worksheetColumns
          }
        }
      };

      // Write the table header
      for (let columnNumber = 0; columnNumber < fields.length; columnNumber++) {
        worksheetColumns.push({ wch: 25 });
        const currentCell = self.calculateCurrentCellReference(
          columnNumber,
          lineNumber
        );
        workbook.Sheets[spreadsheetName][currentCell] = {
          t: "s",
          v: fields[columnNumber].columnName,
          s: {
            font: { sz: "11", bold: true },
            border: {
              left: { style: "thin", color: { auto: 1 } },
              right: { style: "thin", color: { auto: 1 } },
              top: { style: "thin", color: { auto: 1 } },
              bottom: { style: "thin", color: { auto: 1 } }
            }
          }
        };
      }

      lineNumber++;

      // Write the lines
      objects.forEach((rowObject) => {
        for (
          let columnNumber = 0;
          columnNumber < fields.length;
          columnNumber++
        ) {
          const displayValue = rowObject[fields[columnNumber].key];

          const currentCell = self.calculateCurrentCellReference(
            columnNumber,
            lineNumber
          );

          workbook.Sheets[spreadsheetName][currentCell] = {
            t: fields[columnNumber].dataType,
            v: displayValue,
            s: {
              font: { sz: "11", bold: false },
              border: {
                left: { style: "thin", color: { auto: 1 } },
                right: { style: "thin", color: { auto: 1 } },
                top: { style: "thin", color: { auto: 1 } },
                bottom: { style: "thin", color: { auto: 1 } }
              }
            }
          };
        }
        lineNumber++;
      });

      const lastColumnInSheet: number = fields.length - 1;

      const endOfRange: string = self.calculateCurrentCellReference(
        lastColumnInSheet,
        lineNumber
      );

      workbook.Sheets[spreadsheetName]["!ref"] += endOfRange;

      const fileName: string = spreadsheetName + ".xlsx";
*/

    const headers = ["colA", "colB", "colC"];
    const data = [
      { colA: 1, colB: 2, colC: 3 },
      { colA: 4, colB: 5, colC: 6 },
      { colA: 7, colB: 8, colC: 9 }
    ];

    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });

    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);
    const exportFileName = "worksheetName.xlsx";

    const wbout = XLSX.writeFile(workbook, exportFileName, {
      bookType: "xlsx",
      type: "binary"
    });

    /* generate a download */
    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i != s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    }

    return s2ab(wbout);

    /*saveAs(
      new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
      "sheetjs.xlsx"
    );
*/
    /*const ws_data = [["S", "h", "e", "e", "t", "J", "S"], [1, 2, 3, 4, 5]];
      const ws = XLSX.utils.aoa_to_sheet(ws_data);

      XLSX.utils.book_append_sheet(workbook1, ws, "Issues");
      console.log(XLSX.utils.sheet_to_txt(ws));

      const workbookOutput = XLSX.write(workbook1, {
        type: "base64",
        bookType: "xlsx",
        bookSST: false
      });

      return workbookOutput; */
    /*

      const s2ab = function(s) {
        const buffer = new ArrayBuffer(s.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i !== s.length; ++i) {
          view[i] = s.charCodeAt(i) & 0xff;
        }
        return buffer;
      };
      saveAs(
        new this.$window.Blob([s2ab(workbookOutput)], {
          type: "application/octet-stream"
        }),
        fileName
      );
      self.excelFinished = false;
      self.excelProjects = [];
      self.exceloffset = 0;

    } catch (e) {
      console.error("Error in Excel Save: " + e.message);
    }*/
  }

  private calculateCurrentCellReference = (
    columnNumber: number,
    lineNumber: number
  ): string => {
    return columnNumber > 25
      ? this.ALPHA[Math.floor(columnNumber / 26 - 1)] +
          this.ALPHA[columnNumber % 26] +
          lineNumber
      : this.ALPHA[columnNumber] + lineNumber;
  }
}
