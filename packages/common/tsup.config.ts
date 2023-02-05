import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src", "!src/**/*.spec.*"],
  sourcemap: true,
  bundle: false,
});
