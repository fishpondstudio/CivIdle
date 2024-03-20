const { readFileSync, readdirSync, writeFileSync } = require("fs");
const { execSync } = require("child_process");
const { resolve, join } = require("path");

console.log("🟡 Remove Unused English Translation");
const EN_FILE_PATH = "./shared/languages/en.ts";
const file = readFileSync(EN_FILE_PATH, {
   encoding: "utf8",
})
   .replace("export const EN =", "")
   .replace("};", "}");
let en = eval(`(${file})`);

const sourceFiles = getAllFiles(join(__dirname, "../", "shared"))
   .concat(getAllFiles(join(__dirname, "../", "src", "scripts")))
   .filter(
      (f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && !f.endsWith(".d.ts") && !f.includes("/languages/"),
   )
   .map((f) => readFileSync(f, { encoding: "utf8" }))
   .join()
   .replace(/\s+/g, "");

Object.keys(en).forEach((key) => {
   if (!sourceFiles.includes(`L.${key}`)) {
      console.log(`Translation not used: ${key}`);
      delete en[key];
   }
});
en = Object.fromEntries(Object.entries(en).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(EN_FILE_PATH, `export const EN = ${JSON.stringify(en)};`);

console.log("🟡 Adjust Other Translation Based On English");

function getAllFiles(dir) {
   const paths = readdirSync(dir, { withFileTypes: true });
   const files = paths.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getAllFiles(res) : res;
   });
   return files.flat();
}

readdirSync("./shared/languages").forEach((fileName) => {
   if (!fileName.endsWith(".ts") || fileName.startsWith("en.ts")) {
      return;
   }
   const variableName = fileName.replace(".ts", "").replace("-", "_").toUpperCase();
   const filePath = `shared/languages/${fileName}`;
   const file = readFileSync(filePath, { encoding: "utf8" })
      .replace(`export const ${variableName} =`, "")
      .replace("};", "}");
   const language = eval(`(${file})`);
   const result = {};
   Object.keys(en).forEach((k) => {
      if (language[k]) {
         result[k] = language[k];
      } else {
         result[k] = en[k];
      }
   });
   writeFileSync(filePath, `export const ${variableName} = ${JSON.stringify(result)};`);
});

console.log("🟡 Format Translation Files");

execSync("npx @biomejs/biome format --write shared/languages/", {
   encoding: "utf8",
});

console.log("🟢 Translation has successfully updated");
