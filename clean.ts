import { promises } from "fs";

const cleanDist = async () => {
  await promises.rmdir("dist", { recursive: true });
};

cleanDist();
