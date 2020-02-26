const { rmdir } = require("fs").promises;

const cleanDist = async () => {
  await rmdir("dist", { recursive: true });
};

cleanDist();
