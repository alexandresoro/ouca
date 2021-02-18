import { readdirSync, writeFileSync, PathLike } from "fs";

const rootPath = "./src";
const tsFileExtension = ".ts";
const indexFile = "index" + tsFileExtension;

const getDirectories = (source: PathLike) =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

const getSourceFiles = (source: PathLike) =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .filter(dirent => dirent.name.endsWith(tsFileExtension))
    .filter(dirent => dirent.name !== indexFile)
    .map(dirent => dirent.name);

const buildIndexesForDirectory = (directoryPath: string) => {

  const subDirectories = getDirectories(directoryPath);
  subDirectories.map(directoryPath => rootPath + "/" + directoryPath).forEach(buildIndexesForDirectory);

  let indexContent = "";

  for (const subDirectory of subDirectories) {
    const exportDirectoryStr = 'export * from "./' + subDirectory + '";\n';
    indexContent = indexContent + exportDirectoryStr;
  }

  const sourceFilesWithoutExtension = getSourceFiles(directoryPath).map(sourceFile =>
    sourceFile.substring(0, sourceFile.length - tsFileExtension.length)
  );
  for (const sourceFile of sourceFilesWithoutExtension) {
    const exportFileStr = 'export * from "./' + sourceFile + '";\n';
    indexContent = indexContent + exportFileStr;
  }
  writeFileSync(directoryPath + "/" + indexFile, indexContent);
}

buildIndexesForDirectory(rootPath);
