import glob from "glob";
import { renameSync } from "node:fs";
import sharp from "sharp";

(async () => {
   const pngFiles = glob.sync("./dist/assets/*.png");
   const jpgFiles = glob.sync("./dist/assets/*.jpg");
   for (const file of pngFiles) {
      await sharp(file).png({ effort: 10, compressionLevel: 9 }).toFile(`${file}_o`);
      renameSync(`${file}_o`, file);
   }
   for (const file of jpgFiles) {
      await sharp(file).jpeg({ mozjpeg: true }).toFile(`${file}_o`);
      renameSync(`${file}_o`, file);
   }
})();
