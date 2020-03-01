import { existsSync, promises } from "fs";

const copyPackage = async () => {
  const isDistExists = existsSync("dist");
  if (!isDistExists) {
    await promises.mkdir("dist");
  }
  await promises.copyFile("package.json", "dist/package.json");
};

copyPackage();
