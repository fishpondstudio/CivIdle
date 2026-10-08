import type { IShortcutConfig, Shortcut } from "./Shortcut";

function shortcut(key: string, modifiers: Partial<Omit<IShortcutConfig, "key">> = {}): IShortcutConfig {
   return {
      key,
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
      ...modifiers,
   };
}

/** The default bindings used for new games. */
export const DEFAULT_SHORTCUTS: Record<Shortcut, IShortcutConfig> = {
   ShortcutPageSave: shortcut("s"),
   ShortcutPageClear: shortcut("c"),
   ShortcutPageAssign: shortcut("a"),
   BuildingPageSellBuilding: shortcut("Delete"),
   BuildingPageUpgrade1: shortcut("1"),
   BuildingPageUpgrade2: shortcut("2"),
   BuildingPageUpgrade3: shortcut("3"),
   BuildingPageUpgrade4: shortcut("4"),
   BuildingPageUpgrade5: shortcut("5"),
   BuildingPageToggleBuilding: shortcut("v"),
   BuildingPageToggleBuildingSetAllSimilar: shortcut("v", { shift: true }),
   UpgradePageIncreaseLevel: shortcut("1"),
   UpgradePageDecreaseLevel: shortcut("½"),
   UpgradePageEndConstruction: shortcut("Enter"),
   UpgradePageCancelUpgrade: shortcut("x"),
   UpgradePageCancelAllUpgrades: shortcut("x", { shift: true }),
   TechPageGoBackToCity: shortcut("Escape"),
   TechPageUnlockTech: shortcut("Enter"),
   EmptyTilePageBuildLastBuilding: shortcut("b"),
   EmptyTilePageFilterWonder: shortcut("w"),
   EmptyTilePageFilterTier1: shortcut("1"),
   EmptyTilePageFilterTier2: shortcut("2"),
   EmptyTilePageFilterTier3: shortcut("3"),
   EmptyTilePageFilterTier4: shortcut("4"),
   EmptyTilePageFilterTier5: shortcut("5"),
   EmptyTilePageFilterTier6: shortcut("6"),
   EmptyTilePageFilterTier7: shortcut("7"),
   EmptyTilePageFilterTier8: shortcut("8"),
   SendAnExplorer: shortcut("e"),
   PlayerMapPageGoBackToCity: shortcut("Escape"),
};
