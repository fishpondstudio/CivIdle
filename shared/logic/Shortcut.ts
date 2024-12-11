import { forEach } from "../utilities/Helper";
import { TypedEvent } from "../utilities/TypedEvent";
import { L, t } from "../utilities/i18n";
import { getGameOptions } from "./GameStateLogic";

export const ShortcutScopes = {
   BuildingPage: () => t(L.ShortcutScopeBuildingPage),
   TechPage: () => t(L.ShortcutScopeTechPage),
   EmptyTilePage: () => t(L.ShortcutScopeEmptyTilePage),
   ConstructionPage: () => t(L.ShortcutScopeConstructionPage),
   UnexploredPage: () => t(L.ShortcutScopeUnexploredPage),
   GlobalCityPage: () => t(L.ShortcutScopeGlobalCityPage),
   PlayerMapPage: () => t(L.ShortcutScopePlayerMapPage),
} as const;

export type ShortcutScope = keyof typeof ShortcutScopes;

export const ShortcutActions = {
   BuildingPageSellBuilding: {
      scope: "BuildingPage",
      name: () => t(L.ShortcutBuildingPageSellBuildingV2),
   },
   BuildingPageUpgrade1: { scope: "BuildingPage", name: () => t(L.ShortcutBuildingPageUpgrade1) },
   BuildingPageUpgrade2: { scope: "BuildingPage", name: () => t(L.ShortcutBuildingPageUpgrade2) },
   BuildingPageUpgrade3: {
      scope: "BuildingPage",
      name: () => t(L.ShortcutBuildingPageUpgrade3),
   },
   BuildingPageUpgrade4: {
      scope: "BuildingPage",
      name: () => t(L.ShortcutBuildingPageUpgrade4),
   },
   BuildingPageUpgrade5: {
      scope: "BuildingPage",
      name: () => t(L.ShortcutBuildingPageUpgrade5),
   },
   BuildingPageToggleBuilding: {
      scope: "BuildingPage",
      name: () => t(L.ShortcutBuildingPageToggleBuilding),
   },
   BuildingPageToggleBuildingSetAllSimilar: {
      scope: "BuildingPage",
      name: () => t(L.ShortcutBuildingPageToggleBuildingSetAllSimilar),
   },
   UpgradePageIncreaseLevel: { scope: "ConstructionPage", name: () => t(L.ShortcutUpgradePageIncreaseLevel) },
   UpgradePageDecreaseLevel: { scope: "ConstructionPage", name: () => t(L.ShortcutUpgradePageDecreaseLevel) },
   UpgradePageEndConstruction: {
      scope: "ConstructionPage",
      name: () => t(L.ShortcutUpgradePageEndConstruction),
   },
   UpgradePageCancelUpgrade: { scope: "ConstructionPage", name: () => t(L.ShortcutUpgradePageCancelUpgrade) },
   TechPageGoBackToCity: { scope: "TechPage", name: () => t(L.ShortcutTechPageGoBackToCity) },
   TechPageUnlockTech: { scope: "TechPage", name: () => t(L.ShortcutTechPageUnlockTech) },
   EmptyTilePageBuildLastBuilding: {
      scope: "EmptyTilePage",
      name: () => t(L.EmptyTilePageBuildLastBuilding),
   },
   SendAnExplorer: {
      scope: "UnexploredPage",
      name: () => t(L.SendExplorer),
   },
   PlayerMapPageGoBackToCity: {
      scope: "PlayerMapPage",
      name: () => t(L.PlayerMapPageGoBackToCity),
   },
   TogglePetraWarp: {
      scope: "GlobalCityPage",
      name: () => t(L.ShortcutTogglePetraWarp),
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

export const OnKeydown = new TypedEvent<KeyboardEvent>();

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

   if (s.key === " ") {
      keys.push("Space");
   } else {
      keys.push(s.key);
   }

   return keys.join(" + ").toUpperCase();
}

export function isShortcutEqual(a: IShortcutConfig, b: IShortcutConfig): boolean {
   return (
      a.ctrl === b.ctrl &&
      a.shift === b.shift &&
      a.alt === b.alt &&
      a.meta === b.meta &&
      a.key.toUpperCase() === b.key.toUpperCase()
   );
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
