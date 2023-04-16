const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs-extra");

console.log("========== Building CivIdle ==========");

const rootPath = path.resolve(path.join(__dirname, "../"));

cmd(`npm run build`, rootPath);

console.log("========== Building Qt ==========");

fs.copySync(path.join(rootPath, "dist"), path.join(rootPath, "qt", "cividle-win32-x64", "dist"));

console.log("========== Uploading to Steam ==========");

if (!process.env.STEAMWORKS_PATH) {
   console.error("STEAMWORKS_PATH is not defined");
   return;
}

fs.copySync(
   path.join(rootPath, "qt", "out", "cividle-win32-x64"),
   path.join(process.env.STEAMWORKS_PATH, "cividle-win32-x64")
);

cmd(
   path.join(process.env.STEAMWORKS_PATH, "builder_linux", "steamcmd.sh") + " +runscript ../cividle.txt",
   process.env.STEAMWORKS_PATH
);

function cmd(command, cwd = null) {
   console.log(`>> Command: ${command} (CWD: ${cwd})`);
   execSync(command, { stdio: "inherit", cwd: cwd });
}

module.exports = { cmd };
