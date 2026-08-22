import { useEffect, useState } from "react";
import type { City } from "../../../shared/definitions/CityDefinitions";
import type { Material } from "../../../shared/definitions/MaterialDefinitions";
import {
   addPetraOfflineTime,
   BASE_WARP_HOUR,
   findSpecialBuilding,
   getPompidou,
   getRandomEmptyTile,
   hasNotUsedDinosaurProvincialPark,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { GameStateFlags, RebirthFlags } from "../../../shared/logic/GameState";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import {
   getFreeCityThisWeek,
   getGreatPeopleChoiceCount,
   getPermanentGreatPeopleLevel,
   getRebirthGreatPeopleCount,
   makeGreatPeopleFromThisRunPermanent,
   rollPermanentGreatPeople,
} from "../../../shared/logic/RebirthLogic";
import { getAllTechUnlockCost, getCurrentAge } from "../../../shared/logic/TechLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { UserAttributes } from "../../../shared/utilities/Database";
import { clamp, hasFlag, reduceOf, rejectIn, setFlag, uuid4 } from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { resetToCity, saveGame } from "../Global";
import { checkRebirthAchievements } from "../logic/Achievement";
import { clientHeartbeat } from "../logic/Heartbeat";
import { client, isOnlineUser, useTrades, useUser } from "../rpc/RPCClient";
import { playClick, playError } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";
import { html, RenderHTML } from "./RenderHTMLComponent";
import { WarningComponent } from "./WarningComponent";

export function RebirthConfirm({
   nextCity,
   pickPerRoll,
}: {
   nextCity: City;
   pickPerRoll: number;
}): React.ReactNode {
   const trades = useTrades();
   const user = useUser();
   const [tradeCount, setTradeCount] = useState<number>(
      trades.filter((trade) => trade.fromId === user?.userId).length,
   );
   useEffect(() => {
      client.getPendingClaims().then((claims) => setTradeCount((old) => old + claims.length));
   }, []);

   const gs = getGameState();
   const options = getGameOptions();
   const greatPeopleAtRebirthCount = getRebirthGreatPeopleCount();
   const extraTileForNextRebirth = Tick.current.specialBuildings.get("SydneyOperaHouse")?.building.level ?? 0;
   const showPompidouWarning =
      Tick.current.specialBuildings.has("CentrePompidou") &&
      (getCurrentAge(gs) !== "InformationAge" || gs.city === nextCity);

   const superintelligence = Tick.current.specialBuildings.get("Superintelligence");
   const showSuperIntelligenceWarning = superintelligence && superintelligence.building.level <= 1;

   const hasSupporterPack = () => {
      if (import.meta.env.DEV) {
         return true;
      }
      if (Config.City[nextCity].requireSupporterPack) {
         return (
            hasFlag(user?.attr ?? UserAttributes.None, UserAttributes.DLC1) ||
            getFreeCityThisWeek() === nextCity
         );
      }
      return true;
   };

   return (
      <div className="window" style={{ width: "400px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{$t(L.RebirthAsX, { city: Config.City[nextCity].name() })}</div>
         </div>
         <div className="window-body">
            <div className="col g5">
               {tradeCount > 0 ? (
                  <WarningComponent icon="warning" className="text-small">
                     <RenderHTML html={$t(L.RebornTradeWarning)} />
                  </WarningComponent>
               ) : null}
               {showPompidouWarning ? (
                  <WarningComponent icon="warning" className="text-small">
                     <RenderHTML
                        html={$t(L.CentrePompidouWarningHTML, {
                           civ: Config.City[nextCity].name(),
                        })}
                     />
                  </WarningComponent>
               ) : null}
               {hasNotUsedDinosaurProvincialPark() ? (
                  <WarningComponent icon="warning" className="text-small">
                     {html($t(L.DinosaurProvincialParkNotUsedWarningHTML))}
                  </WarningComponent>
               ) : null}
               {showSuperIntelligenceWarning ? (
                  <WarningComponent icon="warning" className="text-small">
                     {html($t(L.SuperintelligenceRebirthWarning))}
                  </WarningComponent>
               ) : null}
               <div>{$t(L.AreYouSureYouWantToRebirthAsX, { city: Config.City[nextCity].name() })}</div>
            </div>
            <div className="mt10">
               <div className="f1" />
               <button
                  className="text-strong w100"
                  onClick={async () => {
                     if (
                        getPermanentGreatPeopleLevel(getGameOptions()) <
                           Config.City[nextCity].requireGreatPeopleLevel ||
                        !hasSupporterPack()
                     ) {
                        playError();
                        return;
                     }

                     playClick();
                     hideModal();
                     const gameId = uuid4();

                     try {
                        await Promise.race([
                           client.rebirthV3(gameId, {
                              ageWisdom: options.ageWisdom,
                              greatPeople: options.greatPeople,
                           }),
                           rejectIn(10),
                        ]);
                     } catch (error) {
                        console.error(error);
                        if (!import.meta.env.DEV && isOnlineUser()) {
                           playError();
                           showToast($t(L.RebornOfflineWarning));
                           return;
                        }
                     }

                     const greatPeopleCount = clamp(
                        greatPeopleAtRebirthCount - gs.claimedGreatPeople,
                        0,
                        Number.POSITIVE_INFINITY,
                     );
                     const currentCity = gs.city;

                     if (!gs.rebirthed) {
                        rollPermanentGreatPeople(
                           greatPeopleCount,
                           pickPerRoll,
                           getGreatPeopleChoiceCount(gs),
                           getCurrentAge(gs),
                           gs.city,
                        ).forEach((gp) => {
                           getGameOptions().greatPeopleChoicesV2.push(gp);
                        });
                        makeGreatPeopleFromThisRunPermanent();
                        gs.rebirthed = true;
                     }

                     let carryOverWarp = 0;
                     const hq = findSpecialBuilding("Headquarter", getGameState());
                     const petra = findSpecialBuilding("Petra", getGameState());
                     if (hq && petra) {
                        carryOverWarp = clamp(hq.building.resources.Warp ?? 0, 0, BASE_WARP_HOUR * 60 * 60);
                     }
                     let carryOverScience = 0;
                     const superintelligence = findSpecialBuilding("Superintelligence", getGameState());
                     if (superintelligence) {
                        carryOverScience = superintelligence.building.level > 1 ? getAllTechUnlockCost() : 0;
                     }

                     const watchedResources = options.carryOverWatchedResources
                        ? gs.watchedResources
                        : new Set<Material>();
                     const watchedTradeable = options.carryOverWatchedTradeable
                        ? gs.watchedTradeable
                        : new Set<Material>();

                     checkRebirthAchievements(greatPeopleCount, gs);

                     let flags = RebirthFlags.None;
                     if (findSpecialBuilding("EasterBunny", gs)) {
                        flags |= RebirthFlags.EasterBunny;
                     }

                     getGameOptions().rebirthInfo.push({
                        greatPeopleAtRebirth: greatPeopleAtRebirthCount,
                        greatPeopleThisRun: reduceOf(gs.greatPeople, (prev, k, v) => prev + v, 0),
                        totalEmpireValue: Tick.current.totalValue,
                        totalTicks: gs.tick,
                        totalSeconds: gs.seconds,
                        city: currentCity,
                        time: Date.now(),
                        flags,
                     });

                     getGameOptions().showTutorial = false;

                     playClick();
                     await resetToCity(gameId, nextCity, extraTileForNextRebirth);

                     const pompidou = getPompidou(gs);
                     if (currentCity !== nextCity && pompidou) {
                        const result = getRandomEmptyTile(1, new Set(), getGameState());
                        if (result) {
                           const [xy, tile] = result;
                           tile.explored = true;
                           tile.building = pompidou;
                           pompidou.cities.add(currentCity);
                        }
                     }

                     if (carryOverWarp > 0) {
                        addPetraOfflineTime(carryOverWarp, getGameState());
                     }

                     if (carryOverScience > 0) {
                        const hq = findSpecialBuilding("Headquarter", getGameState());
                        if (hq) {
                           hq.building.resources.Science = carryOverScience;
                        }
                        getGameState().flags = setFlag(
                           getGameState().flags,
                           GameStateFlags.HasCarriedOverScience,
                        );
                     }

                     getGameState().watchedResources = watchedResources;
                     getGameState().watchedTradeable = watchedTradeable;

                     try {
                        await Promise.all([saveGame(), clientHeartbeat()]);
                        window.location.reload();
                     } catch (error) {
                        playError();
                        showToast(String(error));
                     }
                  }}
               >
                  {$t(L.RebirthAsX, { city: Config.City[nextCity].name() })}
               </button>
               <button
                  className="w100 mt5"
                  onClick={() => {
                     playClick();
                     hideModal();
                  }}
               >
                  {$t(L.Cancel)}
               </button>
            </div>
         </div>
      </div>
   );
}
