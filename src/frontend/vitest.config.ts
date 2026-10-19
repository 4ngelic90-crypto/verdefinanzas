import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
    // Pin the worker bounds explicitly. Some sandboxes export a
    // VITEST_MIN_THREADS/VITEST_MAX_THREADS pair that conflicts (min > max),
    // which makes Tinypool throw before any test runs. An explicit, consistent
    // pair here keeps the suite runnable regardless of the ambient environment.
    minWorkers: 1,
    maxWorkers: 1,
  },
});
