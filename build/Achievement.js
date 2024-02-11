const { readdirSync, existsSync } = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const dir = "assets/achievements/";

const result = readdirSync(dir);
result.forEach((p) => {
   if (p.endsWith(".jpg") && !p.endsWith("_.jpg")) {
      const target = path.join(dir, p.replace(".jpg", "_.jpg"));
      if (!existsSync(target)) {
         execSync(`magick ${path.join(dir, p)} -colorspace Gray -brightness-contrast 30x-30 ${target}`);
      }
   }
});
