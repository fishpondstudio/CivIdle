const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs-extra");

console.log("========== Building CivIdle ==========");

const rootPath = path.resolve(path.join(__dirname, "../"));

console.log("Root Path is", rootPath);

run(`cd ${rootPath}`);
run(`npm run build`);

console.log("========== Building Electron ==========");

run(`cd ${path.join(rootPath, "electron")}`);
run(`npm run make -- --platform=win32`);

function run(command) {
   execSync(command, { stdio: "inherit" });
}
