import { spawn, spawnSync } from "node:child_process";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src", "!src/**/*.spec.*"],
  format: "esm",
  sourcemap: true,
  bundle: false,
  clean: true,
  watch: true,
  async onSuccess() {
    spawnSync("node", ["scripts/copy-graphql-schemas-to-dist.js"]);
    const app = spawn("node", ["-r", "dotenv/config", "dist/main"]);
    app.stdout.pipe(process.stdout);
    return () => {
      app.kill();
    };
  },
});
