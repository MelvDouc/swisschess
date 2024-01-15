// @ts-check

import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  format: ["esm", "cjs"],
  keepNames: true,
  external: ["@faker-js/faker"]
});