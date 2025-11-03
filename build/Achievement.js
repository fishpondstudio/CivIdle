const sharp = require("sharp");
const { readdirSync, existsSync } = require("fs");
const path = require("path");


const dir = "assets/achievements/";

const result = readdirSync(dir);
result.forEach((p) => {
   if (p.endsWith(".jpg") && !p.endsWith("_.jpg")) {
      const target = path.join(dir, p.replace(".jpg", "_.jpg"));
      if (!existsSync(target)) {
         sharp(path.join(dir, p)).grayscale().modulate({ lightness: 12.5 }).toFile(target);
      }
   }
});
