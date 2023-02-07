import { spawn, spawnSync } from "node:child_process";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src", "!src/**/*.spec.*"],
  sourcemap: true,
  bundle: false,
  clean: true,
  watch: true,
  async onSuccess() {
    spawnSync("node", ["scripts/copy-graphql-schemas-to-dist.mjs"]);
    const app = spawn("node", ["main"], { cwd: "./dist" });
    app.stdout.pipe(process.stdout);
    return () => {
      app.kill();
    };
  },
});
