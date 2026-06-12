import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, type TooltipContentProps, XAxis, YAxis } from "recharts";
import { Config } from "../../../shared/logic/Config";
import { RebirthFlags, type RebirthInfo } from "../../../shared/logic/GameState";
import { cls, formatHMS, formatNumber, hasFlag } from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { useGameOptions } from "../Global";
import { playClick } from "../visuals/Sound";
import { hideModal, showToast } from "./GlobalModal";

const RangeOptions = [10, 20, 50] as const;
type RangeOption = (typeof RangeOptions)[number] | "all";

const DataSeries = {
   totalEmpireValue: {
      label: () => $t(L.RebirthHistoryEmpireValueV2),
      labelFull: () => $t(L.TotalEmpireValue),
      color: "#2980b9",
   },
   totalEmpireValuePerCycle: {
      label: () => $t(L.RebirthHistoryEmpireValuePerCycle),
      labelFull: () => $t(L.TotalEmpireValuePerCycle),
      color: "#8e44ad",
   },
   totalEmpireValuePerWallSecond: {
      label: () => $t(L.RebirthHistoryEmpireValuePerWallSecond),
      labelFull: () => $t(L.TotalEmpireValuePerWallSecond),
      color: "#16a085",
   },
   greatPeopleAtRebirth: {
      label: () => $t(L.RebirthHistoryExtraGreatPeopleAtRebirth),
      labelFull: () => $t(L.ExtraGreatPeopleAtReborn),
      color: "#e67e22",
   },
} as const;
type SeriesKey = keyof typeof DataSeries;

const ChartOptions: readonly SeriesKey[] = [
   "totalEmpireValue",
   "totalEmpireValuePerCycle",
   "totalEmpireValuePerWallSecond",
   "greatPeopleAtRebirth",
];

export function RebirthHistoryModal(): React.ReactNode {
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
                     <div className="w10" />
                     {window.showSaveFilePicker && (
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
                                 if (error instanceof DOMException && error.name === "AbortError") return;
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
                     )}
                     <div className="f1" />
                     <div className="text-desc">
                        {$t(L.XRunsInTotal, { count: options.rebirthInfo.length })}
                     </div>
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
         dateLabel: new Date(r.time).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
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
               {ChartOptions.map((key) => (
                  <option key={key} value={key}>
                     {DataSeries[key].label()}
                  </option>
               ))}
            </select>
            <div className="row">
               {RangeOptions.map((r) => (
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
                     backgroundColor: DataSeries[selectedSeries].color,
                  }}
               />
               <span className="text-desc">{DataSeries[selectedSeries].labelFull()}</span>
            </div>
         </div>
         <div>
            <LineChart
               style={{ width: "100%", maxHeight: "70vh", aspectRatio: 1.618 }}
               responsive
               data={data}
               margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.3)" />
               <XAxis dataKey="dateLabel" stroke="rgba(128,128,128,0.7)" minTickGap={24} />
               <YAxis
                  tickFormatter={(v: number) => formatNumber(v)}
                  width="auto"
                  stroke="rgba(128,128,128,0.7)"
               />
               <Tooltip content={RebirthTooltip} />
               <Line
                  type="monotone"
                  dataKey={selectedSeries}
                  name={DataSeries[selectedSeries].label()}
                  stroke={DataSeries[selectedSeries].color}
                  strokeWidth={2}
                  activeDot={{ r: 5, fill: DataSeries[selectedSeries].color }}
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
   const rows = useMemo(() => {
      if (runs.length === 0) return [];
      const rowData: { label: string; values: React.ReactNode[]; bold?: boolean }[] = [
         { label: $t(L.RebirthTime), bold: true, values: [] },
         { label: $t(L.Civilization), values: [] },
         { label: $t(L.GreatPeopleThisRun), values: [] },
         { label: $t(L.ExtraGreatPeopleAtReborn), values: [] },
         { label: $t(L.TotalEmpireValue), values: [] },
         { label: $t(L.TotalGameTimeThisRun), values: [] },
         { label: $t(L.TotalEmpireValuePerCycle), values: [] },
         { label: $t(L.TotalWallTimeThisRun), values: [] },
         { label: $t(L.TotalEmpireValuePerWallSecond), values: [] },
      ];
      for (const r of runs) {
         rowData[0].values.push(new Date(r.time).toLocaleString());
         rowData[1].values.push(Config.City[r.city].name());
         rowData[2].values.push(r.greatPeopleThisRun);
         rowData[3].values.push(r.greatPeopleAtRebirth);
         rowData[4].values.push(formatNumber(r.totalEmpireValue));
         rowData[5].values.push(formatHMS(r.totalTicks * 1000));
         rowData[6].values.push(formatNumber(r.totalTicks > 0 ? r.totalEmpireValue / r.totalTicks : 0));
         rowData[7].values.push(formatHMS(r.totalSeconds * 1000));
         rowData[8].values.push(formatNumber(r.totalSeconds > 0 ? r.totalEmpireValue / r.totalSeconds : 0));
      }
      return rowData;
   }, [runs]);

   return (
      <div className="table-view" style={{ overflow: "auto", maxHeight: "70vh" }}>
         <table>
            <tbody>
               {rows.map((row) => (
                  <tr key={row.label} className={row.bold ? "text-strong" : undefined}>
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
                        {row.label}
                     </td>
                     {row.values.map((v, i) => (
                        <td key={i}>{v}</td>
                     ))}
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
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
                  color={DataSeries.totalEmpireValue.color}
               />
               <tr>
                  <td>{$t(L.TotalGameTimeThisRun)}</td>
                  <td className="text-right text-strong">{formatHMS(datum.totalTicks * 1000)}</td>
               </tr>
               <TooltipRow
                  label={$t(L.TotalEmpireValuePerCycle)}
                  value={formatNumber(datum.totalEmpireValuePerCycle)}
                  color={DataSeries.totalEmpireValuePerCycle.color}
               />
               <tr>
                  <td>{$t(L.TotalWallTimeThisRun)}</td>
                  <td className="text-right text-strong">{formatHMS(datum.totalSeconds * 1000)}</td>
               </tr>
               <TooltipRow
                  label={$t(L.TotalEmpireValuePerWallSecond)}
                  value={formatNumber(datum.totalEmpireValuePerWallSecond)}
                  color={DataSeries.totalEmpireValuePerWallSecond.color}
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
