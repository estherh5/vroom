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
    // Half the cores, not vitest's default of all-but-one: on 2026-10-26 parallel
    // suites across sessions pushed the 16GB Mac to 6.4/7.2GB swap and paged out
    // the always-on launchd servers. Fleet-wide cap; see vitals a331032.
    maxWorkers: "50%",
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
