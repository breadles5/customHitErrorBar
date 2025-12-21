import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

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

export default defineConfig({
    build: {
        emptyOutDir: true,
        outDir: "dist",
        minify: false,
        sourcemap: false,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
            },
            output: {
                banner: "/*\n * find the original source code at https://github.com/breadles5/customhiterrorbar\n */",
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                assetFileNames: "[name][extname]",
                manualChunks: undefined,
            },
        },
        target: "esnext",
    },
    base: "",
    server: {
        port: 3000,
        strictPort: true,
        host: true,
    },
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
});
