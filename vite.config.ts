import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import Spritesmith from "vite-plugin-spritesmith";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
   return {
      base: "",
      plugins: [
         react(),
         Spritesmith({
            watch: command === "serve",
            src: {
               cwd: "./src/textures",
               glob: "**/*.png",
            },
            target: {
               image: "./src/images/textures.png",
               css: [["./src/images/textures.json", { format: "json_texture" }]],
            },
            spritesmithOptions: {
               padding: 1,
            },
         }),
      ],
      server: {
         port: 3000,
         host: true,
      },
      build: {
         target: "es2015",
      },
   };
});
