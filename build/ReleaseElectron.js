const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs-extra");

console.log("========== Building CivIdle ==========");

const rootPath = path.resolve(path.join(__dirname, "../"));

const commitMessage = execSync("git log -1").toString("utf8");
const isRelease = commitMessage.toLowerCase().includes("[release]");

if (isRelease && process.env.STEAMWORKS_PATH) {
   console.log("========== Increase Build Number ==========");
   const versionFilePath = path.join(rootPath, "src", "scripts", "Version.json");
   const ver = JSON.parse(fs.readFileSync(versionFilePath, { encoding: "utf8" }));
   ver.build++;
   fs.writeFileSync(versionFilePath, JSON.stringify(ver));

   fs.copyFileSync(
      path.join(rootPath, "build", "CivIdle.vdf"),
      path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle.vdf"),
   );
   fs.copyFileSync(
      path.join(rootPath, "build", "CivIdle-Demo.vdf"),
      path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle-Demo.vdf"),
   );

   replaceVersion(path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle.vdf"));
   replaceVersion(path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle-Demo.vdf"));

   function replaceVersion(path) {
      const content = fs.readFileSync(path, { encoding: "utf8" });
      fs.writeFileSync(path, content.replace("@Version", ver.build));
   }
}

cmd("npm run build", rootPath);

console.log("========== Copy to Electron ==========");

fs.copySync(path.join(rootPath, "dist"), path.join(rootPath, "electron", "dist"));

console.log("========== Build Electron ==========");

cmd("npm run package -- --platform=win32", path.join(rootPath, "electron"));

console.log("========== Uploading to Steam ==========");

if (!process.env.STEAMWORKS_PATH) {
   console.error("STEAMWORKS_PATH is not defined");
   process.exit();
}

fs.removeSync(path.join(process.env.STEAMWORKS_PATH, "cividle-win32-x64"));

fs.copySync(
   path.join(rootPath, "electron", "out", "cividle-win32-x64"),
   path.join(process.env.STEAMWORKS_PATH, "cividle-win32-x64"),
);

cmd(
   `${path.join(process.env.STEAMWORKS_PATH, "builder_linux", "steamcmd.sh")} +runscript ../cividle.txt`,
   process.env.STEAMWORKS_PATH,
);

function cmd(command, cwd = null) {
   console.log(`>> Command: ${command} (CWD: ${cwd})`);
   execSync(command, { stdio: "inherit", cwd: cwd });
}
