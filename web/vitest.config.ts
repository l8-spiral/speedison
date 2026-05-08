import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true,
    css: false,
    // Playwright e2e specs run via `npm run e2e` (not vitest) — exclude them
    // from vitest discovery so it doesn't try to import @playwright/test.
    exclude: ["node_modules/**", "e2e/**", ".next/**"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
