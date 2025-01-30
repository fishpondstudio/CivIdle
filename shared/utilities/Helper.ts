import type { PartialSet, PartialTabulate } from "./TypeDefinitions";
import { v2 } from "./Vector2";

export const CURRENCY_EPSILON = 0.01;
export const CURRENCY_PERCENT_EPSILON = CURRENCY_EPSILON / 100;

export interface IPointData {
   x: number;
   y: number;
}

// biome-ignore format:
const NUMBER_SUFFIX_1 = ["","K","M","B","T","Qa","Qt","Sx","Sp","Oc","Nn","Dc","UDc","DDc","TDc","QaDc","QtDc","SxDc","SpDc","ODc","NDc","Vi","UVi","DVi","TVi","QaVi","QtVi","SxVi","SpVi","OcVi","NnVi","Tg","UTg","DTg","TTg","QaTg","QtTg","SxTg","SpTg","OcTg","NnTg","Qd","UQd","DQd","TQd","QaQd","QtQd","SxQd","SpQd","OcQd","NnQd","Qq","UQq","DQq","TQq","QaQq","QtQq","SxQq","SpQq","OcQq","NnQq","Sg"];

// biome-ignore format:
const NUMBER_SUFFIX_BIN = ["", "K", "M", "G", "T", "P", "E", "Z", "Y"];

// biome-ignore format:
const NUMBER_SUFFIX_2 = ["","K","M","B","T","aa","bb","cc","dd","ee","ff","gg","hh","ii","jj","kk","ll","mm","nn","oo","pp","qq","rr","ss","tt","uu","vv","ww","xx","yy","zz","Aa","Bb","Cc","Dd","Ee","Ff","Gg","Hh","Ii","Jj","Kk","Ll","Mm","Nn","Oo","Pp","Qq","Rr","Ss","Tt","Uu","Vv","Ww","Xx","Yy","Zz","AA","BB","CC","DD","EE","FF","GG","HH","II","JJ","KK","LL","MM","NN","OO","PP","QQ","RR","SS","TT","UU","VV","WW","XX","YY","ZZ"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// biome-ignore format:
const NUMBER_SUFFIX_3 = ["","thousand","million","billion","trillion","quadrillion","quintillion","sextillion","septillion","octillion","nonillion","decillion","undecillion","duodecillion","tredecillion","quattuordecillion","quindecillion","sedecillion","septendecillion","octodecillion","novemdecillion ","vigintillion","unvigintillion","duovigintillion","trevigintillion","quattuorvigintillion","quinvigintillion","sexvigintillion","septenvigintillion","octovigintillion","novemvigintillion","trigintillion","untrigintillion","duotrigintillion","tretrigintillion","quattuortrigintillion","quintrigintillion","sextrigintillion","septentrigintillion","octotrigintillion","novemtrigintillion","quadragintillion","unquadragintillion","duoquadragintillion","trequadragintillion","quattuorquadragintillion","quinquadragintillion","sexquadragintillion","septenquadragintillion","octoquadragintillion","novemquadragintillion","quinquagintillion","unquinquagintillion","duoquinquagintillion","trequinquagintillion","quattuorquinquagintillion","quinquinquagintillion","sexquinquagintillion","septenquinquagintillion","octoquinquagintillion","novemquinquagintillion","sexagintillion","unsexagintillion","duosexagintillion","tresexagintillion","quattuorsexagintillion","quinsexagintillion","sexsexagintillion","septsexagintillion","octosexagintillion","octosexagintillion","septuagintillion","unseptuagintillion","duoseptuagintillion","treseptuagintillion","quinseptuagintillion","sexseptuagintillion","septseptuagintillion","octoseptuagintillion","novemseptuagintillion","octogintillion","unoctogintillion","duooctogintillion","treoctogintillion","quattuoroctogintillion","quinoctogintillion","sexoctogintillion","septoctogintillion","octooctogintillion","novemoctogintillion","nonagintillion","unnonagintillion","duononagintillion","trenonagintillion","quattuornonagintillion","quinnonagintillion","sexnonagintillion","septnonagintillion","octononagintillion","novemnonagintillion","centillion"];

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

export function escapeHtml(unsafe: string): string {
   return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

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
   return `${num.toLocaleString()}E${idx.toString()}`;
}

export function formatNumber(num: number | undefined | null, binary = false, scientific = false): string {
   if (num === null || num === undefined) {
      return "";
   }
   if (!Number.isFinite(num)) {
      return String(num);
   }
   if (scientific) {
      return scientificFormat(num);
   }
   if (binary) {
      return humanFormat(num, NUMBER_SUFFIX_BIN);
   }
   return humanFormat(num, NUMBER_SUFFIX_1);
}

export enum Rounding {
   Floor = 0,
   Ceil = 1,
   Round = 2,
}

const FormatFunc: Record<Rounding, (v: number) => number> = {
   [Rounding.Floor]: Math.floor,
   [Rounding.Ceil]: Math.ceil,
   [Rounding.Round]: Math.round,
};

export function round(num: number, decimal: number, mode = Rounding.Round): number {
   const fac = Math.pow(10, decimal);
   return FormatFunc[mode](num * fac) / fac;
}

export function formatPercent(p: number, decimal = 2, mode = Rounding.Round) {
   return `${round(p * 100, Math.abs(p) < 0.1 ? decimal + 1 : decimal, mode)}%`;
}

export function mathSign(n: number, epsilon = Number.EPSILON): string {
   if (n > epsilon) {
      return "+";
   }
   if (n < -epsilon) {
      return "-";
   }
   return "";
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function keysOf<T extends {}>(obj: T): Array<keyof T> {
   return Object.keys(obj) as Array<keyof T>;
}

export function entriesOf<K extends string, V>(obj: Record<K, V>): [K, V][] {
   return Object.entries(obj) as [K, V][];
}

export function forEach<T extends {}>(
   obj: T | undefined,
   // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
   func: (k: keyof T, v: NonNullable<T[keyof T]>) => boolean | void,
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
export function firstKeyOf<T extends {}>(obj: T | undefined) {
   for (const key in obj) {
      return key;
   }
   return null;
}
// eslint-disable-next-line @typescript-eslint/ban-types
export function mFirstKeyOf<K, V>(obj: Map<K, V> | undefined): K | null {
   if (!obj) {
      return null;
   }
   for (const key of obj) {
      return key[0];
   }
   return null;
}

export function firstValueOf<T extends {}>(obj: T | undefined) {
   for (const key in obj) {
      return obj[key];
   }
   return null;
}

export function anyOf<T extends {}>(
   obj: T | undefined,
   func: (k: keyof T, v: NonNullable<T[keyof T]>) => boolean,
): boolean {
   for (const key in obj) {
      if (func(key, obj[key]!)) {
         return true;
      }
   }
   return false;
}

export function reduceOf<T extends {}, K>(
   obj: T | undefined,
   func: (prev: K, k: keyof T, v: NonNullable<T[keyof T]>) => K,
   initial: K,
): K {
   let result = initial;
   for (const key in obj) {
      const value = obj[key];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      result = func(result, key, value!);
   }
   return result;
}

export function mReduceOf<T, V, K>(obj: Map<T, V>, func: (prev: K, k: T, v: V) => K, initial: K): K {
   let result = initial;
   for (const [key, value] of obj) {
      result = func(result, key, value);
   }
   return result;
}

export function safeAdd<T extends string>(obj: Partial<Record<T, number>>, key: T, valueToAdd: number): void {
   if (!obj[key]) {
      obj[key] = 0;
   }
   obj[key]! += valueToAdd;
}

export function mapSafeAdd<T>(obj: Map<T, number>, key: T, valueToAdd: number): void {
   const v = obj.get(key);
   if (v) {
      obj.set(key, v + valueToAdd);
   } else {
      obj.set(key, valueToAdd);
   }
}

export function safePush<T extends string, K>(obj: Partial<Record<T, K[]>>, key: T, valueToPush: K): void {
   if (!obj[key]) {
      obj[key] = [];
   }
   obj[key]!.push(valueToPush);
}

export function mapSafePush<T, K>(obj: Map<T, K[]>, key: T, valueToPush: K): void {
   const v = obj.get(key);
   if (v) {
      v.push(valueToPush);
   } else {
      obj.set(key, [valueToPush]);
   }
}

export function clearObject<K extends string | number | symbol>(obj: Record<K, unknown>): void {
   for (const member in obj) delete obj[member];
}

export function mapOf<K extends string, V, T>(
   obj: Partial<Record<K, V>> | undefined | null,
   func: (key: K, value: V) => T,
   ifEmpty: () => T[] = () => [],
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

export function mMapOf<K, V, T>(
   obj: Map<K, V> | undefined | null,
   func: (key: K, value: V) => T,
   ifEmpty: () => T[] = () => [],
): T[] {
   const result: T[] = [];
   if (!obj) {
      return result;
   }
   obj.forEach((v, k) => {
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
   ifEmpty: () => Partial<Record<K, T>> = () => ({}),
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
   func: (key: K, value: V) => boolean,
): Partial<Record<K, V>> {
   const result: Partial<Record<K, V>> = {};
   forEach(obj, (k, v) => {
      if (func(k, v)) {
         result[k] = v;
      }
   });
   return result;
}

export function mFilterOf<K, V>(obj: Map<K, V>, func: (key: K, value: V) => boolean): Map<K, V> {
   const result: Map<K, V> = new Map();
   obj.forEach((v, k) => {
      if (func(k, v)) {
         result.set(k, v);
      }
   });
   return result;
}

const pointToXyCache: Map<number, string> = new Map();

export function pointToXy(point: IPointData): string {
   const hash = (point.x << 16) + point.y;
   const cached = pointToXyCache.get(hash);
   if (cached) {
      return cached;
   }
   const xy = `${point.x.toString()},${point.y.toString()}`;
   pointToXyCache.set(hash, xy);
   return xy;
}

export function pointToTile(point: IPointData): Tile {
   return (point.x << 16) + point.y;
}

export function tileToPoint(tile: Tile): IPointData {
   return { x: (tile >> 16) & 0xffff, y: tile & 0xffff };
}

export function sizeOf(obj: any): number {
   if (typeof obj !== "object") {
      return 0;
   }
   if (obj instanceof Map) {
      return obj.size;
   }
   if (obj instanceof Set) {
      return obj.size;
   }
   if (Array.isArray(obj)) {
      return obj.length;
   }
   return Object.keys(obj).length;
}

export function mapCount<K, V>(map: Map<K, V>, func: (value: V, key: K, map: Map<K, V>) => boolean): number {
   let result = 0;
   map.forEach((value, key, map) => {
      if (func(value, key, map)) {
         ++result;
      }
   });
   return result;
}

const xyToTileCache: Map<string, Tile> = new Map();
export type Tile = number;
export function xyToTile(xy: string): Tile {
   const cached = xyToTileCache.get(xy);
   if (cached) {
      return cached;
   }
   const point = xyToPoint(xy);
   const tile = (point.x << 16) | point.y;
   xyToTileCache.set(xy, tile);
   return tile;
}

const xyHash: Map<Tile, number> = new Map();
let xyCounter = 0;

export function tileToHash(xy: Tile): number {
   let cached = xyHash.get(xy);
   if (!cached) {
      cached = xyCounter++;
      xyHash.set(xy, cached);
   }
   return cached;
}

const xyToPointCache: Map<string, Readonly<IPointData>> = new Map();

export function xyToPoint(str: string): IPointData {
   const cached = xyToPointCache.get(str);
   if (cached) {
      return { x: cached.x, y: cached.y };
   }
   const parts = str.split(",");
   const point = { x: Number.parseInt(parts[0], 10), y: Number.parseInt(parts[1], 10) };
   xyToPointCache.set(str, Object.freeze(point));
   return point;
}

export function clamp(value: number, minInclusive: number, maxInclusive: number): number {
   return Math.min(Math.max(value, minInclusive), maxInclusive);
}

export function lerp(a: number, b: number, amount: number): number {
   amount = clamp(amount, 0, 1);
   return a + (b - a) * amount;
}

export function lookAt(displayObject: { x: number; y: number; rotation: number }, point: IPointData): void {
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

export function safeParseInt(str: string, fallback = 0): number {
   const parsed = Number.parseInt(str, 10);
   return Number.isFinite(parsed) ? parsed : fallback;
}

export function safeParseFloat(str: string, fallback = 0): number {
   const parsed = Number.parseFloat(str);
   return Number.isFinite(parsed) ? parsed : fallback;
}

export function alphaNumericOf(str: string): string {
   return str.replace(/[^0-9a-z]/gi, "");
}

export function isAlphaNumeric(str: string): boolean {
   return !!str.match(/^[a-z0-9]+$/i);
}

export function containsNonASCII(str: string): boolean {
   // biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
   return !/^[\x00-\x7F]*$/.test(str);
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
export function isEmpty<K, V>(obj: Map<K, V> | Set<K> | object | null | undefined): boolean {
   if (obj instanceof Map) {
      return obj.size === 0;
   }
   if (obj instanceof Set) {
      return obj.size === 0;
   }
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
   // biome-ignore format:
   const key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM","","X","XX","XXX","XL","L","LX","LXX","LXXX","XC","","I","II","III","IV","V","VI","VII","VIII","IX"];
   let roman = "";
   let i = 3;
   while (i--) roman = (key[+digits.pop()! + i * 10] || "") + roman;
   return Array(+digits.join("") + 1).join("M") + roman;
}

export function romanToNumber(str: string): number | null {
   str = str.toUpperCase();
   const validator = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/;
   const token = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g;
   // biome-ignore format:
   const key: Record<string, number> = {M: 1000,CM: 900,D: 500,CD: 400,C: 100,XC: 90,L: 50,XL: 40,X: 10,IX: 9,V: 5,IV: 4,I: 1};
   let num = 0;
   // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
   let m;
   if (!(str && validator.test(str))) return null;
   // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
   while ((m = token.exec(str))) num += key[m[0]];
   return num;
}

export function loadScript(src: string): Promise<void> {
   return new Promise((resolve, reject) => {
      if (document.querySelector(`head > script[src="${src}"]`) !== null) {
         return resolve();
      }
      const script = document.createElement("script");
      script.src = src;
      script.type = "text/javascript";
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => resolve();
      script.onerror = reject;
   });
}

export function deepFreeze<T>(object: T): Readonly<T> {
   // Retrieve the property names defined on object
   const propNames = Object.getOwnPropertyNames(object);

   // Freeze properties before freezing self
   for (const name of propNames) {
      const value = (object as Record<string, unknown>)[name];

      if ((value && typeof value === "object") || typeof value === "function") {
         deepFreeze(value);
      }
   }

   return Object.freeze(object);
}

export function resolveIn<T>(seconds: number, result: T): Promise<T> {
   return new Promise((resolve) => {
      setTimeout(() => resolve(result), seconds * 1000);
   });
}

export function rejectIn<T>(seconds: number, reason = "Timeout"): Promise<T> {
   return new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error(reason)), seconds * 1000);
   });
}

export function schedule<T>(func: () => T): Promise<T> {
   return new Promise((resolve) => {
      setTimeout(() => {
         resolve(func());
      }, 0);
   });
}

export function getHMS(t: number): [number, number, number] {
   let h = 0;
   let m = 0;
   let s = 0;
   const seconds = Math.floor(t / 1000);
   const minutes = Math.floor(seconds / 60);
   const hours = Math.floor(minutes / 60);
   if (seconds < 60) {
      s = seconds;
   } else if (minutes < 60) {
      s = seconds - minutes * 60;
      m = minutes;
   } else {
      s = seconds - minutes * 60;
      m = minutes - hours * 60;
      h = hours;
   }
   return [h, m, s];
}

export function formatHMS(t: number, alwaysShowHour = false) {
   if (!Number.isFinite(t)) {
      return "--:--";
   }
   t = clamp(t, 0, Number.POSITIVE_INFINITY);
   const hms = getHMS(t);
   if (hms[0] === 0 && !alwaysShowHour) {
      return `${pad(hms[1])}:${pad(hms[2])}`;
   }
   if (hms[0] > 24 * 4) {
      const days = Math.floor(hms[0] / 24);
      if (days > 30) {
         const month = Math.floor(days / 30);
         if (month > 12) {
            const year = Math.floor(month / 12);
            if (year > 10) {
               return "10y+";
            }
            return `${year}y${month - 12 * year}mo`;
         }
         return `${month}mo${days - 30 * month}d`;
      }
      return `${days}d${hms[0] - 24 * days}h`;
   }
   return `${pad(hms[0])}:${pad(hms[1])}:${pad(hms[2])}`;
}

export function formatHM(t: number) {
   t = clamp(t, 0, Number.POSITIVE_INFINITY);
   const hms = getHMS(t);
   if (hms[0] === 0) {
      return `${hms[1]}m`;
   }
   if (hms[1] === 0) {
      return `${hms[0]}h`;
   }
   return `${hms[0]}h${pad(hms[1])}m`;
}

function pad(num: number) {
   return num < 10 ? `0${num}` : num;
}

interface ICanDrawLine {
   moveTo(x: number, y: number): this;
   lineTo(x: number, y: number): this;
}

export function drawDashedLine(
   g: ICanDrawLine,
   start: IPointData,
   end: IPointData,
   initial = 0,
   lineLength = 10,
   spaceLength = 20,
): number {
   const startPos = v2(start);
   const endPos = v2(end);
   const cursor = startPos;
   let count = initial;
   const direction = endPos.subtract(startPos);
   if (direction.length() < 10) {
      return count;
   }
   const increment = direction.normalizeSelf();
   const lineIncrement = increment.multiply(lineLength);
   const spaceIncrement = increment.multiply(spaceLength);
   while ((endPos.x - cursor.x) * increment.x >= 0 && (endPos.y - cursor.y) * increment.y >= 0) {
      if (count % 2 === 0) {
         g.moveTo(cursor.x, cursor.y);
         cursor.addSelf(lineIncrement);
      } else {
         g.lineTo(cursor.x, cursor.y);
         cursor.addSelf(spaceIncrement);
      }
      count++;
   }
   return count;
}

export function isNullOrUndefined(v: any): v is undefined | null {
   return v === null || typeof v === "undefined";
}

export function hasFlag<T extends number>(value: T, flag: T): boolean {
   return (value & flag) !== 0;
}

export function setFlag<T extends number>(value: T, flag: T): T {
   return (value | flag) as T;
}

export function clearFlag<T extends number>(value: T, flag: T): T {
   return (value & ~flag) as T;
}

export function toggleFlag<T extends number>(value: T, flag: T): T {
   return (value ^ flag) as T;
}

export function copyFlag<T extends number>(from: T, to: T, flag: T): T {
   return hasFlag(from, flag) ? setFlag(to, flag) : clearFlag(to, flag);
}

export function base64ToBytes(base64: string): Uint8Array {
   const binString = atob(base64);
   return Uint8Array.from(binString, (m) => m.charCodeAt(0));
}

export function bytesToBase64Alt(bytes: Uint8Array): string {
   return btoa(bytes.reduce((data, byte) => data + String.fromCharCode(byte), ""));
}

export function bytesToBase64(arrayBuffer: Uint8Array): string {
   let base64 = "";
   const encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

   const bytes = new Uint8Array(arrayBuffer);
   const byteLength = bytes.byteLength;
   const byteRemainder = byteLength % 3;
   const mainLength = byteLength - byteRemainder;

   let a: number;
   let b: number;
   let c: number;
   let d: number;
   let chunk: number;

   // Main loop deals with bytes in chunks of 3
   for (let i = 0; i < mainLength; i = i + 3) {
      // Combine the three bytes into a single integer
      chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

      // Use bitmasks to extract 6-bit segments from the triplet
      a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
      b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
      c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
      d = chunk & 63; // 63       = 2^6 - 1

      // Convert the raw binary segments to the appropriate ASCII encoding
      base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
   }

   // Deal with the remaining bytes and padding
   if (byteRemainder === 1) {
      chunk = bytes[mainLength];

      a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

      // Set the 4 least significant bits to zero
      b = (chunk & 3) << 4; // 3   = 2^2 - 1

      // biome-ignore lint/style/useTemplate:
      base64 += encodings[a] + encodings[b] + "==";
   } else if (byteRemainder === 2) {
      chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

      a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
      b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

      // Set the 2 least significant bits to zero
      c = (chunk & 15) << 2; // 15    = 2^4 - 1

      // biome-ignore lint/style/useTemplate:
      base64 += encodings[a] + encodings[b] + encodings[c] + "=";
   }

   return base64;
}

export function filterInPlace<T>(a: T[], condition: (v: T, i: number, array: T[]) => boolean): T[] {
   let i = 0;
   let j = 0;

   while (i < a.length) {
      const val = a[i];
      if (condition(val, i, a)) a[j++] = val;
      i++;
   }

   a.length = j;
   return a;
}

export function uuid4(): string {
   // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
   let a;
   // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
   let b;
   for (
      // loop :)
      b = a = ""; // b - result , a - numeric variable
      // @ts-expect-error
      a++ < 36; //
      b +=
         // @ts-expect-error
         (a * 51) & 52 // if "a" is not 9 or 14 or 19 or 24
            ? //  return a random number or 4
              // @ts-expect-error
              (a ^ 15 // if "a" is not 15
                 ? // genetate a random number from 0 to 15
                   // @ts-expect-error
                   8 ^ (Math.random() * (a ^ 20 ? 16 : 4)) // unless "a" is 20, in which case a random number from 8 to 11
                 : 4
              ) //  otherwise 4
                 .toString(16)
            : "-" //  in other cases (if "a" is 9,14,19,24) insert "-"
   ) {}
   return b;
}

export function logError(e: unknown, logFunc: (message: any) => void = console.error): void {
   if (typeof e === "string") {
      logFunc(e);
   } else if (e instanceof Error) {
      logFunc(e.message);
      if (e.stack) {
         logFunc(e.stack);
      }
   } else {
      logFunc(e);
   }
}

export function isScrolledToBottom(ele: HTMLElement): boolean {
   return Math.abs(ele.scrollHeight - ele.scrollTop - ele.clientHeight) < 1;
}

export function range(startInclusive: number, endExclusive: number): number[] {
   const result: number[] = [];
   for (let i = startInclusive; i < endExclusive; i++) {
      result.push(i);
   }
   return result;
}
