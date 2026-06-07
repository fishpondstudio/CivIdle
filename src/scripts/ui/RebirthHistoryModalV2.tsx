import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, type TooltipContentProps, XAxis, YAxis } from "recharts";
import { Config } from "../../../shared/logic/Config";
import { RebirthFlags, type RebirthInfo } from "../../../shared/logic/GameState";
import { cls, formatHMS, formatNumber, hasFlag } from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { playClick } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";

const RANGE_OPTIONS = [10, 20, 50] as const;
type RangeOption = (typeof RANGE_OPTIONS)[number] | "all";

const SERIES_META = {
   totalEmpireValue: {
      label: $t(L.RebirthHistoryEmpireValueV2),
      labelFull: $t(L.TotalEmpireValue),
      color: "#2980b9",
   },
   totalEmpireValuePerCycle: {
      label: $t(L.RebirthHistoryEmpireValuePerCycle),
      labelFull: $t(L.TotalEmpireValuePerCycle),
      color: "#8e44ad",
   },
   totalEmpireValuePerWallSecond: {
      label: $t(L.RebirthHistoryEmpireValuePerWallSecond),
      labelFull: $t(L.TotalEmpireValuePerWallSecond),
      color: "#16a085",
   },
   greatPeopleAtRebirth: {
      label: $t(L.RebirthHistoryExtraGreatPeopleAtRebirth),
      labelFull: $t(L.ExtraGreatPeopleAtReborn),
      color: "#e67e22",
   },
} as const;
type SeriesKey = keyof typeof SERIES_META;

const CHART_OPTIONS: readonly SeriesKey[] = [
   "totalEmpireValue",
   "totalEmpireValuePerCycle",
   "totalEmpireValuePerWallSecond",
   "greatPeopleAtRebirth",
];

export function RebirthHistoryModalV2(): React.ReactNode {
   const options = useGameOptions();
   const all = options.rebirthInfo;

   const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

   return (
      <div className="window" style={{ width: "800px", maxWidth: "90vw" }}>
         <div className="title-bar">
            <div className="title-bar-text">{$t(L.RebirthHistory)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body">
            {all.length === 0 ? (
               <div className="text-desc cc" style={{ fontSize: 20, height: "50vh" }}>
                  {$t(L.RebirthHistoryEmpty)}
               </div>
            ) : (
               <>
                  <div className="row mb5">
                     <button
                        style={{ padding: 0, width: 30 }}
                        className={cls(viewMode === "chart" ? "active" : null)}
                        onClick={() => {
                           playClick();
                           setViewMode("chart");
                        }}
                     >
                        <div className="m-icon small">show_chart</div>
                     </button>
                     <button
                        style={{ padding: 0, width: 30 }}
                        className={cls(viewMode === "table" ? "active" : null)}
                        onClick={() => {
                           playClick();
                           setViewMode("table");
                        }}
                     >
                        <div className="m-icon small">grid_on</div>
                     </button>
                     <div className="f1" />
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
                              const rows = all.map((r) => [
                                 new Date(r.time).toISOString(),
                                 Config.City[r.city].name(),
                                 r.greatPeopleThisRun,
                                 r.greatPeopleAtRebirth,
                                 r.totalEmpireValue,
                                 formatHMS(r.totalTicks * 1000),
                                 r.totalTicks > 0 ? r.totalEmpireValue / r.totalTicks : 0,
                                 formatHMS(r.totalSeconds * 1000),
                                 r.totalSeconds > 0 ? r.totalEmpireValue / r.totalSeconds : 0,
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
                  </div>
                  {viewMode === "chart" ? (
                     <RebirthHistoryChart all={all} />
                  ) : (
                     <RebirthHistoryTable all={all} />
                  )}
               </>
            )}
         </div>
      </div>
   );
}

function RebirthHistoryChart({ all }: { all: RebirthInfo[] }): React.ReactNode {
   const [range, setRange] = useState<RangeOption>(10);
   const [selectedSeries, setSelectedSeries] = useState<SeriesKey>("totalEmpireValue");

   const data = useMemo(() => {
      const sliced = range === "all" ? all : all.slice(-range);
      return sliced.map((r) => ({
         ...r,
         totalEmpireValuePerCycle: r.totalTicks > 0 ? r.totalEmpireValue / r.totalTicks : 0,
         totalEmpireValuePerWallSecond: r.totalSeconds > 0 ? r.totalEmpireValue / r.totalSeconds : 0,
      }));
   }, [all, range]);

   return (
      <div className="inset-shallow white">
         <div className="row m5 g5">
            <select
               value={selectedSeries}
               onChange={(e) => {
                  playClick();
                  setSelectedSeries(e.target.value as SeriesKey);
               }}
            >
               {CHART_OPTIONS.map((key) => (
                  <option key={key} value={key}>
                     {SERIES_META[key].label}
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
                     className={cls(range === r ? "active" : null)}
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
                  className={cls(range === "all" ? "active" : null)}
               >
                  {$t(L.RebirthHistoryAll)}
               </button>
            </div>
            <div className="f1" />
            <div className="row g5">
               <span
                  style={{
                     display: "inline-block",
                     width: 16,
                     height: 3,
                     backgroundColor: SERIES_META[selectedSeries].color,
                  }}
               />
               <span className="text-desc">{SERIES_META[selectedSeries].labelFull}</span>
            </div>
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
                  dataKey={(d) =>
                     new Date(d.time).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  }
                  stroke="rgba(128,128,128,0.7)"
                  minTickGap={24}
               />
               <YAxis
                  tickFormatter={(v: number) => formatNumber(v)}
                  width={70}
                  stroke="rgba(128,128,128,0.7)"
               />
               <Tooltip content={(props) => <RebirthTooltip {...props} />} />
               <Line
                  type="monotone"
                  dataKey={selectedSeries}
                  name={SERIES_META[selectedSeries].label}
                  stroke={SERIES_META[selectedSeries].color}
                  strokeWidth={2}
                  activeDot={{ r: 5, fill: SERIES_META[selectedSeries].color }}
                  isAnimationActive={false}
                  connectNulls
               />
            </LineChart>
         </div>
      </div>
   );
}

function RebirthHistoryTable({ all }: { all: RebirthInfo[] }): React.ReactNode {
   const runs = useMemo(() => [...all].reverse(), [all]);
   return (
      <div className="table-view" style={{ overflow: "auto", maxHeight: "70vh" }}>
         <table>
            <tbody>
               <TableRow
                  label={$t(L.RebirthTime)}
                  values={runs.map((r) => new Date(r.time).toLocaleString())}
                  bold
               />
               <TableRow label={$t(L.Civilization)} values={runs.map((r) => Config.City[r.city].name())} />
               <TableRow label={$t(L.GreatPeopleThisRun)} values={runs.map((r) => r.greatPeopleThisRun)} />
               <TableRow
                  label={$t(L.ExtraGreatPeopleAtReborn)}
                  values={runs.map((r) => r.greatPeopleAtRebirth)}
               />
               <TableRow
                  label={$t(L.TotalEmpireValue)}
                  values={runs.map((r) => formatNumber(r.totalEmpireValue))}
               />
               <TableRow
                  label={$t(L.TotalGameTimeThisRun)}
                  values={runs.map((r) => formatHMS(r.totalTicks * 1000))}
               />
               <TableRow
                  label={$t(L.TotalEmpireValuePerCycle)}
                  values={runs.map((r) =>
                     formatNumber(r.totalTicks > 0 ? r.totalEmpireValue / r.totalTicks : 0),
                  )}
               />
               <TableRow
                  label={$t(L.TotalWallTimeThisRun)}
                  values={runs.map((r) => formatHMS(r.totalSeconds * 1000))}
               />
               <TableRow
                  label={$t(L.TotalEmpireValuePerWallSecond)}
                  values={runs.map((r) =>
                     formatNumber(r.totalSeconds > 0 ? r.totalEmpireValue / r.totalSeconds : 0),
                  )}
               />
            </tbody>
         </table>
      </div>
   );
}

function TableRow({
   label,
   values,
   bold,
}: {
   label: React.ReactNode;
   values: React.ReactNode[];
   bold?: boolean;
}): React.ReactNode {
   return (
      <tr className={bold ? "text-strong" : undefined}>
         <td
            style={{
               position: "sticky",
               left: 0,
               zIndex: 1,
               fontWeight: "bold",
               minWidth: 100,
            }}
            className="header"
         >
            {label}
         </td>
         {values.map((v, i) => (
            <td key={i}>{v}</td>
         ))}
      </tr>
   );
}

function RebirthTooltip(props: TooltipContentProps): React.ReactNode {
   const { active, payload } = props;
   if (!active || !payload || payload.length === 0) return null;
   const datum = payload[0]?.payload as RebirthInfo & {
      totalEmpireValuePerCycle: number;
      totalEmpireValuePerWallSecond: number;
   };
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
                  <td>{$t(L.RebirthTime)}</td>
                  <td className="text-right text-strong">{new Date(datum.time).toLocaleDateString()}</td>
               </tr>
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
                  value={formatNumber(datum.totalEmpireValue)}
                  color={SERIES_META.totalEmpireValue.color}
               />
               <tr>
                  <td>{$t(L.TotalGameTimeThisRun)}</td>
                  <td className="text-right text-strong">{formatHMS(datum.totalTicks * 1000)}</td>
               </tr>
               <TooltipRow
                  label={$t(L.TotalEmpireValuePerCycle)}
                  value={formatNumber(datum.totalEmpireValuePerCycle)}
                  color={SERIES_META.totalEmpireValuePerCycle.color}
               />
               <tr>
                  <td>{$t(L.TotalWallTimeThisRun)}</td>
                  <td className="text-right text-strong">{formatHMS(datum.totalSeconds * 1000)}</td>
               </tr>
               <TooltipRow
                  label={$t(L.TotalEmpireValuePerWallSecond)}
                  value={formatNumber(datum.totalEmpireValuePerWallSecond)}
                  color={SERIES_META.totalEmpireValuePerWallSecond.color}
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
}: {
   label: React.ReactNode;
   value: React.ReactNode;
   color: string;
}): React.ReactNode {
   return (
      <tr>
         <td>{label}</td>
         <td
            className="text-right text-strong"
            style={{
               borderRight: `3px solid ${color}`,
               paddingLeft: 6,
               backgroundColor: `${color}22`,
            }}
         >
            {value}
         </td>
      </tr>
   );
}
