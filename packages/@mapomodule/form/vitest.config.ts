import { defineConfig } from "vitest/config";

/** Local Vitest config for the `@mapomodule/form` package tests. */
export default defineConfig({
  test: {
    environment: "node",
  },
});
