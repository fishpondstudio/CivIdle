const glob = require("glob");
const sharp = require("sharp");

glob("./src/textures/people/*.png", (err, files) => {
   if (err) {
      console.error(err);
      return;
   }
   files.forEach(async (f) => {
      sharp(await sharp(f).resize({ width: 350 }).toBuffer())
         .toFormat("png", { palette: true })
         .toFile(f);
   });
});
