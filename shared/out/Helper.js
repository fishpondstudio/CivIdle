"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadScript = exports.romanToNumber = exports.numberToRoman = exports.isEmpty = exports.shuffle = exports.containsNonASCII = exports.isAlphaNumeric = exports.alphaNumericOf = exports.safeParseInt = exports.tabulateAdd = exports.setContains = exports.sum = exports.layoutCenter = exports.lookAt = exports.lerp = exports.clamp = exports.xyToPoint = exports.tileToHash = exports.xyToTile = exports.sizeOf = exports.tileToPoint = exports.pointToTile = exports.pointToXy = exports.jsxMMapOf = exports.jsxMapOf = exports.mFilterOf = exports.filterOf = exports.transformOf = exports.mMapOf = exports.mapOf = exports.mapSafePush = exports.safePush = exports.mapSafeAdd = exports.safeAdd = exports.mReduceOf = exports.reduceOf = exports.anyOf = exports.firstValueOf = exports.mFirstKeyOf = exports.firstKeyOf = exports.forEach = exports.keysOf = exports.formatPercent = exports.round = exports.formatNumber = exports.escapeHtml = exports.DAY = exports.HOUR = exports.MINUTE = exports.SECOND = void 0;
exports.filterInPlace = exports.bytesToBase64 = exports.base64ToBytes = exports.copyFlag = exports.toggleFlag = exports.clearFlag = exports.setFlag = exports.hasFlag = exports.isNullOrUndefined = exports.drawDashedLine = exports.formatHM = exports.formatHMS = exports.getHMS = exports.schedule = exports.rejectIn = exports.resolveIn = exports.deepFreeze = void 0;
const Vector2_1 = require("./Vector2");
// biome-ignore format:
const NUMBER_SUFFIX_1 = ["", "K", "M", "B", "T", "Qa", "Qt", "Sx", "Sp", "Oc", "Nn", "Dc", "UDc", "DDc", "TDc", "QaDc", "QtDc", "SxDc", "SpDc", "ODc", "NDc", "Vi", "UVi", "DVi", "TVi", "QaVi", "QtVi", "SxVi", "SpVi", "OcVi", "NnVi", "Tg", "UTg", "DTg", "TTg", "QaTg", "QtTg", "SxTg", "SpTg", "OcTg", "NnTg", "Qd", "UQd", "DQd", "TQd", "QaQd", "QtQd", "SxQd", "SpQd", "OcQd", "NnQd", "Qq", "UQq", "DQq", "TQq", "QaQq", "QtQq", "SxQq", "SpQq", "OcQq", "NnQq", "Sg"];
// biome-ignore format:
const NUMBER_SUFFIX_BIN = ["", "K", "M", "G", "T", "P", "E", "Z", "Y"];
// biome-ignore format:
const NUMBER_SUFFIX_2 = ["", "K", "M", "B", "T", "aa", "bb", "cc", "dd", "ee", "ff", "gg", "hh", "ii", "jj", "kk", "ll", "mm", "nn", "oo", "pp", "qq", "rr", "ss", "tt", "uu", "vv", "ww", "xx", "yy", "zz", "Aa", "Bb", "Cc", "Dd", "Ee", "Ff", "Gg", "Hh", "Ii", "Jj", "Kk", "Ll", "Mm", "Nn", "Oo", "Pp", "Qq", "Rr", "Ss", "Tt", "Uu", "Vv", "Ww", "Xx", "Yy", "Zz", "AA", "BB", "CC", "DD", "EE", "FF", "GG", "HH", "II", "JJ", "KK", "LL", "MM", "NN", "OO", "PP", "QQ", "RR", "SS", "TT", "UU", "VV", "WW", "XX", "YY", "ZZ"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// biome-ignore format:
const NUMBER_SUFFIX_3 = ["", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion", "sextillion", "septillion", "octillion", "nonillion", "decillion", "undecillion", "duodecillion", "tredecillion", "quattuordecillion", "quindecillion", "sedecillion", "septendecillion", "octodecillion", "novemdecillion ", "vigintillion", "unvigintillion", "duovigintillion", "trevigintillion", "quattuorvigintillion", "quinvigintillion", "sexvigintillion", "septenvigintillion", "octovigintillion", "novemvigintillion", "trigintillion", "untrigintillion", "duotrigintillion", "tretrigintillion", "quattuortrigintillion", "quintrigintillion", "sextrigintillion", "septentrigintillion", "octotrigintillion", "novemtrigintillion", "quadragintillion", "unquadragintillion", "duoquadragintillion", "trequadragintillion", "quattuorquadragintillion", "quinquadragintillion", "sexquadragintillion", "septenquadragintillion", "octoquadragintillion", "novemquadragintillion", "quinquagintillion", "unquinquagintillion", "duoquinquagintillion", "trequinquagintillion", "quattuorquinquagintillion", "quinquinquagintillion", "sexquinquagintillion", "septenquinquagintillion", "octoquinquagintillion", "novemquinquagintillion", "sexagintillion", "unsexagintillion", "duosexagintillion", "tresexagintillion", "quattuorsexagintillion", "quinsexagintillion", "sexsexagintillion", "septsexagintillion", "octosexagintillion", "octosexagintillion", "septuagintillion", "unseptuagintillion", "duoseptuagintillion", "treseptuagintillion", "quinseptuagintillion", "sexseptuagintillion", "septseptuagintillion", "octoseptuagintillion", "novemseptuagintillion", "octogintillion", "unoctogintillion", "duooctogintillion", "treoctogintillion", "quattuoroctogintillion", "quinoctogintillion", "sexoctogintillion", "septoctogintillion", "octooctogintillion", "novemoctogintillion", "nonagintillion", "unnonagintillion", "duononagintillion", "trenonagintillion", "quattuornonagintillion", "quinnonagintillion", "sexnonagintillion", "septnonagintillion", "octononagintillion", "novemnonagintillion", "centillion"];
exports.SECOND = 1000;
exports.MINUTE = exports.SECOND * 60;
exports.HOUR = 60 * exports.MINUTE;
exports.DAY = 24 * exports.HOUR;
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
exports.escapeHtml = escapeHtml;
function scientificFormat(num) {
    return num.toExponential(2).replace("00e+", "e").replace("0e+", "e").replace("e+", "e");
}
function humanFormat(num, suffix) {
    let idx = 0;
    while (Math.abs(num) >= 1000) {
        num /= 1000;
        idx++;
    }
    if (num >= 100) {
        num = Math.floor(num * 10) / 10;
    }
    else if (num >= 10) {
        num = Math.floor(num * 100) / 100;
    }
    else {
        num = Math.floor(num * 1000) / 1000;
    }
    if (idx < suffix.length) {
        return num.toLocaleString() + suffix[idx];
    }
    return `${num.toLocaleString()}E${idx.toString()}`;
}
function formatNumber(num, binary = false, scientific = false) {
    if (num === null || num === undefined) {
        return "";
    }
    if (!Number.isFinite(num)) {
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
exports.formatNumber = formatNumber;
function round(num, decimal) {
    const fac = Math.pow(10, decimal);
    return Math.round(num * fac) / fac;
}
exports.round = round;
function formatPercent(p, decimal = 2) {
    return `${round(p * 100, decimal)}%`;
}
exports.formatPercent = formatPercent;
// eslint-disable-next-line @typescript-eslint/ban-types
function keysOf(obj) {
    return Object.keys(obj);
}
exports.keysOf = keysOf;
function forEach(obj, 
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
func) {
    for (const key in obj) {
        const value = obj[key];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        if (func(key, value) === true) {
            return;
        }
    }
}
exports.forEach = forEach;
// eslint-disable-next-line @typescript-eslint/ban-types
function firstKeyOf(obj) {
    for (const key in obj) {
        return key;
    }
    return null;
}
exports.firstKeyOf = firstKeyOf;
// eslint-disable-next-line @typescript-eslint/ban-types
function mFirstKeyOf(obj) {
    if (!obj) {
        return null;
    }
    for (const key of obj) {
        return key[0];
    }
    return null;
}
exports.mFirstKeyOf = mFirstKeyOf;
function firstValueOf(obj) {
    for (const key in obj) {
        return obj[key];
    }
    return null;
}
exports.firstValueOf = firstValueOf;
function anyOf(obj, func) {
    for (const key in obj) {
        if (func(key, obj[key])) {
            return true;
        }
    }
    return false;
}
exports.anyOf = anyOf;
function reduceOf(obj, func, initial) {
    let result = initial;
    for (const key in obj) {
        const value = obj[key];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        result = func(result, key, value);
    }
    return result;
}
exports.reduceOf = reduceOf;
function mReduceOf(obj, func, initial) {
    let result = initial;
    for (const [key, value] of obj) {
        result = func(result, key, value);
    }
    return result;
}
exports.mReduceOf = mReduceOf;
function safeAdd(obj, key, valueToAdd) {
    if (!obj[key]) {
        obj[key] = 0;
    }
    obj[key] += valueToAdd;
}
exports.safeAdd = safeAdd;
function mapSafeAdd(obj, key, valueToAdd) {
    const v = obj.get(key);
    if (v) {
        obj.set(key, v + valueToAdd);
    }
    else {
        obj.set(key, valueToAdd);
    }
}
exports.mapSafeAdd = mapSafeAdd;
function safePush(obj, key, valueToPush) {
    if (!obj[key]) {
        obj[key] = [];
    }
    obj[key].push(valueToPush);
}
exports.safePush = safePush;
function mapSafePush(obj, key, valueToPush) {
    const v = obj.get(key);
    if (v) {
        v.push(valueToPush);
    }
    else {
        obj.set(key, [valueToPush]);
    }
}
exports.mapSafePush = mapSafePush;
function mapOf(obj, func, ifEmpty = () => []) {
    const result = [];
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
exports.mapOf = mapOf;
function mMapOf(obj, func, ifEmpty = () => []) {
    const result = [];
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
exports.mMapOf = mMapOf;
function transformOf(obj, func, ifEmpty = () => ({})) {
    const result = {};
    forEach(obj, (k, v) => {
        result[k] = func(k, v);
    });
    if (sizeOf(result)) {
        return ifEmpty();
    }
    return result;
}
exports.transformOf = transformOf;
function filterOf(obj, func) {
    const result = {};
    forEach(obj, (k, v) => {
        if (func(k, v)) {
            result[k] = v;
        }
    });
    return result;
}
exports.filterOf = filterOf;
function mFilterOf(obj, func) {
    const result = new Map();
    obj.forEach((v, k) => {
        if (func(k, v)) {
            result.set(k, v);
        }
    });
    return result;
}
exports.mFilterOf = mFilterOf;
function jsxMapOf(obj, func, ifEmpty = () => null) {
    const result = [];
    forEach(obj, (k, v) => {
        const ele = func(k, v);
        if (ele) {
            if (Array.isArray(ele)) {
                ele.forEach((e) => result.push(e));
            }
            else {
                result.push(ele);
            }
        }
    });
    if (result.length === 0) {
        return ifEmpty();
    }
    return result;
}
exports.jsxMapOf = jsxMapOf;
function jsxMMapOf(obj, func, ifEmpty = () => null) {
    const result = [];
    obj === null || obj === void 0 ? void 0 : obj.forEach((v, k) => {
        const ele = func(k, v);
        if (ele) {
            if (Array.isArray(ele)) {
                ele.forEach((e) => result.push(e));
            }
            else {
                result.push(ele);
            }
        }
    });
    if (result.length === 0) {
        return ifEmpty();
    }
    return result;
}
exports.jsxMMapOf = jsxMMapOf;
const pointToXyCache = new Map();
function pointToXy(point) {
    const hash = (point.x << 16) + point.y;
    const cached = pointToXyCache.get(hash);
    if (cached) {
        return cached;
    }
    const xy = `${point.x.toString()},${point.y.toString()}`;
    pointToXyCache.set(hash, xy);
    return xy;
}
exports.pointToXy = pointToXy;
function pointToTile(point) {
    return (point.x << 16) + point.y;
}
exports.pointToTile = pointToTile;
function tileToPoint(tile) {
    return { x: (tile >> 16) & 0xffff, y: tile & 0xffff };
}
exports.tileToPoint = tileToPoint;
function sizeOf(obj) {
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
exports.sizeOf = sizeOf;
const xyToTileCache = new Map();
function xyToTile(xy) {
    const cached = xyToTileCache.get(xy);
    if (cached) {
        return cached;
    }
    const point = xyToPoint(xy);
    const tile = (point.x << 16) | point.y;
    xyToTileCache.set(xy, tile);
    return tile;
}
exports.xyToTile = xyToTile;
const xyHash = new Map();
let xyCounter = 0;
function tileToHash(xy) {
    let cached = xyHash.get(xy);
    if (!cached) {
        cached = xyCounter++;
        xyHash.set(xy, cached);
    }
    return cached;
}
exports.tileToHash = tileToHash;
const xyToPointCache = new Map();
function xyToPoint(str) {
    const cached = xyToPointCache.get(str);
    if (cached) {
        return { x: cached.x, y: cached.y };
    }
    const parts = str.split(",");
    const point = { x: parseInt(parts[0], 10), y: parseInt(parts[1], 10) };
    xyToPointCache.set(str, Object.freeze(point));
    return point;
}
exports.xyToPoint = xyToPoint;
function clamp(value, minInclusive, maxInclusive) {
    return Math.min(Math.max(value, minInclusive), maxInclusive);
}
exports.clamp = clamp;
function lerp(a, b, amount) {
    amount = clamp(amount, 0, 1);
    return a + (b - a) * amount;
}
exports.lerp = lerp;
function lookAt(displayObject, point) {
    displayObject.rotation = Math.atan2(point.y - displayObject.y, point.x - displayObject.x);
}
exports.lookAt = lookAt;
function layoutCenter(itemSize, margin, totalCount, current) {
    const halfSize = itemSize / 2;
    const halfMargin = margin / 2;
    return -(totalCount - 1) * (halfSize + halfMargin) + current * (itemSize + margin);
}
exports.layoutCenter = layoutCenter;
function sum(arr, key) {
    return arr.reduce((prev, curr) => {
        const value = curr[key];
        return typeof value === "number" ? prev + value : prev;
    }, 0);
}
exports.sum = sum;
function setContains(a, b) {
    let k;
    for (k in b) {
        if (!a[k]) {
            return false;
        }
    }
    return true;
}
exports.setContains = setContains;
function tabulateAdd(...params) {
    const result = {};
    params.forEach((param) => {
        forEach(param, (k, v) => {
            safeAdd(result, k, v);
        });
    });
    return result;
}
exports.tabulateAdd = tabulateAdd;
function safeParseInt(str, fallback = 0) {
    const parsed = parseInt(str, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}
exports.safeParseInt = safeParseInt;
function alphaNumericOf(str) {
    return str.replace(/[^0-9a-z]/gi, "");
}
exports.alphaNumericOf = alphaNumericOf;
function isAlphaNumeric(str) {
    return !!str.match(/^[a-z0-9]+$/i);
}
exports.isAlphaNumeric = isAlphaNumeric;
function containsNonASCII(str) {
    return [...str].some((char) => char.charCodeAt(0) > 127);
}
exports.containsNonASCII = containsNonASCII;
function shuffle(array, rand) {
    rand = rand !== null && rand !== void 0 ? rand : Math.random;
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
exports.shuffle = shuffle;
// eslint-disable-next-line @typescript-eslint/ban-types
function isEmpty(obj) {
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
exports.isEmpty = isEmpty;
function numberToRoman(num) {
    if (!+num)
        return null;
    const digits = String(+num).split("");
    // biome-ignore format:
    const key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM", "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC", "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
    let roman = "";
    let i = 3;
    while (i--)
        roman = (key[+digits.pop() + i * 10] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}
exports.numberToRoman = numberToRoman;
function romanToNumber(str) {
    str = str.toUpperCase();
    const validator = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/;
    const token = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g;
    // biome-ignore format:
    const key = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let num = 0, m;
    if (!(str && validator.test(str)))
        return null;
    while ((m = token.exec(str)))
        num += key[m[0]];
    return num;
}
exports.romanToNumber = romanToNumber;
function loadScript(src) {
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
exports.loadScript = loadScript;
function deepFreeze(object) {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(object);
    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = object[name];
        if ((value && typeof value === "object") || typeof value === "function") {
            deepFreeze(value);
        }
    }
    return Object.freeze(object);
}
exports.deepFreeze = deepFreeze;
function resolveIn(seconds, result) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(result), seconds * 1000);
    });
}
exports.resolveIn = resolveIn;
function rejectIn(seconds, reason = "Timeout") {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error(reason)), seconds * 1000);
    });
}
exports.rejectIn = rejectIn;
function schedule(func) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(func());
        }, 0);
    });
}
exports.schedule = schedule;
function getHMS(t) {
    let h = 0;
    let m = 0;
    let s = 0;
    const seconds = Math.floor(t / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (seconds < 60) {
        s = seconds;
    }
    else if (minutes < 60) {
        s = seconds - minutes * 60;
        m = minutes;
    }
    else {
        s = seconds - minutes * 60;
        m = minutes - hours * 60;
        h = hours;
    }
    return [h, m, s];
}
exports.getHMS = getHMS;
function formatHMS(t) {
    if (!Number.isFinite(t)) {
        return "--:--";
    }
    t = clamp(t, 0, Infinity);
    const hms = getHMS(t);
    if (hms[0] === 0) {
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
exports.formatHMS = formatHMS;
function formatHM(t) {
    t = clamp(t, 0, Infinity);
    const hms = getHMS(t);
    if (hms[0] === 0) {
        return `${hms[1]}m`;
    }
    if (hms[1] === 0) {
        return `${hms[0]}h`;
    }
    return `${hms[0]}h${pad(hms[1])}m`;
}
exports.formatHM = formatHM;
function pad(num) {
    return num < 10 ? `0${num}` : num;
}
function drawDashedLine(g, start, end, initial = 0, lineLength = 10, spaceLength = 20) {
    const startPos = (0, Vector2_1.v2)(start);
    const endPos = (0, Vector2_1.v2)(end);
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
        }
        else {
            g.lineTo(cursor.x, cursor.y);
            cursor.addSelf(spaceIncrement);
        }
        count++;
    }
    return count;
}
exports.drawDashedLine = drawDashedLine;
function isNullOrUndefined(v) {
    return v === null || typeof v === "undefined";
}
exports.isNullOrUndefined = isNullOrUndefined;
function hasFlag(value, flag) {
    return (value & flag) !== 0;
}
exports.hasFlag = hasFlag;
function setFlag(value, flag) {
    return (value | flag);
}
exports.setFlag = setFlag;
function clearFlag(value, flag) {
    return (value & ~flag);
}
exports.clearFlag = clearFlag;
function toggleFlag(value, flag) {
    return (value ^ flag);
}
exports.toggleFlag = toggleFlag;
function copyFlag(from, to, flag) {
    return hasFlag(from, flag) ? setFlag(to, flag) : clearFlag(to, flag);
}
exports.copyFlag = copyFlag;
function base64ToBytes(base64) {
    const binString = atob(base64);
    // @ts-expect-error
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
}
exports.base64ToBytes = base64ToBytes;
function bytesToBase64(bytes) {
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
}
exports.bytesToBase64 = bytesToBase64;
function filterInPlace(a, condition) {
    let i = 0;
    let j = 0;
    while (i < a.length) {
        const val = a[i];
        if (condition(val, i, a))
            a[j++] = val;
        i++;
    }
    a.length = j;
    return a;
}
exports.filterInPlace = filterInPlace;
