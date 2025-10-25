import { glob } from "glob";
import JavaScriptObfuscator from "javascript-obfuscator";
import fs from "node:fs";

const jsfiles = await glob("compiled/*.js", { ignore: "node_modules/**" });

for (const file of jsfiles) {
   const content = fs.readFileSync(file, "utf8");
   const obfuscated = JavaScriptObfuscator.obfuscate(content, { target: "node" });
   fs.writeFileSync(file, obfuscated.getObfuscatedCode());
}
