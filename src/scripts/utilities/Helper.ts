import { DisplayObject, IPointData } from "pixi.js";
import { PartialSet, PartialTabulate } from "../definitions/TypeDefinitions";

// prettier-ignore
const NUMBER_SUFFIX_1 = ["","K","M","B","T","Qa","Qt","Sx","Sp","Oc","Nn","Dc","UDc","DDc","TDc","QaDc","QtDc","SxDc","SpDc","ODc","NDc","Vi","UVi","DVi","TVi","QaVi","QtVi","SxVi","SpVi","OcVi","NnVi","Tg","UTg","DTg","TTg","QaTg","QtTg","SxTg","SpTg","OcTg","NnTg","Qd","UQd","DQd","TQd","QaQd","QtQd","SxQd","SpQd","OcQd","NnQd","Qq","UQq","DQq","TQq","QaQq","QtQq","SxQq","SpQq","OcQq","NnQq","Sg",
];

// prettier-ignore
const NUMBER_SUFFIX_BIN = ["", "K", "M", "G", "T", "P", "E", "Z", "Y"];

// prettier-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NUMBER_SUFFIX_2 = ["","K","M","B","T","aa","bb","cc","dd","ee","ff","gg","hh","ii","jj","kk","ll","mm","nn","oo","pp","qq","rr","ss","tt","uu","vv","ww","xx","yy","zz","Aa","Bb","Cc","Dd","Ee","Ff","Gg","Hh","Ii","Jj","Kk","Ll","Mm","Nn","Oo","Pp","Qq","Rr","Ss","Tt","Uu","Vv","Ww","Xx","Yy","Zz","AA","BB","CC","DD","EE","FF","GG","HH","II","JJ","KK","LL","MM","NN","OO","PP","QQ","RR","SS","TT","UU","VV","WW","XX","YY","ZZ",
];

// prettier-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NUMBER_SUFFIX_3 = ["","thousand","million","billion","trillion","quadrillion","quintillion","sextillion","septillion","octillion","nonillion","decillion","undecillion","duodecillion","tredecillion","quattuordecillion","quindecillion","sedecillion","septendecillion","octodecillion","novemdecillion ","vigintillion","unvigintillion","duovigintillion","trevigintillion","quattuorvigintillion","quinvigintillion","sexvigintillion","septenvigintillion","octovigintillion","novemvigintillion","trigintillion","untrigintillion","duotrigintillion","tretrigintillion","quattuortrigintillion","quintrigintillion","sextrigintillion","septentrigintillion","octotrigintillion","novemtrigintillion","quadragintillion","unquadragintillion","duoquadragintillion","trequadragintillion","quattuorquadragintillion","quinquadragintillion","sexquadragintillion","septenquadragintillion","octoquadragintillion","novemquadragintillion","quinquagintillion","unquinquagintillion","duoquinquagintillion","trequinquagintillion","quattuorquinquagintillion","quinquinquagintillion","sexquinquagintillion","septenquinquagintillion","octoquinquagintillion","novemquinquagintillion","sexagintillion","unsexagintillion","duosexagintillion","tresexagintillion","quattuorsexagintillion","quinsexagintillion","sexsexagintillion","septsexagintillion","octosexagintillion","octosexagintillion","septuagintillion","unseptuagintillion","duoseptuagintillion","treseptuagintillion","quinseptuagintillion","sexseptuagintillion","septseptuagintillion","octoseptuagintillion","novemseptuagintillion","octogintillion","unoctogintillion","duooctogintillion","treoctogintillion","quattuoroctogintillion","quinoctogintillion","sexoctogintillion","septoctogintillion","octooctogintillion","novemoctogintillion","nonagintillion","unnonagintillion","duononagintillion","trenonagintillion","quattuornonagintillion","quinnonagintillion","sexnonagintillion","septnonagintillion","octononagintillion","novemnonagintillion","centillion",
];

function scientificFormat(num: number): string {
   return num.toExponential(2).replace("00e+", "e").replace("0e+", "e").replace("e+", "e");
}

function humanFormat(num: number, suffix: string[]): string {
   let idx = 0;
   while (Math.abs(num) >= 1000) {
      num /= 1000;
      idx++;
   }
   if (num >= 100) {
      num = Math.floor(num * 10) / 10;
   } else if (num >= 10) {
      num = Math.floor(num * 100) / 100;
   } else {
      num = Math.floor(num * 1000) / 1000;
   }

   if (idx < suffix.length) {
      return num.toLocaleString() + suffix[idx];
   }
   return num.toLocaleString() + "E" + idx.toString();
}

export function formatNumber(num: number | undefined | null, binary = false, scientific = false): string {
   if (num === null || num === undefined) {
      return "";
   }
   if (!isFinite(num)) {
      return String(num);
   }
   if (scientific && num >= 1e15) {
      return scientificFormat(num);
   }
   if (binary) {
      return humanFormat(num, NUMBER_SUFFIX_BIN);
   }
   return humanFormat(num, NUMBER_SUFFIX_1);
}

export function round(num: number, decimal: number): number {
   const fac = Math.pow(10, decimal);
   return Math.round(num * fac) / fac;
}

export function formatPercent(p: number, decimal = 2) {
   return `${round(p * 100, decimal)}%`;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function keysOf<T extends {}>(obj: T): Array<keyof T> {
   return Object.keys(obj) as Array<keyof T>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function forEach<T extends {}>(
   obj: T | undefined,
   // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
   func: (k: keyof T, v: NonNullable<T[keyof T]>) => boolean | void
) {
   for (const key in obj) {
      const value = obj[key];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      if (func(key, value!) === true) {
         return;
      }
   }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function reduceOf<T extends {}, K>(
   obj: T | undefined,
   func: (prev: K, k: keyof T, v: NonNullable<T[keyof T]>) => K,
   initial: K
): K {
   let result = initial;
   for (const key in obj) {
      const value = obj[key];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      result = func(result, key, value!);
   }
   return result;
}

export function safeAdd<T extends string>(obj: Partial<Record<T, number>>, key: T, valueToAdd: number): void {
   if (!obj[key]) {
      obj[key] = 0;
   }
   obj[key]! += valueToAdd;
}

export function safePush<T extends string, K>(obj: Partial<Record<T, K[]>>, key: T, valueToPush: K): void {
   if (!obj[key]) {
      obj[key] = [];
   }
   obj[key]!.push(valueToPush);
}

export function mapOf<K extends string, V, T>(
   obj: Partial<Record<K, V>> | undefined | null,
   func: (key: K, value: V) => T,
   ifEmpty: () => T[] = () => []
): T[] {
   const result: T[] = [];
   if (!obj) {
      return result;
   }
   forEach(obj, (k, v) => {
      result.push(func(k, v));
   });
   if (result.length === 0) {
      return ifEmpty();
   }
   return result;
}

export function transformOf<K extends string, V, T>(
   obj: Partial<Record<K, V>>,
   func: (key: K, value: V) => T,
   ifEmpty: () => Partial<Record<K, T>> = () => ({})
): Partial<Record<K, T>> {
   const result: Partial<Record<K, T>> = {};
   forEach(obj, (k, v) => {
      result[k] = func(k, v);
   });
   if (sizeOf(result)) {
      return ifEmpty();
   }
   return result;
}

export function filterOf<K extends string, V>(
   obj: Partial<Record<K, V>>,
   func: (key: K, value: V) => boolean
): Partial<Record<K, V>> {
   const result: Partial<Record<K, V>> = {};
   forEach(obj, (k, v) => {
      if (func(k, v)) {
         result[k] = v;
      }
   });
   return result;
}

export function jsxMapOf<K extends string, V>(
   obj: Partial<Record<K, V>> | undefined,
   func: (key: K, value: V) => JSX.Element | null,
   ifEmpty: () => JSX.Element | null = () => null
): JSX.Element[] | JSX.Element | null {
   const result: JSX.Element[] = [];
   forEach(obj, (k, v) => {
      const ele = func(k, v);
      if (ele) {
         result.push(ele);
      }
   });
   if (result.length === 0) {
      return ifEmpty();
   }
   return result;
}

export function pointToXy(point: IPointData): string {
   return point.x.toString() + "," + point.y.toString();
}

export function sizeOf(obj: any): number {
   if (typeof obj !== "object") {
      return 0;
   }
   return Object.keys(obj).length;
}

export function xyToPoint(str: string): IPointData {
   const parts = str.split(",");
   return { x: parseInt(parts[0], 10), y: parseInt(parts[1], 10) };
}

export function clamp(value: number, minInclusive: number, maxInclusive: number): number {
   if (value > maxInclusive) {
      return maxInclusive;
   }
   if (value < minInclusive) {
      return minInclusive;
   }
   return value;
}

export function lookAt(displayObject: DisplayObject, point: IPointData): void {
   displayObject.rotation = Math.atan2(point.y - displayObject.y, point.x - displayObject.x);
}

export function layoutCenter(itemSize: number, margin: number, totalCount: number, current: number): number {
   const halfSize = itemSize / 2;
   const halfMargin = margin / 2;
   return -(totalCount - 1) * (halfSize + halfMargin) + current * (itemSize + margin);
}

export type NumericKeyOf<TP> = {
   [P in keyof TP]: TP[P] extends number ? P : never;
}[keyof TP];

export type BooleanKeyOf<TP> = {
   [P in keyof TP]: TP[P] extends boolean ? P : never;
}[keyof TP];

export function sum<T>(arr: T[], key: NumericKeyOf<T>): number {
   return arr.reduce((prev, curr) => {
      const value = curr[key];
      return typeof value === "number" ? prev + value : prev;
   }, 0);
}

export function setContains<T extends string>(a: PartialSet<T>, b: PartialSet<T>): boolean {
   let k: keyof typeof b;
   for (k in b) {
      if (!a[k]) {
         return false;
      }
   }
   return true;
}

export function tabulateAdd<T extends string>(...params: Array<PartialTabulate<T>>): PartialTabulate<T> {
   const result: PartialTabulate<T> = {};
   params.forEach((param) => {
      forEach(param, (k, v) => {
         safeAdd(result, k, v);
      });
   });
   return result;
}

export function alphaNumericOf(str: string): string {
   return str.replace(/[^0-9a-z]/gi, "");
}

export function isAlphaNumeric(str: string): boolean {
   return !!str.match(/^[a-z0-9]+$/i);
}

export function containsNonASCII(str: string): boolean {
   return [...str].some((char) => char.charCodeAt(0) > 127);
}

export function shuffle<T>(array: T[], rand?: () => number): T[] {
   rand = rand ?? Math.random;
   for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
   }
   return array;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isEmpty(obj: {} | null | undefined): boolean {
   if (!obj) {
      return true;
   }
   for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
         return false;
      }
   }
   return true;
}

export function numberToRoman(num: number): string | null {
   if (!+num) return null;
   const digits = String(+num).split("");
   // prettier-ignore
   const key = ['','C','CC','CCC','CD','D','DC','DCC','DCCC','CM',
              '','X','XX','XXX','XL','L','LX','LXX','LXXX','XC',
              '','I','II','III','IV','V','VI','VII','VIII','IX'];
   let roman = "",
      i = 3;
   while (i--) roman = (key[+digits.pop()! + i * 10] || "") + roman;
   return Array(+digits.join("") + 1).join("M") + roman;
}

export function romanToNumber(str: string): number | null {
   str = str.toUpperCase();
   const validator = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/;
   const token = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g;
   // prettier-ignore
   const key : Record<string,number> = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
   let num = 0,
      m;
   if (!(str && validator.test(str))) return null;
   while ((m = token.exec(str))) num += key[m[0]];
   return num;
}
