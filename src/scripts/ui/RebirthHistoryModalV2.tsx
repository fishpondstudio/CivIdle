import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, type TooltipContentProps, XAxis, YAxis } from "recharts";
import { Config } from "../../../shared/logic/Config";
import { RebirthFlags, type RebirthInfo } from "../../../shared/logic/GameState";
import { cls, formatHMS, formatNumber, hasFlag } from "../../../shared/utilities/Helper";
import classNames from "classnames";
import { $t, L } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { playClick } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";
import { FormatNumber } from "./HelperComponents";

const RANGE_OPTIONS = [10, 20, 50] as const;
type RangeOption = (typeof RANGE_OPTIONS)[number] | "all";

const SERIES_META = {
   totalEmpireValue: {
      label: $t(L.TotalEmpireValue),
      color: "#2980b9",
   },
   totalEmpireValuePerCycle: {
      label: $t(L.TotalEmpireValuePerCycle),
      color: "#8e44ad",
   },
   totalEmpireValuePerWallSecond: {
      label: $t(L.TotalEmpireValuePerWallSecond),
      color: "#16a085",
   },
} as const;
type SeriesKey = keyof typeof SERIES_META;

const TOGGLE_META = {
   total: {
      label: $t(L.RebirthHistoryEmpireValue),
      color: "#2980b9",
      series: ["totalEmpireValue"] as SeriesKey[],
   },
   rate: {
      label: $t(L.RebirthHistorySeriesPerCycleSec),
      color: "#8e44ad",
      series: ["totalEmpireValuePerCycle", "totalEmpireValuePerWallSecond"] as SeriesKey[],
   },
} as const;
type ToggleKey = keyof typeof TOGGLE_META;

type ChartDatum = RebirthInfo & {
   date: Date;
   totalEmpireValuePerCycle: number;
   totalEmpireValuePerWallSecond: number;
};

type SeriesBests = Record<SeriesKey, number>;

export function RebirthHistoryModalV2(): React.ReactNode {
   const options = useGameOptions();
   const all = options.rebirthInfo;
   const total = all.length;

   const [range, setRange] = useState<RangeOption>(10);
   const [selectedToggle, setSelectedToggle] = useState<ToggleKey>("total");

   const data = useMemo<ChartDatum[]>(() => {
      if (total === 0) return [];
      const sliced = range === "all" ? all : all.slice(-range);
      return sliced.map((r) => ({
         ...r,
         date: new Date(r.time),
         totalEmpireValuePerCycle: r.totalTicks > 0 ? r.totalEmpireValue / r.totalTicks : 0,
         totalEmpireValuePerWallSecond: r.totalSeconds > 0 ? r.totalEmpireValue / r.totalSeconds : 0,
      }));
   }, [all, range, total]);

   const bests = useMemo<SeriesBests>(() => {
      return {
         totalEmpireValue: all.reduce((acc, r) => Math.max(acc, r.totalEmpireValue), 0),
         totalEmpireValuePerCycle: all.reduce(
            (acc, r) => Math.max(acc, r.totalTicks > 0 ? r.totalEmpireValue / r.totalTicks : 0),
            0,
         ),
         totalEmpireValuePerWallSecond: all.reduce(
            (acc, r) => Math.max(acc, r.totalSeconds > 0 ? r.totalEmpireValue / r.totalSeconds : 0),
            0,
         ),
      };
   }, [all]);

   const summary = useMemo(() => {
      if (total === 0) return null;
      const values = all.map((r) => r.totalEmpireValue);
      const sum = values.reduce((a, b) => a + b, 0);
      return {
         total,
         best: Math.max(...values),
         average: sum / values.length,
         latest: all[total - 1].totalEmpireValue,
      };
   }, [all, total]);

   return (
      <div className="window" style={{ width: "800px", maxWidth: "90vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{$t(L.RebirthHistory)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            {total === 0 ? (
               <div className="text-desc cc" style={{ fontSize: 20, height: "50vh" }}>
                  {$t(L.RebirthHistoryEmpty)}
               </div>
            ) : (
               <>
                  {summary ? (
                     <div className="row g10 mb5">
                        <select
                           value={selectedToggle}
                           onChange={(e) => {
                              playClick();
                              setSelectedToggle(e.target.value as ToggleKey);
                           }}
                        >
                           {(Object.keys(TOGGLE_META) as ToggleKey[]).map((key) => (
                              <option key={key} value={key}>
                                 {TOGGLE_META[key].label}
                              </option>
                           ))}
                        </select>
                        <div className="row">
                           {RANGE_OPTIONS.map((r) => (
                              <button
                                 key={r}
                                 onClick={() => {
                                    playClick();
                                    setRange(r);
                                 }}
                                 style={{
                                    width: 30,
                                    padding: 0,
                                 }}
                                 className={cls(range === r ? "text-strong" : "text-desc")}
                              >
                                 {r}
                              </button>
                           ))}
                           <button
                              onClick={() => {
                                 playClick();
                                 setRange("all");
                              }}
                              style={{
                                 width: 40,
                                 padding: 0,
                              }}
                              className={cls(range === "all" ? "text-strong" : "text-desc")}
                           >
                              {$t(L.RebirthHistoryAll)}
                           </button>
                        </div>
                        <button
                           onClick={async () => {
                              playClick();
                              try {
                                 const handle = await window.showSaveFilePicker({
                                    suggestedName: "CivIdle-Rebirth-History.csv",
                                    types: [{ description: "CSV", accept: { "text/csv": [".csv"] } }],
                                 });
                                 const headers = [
                                    $t(L.RebirthTime),
                                    $t(L.Civilization),
                                    $t(L.GreatPeopleThisRun),
                                    $t(L.ExtraGreatPeopleAtReborn),
                                    $t(L.TotalEmpireValue),
                                    $t(L.TotalGameTimeThisRun),
                                    $t(L.TotalEmpireValuePerCycle),
                                    $t(L.TotalWallTimeThisRun),
                                    $t(L.TotalEmpireValuePerWallSecond),
                                    $t(L.EasterBunnyConstructed),
                                 ];
                                 const escapeCSV = (v: string | number | boolean): string => {
                                    const s = String(v);
                                    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
                                 };
                                 const rows = data.map((r) => [
                                    new Date(r.time).toISOString(),
                                    Config.City[r.city].name(),
                                    r.greatPeopleThisRun,
                                    r.greatPeopleAtRebirth,
                                    r.totalEmpireValue,
                                    formatHMS(r.totalTicks * 1000),
                                    r.totalEmpireValuePerCycle,
                                    formatHMS(r.totalSeconds * 1000),
                                    r.totalEmpireValuePerWallSecond,
                                    hasFlag(r.flags, RebirthFlags.EasterBunny),
                                 ]);
                                 const csv = `\uFEFF${[headers, ...rows]
                                    .map((row) => row.map(escapeCSV).join(","))
                                    .join("\n")}`;
                                 const stream = await handle.createWritable();
                                 await stream.write(new TextEncoder().encode(csv));
                                 await stream.close();
                              } catch (error) {
                                 showToast(String(error));
                              }
                           }}
                           style={{
                              width: 30,
                              padding: 0,
                           }}
                        >
                           <div className="m-icon small">download</div>
                        </button>
                        <div className="f1" />
                        <div className="text-desc">
                           <span className="text-desc">{$t(L.RebirthHistoryTotal)}: </span>
                           <span className="text-strong">
                              <FormatNumber value={summary.total} />
                           </span>
                        </div>
                        <div>
                           <span className="text-desc">{$t(L.RebirthHistoryBest)}: </span>
                           <span className="text-strong">
                              <FormatNumber value={summary.best} />
                           </span>
                        </div>
                        <div>
                           <span className="text-desc">{$t(L.RebirthHistoryAverage)}: </span>
                           <span className="text-strong">
                              <FormatNumber value={summary.average} />
                           </span>
                        </div>
                        <div>
                           <span className="text-desc">{$t(L.RebirthHistoryLatest)}: </span>
                           <span className="text-strong">
                              <FormatNumber value={summary.latest} />
                           </span>
                        </div>
                     </div>
                  ) : null}
                  <div className="inset-shallow white">
                     <div className="row mv5 cc" style={{ gap: 20, flexWrap: "wrap" }}>
                        {TOGGLE_META[selectedToggle].series.map((key) => {
                           const meta = SERIES_META[key];
                           return (
                              <div key={key} className="row g" style={{ gap: 5, alignItems: "center" }}>
                                 <span
                                    style={{
                                       display: "inline-block",
                                       width: 16,
                                       height: 3,
                                       backgroundColor: meta.color,
                                    }}
                                 />
                                 <span className="text-desc">{meta.label}</span>
                              </div>
                           );
                        })}
                     </div>
                     <div>
                        <LineChart
                           style={{ width: "100%", maxWidth: "700px", maxHeight: "70vh", aspectRatio: 1.618 }}
                           responsive
                           data={data}
                           margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        >
                           <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.3)" />
                           <XAxis
                              dataKey="time"
                              type="number"
                              domain={["dataMin", "dataMax"]}
                              scale="time"
                              tickFormatter={(t: number) =>
                                 new Date(t).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                 })
                              }
                              stroke="rgba(128,128,128,0.7)"
                              minTickGap={24}
                           />
                           <YAxis
                              tickFormatter={(v: number) => formatNumber(v)}
                              width={70}
                              stroke="rgba(128,128,128,0.7)"
                           />
                           <Tooltip content={(props) => <RebirthTooltip {...props} bests={bests} />} />
                           {TOGGLE_META[selectedToggle].series.map((key) => {
                              const meta = SERIES_META[key];
                              return (
                                 <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    name={meta.label}
                                    stroke={meta.color}
                                    strokeWidth={2}
                                    activeDot={{ r: 5, fill: meta.color }}
                                    isAnimationActive={false}
                                    connectNulls
                                 />
                              );
                           })}
                        </LineChart>
                     </div>
                  </div>
               </>
            )}
         </div>
      </div>
   );
}

function RebirthTooltip(props: TooltipContentProps & { bests?: SeriesBests }): React.ReactNode {
   const { active, payload, bests } = props;
   if (!active || !payload || payload.length === 0 || !bests) return null;
   const datum = payload[0]?.payload as ChartDatum | undefined;
   if (!datum) return null;
   return (
      <div
         className="table-view text-small"
         style={{
            borderRadius: 5,
            border: "1px solid #ccc",
            overflow: "hidden",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
         }}
      >
         <table>
            <tbody>
               <tr>
                  <td>{$t(L.Civilization)}</td>
                  <td className="text-right text-strong">{Config.City[datum.city].name()}</td>
               </tr>
               <tr>
                  <td>{$t(L.GreatPeopleThisRun)}</td>
                  <td className="text-right text-strong">{datum.greatPeopleThisRun}</td>
               </tr>
               <tr>
                  <td>{$t(L.ExtraGreatPeopleAtReborn)}</td>
                  <td className="text-right text-strong">{datum.greatPeopleAtRebirth}</td>
               </tr>
               <TooltipRow
                  label={$t(L.TotalEmpireValue)}
                  value={<FormatNumber value={datum.totalEmpireValue} />}
                  color={SERIES_META.totalEmpireValue.color}
                  isBest={datum.totalEmpireValue === bests.totalEmpireValue}
               />
               <tr>
                  <td>{$t(L.TotalGameTimeThisRun)}</td>
                  <td className="text-right text-strong">{formatHMS(datum.totalTicks * 1000)}</td>
               </tr>
               <TooltipRow
                  label={$t(L.TotalEmpireValuePerCycle)}
                  value={<FormatNumber value={datum.totalEmpireValuePerCycle} />}
                  color={SERIES_META.totalEmpireValuePerCycle.color}
                  isBest={datum.totalEmpireValuePerCycle === bests.totalEmpireValuePerCycle}
               />
               <tr>
                  <td>{$t(L.TotalWallTimeThisRun)}</td>
                  <td className="text-right text-strong">{formatHMS(datum.totalSeconds * 1000)}</td>
               </tr>
               <TooltipRow
                  label={$t(L.TotalEmpireValuePerWallSecond)}
                  value={<FormatNumber value={datum.totalEmpireValuePerWallSecond} />}
                  color={SERIES_META.totalEmpireValuePerWallSecond.color}
                  isBest={datum.totalEmpireValuePerWallSecond === bests.totalEmpireValuePerWallSecond}
               />
               {hasFlag(datum.flags, RebirthFlags.EasterBunny) ? (
                  <tr>
                     <td>{$t(L.EasterBunnyConstructed)}</td>
                     <td className="text-right text-strong">
                        <div className="m-icon small text-green">check_circle</div>
                     </td>
                  </tr>
               ) : null}
            </tbody>
         </table>
      </div>
   );
}

function TooltipRow({
   label,
   value,
   color,
   isBest,
}: {
   label: React.ReactNode;
   value: React.ReactNode;
   color: string;
   isBest: boolean;
}): React.ReactNode {
   return (
      <tr>
         <td>{label}</td>
         <td
            className={classNames("text-right text-strong", { "text-orange": isBest })}
            style={{
               borderRight: `3px solid ${color}`,
               paddingLeft: 6,
               backgroundColor: `${color}22`,
            }}
         >
            {isBest ? <span className="m-icon inline mr5 small text-orange">emoji_events</span> : null}
            {value}
         </td>
      </tr>
   );
}
