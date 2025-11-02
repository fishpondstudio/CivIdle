import classNames from "classnames";
import { useState } from "react";
import type { Material } from "../../../shared/definitions/MaterialDefinitions";
import { getMarketBuyAmount, getMarketSellAmount } from "../../../shared/logic/BuildingLogic";
import { Config } from "../../../shared/logic/Config";
import type { GameState } from "../../../shared/logic/GameState";
import { notifyGameStateUpdate } from "../../../shared/logic/GameStateLogic";
import { getBuildingsByType } from "../../../shared/logic/IntraTickCache";
import type { IMarketBuildingData } from "../../../shared/logic/Tile";
import { convertPriceIdToTime } from "../../../shared/logic/Update";
import {
   CURRENCY_PERCENT_EPSILON,
   forEach,
   formatHMS,
   formatPercent,
   mathSign,
   type Tile,
} from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";
import { LookAtMode, WorldScene } from "../scenes/WorldScene";
import { Singleton } from "../utilities/Singleton";
import { playClick } from "../visuals/Sound";
import { BuildingColorComponent } from "./BuildingColorComponent";
import { BuildingDescriptionComponent } from "./BuildingDescriptionComponent";
import type { IBuildingComponentProps } from "./BuildingPage";
import { BuildingValueComponent } from "./BuildingValueComponent";
import { BuildingWikipediaComponent } from "./BuildingWikipediaComponent";
import { FormatNumber } from "./HelperComponents";
import { RenderHTML } from "./RenderHTMLComponent";
import { TableView } from "./TableView";
import { TextWithHelp } from "./TextWithHelpComponent";
import { WarningComponent } from "./WarningComponent";

interface IGrandBazaarMarketData {
   xy: Tile;
   sellResource: Material;
   sellAmount: number;
   buyResource: Material;
   buyAmount: number;
}

function calculateTradeValue(item: IGrandBazaarMarketData): number {
   return (
      (item.buyAmount * Config.MaterialPrice[item.buyResource]!) /
         (item.sellAmount * Config.MaterialPrice[item.sellResource]!) -
      1
   );
}

let savedBuyResourceFilter: Material | null = null;
let savedSellResourceFilter: Material | null = null;
let savedNameResourceFilter = "";
let savedNameBuyFilter = true;
let savedNameSellFilter = true;

function TradesTab({
   allMarketTrades,
   availableResourcesSet,
   gs,
}: {
   allMarketTrades: IGrandBazaarMarketData[];
   availableResourcesSet: Set<Material>;
   gs: GameState;
}): React.ReactNode {
   const [buyResourceFilter, setBuyResourceFilter] = useState<Material | null>(savedBuyResourceFilter);
   const [sellResourceFilter, setSellResourceFilter] = useState<Material | null>(savedSellResourceFilter);

   const [nameResourceFilter, setNameResourceFilter] = useState<string>(savedNameResourceFilter);
   const [nameBuyFilter, setNameBuyFilter] = useState<boolean>(savedNameBuyFilter);
   const [nameSellFilter, setNameSellFilter] = useState<boolean>(savedNameSellFilter);

   const availableResources = Array.from(availableResourcesSet).sort((a, b) =>
      Config.Material[a].name().localeCompare(Config.Material[b].name()),
   );

   return (
      <>
         <article role="tabpanel" className="f1 column" style={{ padding: "8px", overflow: "auto" }}>
            <fieldset>
               <legend>{t(L.GrandBazaarFilters)}</legend>
               <div className="row">
                  <div style={{ width: "80px" }}>{t(L.GrandBazaarSeach)}</div>
                  <input
                     type="text"
                     className="f1 mr5"
                     value={nameResourceFilter}
                     onChange={(e) => {
                        savedNameResourceFilter = e.target.value;
                        setNameResourceFilter(savedNameResourceFilter);
                     }}
                  />

                  <button
                     className={classNames({
                        active: savedNameSellFilter === true,
                     })}
                     onClick={() => {
                        savedNameSellFilter = !savedNameSellFilter;
                        setNameSellFilter(savedNameSellFilter);
                     }}
                  >
                     {t(L.GrandBazaarSearchPay)}
                  </button>
                  <button
                     className={classNames({
                        active: savedNameBuyFilter === true,
                     })}
                     onClick={() => {
                        savedNameBuyFilter = !savedNameBuyFilter;
                        setNameBuyFilter(savedNameBuyFilter);
                     }}
                  >
                     {t(L.GrandBazaarSearchGet)}
                  </button>
               </div>
               <div className="sep10"></div>
               <div className="row">
                  <div style={{ width: "80px" }}>{t(L.GrandBazaarFilterYouPay)}</div>
                  <select
                     className="f1"
                     value={sellResourceFilter ? sellResourceFilter : ""}
                     onChange={(e) => {
                        if (e.target.value === "") {
                           savedSellResourceFilter = null;
                           setSellResourceFilter(savedSellResourceFilter);
                        }
                        if (e.target.value in Config.Material) {
                           savedSellResourceFilter = e.target.value as Material;
                           setSellResourceFilter(savedSellResourceFilter);
                        }
                     }}
                  >
                     <option value=""></option>
                     {availableResources.map((res) => (
                        <option key={res} value={res}>
                           {Config.Material[res].name()}
                        </option>
                     ))}
                  </select>
               </div>
               <div className="sep10"></div>
               <div className="row">
                  <div style={{ width: "80px" }}>{t(L.GrandBazaarFilterYouGet)}</div>
                  <select
                     className="f1"
                     value={buyResourceFilter ? buyResourceFilter : ""}
                     onChange={(e) => {
                        if (e.target.value === "") {
                           savedBuyResourceFilter = null;
                           setBuyResourceFilter(savedBuyResourceFilter);
                        }
                        if (e.target.value in Config.Material) {
                           savedBuyResourceFilter = e.target.value as Material;
                           setBuyResourceFilter(savedBuyResourceFilter);
                        }
                     }}
                  >
                     <option value=""></option>
                     {availableResources.map((res) => (
                        <option key={res} value={res}>
                           {Config.Material[res].name()}
                        </option>
                     ))}
                  </select>
               </div>
            </fieldset>
            {buyResourceFilter === null && sellResourceFilter === null && nameResourceFilter === "" ? (
               <WarningComponent icon="info" className="mb10 text-small">
                  <RenderHTML html={t(L.GrandBazaarFilterWarningHTML)} />
               </WarningComponent>
            ) : null}
            <TableView
               classNames="sticky-header f1"
               header={[
                  { name: t(L.MarketYouPay), sortable: true },
                  { name: t(L.MarketYouGet), sortable: true },
                  { name: "", sortable: true },
                  { name: t(L.MarketSell), sortable: true },
                  { name: "", sortable: false },
               ]}
               data={allMarketTrades.filter((m) => {
                  // No filter, we show nothing, should revisit this later
                  if (
                     buyResourceFilter === null &&
                     sellResourceFilter === null &&
                     nameResourceFilter === ""
                  ) {
                     return false;
                  }
                  let buyFilter = false;
                  let sellFilter = false;
                  let nameFilter = false;
                  if (buyResourceFilter != null) {
                     buyFilter = buyResourceFilter === m.buyResource;
                  } else {
                     buyFilter = true;
                  }
                  if (sellResourceFilter != null) {
                     sellFilter = sellResourceFilter === m.sellResource;
                  } else {
                     sellFilter = true;
                  }
                  if (
                     nameBuyFilter &&
                     Config.Material[m.buyResource]
                        .name()
                        .toLowerCase()
                        .includes(nameResourceFilter.toLowerCase())
                  ) {
                     nameFilter = true;
                  }

                  if (
                     nameSellFilter &&
                     Config.Material[m.sellResource]
                        .name()
                        .toLowerCase()
                        .includes(nameResourceFilter.toLowerCase())
                  ) {
                     nameFilter = true;
                  }
                  return buyFilter && sellFilter && nameFilter;
               })}
               compareFunc={(a, b, i) => {
                  switch (i) {
                     case 0:
                        return Config.Material[a.sellResource]
                           .name()
                           .localeCompare(Config.Material[b.sellResource].name());
                     case 1:
                        return Config.Material[a.buyResource]
                           .name()
                           .localeCompare(Config.Material[b.buyResource].name());
                     case 2:
                        return (calculateTradeValue(a) ?? 0) - (calculateTradeValue(b) ?? 0);
                     default:
                        return 0;
                  }
               }}
               renderRow={(item) => {
                  const building = gs.tiles.get(item.xy)?.building as IMarketBuildingData;
                  const sellResource = Config.Material[item.sellResource];
                  const buyResource = Config.Material[item.buyResource];
                  const tradeValue = calculateTradeValue(item);
                  return (
                     <tr key={`Res:${item.sellResource}Tile:${item.xy}`}>
                        <td>
                           <div>{sellResource.name()}</div>
                           <div className="text-small text-desc text-strong">
                              <FormatNumber value={item.sellAmount} />
                           </div>
                        </td>
                        <td>
                           <div>{buyResource.name()}</div>
                           <div className="text-small text-desc text-strong">
                              <FormatNumber value={item.buyAmount} />
                           </div>
                        </td>
                        <td
                           className={classNames({
                              "text-green": tradeValue > 0,
                              "text-red": tradeValue < 0,
                              "text-right text-small": true,
                           })}
                        >
                           <TextWithHelp
                              content={t(L.MarketValueDesc, {
                                 value: formatPercent(tradeValue, 0),
                              })}
                              noStyle
                           >
                              {mathSign(tradeValue, CURRENCY_PERCENT_EPSILON)}
                              {formatPercent(Math.abs(tradeValue), 0)}
                           </TextWithHelp>
                        </td>
                        <td
                           className="pointer"
                           onClick={() => {
                              playClick();
                              if (building.sellResources[item.sellResource]) {
                                 delete building.sellResources[item.sellResource];
                              } else {
                                 // Turn the market on if it's been turned off, else keep capacity the same.
                                 building.capacity = building.capacity === 0 ? 1 : building.capacity;
                                 building.sellResources[item.sellResource] = true;
                              }
                              notifyGameStateUpdate();
                           }}
                        >
                           {building.sellResources[item.sellResource] ? (
                              <div className="m-icon text-green">toggle_on</div>
                           ) : (
                              <div className="m-icon text-grey">toggle_off</div>
                           )}
                        </td>
                        <td style={{ width: 0 }}>
                           <div
                              className="m-icon small pointer"
                              onPointerDown={() => {
                                 playClick();
                                 Singleton()
                                    .sceneManager.getCurrent(WorldScene)
                                    ?.lookAtTile(item.xy, LookAtMode.Select);
                              }}
                           >
                              open_in_new
                           </div>
                        </td>
                     </tr>
                  );
               }}
            />
         </article>
      </>
   );
}

function ActiveTradesTab({
   allMarketTrades,
   gs,
}: { allMarketTrades: IGrandBazaarMarketData[]; gs: GameState }): React.ReactNode {
   return (
      <article role="tabpanel" className="f1" style={{ padding: "8px", overflow: "auto" }}>
         <TableView
            classNames="sticky-header f1"
            header={[
               { name: t(L.MarketYouPay), sortable: true },
               { name: t(L.MarketYouGet), sortable: true },
               { name: "", sortable: true },
               { name: "", sortable: false },
               { name: "", sortable: false },
            ]}
            data={allMarketTrades.filter((item) => {
               const building = gs.tiles.get(item.xy)?.building as IMarketBuildingData;
               return building.sellResources[item.sellResource];
            })}
            renderRow={(item) => {
               const building = gs.tiles.get(item.xy)?.building as IMarketBuildingData;
               const sellResource = Config.Material[item.sellResource];
               const buyResource = Config.Material[item.buyResource];
               const tradeValue = calculateTradeValue(item);
               return (
                  <tr key={`Res:${item.sellResource}Tile:${item.xy}`}>
                     <td>
                        <div>{sellResource.name()}</div>
                        <div className="text-small text-desc text-strong">
                           <FormatNumber value={item.sellAmount} />
                        </div>
                     </td>
                     <td>
                        <div>{buyResource.name()}</div>
                        <div className="text-small text-desc text-strong">
                           <FormatNumber value={item.buyAmount} />
                        </div>
                     </td>
                     <td
                        className={classNames({
                           "text-green": tradeValue > 0,
                           "text-red": tradeValue < 0,
                           "text-right text-small": true,
                        })}
                     >
                        <TextWithHelp
                           content={t(L.MarketValueDesc, {
                              value: formatPercent(tradeValue, 0),
                           })}
                           noStyle
                        >
                           {mathSign(tradeValue, CURRENCY_PERCENT_EPSILON)}
                           {formatPercent(Math.abs(tradeValue), 0)}
                        </TextWithHelp>
                     </td>
                     <td style={{ width: 0 }}>
                        <div
                           className="m-icon small text-red pointer"
                           onClick={() => {
                              playClick();
                              delete building.sellResources[item.sellResource];
                              notifyGameStateUpdate();
                           }}
                        >
                           delete
                        </div>
                     </td>
                     <td style={{ width: 0 }}>
                        <div
                           className="m-icon small pointer"
                           onPointerDown={() => {
                              playClick();
                              Singleton()
                                 .sceneManager.getCurrent(WorldScene)
                                 ?.lookAtTile(item.xy, LookAtMode.Select);
                           }}
                        >
                           open_in_new
                        </div>
                     </td>
                  </tr>
               );
            }}
            compareFunc={(a, b, i) => {
               switch (i) {
                  case 0:
                     return Config.Material[a.sellResource]
                        .name()
                        .localeCompare(Config.Material[b.sellResource].name());
                  case 1:
                     return Config.Material[a.buyResource]
                        .name()
                        .localeCompare(Config.Material[b.buyResource].name());
                  case 2:
                     return (calculateTradeValue(a) ?? 0) - (calculateTradeValue(b) ?? 0);
                  default:
                     return 0;
               }
            }}
         />
      </article>
   );
}

type Tab = "trades" | "active";

export function GrandBazaarBuildingBody({ gameState, xy }: IBuildingComponentProps): React.ReactNode {
   const building = gameState.tiles.get(xy)?.building;
   if (!building) {
      return null;
   }

   const marketBuildings = getBuildingsByType("Market", gameState);
   const availableResourcesSet = new Set<Material>();

   const allMarketTrades: IGrandBazaarMarketData[] = [];
   marketBuildings?.forEach((tile, xy) => {
      const market = tile.building as IMarketBuildingData;
      if (market.status !== "completed") {
         return;
      }
      forEach(market.availableResources, (sellResource, buyResource) => {
         availableResourcesSet.add(sellResource);
         availableResourcesSet.add(buyResource);
         const sellAmount = getMarketSellAmount(sellResource, xy, gameState);
         allMarketTrades.push({
            xy,
            sellResource,
            sellAmount,
            buyResource,
            buyAmount: getMarketBuyAmount(sellResource, sellAmount, buyResource, xy, gameState),
         });
      });
   });

   const [currentTab, setCurrentTab] = useState<Tab>("trades");
   let content: React.ReactNode = null;
   if (currentTab === "trades") {
      content = (
         <TradesTab
            gs={gameState}
            availableResourcesSet={availableResourcesSet}
            allMarketTrades={allMarketTrades}
         />
      );
   } else if (currentTab === "active") {
      content = <ActiveTradesTab gs={gameState} allMarketTrades={allMarketTrades} />;
   }
   return (
      <div className="window-body">
         <BuildingDescriptionComponent gameState={gameState} xy={xy} />
         <fieldset>
            <div className="row">
               <div className="f1">{t(L.NextMarketUpdateIn)}</div>
               <div className="text-strong">
                  {formatHMS(convertPriceIdToTime(gameState.lastPriceUpdated + 1) - Date.now())}
               </div>
            </div>
         </fieldset>

         <div className="column">
            <menu role="tablist">
               <button onClick={() => setCurrentTab("trades")} aria-selected={currentTab === "trades"}>
                  {t(L.GrandBazaarTabTrades)}
               </button>
               <button onClick={() => setCurrentTab("active")} aria-selected={currentTab === "active"}>
                  {t(L.GrandBazaarTabActive)}
               </button>
            </menu>
            {content}
         </div>
         <div className="sep10"></div>
         <BuildingWikipediaComponent gameState={gameState} xy={xy} />
         <BuildingValueComponent gameState={gameState} xy={xy} />
         <BuildingColorComponent gameState={gameState} xy={xy} />
      </div>
   );
}
