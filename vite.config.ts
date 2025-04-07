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
        minify: mode.match(/production|development/) ? "esbuild" : false,
        // Generate sourcemaps based on mode
        sourcemap: !mode.match(/ci|production/),
        // Configure rollup options
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
            },
            output: {
                banner: String("/*\n * find the original source code at https://github.com/breadles5/customhiterrorbar\n */"),
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
            legalComments: "eof",
            treeShaking: true,
            minifyIdentifiers: mode.match(/production|development/),
            minifySyntax: mode.match(/production|development/),
            minifyWhitespace: mode.match(/production|development/),
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
                const files = ["metadata.txt", "settings.json"];

                files.forEach((file) => {
                    const src = resolve(__dirname, file);
                    const dest = resolve(__dirname, "dist", file);
                    copyFile(src, dest);
                });
            },
        },
    ],
}));
