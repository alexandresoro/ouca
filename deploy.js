const { existsSync } = require("fs");
const { mkdir, copyFile } = require("fs").promises;

const copyPackage = async () => {
  const isDistExists = existsSync("dist");
  if (!isDistExists) {
    await mkdir("dist");
  }
  await copyFile("package.json", "dist/package.json");
};

copyPackage();
