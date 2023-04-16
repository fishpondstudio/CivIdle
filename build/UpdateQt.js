const path = require("path");
const fs = require("fs-extra");
const glob = require("glob");

const qtPath = "C:/Users/Ruoyu/Projects/CivIdle-Qt/build-CivIdle-Desktop_Qt_6_5_0_MSVC2019_64bit-Release/release";
const rootPath = path.resolve(path.join(__dirname, "../"));
const targetPath = path.join(rootPath, "qt", "cividle-win32-x64");

fs.emptyDirSync(targetPath);
fs.copySync(qtPath, targetPath);

const globPattern = path.join(targetPath, "**", "*.{cpp,obj,h}").replace(/\\/g, "/");
glob.sync(globPattern).forEach(removeFile);

function removeFile(f) {
   console.log(`Removing ${f}`);
   fs.removeSync(f);
}
