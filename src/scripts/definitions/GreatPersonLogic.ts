import { Tick } from "../logic/TickLogic";
import { addMultiplier } from "../logic/Update";
import { L, t } from "../utilities/i18n";
import { GreatPerson } from "./GreatPersonDefinitions";

export const GreatPersonLogic: Record<GreatPerson, (level: number) => void> = {
   Cincinnatus: (level) => {
      addMultiplier("WheatFarm", { input: level, output: level }, t(L.SourceGreatPerson, { person: t(L.Cincinnatus) }));
   },
   ScipioAfricanus: (level) => {
      addMultiplier(
         "Castrum",
         { input: level, output: level },
         t(L.SourceGreatPerson, { person: t(L.ScipioAfricanus) })
      );
   },
   JuliusCaesar: (level) => {
      Tick.next.globalMultipliers.sciencePerIdleWorker.push({
         value: level,
         source: t(L.SourceGreatPerson, { person: t(L.JuliusCaesar) }),
      });
   },
};
