import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "tests/setup.ts",
    coverage: {
        provider: "istanbul",
        reporter: ["text", "html", "lcov"],
        exclude: ["**/*.ts"],
        include: ["src"],
    },
 },
});
