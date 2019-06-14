import fs from "fs";
import readline from "readline";
import { HttpParameters } from "../http/httpParameters.js";
export const importFile = async (
  isMockDatabaseMode: boolean,
  httpParameters: HttpParameters
): Promise<any> => {
  const myInterface = readline.createInterface({
    input: fs.createReadStream("file.csv")
  });

  let lineno = 0;
  myInterface.on("line", (line) => {
    lineno++;
    console.log("Line number " + lineno + ": " + line);
  });
  console.log("toto");
};
