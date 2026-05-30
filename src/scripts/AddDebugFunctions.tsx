import { Sprite } from "pixi.js";
import { NoPrice, NoStorage } from "../../shared/definitions/MaterialDefinitions";
import { exploreTile, getTotalBuildingCost, isWorldOrNaturalWonder } from "../../shared/logic/BuildingLogic";
import { Config } from "../../shared/logic/Config";
import {
   checksum,
   getGameOptions,
   getGameState,
   notifyGameStateUpdate,
   savedGame,
} from "../../shared/logic/GameStateLogic";
import {
   getGreatPeopleChoiceCount,
   rollGreatPeopleThisRun,
   rollPermanentGreatPeople,
} from "../../shared/logic/RebirthLogic";
import { getResourcesValue } from "../../shared/logic/ResourceLogic";
import { Tick } from "../../shared/logic/TickLogic";
import { AccountLevel, UserAttributes } from "../../shared/utilities/Database";
import {
   clamp,
   clearFlag,
   forEach,
   formatNumber,
   keysOf,
   resolveIn,
   safeAdd,
   uuid4,
} from "../../shared/utilities/Helper";
import { UnicodeText } from "../../shared/utilities/UnicodeText";
import { decompressSave, overwriteSaveGame, resetToCity, saveGame } from "./Global";
import { tickEverySecond } from "./logic/ClientUpdate";
import { clientHeartbeat } from "./logic/Heartbeat";
import { getUser } from "./rpc/RPCClient";
import { WorldScene } from "./scenes/WorldScene";
import { AccountRankUpModal } from "./ui/AccountRankUpModal";
import { BuildingCompleteModal } from "./ui/BuildingCompleteModal";
import { showModal } from "./ui/GlobalModal";
import { IdeaTreeModal } from "./ui/IdeaTreeModal";
import { OfflineProductionModal } from "./ui/OfflineProductionModal";
import { PaintingModal } from "./ui/PaintingModal";
import { SupporterPackModal } from "./ui/SupporterPackModal";
import { Singleton } from "./utilities/Singleton";
import { Fonts } from "./visuals/Fonts";
import { clearGreatPersonImageCache } from "./visuals/GreatPersonVisual";

export function addDebugFunctions(): void {
   if (!import.meta.env.DEV) {
      return;
   }
   // @ts-expect-error
   window.savedGame = savedGame;
   // @ts-expect-error
   window.reset = (city: City = "Rome") => {
      resetToCity(uuid4(), city, 0)
         .then(() => saveGame())
         .then(() => window.location.reload());
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
   window.save = () => {
      saveGame().then(() => window.location.reload());
   };
   // @ts-expect-error
   window.rollPermanentGreatPeople = (rollCount: number, age: TechAge) => {
      const gs = getGameState();
      rollPermanentGreatPeople(
         rollCount,
         clamp(Math.floor(rollCount / 10), 1, Number.POSITIVE_INFINITY),
         getGreatPeopleChoiceCount(gs),
         age,
         gs.city,
      ).forEach((gp) => {
         getGameOptions().greatPeopleChoicesV2.push(gp);
      });
   };
   // @ts-expect-error
   window.upgradePermanentGreatPeople = (level = 5) => {
      const options = getGameOptions();
      forEach(Config.GreatPerson, (gp, def) => {
         options.greatPeople[gp] = { level, amount: 0 };
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
   window.completeBuildings = () => {
      getGameState().tiles.forEach((data, tile) => {
         if (data.building && data.building.status !== "completed") {
            const building = data.building;
            forEach(getTotalBuildingCost(building, building.level, building.desiredLevel), (res, amount) => {
               building.resources[res] = amount;
            });
         }
      });
   };

   // @ts-expect-error
   window.showComplete = (building: Building) => {
      showModal(<BuildingCompleteModal building={building} />);
   };

   // @ts-expect-error
   window.formatNumber = formatNumber;

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
   window.validateSave = async () => {
      const [handle] = await window.showOpenFilePicker();
      const file = await handle.getFile();
      const bytes = await file.arrayBuffer();
      await decompressSave(new Uint8Array(bytes));
      console.log(checksum);
   };

   // @ts-expect-error
   window.Config = Config;

   // @ts-expect-error
   window.hq = () => findSpecialBuildingCached("Headquarter", getGameState());

   // @ts-expect-error
   window.ideaTree = () => {
      showModal(<IdeaTreeModal />);
   };

   // @ts-expect-error
   window.paintingModal = () => {
      showModal(<PaintingModal painting="GirlWithAPearlEarring" />);
   };

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
