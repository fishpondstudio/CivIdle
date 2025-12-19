import Tippy from "@tippyjs/react";
import { useEffect, useState } from "react";
import type { City } from "../../../shared/definitions/CityDefinitions";
import {
   findSpecialBuilding,
   getBuildingDescription,
   getMultipliersDescription,
   getPompidou,
   getRandomEmptyTiles,
} from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import { SUPPORTER_PACK_URL } from "../../../shared/logic/Constants";
import { RebirthFlags } from "../../../shared/logic/GameState";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import {
   getFreeCityThisWeek,
   getGreatPeopleChoiceCount,
   getPermanentGreatPeopleLevel,
   getRebirthGreatPeopleCount,
   makeGreatPeopleFromThisRunPermanent,
   rollPermanentGreatPeople,
} from "../../../shared/logic/RebirthLogic";
import { getAgeForTech, getCurrentAge } from "../../../shared/logic/TechLogic";
import { Tick } from "../../../shared/logic/TickLogic";
import { UserAttributes } from "../../../shared/utilities/Database";
import {
   clamp,
   entriesOf,
   formatPercent,
   hasFlag,
   isEmpty,
   mapOf,
   range,
   reduceOf,
   rejectIn,
   safeParseInt,
   uuid4,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { resetToCity, saveGame, useGameState } from "../Global";
import { checkRebirthAchievements } from "../logic/Achievement";
import { clientHeartbeat } from "../logic/Heartbeat";
import { canEarnGreatPeopleFromReborn, client, isOnlineUser, useTrades, useUser } from "../rpc/RPCClient";
import { jsxMapOf } from "../utilities/Helper";
import { openUrl } from "../utilities/Platform";
import { GreatPersonImage } from "../visuals/GreatPersonVisual";
import { playClick, playError } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";
import { html, RenderHTML } from "./RenderHTMLComponent";
import { TextWithHelp } from "./TextWithHelpComponent";
import { BuildingSpriteComponent, DepositTextureComponent, MiscTextureComponent } from "./TextureSprites";
import { WarningComponent } from "./WarningComponent";

export function RebirthModal(): React.ReactNode {
   const trades = useTrades();
   const user = useUser();
   const options = getGameOptions();
   const [tradeCount, setTradeCount] = useState<number>(
      trades.filter((t) => t.fromId === user?.userId).length,
   );
   useEffect(() => {
      client.getPendingClaims().then((c) => setTradeCount((old) => old + c.length));
   }, []);

   const gs = useGameState();
   const [nextCity, setNextCity] = useState<City>(gs.city);
   const permanentGreatPeopleLevel = getPermanentGreatPeopleLevel(getGameOptions());
   const greatPeopleAtRebirthCount = getRebirthGreatPeopleCount();

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

   const maxPickPerRoll = clamp(
      Math.floor(clamp(greatPeopleAtRebirthCount - gs.claimedGreatPeople, 0, Number.POSITIVE_INFINITY) / 50),
      1,
      Number.POSITIVE_INFINITY,
   );
   const [pickPerRoll, setPickPerRoll] = useState(maxPickPerRoll);
   const showPompidouWarning =
      Tick.current.specialBuildings.has("CentrePompidou") &&
      (getCurrentAge(gs) !== "InformationAge" || gs.city === nextCity);

   const extraTileForNextRebirth = Tick.current.specialBuildings.get("SydneyOperaHouse")?.building.level ?? 0;

   const uniqueEffects = Config.City[nextCity].uniqueEffects();
   const citySize = Config.City[nextCity].size;
   return (
      <div className="window" style={{ width: "700px" }}>
         <div className="title-bar">
            <div className="title-bar-text">{t(L.Reborn)}</div>
         </div>
         <div className="window-body">
            <div style={{ maxHeight: "75vh", overflowY: "auto", margin: "-8px -8px 0 -8px", padding: 10 }}>
               {tradeCount > 0 ? (
                  <WarningComponent icon="warning" className="mb10 text-small">
                     <RenderHTML html={t(L.RebornTradeWarning)} />
                  </WarningComponent>
               ) : null}
               {options.rebirthInfo.length <= 0 ? (
                  <WarningComponent icon="info" className="mb10 text-small">
                     <RenderHTML html={t(L.RebornModalDescV3)} />
                  </WarningComponent>
               ) : null}
               {canEarnGreatPeopleFromReborn() ? (
                  <ul className="tree-view">
                     <li className="row">
                        <div className="f1">{t(L.GreatPeopleThisRun)}</div>
                        <div className="text-strong">
                           {reduceOf(
                              gs.greatPeople,
                              (prev, k, v) => {
                                 return prev + v;
                              },
                              0,
                           )}
                        </div>
                     </li>
                     <li className="row">
                        <div className="f1">{t(L.TotalEmpireValue)}</div>
                        <div className="text-strong">
                           <FormatNumber value={Tick.current.totalValue} />
                        </div>
                     </li>
                     <li className="row">
                        <div className="f1">{t(L.ExtraGreatPeopleAtReborn)}</div>
                        <div className="text-strong">
                           <TextWithHelp
                              content={t(L.ClaimedGreatPeopleTooltip, {
                                 total: greatPeopleAtRebirthCount,
                                 claimed: gs.claimedGreatPeople,
                              })}
                           >
                              {clamp(
                                 greatPeopleAtRebirthCount - gs.claimedGreatPeople,
                                 0,
                                 Number.POSITIVE_INFINITY,
                              )}
                           </TextWithHelp>
                        </div>
                     </li>
                  </ul>
               ) : (
                  <WarningComponent icon="warning">
                     {t(L.CannotEarnPermanentGreatPeopleDesc)}
                  </WarningComponent>
               )}
               <div className="sep10" />
               {hasFlag(user?.attr ?? UserAttributes.None, UserAttributes.DLC1) ? null : (
                  <WarningComponent icon="info" className="text-small mb10">
                     <RenderHTML
                        html={t(L.FreeThisWeekDescHTMLV2, {
                           city: Config.City[getFreeCityThisWeek()].name(),
                        })}
                     />
                  </WarningComponent>
               )}
               {showPompidouWarning ? (
                  <WarningComponent icon="info" className="text-small mb10">
                     <RenderHTML
                        html={t(L.CentrePompidouWarningHTML, {
                           civ: Config.City[nextCity].name(),
                        })}
                     />
                  </WarningComponent>
               ) : null}
               <fieldset>
                  <div className="row">
                     <div className="f1 row">
                        <div className="f1">{t(L.GreatPeoplePickPerRoll)}</div>
                        <select
                           value={pickPerRoll}
                           onChange={(e) => {
                              setPickPerRoll(clamp(safeParseInt(e.target.value, 1), 1, maxPickPerRoll));
                           }}
                        >
                           {range(1, maxPickPerRoll + 1).map((i) => (
                              <option key={i} value={i}>
                                 {i}
                              </option>
                           ))}
                        </select>
                     </div>
                     <div className="separator-vertical" style={{ height: 30, margin: "-5px 20px" }} />
                     <div className="f1 row">
                        <div className="f1">{t(L.SelectCivilization)}</div>
                        <select
                           value={nextCity}
                           onChange={(e) => {
                              setNextCity(e.target.value as City);
                           }}
                        >
                           {jsxMapOf(Config.City, (city, def) => {
                              return (
                                 <option key={city} value={city}>
                                    {def.name()}
                                    {def.requireSupporterPack ? "*" : ""}
                                 </option>
                              );
                           })}
                        </select>
                     </div>
                  </div>
                  <div className="separator" />
                  <div className="row">
                     <div className="row f1">
                        <div className="f1">{t(L.GreatPersonLevelRequired)}</div>
                        {permanentGreatPeopleLevel >= Config.City[nextCity].requireGreatPeopleLevel ? (
                           <div className="m-icon small mr5 text-green">check_circle</div>
                        ) : (
                           <div className="m-icon small mr5 text-red">cancel</div>
                        )}
                        <div className="text-strong">
                           <TextWithHelp
                              content={t(L.GreatPersonLevelRequiredDescV2, {
                                 city: Config.City[nextCity].name(),
                                 required: Config.City[nextCity].requireGreatPeopleLevel,
                                 current: permanentGreatPeopleLevel,
                              })}
                           >
                              {Config.City[nextCity].requireGreatPeopleLevel}
                           </TextWithHelp>
                        </div>
                     </div>
                     {Config.City[nextCity].requireSupporterPack ? (
                        <>
                           <div className="separator-vertical" style={{ height: 30, margin: "-5px 20px" }} />
                           <Tippy content={t(L.SupporterPackRequiredTooltip)}>
                              <div
                                 className="row f1 pointer"
                                 onClick={() => {
                                    playClick();
                                    openUrl(SUPPORTER_PACK_URL);
                                 }}
                              >
                                 <div className="mr5">{t(L.SupporterPackRequired)}</div>
                                 <MiscTextureComponent name="Supporter" scale={0.2} />
                                 <div className="f1" />
                                 <div>
                                    {hasFlag(user?.attr ?? UserAttributes.None, UserAttributes.DLC1) ? (
                                       <div className="m-icon small text-green">check_circle</div>
                                    ) : getFreeCityThisWeek() === nextCity ? (
                                       <div className="text-green text-strong">{t(L.FreeThisWeek)}</div>
                                    ) : (
                                       <div className="m-icon small text-red">cancel</div>
                                    )}
                                 </div>
                              </div>
                           </Tippy>
                        </>
                     ) : null}
                  </div>
               </fieldset>
               <div className="row mb5">
                  <div className="text-strong">{t(L.Deposit)}</div>
                  <div className="text-desc ml5">
                     ({citySize + extraTileForNextRebirth}x{citySize + extraTileForNextRebirth})
                  </div>
                  {extraTileForNextRebirth > 0 && (
                     <Tippy content={t(L.ExtraTileForNextRebirthTooltip, { count: extraTileForNextRebirth })}>
                        <div className="m-icon small ml5 text-green">info</div>
                     </Tippy>
                  )}
               </div>
               <div
                  className="inset-shallow white p5"
                  style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "5px 20px" }}
               >
                  {mapOf(Config.City[nextCity].deposits, (dep, value) => {
                     return (
                        <div key={dep} className="row">
                           <DepositTextureComponent
                              deposit={dep}
                              scale={0.25}
                              style={{ filter: "invert(0.75)", margin: "0 10px 0 0" }}
                           />
                           <div className="f1">{Config.Material[dep].name()}</div>
                           <div className="text-strong">{formatPercent(value)}</div>
                        </div>
                     );
                  })}
               </div>
               {uniqueEffects.length <= 0 ? null : (
                  <>
                     <div className="text-strong mt5 mb5">{t(L.UniqueEffects)}</div>
                     <div className="inset-shallow white">
                        {uniqueEffects.map((effect, i) => {
                           return (
                              <div
                                 key={i}
                                 className="row p5"
                                 style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#efefef" }}
                              >
                                 {html(effect)}
                              </div>
                           );
                        })}
                     </div>
                  </>
               )}
               <div className="text-strong mt5 mb5">{t(L.UniqueBuildings)}</div>
               <div className="inset-shallow white">
                  {jsxMapOf(Config.City[nextCity].uniqueBuildings, (building, tech, i) => {
                     return (
                        <div
                           key={building}
                           className="row p5"
                           style={{ backgroundColor: i % 2 === 0 ? "#efefef" : "#fff" }}
                        >
                           <div className="cc mr10" style={{ width: 50, height: 50 }}>
                              <BuildingSpriteComponent
                                 building={building}
                                 scale={0.5}
                                 style={{ filter: "invert(0.75)" }}
                              />
                           </div>
                           <div className="f1">
                              <div className="row">
                                 <div className="text-strong f1">{Config.Building[building].name()}</div>
                                 <div className="text-desc">{Config.Tech[tech].name()}</div>
                              </div>
                              <div>{getBuildingDescription(building)}</div>
                           </div>
                        </div>
                     );
                  })}
               </div>
               <div className="text-strong mt5 mb5">{t(L.NaturalWonders)}</div>
               <div className="inset-shallow white">
                  {jsxMapOf(Config.City[nextCity].naturalWonders, (building, tech, i) => {
                     return (
                        <div
                           key={building}
                           className="row p5"
                           style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#efefef" }}
                        >
                           <div className="cc mr10" style={{ width: 50, height: 50 }}>
                              <BuildingSpriteComponent
                                 building={building}
                                 scale={0.5}
                                 style={{ filter: "invert(0.75)" }}
                              />
                           </div>
                           <div className="f1">
                              <div className="text-strong">{Config.Building[building].name()}</div>
                              <div>{getBuildingDescription(building)}</div>
                           </div>
                        </div>
                     );
                  })}
               </div>
               {isEmpty(Config.City[nextCity].uniqueMultipliers) ? null : (
                  <>
                     <div className="text-strong mt5 mb5">{t(L.UniqueTechMultipliers)}</div>
                     <div className="inset-shallow white">
                        {jsxMapOf(Config.City[nextCity].uniqueMultipliers, (tech, multipliers, i) => {
                           return (
                              <div
                                 key={tech}
                                 className="row p5"
                                 style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#efefef" }}
                              >
                                 <div className="text-strong f1">
                                    {Config.Tech[tech].name()} ({Config.TechAge[getAgeForTech(tech)].name()})
                                 </div>
                                 <div className="text-desc">{getMultipliersDescription(multipliers)}</div>
                              </div>
                           );
                        })}
                     </div>
                  </>
               )}
               <div className="text-strong mt5 mb5">{t(L.GreatPeople)}</div>
               <div className="inset-shallow white">
                  {entriesOf(Config.GreatPerson)
                     .filter(([_, def]) => def.city === nextCity)
                     .map(([person, def], i) => {
                        return (
                           <div
                              key={person}
                              className="row p5"
                              style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#efefef" }}
                           >
                              <GreatPersonImage
                                 greatPerson={person}
                                 style={{ height: 50, margin: "0 10px 0 0" }}
                              />
                              <div className="f1">
                                 <div className="row">
                                    <div className="f1 text-strong">{def.name()}</div>
                                    <div className="text-desc">{Config.TechAge[def.age].name()}</div>
                                 </div>
                                 <div>{def.desc(def, 1)}</div>
                              </div>
                           </div>
                        );
                     })}
               </div>
               <div className="text-strong mt5 mb5">{t(L.Festival)}</div>
               <div className="inset-shallow white">
                  <div className="row p5">
                     <div className="cc mr10" style={{ width: 50, height: 50 }}>
                        <BuildingSpriteComponent
                           building={`Headquarter_${nextCity}` as any}
                           scale={0.5}
                           style={{ filter: "invert(0.75)" }}
                        />
                     </div>
                     <div className="f1">{Config.City[nextCity].festivalDesc()}</div>
                  </div>
               </div>
            </div>
            <div className="separator" style={{ margin: "0 -8px 8px -8px" }} />
            <div className="text-right row" style={{ justifyContent: "flex-end" }}>
               <button
                  style={{ padding: "0 15px" }}
                  onClick={() => {
                     playClick();
                     hideModal();
                  }}
               >
                  {t(L.Cancel)}
               </button>
               <div style={{ width: "6px" }} />
               <button
                  disabled={
                     permanentGreatPeopleLevel < Config.City[nextCity].requireGreatPeopleLevel ||
                     !hasSupporterPack()
                  }
                  style={{ padding: "0 15px" }}
                  className="text-strong"
                  onClick={async () => {
                     if (
                        getPermanentGreatPeopleLevel(getGameOptions()) <
                           Config.City[nextCity].requireGreatPeopleLevel ||
                        !hasSupporterPack()
                     ) {
                        playError();
                        return;
                     }

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
                           showToast(t(L.RebornOfflineWarning));
                           return;
                        }
                     }

                     const greatPeopleCount = clamp(
                        greatPeopleAtRebirthCount - gs.claimedGreatPeople,
                        0,
                        Number.POSITIVE_INFINITY,
                     );
                     const currentCity = gs.city;

                     if (!gs.rebirthed && canEarnGreatPeopleFromReborn()) {
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
                        getRandomEmptyTiles(1, getGameState()).forEach((xy) => {
                           const tile = getGameState().tiles.get(xy);
                           if (tile) {
                              tile.explored = true;
                              tile.building = pompidou;
                              pompidou.cities.add(currentCity);
                           }
                        });
                     }

                     try {
                        await Promise.all([saveGame(), clientHeartbeat()]);
                        window.location.reload();
                     } catch (error) {
                        playError();
                        showToast(String(error));
                     }
                  }}
               >
                  {t(L.Reborn)}
               </button>
            </div>
         </div>
      </div>
   );
}
