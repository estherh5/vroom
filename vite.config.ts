/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Vite emits no source maps in a production build unless asked, unlike Next.
  // Without them every stack trace flare receives names a minified chunk and a
  // column number, which is a group with no culprit and nothing to act on.
  build: {
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
