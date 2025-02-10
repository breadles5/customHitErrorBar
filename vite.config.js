import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Function to copy files to dist
const copyFile = (src, dest) => {
    try {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${src} to dist directory`);
    } catch (error) {
        console.error(`Error copying ${src}:`, error);
    }
};

export default defineConfig({
    build: {
        // Output to dist directory
        emptyOutDir: true,
        outDir: "../../customHitErrorBar",
        // Use esbuild for better minification
        minify: "esbuild",
        // Generate sourcemaps for debugging
        sourcemap: true,
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

        // Optimize dependencies
        optimizeDeps: {
            include: ["src/index.ts", "src/**/*.ts"],
        },
        // esbuild options for maximum minification
        target: "esnext",
        esbuild: {
            legalComments: "none",
            treeShaking: true,
            minifyIdentifiers: false,
            minifySyntax: false,
            minifyWhitespace: true,
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
});
