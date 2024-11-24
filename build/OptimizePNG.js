const path = require("path");
const { execSync } = require("child_process");

const rootPath = path.resolve(path.join(__dirname, "../"));
const texturesPath = path.join(rootPath, "dist", "assets");
let pngQuantPath = path.join(rootPath, "bin", "pngquant --force --ext .png");
if (process.platform === "darwin") {
    pngQuantPath = path.join(rootPath, "bin", "pngquant_mac --force --ext .png");
}
execSync(`${pngQuantPath} *.png`, { cwd: texturesPath });
