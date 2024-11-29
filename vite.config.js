import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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
    outDir: "dist/",
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
    // Worker bundling options
    worker: {
      format: "es",
      plugins: [],
      rollupOptions: {
        output: {
          entryFileNames: "[name].js",
        },
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        // Core modules
        "./js/elements.js",
        "./js/settings.js",
        "./js/timingWindows.js",
        "./js/socket.js",
        // Tick manager modules
        "./js/modules/tickManager/index.js",
        "./js/modules/tickManager/pool.js",
        "./js/modules/tickManager/renderer.js",
        "./js/modules/tickManager/creator.js",
      ],
    },
    // esbuild options for maximum minification
    target: "esnext",
    esbuild: {
      legalComments: "none",
      treeShaking: true,
      minifyIdentifiers: true,
      minifySyntax: true,
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
        const files = ["metadata.txt", "settings.json", "readme.md"];

        files.forEach((file) => {
          const src = resolve(__dirname, file);
          const dest = resolve(__dirname, "dist", file);
          copyFile(src, dest);
        });
      },
    },
  ],
});
