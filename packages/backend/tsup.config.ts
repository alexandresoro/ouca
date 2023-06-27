import { ChildProcess, spawn } from "node:child_process";
import { defineConfig } from "tsup";

let app: ChildProcess;

const onSuccess = async () => {
  if (app && !app.killed) {
    app.kill();
  }
  app = spawn("node", ["-r", "dotenv/config", "dist/main"]);
  app.stdout?.pipe(process.stdout);
  return () => {
    app.kill();
  };
};

export default defineConfig([
  // common
  {
    entry: ["../common/src", "!../common/src/**/*.spec.*"],
    outDir: "../common/dist",
    format: "esm",
    target: "es2022",
    sourcemap: true,
    bundle: false,
    clean: true,
    watch: "../common",
    onSuccess,
  },
  // backend
  {
    entry: ["src", "!src/**/*.spec.*"],
    format: "esm",
    target: "es2022",
    sourcemap: true,
    bundle: false,
    clean: true,
    watch: true,
    onSuccess,
  },
]);
