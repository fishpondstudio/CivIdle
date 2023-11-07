const fs = require("fs-extra");

fs.removeSync("./dist");
fs.removeSync("./compiled");
fs.removeSync("./out");
fs.removeSync("./save");
