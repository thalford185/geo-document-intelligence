import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    include: ["tests/unit/**/*.test.*"],
    environment: "jsdom",
    setupFiles: ["/tests/unit/setup.ts"],
  },
});
