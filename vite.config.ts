import { defineConfig } from "vite";
import path, { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { ConfigEnv } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Function to copy files to dist
const copyFile = (src: string, dest: string) => {
    try {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${src} to dist directory`);
    } catch (error) {
        console.error(`Error copying ${src}:`, error);
    }
};

export default defineConfig(({ mode }) => ({
    build: {
        emptyOutDir: true,
        outDir: "dist",
        minify: mode === "production" || mode === "development",
        // Generate sourcemaps based on mode
        sourcemap: !mode.includes("ci"),
        // Configure rollup options
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
            },
            output: {
                // Optimize chunk size
                manualChunks: undefined,
                // Prevent hash generation in filenames
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                assetFileNames: "[name][extname]",
            },
        },
        target: "esnext",
        esbuild: {
            legalComments: "none",
            treeShaking: true,
            minifyIdentifiers: mode === "production" || mode === "development",
            minifySyntax: mode === "production" || mode === "development",
            minifyWhitespace: mode === "production" || mode === "development",
        },
    },
    // Base public path - important for worker loading
    base: "",
    // Development server config
    server: {
        port: 3000,
        strictPort: true,
        host: true,
    },
    // Custom plugin to copy files
    plugins: [
        {
            name: "copy-assets",
            closeBundle() {
                const files = ["metadata.txt", "settings.json", "README.md"];

                files.forEach((file) => {
                    const src = resolve(__dirname, file);
                    const dest = resolve(__dirname, "../../customHitErrorBar", file);
                    copyFile(src, dest);
                });
            },
        },
    ],
    // Worker bundling options
    worker: {
        format: "es",
        rollupOptions: {
            output: {
                // Optimize chunk size
                manualChunks: undefined,
                // Prevent hash generation in filenames
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                assetFileNames: "[name][extname]",
            },
        },
    },
}));
