const fs = require("fs-extra");

module.exports = {
   packagerConfig: {
      icon: "./icons/icon",
   },
   rebuildConfig: {},
   makers: [
      {
         name: "@electron-forge/maker-zip",
         platforms: ["win32", "linux"],
      },
   ],
   hooks: {
      generateAssets: () => {
         fs.copySync("../dist", "./dist");
      },
   },
};
