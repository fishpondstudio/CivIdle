const path = require("path");
const { execSync } = require("child_process");

const rootPath = path.resolve(path.join(__dirname, "../"));
const texturesPath = path.join(rootPath, "src", "images", "textures.png");
const pngQuantPath = path.join(rootPath, "bin", "pngquant.exe --force --ext .png");
execSync(`${pngQuantPath} ${texturesPath}`);
