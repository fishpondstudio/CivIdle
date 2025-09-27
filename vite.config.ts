import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { defineConfig } from "vite";
import Spritesmith from "vite-plugin-spritesmith";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
   return {
      base: "",
      plugins: [
         react(),
         buildAtlas("rome", command === "serve"),
         buildAtlas("person1", command === "serve", "Person", "jpg"),
         buildAtlas("person2", command === "serve", "Person", "jpg"),
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
         sourcemap: true,
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

function buildAtlas(folder: string, watch: boolean, nameOverride?: string, format: "jpg" | "png" = "png") {
   return Spritesmith({
      watch: watch,
      src: {
         cwd: `./src/textures/${folder}`,
         glob: "*.png",
      },
      apiOptions: {
         generateSpriteName: (filePath: string) => {
            const name = nameOverride ?? `${folder.charAt(0).toUpperCase()}${folder.slice(1)}`;
            return `${name}_${path.basename(filePath, ".png")}`;
         },
      },
      target: {
         image: `./src/images/textures_${folder}.${format}`,
         css: [[`./src/images/textures_${folder}.json`, { format: "json_texture" }]],
      },
      spritesmithOptions: {
         padding: 2,
         exportOpts: {
            format: format,
         },
      },
   });
}
