import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import Spritesmith from "vite-plugin-spritesmith";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
   return {
      base: "",
      plugins: [
         react(),
         buildAtlas("rome", command === "serve"),
         buildAtlas("person", command === "serve"),
         buildAtlas("building", command === "serve"),
         buildAtlas("tile", command === "serve"),
         buildAtlas("flag", command === "serve"),
         buildAtlas("misc", command === "serve"),
      ],
      server: {
         port: 3000,
         host: true,
      },
      build: {
         target: "es2015",
      },
      test: {
         browser: {
            enabled: true,
            headless: true,
            name: "chrome",
         },
      },
   };
});

function buildAtlas(folder: string, watch: boolean) {
   return Spritesmith({
      watch: watch,
      src: {
         cwd: `./src/textures/${folder}`,
         glob: "*.png",
      },
      apiOptions: {
         generateSpriteName: (filePath: string) => {
            return `${folder.charAt(0).toUpperCase()}${folder.slice(1)}_${path.basename(filePath, ".png")}`;
         },
      },
      target: {
         image: `./src/images/textures_${folder}.png`,
         css: [[`./src/images/textures_${folder}.json`, { format: "json_texture" }]],
      },
      spritesmithOptions: {
         padding: 1,
      },
   });
}
