const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs-extra");

console.log("========== Building CivIdle ==========");

const rootPath = path.resolve(path.join(__dirname, "../"));

if (process.env.STEAMWORKS_PATH) {
   console.log("========== Increase Build Number ==========");
   const versionFilePath = path.join(rootPath, "src", "scripts", "Version.json");
   const ver = JSON.parse(fs.readFileSync(versionFilePath, { encoding: "utf8" }));
   ver.build++;
   fs.writeFileSync(versionFilePath, JSON.stringify(ver));
   console.log(`🔔 Build Number: ${ver.build}`);
   fs.copyFileSync(
      path.join(rootPath, "build", "CivIdle.vdf"),
      path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle.vdf"),
   );
   fs.copyFileSync(
      path.join(rootPath, "build", "CivIdle-Linux.vdf"),
      path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle-Linux.vdf"),
   );

   replaceVersion(path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle.vdf"));
   replaceVersion(path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle-Linux.vdf"));

   function replaceVersion(path) {
      const content = fs.readFileSync(path, { encoding: "utf8" });
      fs.writeFileSync(path, content.replace("@Version", ver.build));
   }
}

cmd("npm run build", rootPath);
cmd("npm run optimize", rootPath);

if (process.env.STEAMWORKS_PATH) {
   const ver = JSON.parse(fs.readFileSync(versionFilePath, { encoding: "utf8" }));
   cmd("sentry-cli sourcemaps inject ./dist/", rootPath);
   cmd(`sentry-cli sourcemaps upload --org fish-pond-studio --project cividle --release Build.${ver.build} ./dist/ --log-level=debug`, rootPath);
}

console.log("========== Copy to Electron ==========");

fs.copySync(path.join(rootPath, "dist"), path.join(rootPath, "electron", "dist"));

console.log("========== Build Electron ==========");

cmd("npm run package -- --platform=win32,linux", path.join(rootPath, "electron"));

console.log("========== Uploading to Steam ==========");

if (!process.env.STEAMWORKS_PATH) {
   console.error("STEAMWORKS_PATH is not defined");
   process.exit();
}

fs.removeSync(path.join(process.env.STEAMWORKS_PATH, "cividle-win32-x64"));
fs.removeSync(path.join(process.env.STEAMWORKS_PATH, "cividle-linux-x64"));

fs.copySync(
   path.join(rootPath, "electron", "out", "cividle-win32-x64"),
   path.join(process.env.STEAMWORKS_PATH, "cividle-win32-x64"),
);

fs.copySync(
   path.join(rootPath, "electron", "out", "cividle-linux-x64"),
   path.join(process.env.STEAMWORKS_PATH, "cividle-linux-x64"),
);

cmd(
   `${path.join(process.env.STEAMWORKS_PATH, "builder_linux", "steamcmd.sh")} +runscript ../cividle.txt`,
   process.env.STEAMWORKS_PATH,
);

function cmd(command, cwd = null) {
   console.log(`>> Command: ${command} (CWD: ${cwd})`);
   execSync(command, { stdio: "inherit", cwd: cwd });
}
