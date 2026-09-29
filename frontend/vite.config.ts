/// <reference types="vitest" />

import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  plugins: [tsConfigPaths(), tailwindcss(), viteReact()],
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    css: true,
  },
});
