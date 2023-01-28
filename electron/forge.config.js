const fs = require("fs-extra");

module.exports = {
   packagerConfig: {
      icon: "./icons/icon",
   },
   rebuildConfig: {},
   makers: [
      {
         name: "@electron-forge/maker-zip",
      },
   ],
   hooks: {
      generateAssets: () => {
         fs.copySync("../dist", "./dist");
      },
   },
};
