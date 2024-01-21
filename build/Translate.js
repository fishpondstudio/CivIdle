const { readFileSync, readdirSync, writeFileSync } = require("fs");
const { execSync } = require("child_process");
const { resolve, join } = require("path");

const file = readFileSync("./shared/languages/en.ts", {
   encoding: "utf8",
})
   .replace("export const EN =", "")
   .replace("};", "}");
const en = eval(`(${file})`);

function getAllFiles(dir) {
   const paths = readdirSync(dir, { withFileTypes: true });
   const files = paths.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getAllFiles(res) : res;
   });
   return files.flat();
}

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
   }
});

// readdirSync("./shared/languages").forEach((fileName) => {
//    if (!fileName.endsWith(".ts") || fileName.startsWith("en.ts")) {
//       return;
//    }
//    const variableName = fileName.replace(".ts", "").replace("-", "_").toUpperCase();
//    const filePath = `./assets/Script/Languages/${fileName}`;
//    const file = readFileSync(filePath, { encoding: "utf8" })
//       .replace(`export const ${variableName} =`, "")
//       .replace("};", "}");
//    const language = eval(`(${file})`);
//    const result = {};
//    Object.keys(en).forEach((k) => {
//       if (language[k]) {
//          result[k] = language[k];
//       } else {
//          result[k] = en[k];
//       }
//    });
//    writeFileSync(filePath, `export const ${variableName} = ${JSON.stringify(result, null, 2)};`);
// });

execSync("npx @biomejs/biome format ./shared/languages/*.ts --config biome.json --write", {
   encoding: "utf8",
});

// console.log("Translation has successfully updated!");
