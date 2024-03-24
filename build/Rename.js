const fs = require("fs-extra");
const path = require("path");

const folder = path.resolve(path.join(__dirname, "../", "src", "textures", "tile"));
for (const file of fs.readdirSync(folder)) {
   fs.renameSync(path.join(folder, file), path.join(folder, file.slice(4)));
}
