const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const sevenBin = require("7zip-bin");
const sevenZip = require("node-7z");

console.log("========== Building CivIdle ==========");

const rootPath = path.resolve(path.join(__dirname, "../"));

const versionFilePath = path.join(rootPath, "src", "scripts", "Version.json");
const ver = JSON.parse(fs.readFileSync(versionFilePath, { encoding: "utf8" }));
ver.build++;
fs.writeFileSync(versionFilePath, JSON.stringify(ver));

cmd(`npm run build`, rootPath);

console.log("========== Building Qt ==========");

fs.emptyDirSync(path.join(rootPath, "qt", "cividle-win32-x64"));

const stream = sevenZip.extractFull(
   path.join(rootPath, "qt", "cividle-win32-x64.7z"),
   path.join(rootPath, "qt"),
   {
      $bin: sevenBin.path7za,
   },
);

stream.on("end", () => {
   fs.copySync(path.join(rootPath, "dist"), path.join(rootPath, "qt", "cividle-win32-x64", "dist"));

   console.log("========== Uploading to Steam ==========");

   if (!process.env.STEAMWORKS_PATH) {
      console.error("STEAMWORKS_PATH is not defined");
      return;
   }

   const gameFilePath = path.join(process.env.STEAMWORKS_PATH, "cividle-win32-x64");

   fs.removeSync(gameFilePath);
   console.log(`Copying game files to ${gameFilePath}`);
   fs.copySync(path.join(rootPath, "qt", "cividle-win32-x64"), gameFilePath);

   cmd(
      path.join(process.env.STEAMWORKS_PATH, "builder_linux", "steamcmd.sh") + " +runscript ../cividle.txt",
      process.env.STEAMWORKS_PATH,
   );
});

function cmd(command, cwd = null) {
   console.log(`>> Command: ${command} (CWD: ${cwd})`);
   execSync(command, { stdio: "inherit", cwd: cwd });
}
