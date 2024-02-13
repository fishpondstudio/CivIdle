import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import Spritesmith from "vite-plugin-spritesmith";

const NO_SPRITE_WATCH = false;

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
   return {
      base: "",
      plugins: [
         react(),
         buildAtlas("rome", command === "serve"),
         buildAtlas("people", command === "serve"),
         buildAtlas("buildings", command === "serve"),
         buildAtlas("tiles", command === "serve"),
         buildAtlas("flags", command === "serve"),
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
      watch: !NO_SPRITE_WATCH && watch,
      src: {
         cwd: `./src/textures/${folder}`,
         glob: "*.png",
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
