const { readdirSync, writeFileSync } = require("fs");

const rootPath = "./src";
const tsFileExtension = ".ts";
const indexFile = "index" + tsFileExtension;

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

const getSourceFiles = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .filter(dirent => dirent.name.endsWith(tsFileExtension))
    .map(dirent => dirent.name);

const buildIndexes = () => {
  const directories = getDirectories(rootPath);
  directories.forEach(directory => {
    let indexContent = "";
    const path = rootPath + "/" + directory;
    const sourceFilesWithoutExtension = getSourceFiles(path).map(sourceFile =>
      sourceFile.substring(0, sourceFile.length - tsFileExtension.length)
    );
    for (const sourceFile of sourceFilesWithoutExtension) {
      const exportFileStr = 'export * from "./' + sourceFile + '";\n';
      indexContent = indexContent + exportFileStr;
    }
    writeFileSync(path + "/" + indexFile, indexContent);
  });
};

buildIndexes();
