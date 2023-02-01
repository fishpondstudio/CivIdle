import { writeFileSync } from "fs";
import path from "path";
import { SteamAPIDef } from "./steam-api";

const koffiTypes: Record<string, string> = {
   bool: "boolean",
   int8_t: "number",
   int8: "number",
   uint8_t: "number",
   uint8: "number",
   char: "number",
   "unsigned char": "number",
   uchar: "number",
   char16_t: "number",
   char16: "number",
   int16_t: "number",
   int16: "number",
   uint16_t: "number",
   uint16: "number",
   short: "number",
   "unsigned short": "number",
   ushort: "number",
   int32_t: "number",
   int32: "number",
   uint32_t: "number",
   uint32: "number",
   int: "number",
   "unsigned int": "number",
   uint: "number",
   int64_t: "number",
   int64: "number",
   uint64_t: "number",
   uint64: "number",
   intptr_t: "number",
   intptr: "number",
   uintptr_t: "number",
   uintptr: "number",
   size_t: "number",
   long: "number",
   "unsigned long": "number",
   ulong: "number",
   "long long": "number",
   longlong: "number",
   "unsigned long long": "number",
   ulonglong: "number",
   float: "number",
   float32: "number",
   double: "number",
   float64: "number",
   "char *": "string",
   str: "string",
   string: "string",
   "char16_t *": "string",
   "char16 *": "string",
   str16: "string",
   string16: "string",
   "void *": "Buffer",
   void: "void",
};

const alias: Record<string, string> = {
   uint64_steamid: "uint64",
   uint64_gameid: "uint64",
   HSteamPipe: "int32",
   HSteamUser: "int32",
};

SteamAPIDef.typedefs.forEach((t) => {
   if (koffiTypes[t.typedef]) {
      // No need to generate alias
   } else if (koffiTypes[t.type]) {
      alias[t.typedef] = t.type;
   } else {
      console.log(`I don't know how to handle typedef: ${t.typedef} -> ${t.type}`);
   }
});

interface IParam {
   paramname: string;
   paramtype: string;
   paramtype_flat?: string;
}

interface IMethod {
   methodname: string;
   methodname_flat: string;
   returntype: string;
   returntype_flat?: string;
   params: IParam[];
}

const result: string[] = ["// This file is generated", `import koffi from "koffi";`, `import path from "path";`];

result.push(`
let lib;
if (process.platform === "win32") {
   lib = koffi.load(path.join(__dirname, "../steamworks/steam_api64.dll"));
} else if (process.platform === "linux") {
   lib = koffi.load(path.join(__dirname, "../steamworks/libsteam_api.so"));
} else if (process.platform === "darwin") {
   lib = koffi.load(path.join(__dirname, "../steamworks/libsteam_api.dylib"));
} else {
   throw new Error("Unsupported platform: " + process.platform);
}

type KoffiFunc<T extends (...args:any) => any> = T & {
   async: T;
};`);

result.push("// Typedefs");
Object.keys(alias).forEach((k) => {
   result.push(`koffi.alias("${k}", "${alias[k]}");`);
});

result.push("// Functions");
SteamAPIDef.interfaces.forEach((i) => {
   result.push(`interface ${i.classname} { __brand: "${i.classname}" }`);
   result.push(`koffi.opaque("${i.classname}");`);
   i.accessors?.forEach((a) => {
      result.push(
         `export const ${a.name_flat}: KoffiFunc<() => ${i.classname}> = lib.cdecl("${i.classname}* ${a.name_flat}()");`
      );
   });

   i.methods.forEach((m: IMethod) => {
      const params = [`${`${i.classname} * self`}${m.params.length > 0 ? ", " : ""}`];

      const [success, returnType] = getReturnType(m.returntype_flat ?? m.returntype);
      if (!success) {
         console.warn(`Cannot handle: ${m.methodname_flat} because of return type: ${returnType}`);
         return;
      }
      let allValid = true;
      m.params.forEach((p) => {
         const [success, type] = getParamType(p.paramtype_flat ?? p.paramtype);
         if (!success) {
            allValid = false;
            console.warn(`Cannot handle: ${m.methodname_flat} because of param type: ${type}`);
         }
         params.push(`${type} ${p.paramname}`);
      });
      const def = `${returnType} ${m.methodname_flat}(${params.join(", ")})`;
      if (allValid) {
         const params = [`self: ${i.classname}`];
         m.params.forEach((p) => params.push(`${p.paramname}: ${getTSType(p.paramtype_flat ?? p.paramtype)}`));
         result.push(
            `export const ${m.methodname_flat}: (${params.join(", ")}) => ${getTSType(
               returnType
            )} = lib.cdecl("${def}");`
         );
      }
   });
});

writeFileSync(path.join(__dirname, "../src/steamworks.generated.ts"), result.join("\n"));

function getReturnType(type: string): [boolean, string] {
   const t = getCleanType(type);
   const known = !!koffiTypes[t] || !!alias[t];
   return [known, type];
}

function getCleanType(type: string): string {
   type = type.replace("const ", "");
   if (type == "char *") {
      return type;
   }
   return type.replace(" *", "").trim();
}

function getTSType(type: string): string {
   const t = getCleanType(type);
   if (koffiTypes[t]) {
      return isOutType(type) ? `[${koffiTypes[t]}]` : koffiTypes[t];
   }
   if (koffiTypes[alias[t]]) {
      return isOutType(type) ? `[${koffiTypes[alias[t]]}]` : koffiTypes[alias[t]];
   }
   throw new Error(`Cannot find TS type for ${type}`);
}

function getParamType(type: string): [boolean, string] {
   const t = getCleanType(type);
   const known = !!koffiTypes[t] || !!alias[t];
   let outputType = type;
   if (isOutType(type)) {
      outputType = "_Out_ " + type;
   }
   return [known, outputType];
}
function isOutType(type: string) {
   return !type.startsWith("const") && type.endsWith("*");
}
