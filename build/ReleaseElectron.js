const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const { rimrafSync } = require('rimraf')

console.log("========== Building CivIdle ==========");

const rootPath = path.resolve(path.join(__dirname, "../"));

let build = 0;

if (process.env.STEAMWORKS_PATH) {
   console.log("========== Increase Build Number ==========");
   const versionFilePath = path.join(rootPath, "src", "scripts", "Version.json");
   const ver = JSON.parse(fs.readFileSync(versionFilePath, { encoding: "utf8" }));
   build = ++ver.build;
   fs.writeFileSync(versionFilePath, JSON.stringify(ver));
   console.log(`🔔 Build Number: ${build}`);
   fs.copyFileSync(
      path.join(rootPath, "build", "CivIdle.vdf"),
      path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle.vdf"),
   );
   fs.copyFileSync(
      path.join(rootPath, "build", "CivIdle-Linux.vdf"),
      path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle-Linux.vdf"),
   );
   fs.copyFileSync(
      path.join(rootPath, "build", "CivIdle-macOS.vdf"),
      path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle-macOS.vdf"),
   );

   replaceVersion(path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle.vdf"));
   replaceVersion(path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle-Linux.vdf"));
   replaceVersion(path.join(process.env.STEAMWORKS_PATH, "cividle", "CivIdle-macOS.vdf"));

   function replaceVersion(path) {
      const content = fs.readFileSync(path, { encoding: "utf8" });
      fs.writeFileSync(path, content.replace("@Version", ver.build));
   }
}

cmd("npm run build", rootPath);
cmd("npm run optimize", rootPath);

if (build > 0) {
   cmd("sentry-cli sourcemaps inject ./dist/", rootPath);
   cmd(`sentry-cli sourcemaps upload --org fish-pond-studio --project cividle --release Build.${build} ./dist/`, rootPath);

   const sourceMaps = path.join(rootPath, "dist", "assets", "*.js.map");
   console.log(`rimraf ${sourceMaps}`)
   rimrafSync(sourceMaps, { glob: true });

   console.log("========== Upload to Web Server ==========");

   cmd("zip -r cividle.zip .", path.join(rootPath, "dist"));
   fs.ensureDirSync(path.join(rootPath, "out"));
   fs.removeSync(path.join(rootPath, "out", `cividle-${build}.zip`));
   fs.moveSync(path.join(rootPath, "dist", "cividle.zip"), path.join(rootPath, "out", `cividle-${build}.zip`));
   fs.writeJsonSync(path.join(rootPath, "out", "cividle-v1.json"), { build: build });
   cmd(`scp cividle-${build}.zip ubuntu@de.fishpondstudio.com:/opt/ota/`, path.join(rootPath, "out"));
   cmd(`scp cividle-v1.json ubuntu@de.fishpondstudio.com:/opt/ota/`, path.join(rootPath, "out"));
}

console.log("========== Copy to Electron ==========");

fs.copySync(path.join(rootPath, "dist"), path.join(rootPath, "electron", "dist"));

console.log("========== Build Electron ==========");

cmd("npm run package -- --platform=win32,linux,darwin", path.join(rootPath, "electron"));
cmd(`rcodesign sign --p12-file local/app-sign.p12 --p12-password-file local/p12-password`
   + ` --code-signature-flags runtime`
   + ` --entitlements-xml-file local/entitlements.plist`
   + ` --code-signature-flags "Contents/Frameworks/cividle Helper.app":runtime`
   + ` --entitlements-xml-file "Contents/Frameworks/cividle Helper.app":local/entitlements.plist`
   + ` --code-signature-flags "Contents/Frameworks/cividle Helper (Renderer).app":runtime`
   + ` --entitlements-xml-file "Contents/Frameworks/cividle Helper (Renderer).app":local/entitlements.plist`
   + ` --code-signature-flags "Contents/Frameworks/cividle Helper (GPU).app":runtime`
   + ` --entitlements-xml-file "Contents/Frameworks/cividle Helper (GPU).app":local/entitlements.plist`
   + ` --code-signature-flags "Contents/Frameworks/cividle Helper (Plugin).app":runtime`
   + ` --entitlements-xml-file "Contents/Frameworks/cividle Helper (Plugin).app":local/entitlements.plist`
   + ` --code-signature-flags "Contents/Frameworks/Electron Framework.framework/Versions/A/Helpers/chrome_crashpad_handler":runtime`
   + ` --entitlements-xml-file "Contents/Frameworks/Electron Framework.framework/Versions/A/Helpers/chrome_crashpad_handler":local/entitlements.plist`
   + ` --code-signature-flags "Contents/Frameworks/Squirrel.framework/Versions/A/Resources/ShipIt":runtime`
   + ` --entitlements-xml-file "Contents/Frameworks/Squirrel.framework/Versions/A/Resources/ShipIt":local/entitlements.plist`
   + ` ./out/cividle-darwin-x64/cividle.app`, path.join(rootPath, "electron"));
cmd(`rcodesign notary-submit --api-key-file local/app-store.json --staple out/cividle-darwin-x64/cividle.app`, path.join(rootPath, "electron"));

console.log("========== Uploading to Steam ==========");

if (!process.env.STEAMWORKS_PATH) {
   console.error("STEAMWORKS_PATH is not defined");
   process.exit();
}

fs.removeSync(path.join(process.env.STEAMWORKS_PATH, "cividle-win32-x64"));
fs.removeSync(path.join(process.env.STEAMWORKS_PATH, "cividle-linux-x64"));
fs.removeSync(path.join(process.env.STEAMWORKS_PATH, "cividle-darwin-x64"));

fs.copySync(
   path.join(rootPath, "electron", "out", "cividle-win32-x64"),
   path.join(process.env.STEAMWORKS_PATH, "cividle-win32-x64"),
);

fs.copySync(
   path.join(rootPath, "electron", "out", "cividle-linux-x64"),
   path.join(process.env.STEAMWORKS_PATH, "cividle-linux-x64"),
);

fs.copySync(
   path.join(rootPath, "electron", "out", "cividle-darwin-x64"),
   path.join(process.env.STEAMWORKS_PATH, "cividle-darwin-x64"),
);

cmd(
   `${path.join(process.env.STEAMWORKS_PATH, "builder_linux", "steamcmd.sh")} +runscript ../cividle.txt`,
   process.env.STEAMWORKS_PATH,
);

function cmd(command, cwd = null) {
   console.log(`>> Command: ${command} (CWD: ${cwd})`);
   execSync(command, { stdio: "inherit", cwd: cwd });
}
