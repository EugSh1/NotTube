import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "next/server": "next/server.js",
            "next/headers": "next/headers.js"
        }
    },
    test: {
        environment: "node",
        fileParallelism: false,
        globalSetup: "./test/vitest.globalSetup.ts",
        deps: {
            inline: ["next-auth", "next"]
        },
        server: {
            deps: {
                external: ["**/node_modules/@next-auth/**"]
            }
        }
    }
});
