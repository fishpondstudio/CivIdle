import { forEach } from "../utilities/Helper";
import { TypedEvent } from "../utilities/TypedEvent";
import { L, t } from "../utilities/i18n";
import { getGameOptions } from "./GameStateLogic";

export const ShortcutScopes = {
   BuildingPage: () => t(L.ShortcutScopeBuildingPage),
   TechPage: () => t(L.ShortcutScopeTechPage),
   EmptyTilePage: () => t(L.ShortcutScopeEmptyTilePage),
} as const;

export type ShortcutScope = keyof typeof ShortcutScopes;

export const ShortcutActions = {
   BuildingPageSellBuilding: {
      scope: "BuildingPage",
      name: () => t(L.ShortcutBuildingPageSellBuilding),
   },
   BuildingPageUpgradeX1: { scope: "BuildingPage", name: () => t(L.ShortcutBuildingPageUpgradeX1) },
   BuildingPageUpgradeX5: { scope: "BuildingPage", name: () => t(L.ShortcutBuildingPageUpgradeX5) },
   BuildingPageUpgradeToNext10: {
      scope: "BuildingPage",
      name: () => t(L.ShortcutBuildingPageUpgradeToNext10),
   },
   TechPageGoBackToCity: { scope: "TechPage", name: () => t(L.ShortcutTechPageGoBackToCity) },
   TechPageUnlockTech: { scope: "TechPage", name: () => t(L.ShortcutTechPageUnlockTech) },
   EmptyTilePageBuildLastBuilding: {
      scope: "EmptyTilePage",
      name: () => t(L.EmptyTilePageBuildLastBuilding),
   },
} satisfies Record<string, IShortcutNameAndScope>;

export interface IShortcutNameAndScope {
   scope: ShortcutScope;
   name: () => string;
}

export type Shortcut = keyof typeof ShortcutActions;

export interface IShortcutConfig {
   key: string;
   ctrl: boolean;
   alt: boolean;
   shift: boolean;
   meta: boolean;
}

const OnKeydown = new TypedEvent<KeyboardEvent>();

document.addEventListener("keydown", OnKeydown.emit);

const shortcuts: Partial<Record<Shortcut, () => void>> = {};

export function getShortcuts() {
   return shortcuts;
}

export function clearShortcuts() {
   forEach(shortcuts, (k, v) => {
      shortcuts[k] = undefined;
   });
}

OnKeydown.on((e) => {
   if (e.target instanceof HTMLInputElement) {
      return;
   }
   forEach(getGameOptions().shortcuts, (shortcut, config) => {
      if (isShortcutEqual(config, makeShortcut(e))) {
         shortcuts[shortcut]?.();
      }
   });
});

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
