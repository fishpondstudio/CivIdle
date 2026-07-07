import { useEffect, useRef, useState } from "react";
import type { Material } from "../../../shared/definitions/MaterialDefinitions";
import { Config } from "../../../shared/logic/Config";
import { clamp, formatNumber, keysOf, mapOf, safeAdd } from "../../../shared/utilities/Helper";
import type { PartialTabulate } from "../../../shared/utilities/TypeDefinitions";
import { TitleBarComponent } from "./TitleBarComponent";

interface FpsSample {
   t: number;
   fps: number;
   ms: number;
}

export function DebugPage(): React.ReactNode {
   const [selectedResource, setSelectedResource] = useState<PartialTabulate<Material>>({});
   return (
      <div className="window">
         <TitleBarComponent>Debug</TitleBarComponent>
         <div className="window-body">
            <FpsBench />
            <div className="separator" />
            <div className="table-view">
               <table>
                  <thead>
                     <tr>
                        <th></th>
                        <th>Resource</th>
                        <th>Tier</th>
                        <th className="text-right">Price</th>
                     </tr>
                  </thead>
                  <tbody>
                     {keysOf(Config.MaterialPrice)
                        .sort((a, b) => {
                           const tier = Config.MaterialTier[a]! - Config.MaterialTier[b]!;
                           if (tier !== 0) {
                              return tier;
                           }
                           return a.localeCompare(b);
                        })
                        .map((res) => {
                           return (
                              <tr key={res}>
                                 <td className="row">
                                    <div
                                       className="m-icon small text-desc"
                                       onClick={() => {
                                          safeAdd(selectedResource, res, 1);
                                          setSelectedResource({ ...selectedResource });
                                       }}
                                    >
                                       add_box
                                    </div>
                                    <code>{selectedResource[res] ?? 0}</code>
                                    <div
                                       className="m-icon small text-desc"
                                       onClick={() => {
                                          safeAdd(selectedResource, res, -1);
                                          selectedResource[res] = clamp(
                                             selectedResource[res]!,
                                             0,
                                             Number.POSITIVE_INFINITY,
                                          );
                                          setSelectedResource({ ...selectedResource });
                                       }}
                                    >
                                       indeterminate_check_box
                                    </div>
                                 </td>
                                 <td>{Config.Material[res].name()}</td>
                                 <td>{Config.MaterialTier[res]}</td>
                                 <td>{Config.MaterialPrice[res]}</td>
                              </tr>
                           );
                        })}
                  </tbody>
               </table>
            </div>
            <div className="sep5"></div>
            <div className="row">
               <div>Selected</div>
               <div className="f1 text-right">
                  {mapOf(selectedResource, (res, amount) => Config.MaterialPrice[res]! * amount).reduce(
                     // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
                     (prev, curr) => prev + curr,
                     0,
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}

function FpsBench(): React.ReactNode {
   const [samples, setSamples] = useState<FpsSample[]>([]);
   const [recording, setRecording] = useState(false);
   const recordingRef = useRef(false);
   const samplesRef = useRef<FpsSample[]>([]);

   useEffect(() => {
      let raf = 0;
      let last = performance.now();
      let startedAt = last;
      let frames = 0;

      const tick = (now: number) => {
         if (recordingRef.current) {
            frames++;
            const elapsed = now - last;
            if (elapsed >= 1000) {
               const sample = {
                  t: (now - startedAt) / 1000,
                  fps: (frames * 1000) / elapsed,
                  ms: elapsed / frames,
               };
               samplesRef.current = [...samplesRef.current.slice(-119), sample];
               setSamples(samplesRef.current);
               frames = 0;
               last = now;
            }
         } else {
            last = now;
            startedAt = now;
            frames = 0;
         }
         raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
   }, []);

   const latest = samples[samples.length - 1];
   const avg = samples.length ? samples.reduce((sum, s) => sum + s.fps, 0) / samples.length : 0;
   const min = samples.length ? Math.min(...samples.map((s) => s.fps)) : 0;
   const max = samples.length ? Math.max(...samples.map((s) => s.fps)) : 0;
   const points = samples
      .map((s, i) => {
         const x = samples.length <= 1 ? 0 : (i / (samples.length - 1)) * 320;
         const y = 80 - (Math.min(s.fps, 120) / 120) * 80;
         return `${x},${y}`;
      })
      .join(" ");

   function toggleRecording() {
      recordingRef.current = !recordingRef.current;
      setRecording(recordingRef.current);
   }

   function clear() {
      samplesRef.current = [];
      setSamples([]);
   }

   function copyCsv() {
      const csv = ["seconds,fps,frame_ms"]
         .concat(samples.map((s) => `${s.t.toFixed(1)},${s.fps.toFixed(2)},${s.ms.toFixed(2)}`))
         .join("\n");
      navigator.clipboard.writeText(csv).catch(console.error);
   }

   return (
      <fieldset>
         <legend>FPS Bench</legend>
         <div className="row">
            <button className="f1" onClick={toggleRecording}>
               {recording ? "Stop" : "Start"}
            </button>
            <button className="f1" onClick={clear}>
               Clear
            </button>
            <button className="f1" disabled={samples.length <= 0} onClick={copyCsv}>
               Copy CSV
            </button>
         </div>
         <div className="sep5" />
         <div className="row">
            <div className="f1">FPS</div>
            <div className="text-strong">{latest ? formatNumber(latest.fps) : "-"}</div>
         </div>
         <div className="row">
            <div className="f1">Avg / Min / Max</div>
            <div>
               {samples.length ? `${formatNumber(avg)} / ${formatNumber(min)} / ${formatNumber(max)}` : "-"}
            </div>
         </div>
         <div className="row">
            <div className="f1">Frame ms</div>
            <div>{latest ? formatNumber(latest.ms) : "-"}</div>
         </div>
         <div className="sep5" />
         <svg width="320" height="80" viewBox="0 0 320 80" style={{ display: "block" }}>
            <rect width="320" height="80" fill="#111" />
            <line x1="0" y1="40" x2="320" y2="40" stroke="#555" />
            <polyline points={points} fill="none" stroke="#00aa00" strokeWidth="2" />
         </svg>
      </fieldset>
   );
}
