import { execSync } from "child_process";
import { writeFileSync } from "fs";
import path from "path";
import { SteamAPIDef } from "./SteamAPIDef";

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
export const SteamLib = lib;
export type KoffiFunc<T extends (...args:any) => any> = T & {
   async: (...args: [...Parameters<T>, (err: any, result: ReturnType<T>) => void]) => void;
};
`);

SteamAPIDef.enums.forEach((e) => {
   alias[e.enumname] = "int";
   koffiTypes[e.enumname] = e.enumname;
   result.push(`export enum ${e.enumname} {${e.values.map((v) => [v.name, "=", v.value].join(""))}}`);
});

result.push("// Typedefs");
Object.keys(alias).forEach((k) => {
   result.push(`koffi.alias("${k}", "${alias[k]}");`);
});

result.push("// Consts");
SteamAPIDef.consts.forEach(handleConst);

interface IConst {
   constname: string;
   consttype: string;
   constval: string;
}

function handleConst(v: IConst) {
   const [success, type] = getReturnType(v.consttype);
   if (!success) {
      console.warn(`Cannot handle const: ${v.constname} because of its type: ${v.consttype}`);
      return;
   }
   if (v.constval == "0xffffffffffffffffull") {
      result.push(`export const ${v.constname} = BigInt("0xffffffffffffffff");`);
      return;
   }
   if (v.constval.includes("<<") || v.constval.includes("SteamItemInstanceID_t")) {
      return;
   }
   result.push(`export const ${v.constname} = ${v.constval};`);
}

result.push("// Callbacks");
const callbackIdToStruct: Record<string, string> = {};
const callbackStructToId: Record<string, number> = {};
SteamAPIDef.callback_structs.forEach((c) => {
   if (c.consts) {
      c.consts.forEach(handleConst);
   }
   const fields: Record<string, string> = {};
   const jsFields: Record<string, string> = {};
   c.fields.forEach((f) => {
      const [success, type] = getReturnType(f.fieldtype);
      if (success) {
         fields[f.fieldname] = type;
         jsFields[f.fieldname] = getJSType(f.fieldtype);
      } else {
         console.warn(`Cannot handle ${c.struct} because of field ${f.fieldname} has unknown type ${f.fieldtype}`);
      }
   });
   if (Object.keys(fields).length == Object.keys(c.fields).length) {
      if (Object.keys(fields).length > 0) {
         result.push(
            `export interface ICallback_${c.struct} { ${Object.keys(jsFields).map((j) => `${j}:${jsFields[j]}`)} };`
         );
         result.push(`koffi.struct("${c.struct}", ${JSON.stringify(fields)});`);
      }
      callbackIdToStruct[c.callback_id] = c.struct;
      callbackStructToId[c.struct] = c.callback_id;
   }
});

result.push(
   `export const CallbackIdToStruct = { ${Object.keys(callbackIdToStruct).map((i) => {
      return [i, ":", '"', callbackIdToStruct[i], '"'].join("");
   })} } as const;`
);
result.push(`export const CallbackStructToId = ${JSON.stringify(callbackStructToId)} as const;`);
result.push(`export type CallbackId = keyof typeof CallbackIdToStruct`);
result.push(`export type CallbackStruct = keyof typeof CallbackStructToId`);

result.push("// Functions");
SteamAPIDef.interfaces.forEach((i) => {
   result.push(`export interface ${i.classname} { __brand: "${i.classname}" }`);
   result.push(`koffi.opaque("${i.classname}");`);
   i.accessors
      ?.filter((a) => a.kind === "user")
      .forEach((a) => {
         result.push(
            `export const ${a.name_flat}: KoffiFunc<() => ${i.classname}> = lib.cdecl("${i.classname}* ${a.name_flat}()");`
         );
         result.push(`let ${i.classname}_Instance: ${i.classname} | null = null;`);
         result.push(`export function SteamAPI_${i.classname}(): ${i.classname} {`);
         result.push(`if (!${i.classname}_Instance) {${i.classname}_Instance = ${a.name_flat}();}`);
         result.push(`return ${i.classname}_Instance;`);
         result.push(`}`);
      });

   i.methods.forEach((m: IMethod) => {
      const params = [`${i.classname} * self`];

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
         m.params.forEach((p) => params.push(`${p.paramname}: ${getJSType(p.paramtype_flat ?? p.paramtype)}`));
         result.push(
            `export const ${m.methodname_flat}: KoffiFunc<(${params.join(", ")}) => ${getJSType(
               returnType
            )}> = lib.cdecl("${def}");`
         );
      }
   });
});

const outputFile = path.join(__dirname, "../src/Steamworks.Generated.ts");
writeFileSync(outputFile, result.join("\n"));
execSync(`npx prettier --write ${outputFile}`);

function getCleanType(type: string): string {
   type = type.replace("const ", "");
   if (type == "char *") {
      return type;
   }
   if (type == "void *") {
      return type;
   }
   return type.replace(" *", "").trim();
}

function getJSType(type: string): string {
   const t = getCleanType(type);
   if (type == "void *") {
      return "Buffer";
   }
   if (koffiTypes[t]) {
      return isOutType(type) ? `[${koffiTypes[t]}]` : koffiTypes[t];
   }
   if (koffiTypes[alias[t]]) {
      return isOutType(type) ? `[${koffiTypes[alias[t]]}]` : koffiTypes[alias[t]];
   }
   throw new Error(`Cannot find JS type for ${type}`);
}

function getReturnType(type: string): [boolean, string] {
   const t = getCleanType(type);
   const known = !!koffiTypes[t] || !!alias[t];
   return [known, type];
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
