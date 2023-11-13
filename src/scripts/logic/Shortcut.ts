import { DependencyList, useEffect } from "react";
import { getGameOptions } from "../Global";
import { L, t } from "../utilities/i18n";

export const ShortcutScopes = {
   BuildingPage: () => t(L.ShortcutScopeBuildingPage),
   TechPage: () => t(L.ShortcutScopeTechPage),
} as const;

export type ShortcutScope = keyof typeof ShortcutScopes;

export const ShortcutActions = {
   BuildingPageSellBuilding: { scope: "BuildingPage", name: () => t(L.ShortcutBuildingPageSellBuilding) },
   BuildingPageUpgradeX1: { scope: "BuildingPage", name: () => t(L.ShortcutBuildingPageUpgradeX1) },
   BuildingPageUpgradeX5: { scope: "BuildingPage", name: () => t(L.ShortcutBuildingPageUpgradeX5) },
   BuildingPageUpgradeToNext10: { scope: "BuildingPage", name: () => t(L.ShortcutBuildingPageUpgradeToNext10) },
   TechPageGoBackToCity: { scope: "TechPage", name: () => t(L.ShortcutTechPageGoBackToCity) },
} satisfies Record<
   string,
   {
      scope: ShortcutScope;
      name: () => string;
   }
>;

export type Shortcut = keyof typeof ShortcutActions;

export interface IShortcutConfig {
   key: string;
   ctrl: boolean;
   alt: boolean;
   shift: boolean;
   meta: boolean;
}

export function useShortcut(shortcut: Shortcut, callback: () => void, deps?: DependencyList) {
   useEffect(() => {
      const handler = (e: KeyboardEvent) => {
         if (e.target instanceof HTMLInputElement) {
            return;
         }
         const s = getGameOptions().shortcuts[shortcut];
         if (s && isShortcutEqual(s, makeShortcut(e))) {
            callback();
         }
      };
      document.addEventListener("keydown", handler);
      return () => {
         document.removeEventListener("keydown", handler);
      };
   }, deps);
}

export function getShortcutKey(s: IShortcutConfig): string {
   const keys: string[] = [];
   if (s.ctrl) {
      keys.push("Ctrl");
   }
   if (s.shift) {
      keys.push("Shift");
   }
   if (s.alt) {
      keys.push("Alt");
   }
   if (s.meta) {
      keys.push("Command");
   }
   keys.push(s.key);
   return keys.join(" + ");
}

export function isShortcutEqual(a: IShortcutConfig, b: IShortcutConfig): boolean {
   return a.ctrl === b.ctrl && a.shift === b.shift && a.alt === b.alt && a.meta === b.meta && a.key === b.key;
}

export function makeShortcut(e: KeyboardEvent): IShortcutConfig {
   return {
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      meta: e.metaKey,
      key: e.key,
   };
}
