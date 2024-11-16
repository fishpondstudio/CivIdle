import { Capacitor } from "@capacitor/core";

export function isAndroid() {
   return Capacitor.getPlatform() === "android";
}

export function isIOS() {
   return Capacitor.getPlatform() === "ios";
}
