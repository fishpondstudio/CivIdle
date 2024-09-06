import { Advisors } from "../../../shared/definitions/AdvisorDefinitions";
import { GreatPersonTickFlag } from "../../../shared/definitions/GreatPersonDefinitions";
import { OnTileExplored, getScienceFromWorkers } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { ValueToTrack, type GameState } from "../../../shared/logic/GameState";
import {
   getGameOptions,
   notifyGameStateUpdate,
   serializeSaveLite,
} from "../../../shared/logic/GameStateLogic";
import { calculateHappiness } from "../../../shared/logic/HappinessLogic";
import { clearIntraTickCache, getBuildingsByType } from "../../../shared/logic/IntraTickCache";
import { getGreatPersonThisRunLevel } from "../../../shared/logic/RebirthLogic";
import { RequestResetTile } from "../../../shared/logic/TechLogic";
import { CurrentTickChanged, EmptyTickData, Tick, freezeTickData } from "../../../shared/logic/TickLogic";
import {
   OnBuildingComplete,
   OnBuildingProductionComplete,
   OnPriceUpdated,
   RequestChooseGreatPerson,
   RequestFloater,
   getSortedTiles,
   tickPower,
   tickPrice,
   tickTile,
   tickTransports,
   tickUnlockable,
} from "../../../shared/logic/Update";
import { clamp, forEach, safeAdd, type Tile } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { saveGame } from "../Global";
import { isSteam } from "../rpc/SteamClient";
import { WorldScene } from "../scenes/WorldScene";
import { AdvisorModal } from "../ui/AdvisorModal";
import { ChooseGreatPersonModal } from "../ui/ChooseGreatPersonModal";
import { hasOpenModal, showModal, showToast } from "../ui/GlobalModal";
import { makeObservableHook } from "../utilities/Hook";
import { Singleton } from "../utilities/Singleton";
import { playAgeUp, playDing } from "../visuals/Sound";
import { onBuildingComplete } from "./OnBuildingComplete";
import { onProductionComplete } from "./OnProductionComplete";
import { onTileExplored } from "./OnTileExplored";
import { TimeSeries } from "./TimeSeries";

export function shouldTick(): boolean {
   return isSteam() || document.visibilityState === "visible";
}

let timeSinceLastTick = 0;

export function tickEveryFrame(gs: GameState, dt: number) {
   timeSinceLastTick = Math.min(timeSinceLastTick + dt, 1);
   const worldScene = Singleton().sceneManager.getCurrent(WorldScene);
   if (worldScene) {
      for (const xy of gs.tiles.keys()) {
         worldScene.updateTile(xy, dt);
      }
      worldScene.updateTransportVisual(gs, timeSinceLastTick);
   }

   const targetProgress = Math.ceil(timeSinceLastTick * tickTileQueueSize * Singleton().ticker.speedUp);
   const currentProgress = tickTileQueueSize - tickTileQueue.length;
   const toProcess = clamp(targetProgress - currentProgress, 0, tickTileQueue.length);
   tickTileQueue.splice(0, toProcess).forEach((tile) => tickTile(tile, gs, false));
}

const heartbeatFreq = import.meta.env.DEV ? 10 : 60;
const saveFreq = isSteam() ? 60 : 10;

let tickTileQueue: Tile[] = [];
let tickTileQueueSize = 0;

let currentSessionTick = 0;
export function tickEverySecond(gs: GameState, offline: boolean) {
   // We should always tick when offline
   if (!offline && !shouldTick()) {
      return;
   }
   timeSinceLastTick = 0;

   if (!offline) {
      tickTileQueue.forEach((tile) => tickTile(tile, gs, false));
      postTickTiles(gs, false);
   }

   Tick.next.tick = ++currentSessionTick;
   Tick.current = freezeTickData(Tick.next);
   Tick.next = EmptyTickData();
   clearIntraTickCache();

   forEach(gs.unlockedTech, (tech) => {
      const td = Config.Tech[tech];
      tickUnlockable(td, t(L.SourceResearch, { tech: td.name() }), gs);
   });

   forEach(gs.greatPeople, (person, level) => {
      const greatPerson = Config.GreatPerson[person];
      greatPerson.tick(
         greatPerson,
         getGreatPersonThisRunLevel(level),
         t(L.SourceGreatPerson, { person: greatPerson.name() }),
         GreatPersonTickFlag.None,
      );
   });

   forEach(getGameOptions().greatPeople, (person, v) => {
      const greatPerson = Config.GreatPerson[person];
      greatPerson.tick(
         greatPerson,
         v.level,
         t(L.SourceGreatPersonPermanent, { person: greatPerson.name() }),
         GreatPersonTickFlag.None,
      );
   });

   tickPrice(gs);
   tickTransports(gs);

   const tiles = getSortedTiles(gs);

   if (offline) {
      tiles.forEach(function forEachTickTile([tile, _building]) {
         tickTile(tile, gs, offline);
      });
      postTickTiles(gs, offline);
   } else {
      tickTileQueue = tiles.map(([tile, _building]) => tile);
      tickTileQueueSize = tickTileQueue.length;
      checkForAdvisors(gs);
   }
}

function checkForAdvisors(gs: GameState) {
   if (gs.tick % 10 !== 0) {
      return;
   }
   if (hasOpenModal()) {
      return;
   }
   const options = getGameOptions();

   forEach(Advisors, (k, v) => {
      if (!options.disabledTutorials.has(k) && v.condition(gs)) {
         showModal(<AdvisorModal advisor={k} />);
         // break
         return true;
      }
   });
}

let lastTickTime = Date.now();

function postTickTiles(gs: GameState, offline: boolean) {
   tickPower(gs);

   Tick.next.happiness = calculateHappiness(gs);
   const { scienceFromWorkers } = getScienceFromWorkers(gs);
   const hq = Tick.current.specialBuildings.get("Headquarter")?.building.resources;
   if (hq) {
      safeAdd(hq, "Science", scienceFromWorkers);
   }

   let tracker = gs.valueTrackers.get(ValueToTrack.EmpireValue);
   if (!tracker) {
      tracker = { accumulated: 0, history: [] };
      gs.valueTrackers.set(ValueToTrack.EmpireValue, tracker);
   }
   // Here we use Tick.next, make sure this is the last code before we increase the tick
   tracker.accumulated += Tick.next.totalValue;
   if (gs.tick % 3600 === 0) {
      tracker.history.push(tracker.accumulated / 3600);
      tracker.accumulated = 0;
   }
   gs.valueTrackers.set(ValueToTrack.EmpireValue, tracker);

   ++gs.tick;

   while (Date.now() - lastTickTime > 1000) {
      lastTickTime += 1000;
      ++gs.seconds;
   }

   if (!offline) {
      const speed = Singleton().ticker.speedUp;
      if (gs.tick % speed === 0) {
         CurrentTickChanged.emit(Tick.current);
         Singleton().sceneManager.getCurrent(WorldScene)?.flushFloater(speed);
         notifyGameStateUpdate();
      }
      if (gs.tick % (saveFreq * speed) === 0) {
         saveGame().catch(console.error);
      }
      if (gs.tick % (heartbeatFreq * speed) === 0) {
         Singleton().heartbeat.update(serializeSaveLite());
      }
   }

   if (Tick.current.totalValue > 0 && Tick.current.tick > 10) {
      TimeSeries.add(gs.tick, Tick.current.totalValue, hq?.Science ?? 0);
   }
}

// Make sure we do event subscription here. If we do it in the individual file, it might mistakenly get
// eliminated by the dead code elimination!

RequestFloater.on(({ xy, amount }) => {
   Singleton().sceneManager.getCurrent(WorldScene)?.showFloater(xy, amount);
});
RequestResetTile.on((xy) => {
   Singleton().sceneManager.enqueue(WorldScene, (s) => s.resetTile(xy));
});
OnTileExplored.on(onTileExplored);
OnBuildingComplete.on(onBuildingComplete);
OnBuildingProductionComplete.on(onProductionComplete);
OnPriceUpdated.on((gs) => {
   const count = getBuildingsByType("Market", gs)?.size ?? 0;
   if (count > 0) {
      showToast(t(L.MarketRefreshMessage, { count }));
      playDing();
   }
});
RequestChooseGreatPerson.on(({ permanent }) => {
   playAgeUp();
   showModal(<ChooseGreatPersonModal permanent={permanent} />);
});

export const useCurrentTick = makeObservableHook(CurrentTickChanged, () => Tick.current);
