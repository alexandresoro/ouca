import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src", "!src/**/*.spec.*"],
  format: "esm",
  target: "es2022",
  sourcemap: true,
  bundle: false,
  clean: true,
});
