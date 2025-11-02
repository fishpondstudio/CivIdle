import { Preferences } from "@capacitor/preferences";
import { Sprite, type Application } from "pixi.js";
import type { Building } from "../../shared/definitions/BuildingDefinitions";
import type { City } from "../../shared/definitions/CityDefinitions";
import { NoPrice, NoStorage } from "../../shared/definitions/MaterialDefinitions";
import type { TechAge } from "../../shared/definitions/TechDefinitions";
import {
   exploreTile,
   findSpecialBuilding,
   getBuildingCost,
   getTotalBuildingCost,
   isWorldOrNaturalWonder,
} from "../../shared/logic/BuildingLogic";
import { Config } from "../../shared/logic/Config";
import type { GameOptions, SavedGame } from "../../shared/logic/GameState";
import { GameState } from "../../shared/logic/GameState";
import {
   GameOptionsChanged,
   GameStateChanged,
   deserializeSave,
   getGameOptions,
   getGameState,
   notifyGameStateUpdate,
   savedGame,
   serializeSave,
} from "../../shared/logic/GameStateLogic";
import { initializeGameState } from "../../shared/logic/InitializeGameState";
import {
   getGreatPeopleChoiceCount,
   rollGreatPeopleThisRun,
   rollPermanentGreatPeople,
} from "../../shared/logic/RebirthLogic";
import { getResourcesValue } from "../../shared/logic/ResourceLogic";
import { Tick } from "../../shared/logic/TickLogic";
import { Transports } from "../../shared/logic/Transports";
import { AccountLevel, UserAttributes } from "../../shared/utilities/Database";
import {
   base64ToBytes,
   clamp,
   clearFlag,
   forEach,
   formatNumber,
   keysOf,
   resolveIn,
   safeAdd,
   sizeOf,
   uuid4,
} from "../../shared/utilities/Helper";
import { TypedEvent } from "../../shared/utilities/TypedEvent";
import { UnicodeText } from "../../shared/utilities/UnicodeText";
import { migrateSavedGame } from "./MigrateSavedGame";
import { tickEverySecond } from "./logic/ClientUpdate";
import { clientHeartbeat } from "./logic/Heartbeat";
import { getUser } from "./rpc/RPCClient";
import { SteamClient, isSteam } from "./rpc/SteamClient";
import { WorldScene } from "./scenes/WorldScene";
import { AccountRankUpModal } from "./ui/AccountRankUpModal";
import { BuildingCompleteModal } from "./ui/BuildingCompleteModal";
import { showModal } from "./ui/GlobalModal";
import { OfflineProductionModal } from "./ui/OfflineProductionModal";
import { SupporterPackModal } from "./ui/SupporterPackModal";
import { idbClear, idbGet, idbSet } from "./utilities/BrowserStorage";
import { makeObservableHook } from "./utilities/Hook";
import { isAndroid, isIOS } from "./utilities/Platforms";
import { Singleton } from "./utilities/Singleton";
import { Fonts } from "./visuals/Fonts";
import { clearGreatPersonImageCache } from "./visuals/GreatPersonVisual";
import { compress, decompress } from "./workers/Compress";

export async function resetToCity(id: string, city: City, extraTileSize: number): Promise<void> {
   Transports.length = 0;
   savedGame.current = new GameState();
   savedGame.current.id = id;
   savedGame.current.city = city;
   savedGame.current.mapSize = Config.City[city].size + extraTileSize;
   initializeGameState(savedGame.current, savedGame.options);
}

export function overwriteSaveGame(save: SavedGame): void {
   Object.assign(savedGame, save);
}

export const OnUIThemeChanged = new TypedEvent<boolean>();
export const ToggleChatWindow = new TypedEvent<boolean>();

export function syncUITheme(gameOptions: GameOptions): void {
   gameOptions.useModernUI ? document.body.classList.add("modern") : document.body.classList.remove("modern");
   switch (gameOptions.cursor) {
      case "BigOldFashioned":
         document.body.classList.add("big-old-fashioned-cursor");
         break;
      case "OldFashioned":
         document.body.classList.add("old-fashioned-cursor");
         break;
      case "System":
         break;
      default:
         document.body.classList.add("old-fashioned-cursor");
   }
   OnUIThemeChanged.emit(getGameOptions().useModernUI);
}

export function syncSidePanelWidth(app: Application, options: GameOptions): void {
   const width = isAndroid() || isIOS() ? options.sidePanelWidthMobile : options.sidePanelWidth;
   document.documentElement.style.setProperty("--game-ui-width", `${width / 10}rem`);
   app.resize();
}

export function syncFontSizeScale(app: Application, options: GameOptions): void {
   if (!options.useModernUI) {
      document.documentElement.style.setProperty("--base-font-size", "62.5%");
      return;
   }
   const scale = isAndroid() || isIOS() ? options.fontSizeScaleMobile : options.fontSizeScale;
   document.documentElement.style.setProperty("--base-font-size", `${scale * 62.5}%`);
   app.resize();
}

export function syncFontVariantNumeric(options: GameOptions): void {
   document.documentElement.style.setProperty(
      "--font-variant-numeric",
      options.useMonospaceNumbers ? "tabular-nums" : "normal",
   );
}

const SaveKey = "CivIdle";
const SaveKeyNew = "CivIdleNew";

interface ISaveGameTask {
   resolve: () => void;
   reject: (err: any) => void;
}

const saveGameQueue: ISaveGameTask[] = [];

export async function saveGame(): Promise<void> {
   let resolve: (() => void) | null = null;
   let reject: (() => void) | null = null;

   const promise = new Promise<void>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
   });

   saveGameQueue.push({ resolve: resolve!, reject: reject! });

   if (saveGameQueue.length === 1) {
      doSaveGame(saveGameQueue[0]);
   }

   return promise;
}

export async function doSaveGame(task: ISaveGameTask): Promise<void> {
   try {
      if (isSteam()) {
         const serialized = serializeSave(savedGame);
         await SteamClient.fileWriteCompressed(SaveKey, serialized);
      } else if (isAndroid() || isIOS()) {
         await Preferences.set({ key: SaveKeyNew, value: serializeSave(savedGame) });
      } else {
         await idbSet(SaveKeyNew, serializeSave(savedGame));
      }
      task.resolve();
   } catch (error) {
      task.reject(error);
   } finally {
      const index = saveGameQueue.indexOf(task);
      if (index !== -1) {
         saveGameQueue.splice(index, 1);
      }
      if (saveGameQueue.length > 0) {
         doSaveGame(saveGameQueue[0]);
      }
   }
}

export async function hardReset(): Promise<void> {
   if (isSteam()) {
      await SteamClient.fileDelete(SaveKey);
   } else if (isAndroid() || isIOS()) {
      await Preferences.clear();
   } else {
      await idbClear();
   }
}

export async function compressSave(gs: SavedGame = savedGame): Promise<Uint8Array> {
   return await compress(new TextEncoder().encode(serializeSave(gs)));
}

export async function decompressSave(data: Uint8Array): Promise<SavedGame> {
   return deserializeSave(new TextDecoder().decode(await decompress(data)));
}

export async function loadGame(): Promise<SavedGame | null> {
   try {
      console.time("Loading Save file");
      if (isSteam()) {
         const bytes = await SteamClient.fileReadBytes(SaveKey);
         return await decompressSave(new Uint8Array(bytes));
      }
      if (isAndroid() || isIOS()) {
         const string = (await Preferences.get({ key: SaveKeyNew })).value;
         if (string) {
            return deserializeSave(string);
         }
         const oldSaveString = (await Preferences.get({ key: SaveKey })).value;
         if (oldSaveString) {
            return await decompressSave(base64ToBytes(oldSaveString));
         }
         return null;
      }
      const string = await idbGet<string>(SaveKeyNew);
      if (string) {
         return deserializeSave(string);
      }
      const oldSaveBytes = await idbGet<Uint8Array>(SaveKey);
      if (oldSaveBytes) {
         return await decompressSave(oldSaveBytes);
      }
      return null;
   } catch (e) {
      console.warn("loadGame failed", e);
      return null;
   } finally {
      console.timeEnd("Loading Save file");
   }
}

export function isGameDataCompatible(gs: SavedGame): boolean {
   if (savedGame.options.version !== gs.options.version) {
      return false;
   }
   migrateSavedGame(gs);
   Object.assign(savedGame.current, gs.current);
   gs.options.themeColors = Object.assign(savedGame.options.themeColors, gs.options.themeColors);
   Object.assign(savedGame.options, gs.options);
   return true;
}

export const useGameState = makeObservableHook(GameStateChanged, getGameState);
export const useGameOptions = makeObservableHook(GameOptionsChanged, getGameOptions);

let floatingMode = false;
export const FloatingModeChanged = new TypedEvent<boolean>();
FloatingModeChanged.on((mode) => {
   floatingMode = mode;
});
export const useFloatingMode = makeObservableHook(FloatingModeChanged, () => floatingMode);

export function getProductionPriority(v: number): number {
   return v & 0x0000ff;
}

function setProductionPriority(priority: number, v: number): number {
   return (priority & 0xffff00) | (v & 0xff);
}

export function getConstructionPriority(v: number): number {
   return (v & 0x00ff00) >> 8;
}

function setConstructionPriority(priority: number, v: number): number {
   return (priority & 0xff00ff) | ((v & 0xff) << 8);
}

function getUpgradePriority(v: number): number {
   return (v & 0xff0000) >> 16;
}

function setUpgradePriority(priority: number, v: number): number {
   return (priority & 0x00ffff) | ((v & 0xff) << 16);
}

if (import.meta.env.DEV) {
   // @ts-expect-error
   window.savedGame = savedGame;
   // @ts-expect-error
   window.reset = async () => {
      hardReset().then(() => {
         window.location.reload();
      });
   };
   // @ts-expect-error
   window.clearAllResources = () => {
      getGameState().tiles.forEach((tile) => {
         if (tile.building) {
            tile.building.resources = {};
         }
      });
   };
   // @ts-expect-error
   window.saveGame = () => {
      saveGame().then(() => window.location.reload());
   };
   // @ts-expect-error
   window.rollPermanentGreatPeople = (rollCount: number, age: TechAge) => {
      const gs = getGameState();
      rollPermanentGreatPeople(
         rollCount,
         clamp(Math.floor(rollCount / sizeOf(Config.GreatPerson)), 1, Number.POSITIVE_INFINITY),
         getGreatPeopleChoiceCount(gs),
         age,
         gs.city,
      ).forEach((gp) => {
         getGameOptions().greatPeopleChoicesV2.push(gp);
      });
   };
   // @ts-expect-error
   window.cameraPan = (target: number, time: number) => {
      Singleton().sceneManager.getCurrent(WorldScene)?.cameraPan(target, time);
   };
   // @ts-expect-error
   window.rollGreatPeople = (age: TechAge, candidate: number) => {
      const gs = getGameState();
      const candidates = rollGreatPeopleThisRun(new Set([age]), getGameState().city, candidate);
      if (candidates) {
         gs.greatPeopleChoicesV2.push(candidates);
      }
      notifyGameStateUpdate(gs);
   };

   // @ts-expect-error
   window.completeBuilding = (xy: Tile) => {
      const building = getGameState().tiles.get(xy)?.building;
      if (building) {
         forEach(getBuildingCost(building), (res, amount) => {
            building.resources[res] = amount;
         });
      }
   };

   // @ts-expect-error
   window.showComplete = (building: Building) => {
      showModal(<BuildingCompleteModal building={building} />);
   };

   // @ts-expect-error
   window.showSupporterPack = () => {
      showModal(<SupporterPackModal />);
   };

   // @ts-expect-error
   window.rankUp = () => {
      showModal(<AccountRankUpModal rank={AccountLevel.Consul} user={getUser()!} />);
   };

   // @ts-expect-error
   window.offline = () => {
      const gs = getGameState();
      showModal(
         <OfflineProductionModal
            before={gs}
            after={gs}
            totalOfflineTime={500}
            offlineProductionTime={100}
            warpFull={true}
         />,
      );
   };

   // @ts-expect-error
   window.removeSupporterPack = () => {
      const user = getUser();
      if (user) {
         user.attr = clearFlag(user.attr, UserAttributes.DLC1);
      }
   };

   // @ts-expect-error
   window.revealAllTiles = () => {
      const gs = getGameState();
      gs.tiles.forEach((tile, xy) => {
         if (!tile.explored) {
            exploreTile(xy, gs);
            Singleton().sceneManager.enqueue(WorldScene, (s) => s.revealTile(xy));
         }
      });
   };

   // @ts-expect-error
   window.revealTile = (xy: Tile) => {
      const gs = getGameState();
      exploreTile(xy, gs);
      Singleton().sceneManager.enqueue(WorldScene, (s) => s.revealTile(xy));
   };

   // @ts-expect-error
   window.clearGreatPersonImageCache = () => {
      clearGreatPersonImageCache().then(console.log).catch(console.error);
   };

   // @ts-expect-error
   window.getBuildingValue = (building: Building, level: number) => {
      return formatNumber(getResourcesValue(getTotalBuildingCost({ type: building }, 0, level)));
   };

   // @ts-expect-error
   window.tickGameState = (tick: number) => {
      const gs = getGameState();
      for (let i = 0; i < tick; i++) {
         tickEverySecond(gs, true);
      }
   };

   // @ts-expect-error
   window.clientHeartbeat = () => {
      clientHeartbeat();
   };

   // @ts-expect-error
   window.benchmarkTick = (tick: number) => {
      console.time(`TickGameState(${tick})`);
      const gs = getGameState();
      for (let i = 0; i < tick; i++) {
         tickEverySecond(gs, true);
      }
      console.timeEnd(`TickGameState(${tick})`);
   };
   // @ts-expect-error
   window.addAllResources = (amount: number) => {
      forEach(Config.Material, (res, def) => {
         if (NoStorage[res] || NoPrice[res]) {
            return;
         }
         safeAdd(Tick.current.specialBuildings.get("Headquarter")!.building.resources, res, amount);
      });
   };

   // @ts-expect-error
   window.loadSave = async () => {
      const [handle] = await window.showOpenFilePicker();
      const file = await handle.getFile();
      const bytes = await file.arrayBuffer();
      const save = await decompressSave(new Uint8Array(bytes));
      save.options.userId = `web:${uuid4()}`;
      overwriteSaveGame(save);
      await saveGame();
      window.location.reload();
   };

   // @ts-expect-error
   window.Config = Config;

   // @ts-expect-error
   window.hq = () => findSpecialBuilding("Headquarter", getGameState());

   // @ts-expect-error
   window.wonders = async () => {
      for (const building of keysOf(Config.Building)) {
         if (isWorldOrNaturalWonder(building)) {
            const context = Singleton().sceneManager.getContext();
            const container = new Sprite(context.textures.Misc_Tile9);
            const sprite = container.addChild(new Sprite(context.textures[`Building_${building}`]));
            sprite.anchor.set(0.5, 0.5);
            sprite.position.set(0.5 * container.width, 0.425 * container.height);
            sprite.tint = 0x333333;
            sprite.scale.set(1.25);
            const text = container.addChild(
               new UnicodeText(
                  Config.Building[building].name(),
                  {
                     fontName: `${Fonts.Cabin}NoShadow`,
                     fontSize: 32,
                     tint: 0x333333,
                  },
                  {
                     dropShadow: true,
                     dropShadowAlpha: 0.75,
                     dropShadowColor: "#000000",
                     dropShadowAngle: Math.PI / 6,
                     dropShadowBlur: 0,
                     dropShadowDistance: 1,
                  },
               ),
            );
            while (text.width > container.width * 0.8) {
               --text.size;
            }
            text.anchor.set(0.5, 0.5);
            text.position.set(0.5 * container.width, 0.7 * container.height);
            const image = await context.app.renderer.extract.image(container);
            const link = document.createElement("a");
            link.href = image.src;
            link.download = `${Config.Building[building].name()}.png`;
            link.click();
            link.remove();
            console.log(`${Config.Building[building].name()}`);
            await resolveIn(0.5, null);
         }
      }
   };
}
