import { getScienceFromWorkers } from "../logic/BuildingLogic";
import { Config } from "../logic/Config";
import { getGameState } from "../logic/GameStateLogic";
import type { Multiplier, MultiplierType } from "../logic/TickLogic";
import { MultiplierTypeDesc, Tick } from "../logic/TickLogic";
import { addMultiplier } from "../logic/Update";
import { L, t } from "../utilities/i18n";
import type { Building } from "./BuildingDefinitions";
import type { TechAge } from "./TechDefinitions";

export class GreatPersonDefinitions {
   // Bronze /////////////////////////////////////////////////////////////////////////////////////////////////

   Hammurabi: IGreatPersonDefinition = boostOf({
      name: () => t(L.Hammurabi),
      boost: {
         multipliers: ["output"],
         buildings: ["House", "Hut"],
      },
      value: (level) => level,
      maxLevel: Infinity,
      age: "BronzeAge",
      time: "c. 1800s BC",
   });

   RamessesII: IGreatPersonDefinition = {
      name: () => t(L.RamessesII),
      desc: (self, level) => t(L.RamessesIIDesc, { value: self.value(level) }),
      time: "c. 1300s BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "BronzeAge",
      tick: (self, level, permanent) => {
         Tick.next.globalMultipliers.builderCapacity.push({
            value: self.value(level),
            source: t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, {
               person: self.name(),
            }),
         });
      },
   };

   TangOfShang: IGreatPersonDefinition = {
      name: () => t(L.TangOfShang),
      desc: (self, level) => t(L.TangOfShangDesc, { value: self.value(level) }),
      time: "c. 1600s BC",
      value: (level) => level * 0.5,
      maxLevel: Infinity,
      age: "BronzeAge",
      tick: (self, level, permanent) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({
            value: self.value(level),
            source: t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, {
               person: self.name(),
            }),
         });
      },
   };

   Hatshepsut: IGreatPersonDefinition = boostOf({
      name: () => t(L.Hatshepsut),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Aqueduct", "Brickworks"],
      },
      time: "c. 1507 ~ 1458 BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "BronzeAge",
   });

   SargonOfAkkad: IGreatPersonDefinition = boostOf({
      name: () => t(L.SargonOfAkkad),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["LoggingCamp", "LumberMill"],
      },
      time: "c. 2334 ~2279 BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "BronzeAge",
   });

   // Iron ///////////////////////////////////////////////////////////////////////////////////////////////////

   Agamemnon: IGreatPersonDefinition = boostOf({
      name: () => t(L.Agamemnon),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["StoneQuarry", "Marbleworks"],
      },
      time: "c. 1200s BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "IronAge",
   });

   DukeOfZhou: IGreatPersonDefinition = boostOf({
      name: () => t(L.DukeOfZhou),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CopperMiningCamp", "Blacksmith"],
      },
      time: "c. 1000s BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "IronAge",
   });

   Dido: IGreatPersonDefinition = boostOf({
      name: () => t(L.Dido),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["LivestockFarm", "Stable"],
      },
      time: "c. 800s BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "IronAge",
   });

   Zoroaster: IGreatPersonDefinition = boostOf({
      name: () => t(L.Zoroaster),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CottonPlantation", "CottonMill"],
      },
      time: "c. 1500s BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "IronAge",
   });

   // Classical //////////////////////////////////////////////////////////////////////////////////////////////

   Aeschylus: IGreatPersonDefinition = boostOf({
      name: () => t(L.Aeschylus),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["FlourMill", "Bakery"],
      },
      time: "c. 500s",
      value: (level) => level,
      maxLevel: Infinity,
      age: "ClassicalAge",
   });

   Ashurbanipal: IGreatPersonDefinition = boostOf({
      name: () => t(L.Ashurbanipal),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Sandpit", "Glassworks"],
      },
      time: "c. 685 ~ 631 BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "ClassicalAge",
   });

   NebuchadnezzarII: IGreatPersonDefinition = boostOf({
      name: () => t(L.NebuchadnezzarII),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["WheatFarm", "Brewery"],
      },
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "ClassicalAge",
   });

   Herodotus: IGreatPersonDefinition = boostOf({
      name: () => t(L.Herodotus),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["WritersGuild", "MusiciansGuild"],
      },
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "ClassicalAge",
   });

   CyrusII: IGreatPersonDefinition = boostOf({
      name: () => t(L.CyrusII),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["IronMiningCamp", "IronForge"],
      },
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "ClassicalAge",
   });

   Socrates: IGreatPersonDefinition = {
      name: () => t(L.Socrates),
      desc: (self, level) => t(L.SocratesDesc, { value: self.value(level) }),
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "ClassicalAge",
      tick: (self, level, permanent) => {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: self.value(level),
            source: t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, {
               person: self.name(),
            }),
         });
      },
   };

   Aristophanes: IGreatPersonDefinition = {
      name: () => t(L.Aristophanes),
      desc: (self, level) => t(L.AristophanesDesc, { value: self.value(level) }),
      time: "446 ~ 386 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "ClassicalAge",
      tick: (self, level, permanent) => {
         Tick.next.globalMultipliers.happiness.push({
            value: self.value(level),
            source: t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, {
               person: self.name(),
            }),
         });
      },
   };

   Confucius: IGreatPersonDefinition = {
      name: () => t(L.Confucius),
      desc: (self, level) => t(L.ConfuciusDesc, { value: self.value(level) }),
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "ClassicalAge",
      tick: addScienceBasedOnBusyWorkers.bind(null),
   };

   QinShiHuang: IGreatPersonDefinition = boostOf({
      name: () => t(L.QinShiHuang),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["ChariotWorkshop", "Armory"],
      },
      time: "c. 200s BC",
      value: (level) => level,
      maxLevel: Infinity,
      age: "ClassicalAge",
   });

   // Middle Age /////////////////////////////////////////////////////////////////////////////////////////////

   Justinian: IGreatPersonDefinition = boostOf({
      name: () => t(L.Justinian),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["FurnitureWorkshop", "GarmentWorkshop"],
      },
      time: "482 ~ 565 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "MiddleAge",
   });

   IsidoreOfMiletus: IGreatPersonDefinition = {
      name: () => t(L.IsidoreOfMiletus),
      desc: (self, level) => t(L.IsidoreOfMiletusDesc, { value: self.value(level) }),
      time: "c. 500 AD",
      value: (level) => level * 2,
      maxLevel: Infinity,
      age: "MiddleAge",
      tick: (self, level, permanent) => {
         Tick.next.globalMultipliers.builderCapacity.push({
            value: self.value(level),
            source: t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, {
               person: self.name(),
            }),
         });
      },
   };

   Charlemagne: IGreatPersonDefinition = boostOf({
      name: () => t(L.Charlemagne),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["SwordForge", "KnightCamp"],
      },
      time: "747 ~ 814 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "MiddleAge",
   });

   HarunAlRashid: IGreatPersonDefinition = boostOf({
      name: () => t(L.HarunAlRashid),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CheeseMaker", "Mosque"],
      },
      time: "763 ~ 809 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "MiddleAge",
   });

   WuZetian: IGreatPersonDefinition = {
      name: () => t(L.WuZetian),
      desc: (self, level) => t(L.WuZetianDesc, { value: self.value(level) }),
      time: "624 ~ 705 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "MiddleAge",
      tick: (self, level, permanent) => {
         Tick.next.globalMultipliers.transportCapacity.push({
            value: self.value(level),
            source: t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, {
               person: self.name(),
            }),
         });
      },
   };

   Rurik: IGreatPersonDefinition = {
      name: () => t(L.Rurik),
      desc: (self, level) => t(L.RurikDesc, { value: self.value(level) }),
      time: "624 ~ 705 AD",
      value: (level) => level * 2,
      maxLevel: Infinity,
      age: "MiddleAge",
      tick: (self, level, permanent) => {
         Tick.next.globalMultipliers.happiness.push({
            value: self.value(level),
            source: t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, {
               person: self.name(),
            }),
         });
      },
   };

   Fibonacci: IGreatPersonDefinition = {
      name: () => t(L.Fibonacci),
      desc: (self, level) => t(L.FibonacciDescV2, { idle: self.value(level) / 2, busy: self.value(level) }),
      time: "c. 1170 ~ 1250 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "MiddleAge",
      tick: (self, level, permanent) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({
            value: self.value(level) / 2,
            source: t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, {
               person: self.name(),
            }),
         });
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: self.value(level),
            source: t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, {
               person: self.name(),
            }),
         });
      },
   };

   // Renaissance ////////////////////////////////////////////////////////////////////////////////////////////

   LeonardoDaVinci: IGreatPersonDefinition = boostOf({
      name: () => t(L.LeonardoDaVinci),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["PaintersGuild", "University"],
      },
      time: "1452 ~ 1519 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "RenaissanceAge",
   });

   MartinLuther: IGreatPersonDefinition = boostOf({
      name: () => t(L.MartinLuther),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Church", "Cathedral"],
      },
      time: "1483 ~ 1546 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "RenaissanceAge",
   });

   WilliamShakespeare: IGreatPersonDefinition = boostOf({
      name: () => t(L.WilliamShakespeare),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["PaperMaker", "PrintingHouse"],
      },
      time: "1564 ~ 1616 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "RenaissanceAge",
   });

   ReneDescartes: IGreatPersonDefinition = boostOf({
      name: () => t(L.ReneDescartes),
      boost: {
         multipliers: ["output"],
         buildings: ["School", "Library"],
      },
      time: "1596 ~ 1650 AD",
      value: (level) => level * 2,
      maxLevel: Infinity,
      age: "RenaissanceAge",
   });

   ZhengHe: IGreatPersonDefinition = boostOf({
      name: () => t(L.ZhengHe),
      boost: {
         multipliers: ["storage", "output"],
         buildings: ["CaravelBuilder", "GalleonBuilder"],
      },
      time: "1371 ~ 1435 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "RenaissanceAge",
   });

   CosimoDeMedici: IGreatPersonDefinition = boostOf({
      name: () => t(L.CosimoDeMedici),
      boost: {
         multipliers: ["storage", "output"],
         buildings: ["GoldMiningCamp", "CoinMint"],
      },
      time: "1389 ~ 1464 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "RenaissanceAge",
   });

   IsaacNewton: IGreatPersonDefinition = {
      name: () => t(L.IsaacNewton),
      desc: (self, level) => t(L.IsaacNewtonDesc, { value: self.value(level) }),
      time: "1642 ~ 1727",
      value: (level) => level * 2,
      maxLevel: Infinity,
      age: "RenaissanceAge",
      tick: addScienceBasedOnBusyWorkers.bind(null),
   };

   // Industrial /////////////////////////////////////////////////////////////////////////////////////////////

   JamesWatt: IGreatPersonDefinition = boostOf({
      name: () => t(L.JamesWatt),
      boost: {
         multipliers: ["storage", "output"],
         buildings: ["Steamworks", "DynamiteWorkshop"],
      },
      time: "1736 ~ 1819 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "IndustrialAge",
   });

   KarlMarx: IGreatPersonDefinition = boostOf({
      name: () => t(L.KarlMarx),
      boost: {
         multipliers: ["storage", "output"],
         buildings: ["Courthouse", "Parliament"],
      },
      time: "1818 ~ 1883 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "IndustrialAge",
   });

   AdaLovelace: IGreatPersonDefinition = boostOf({
      name: () => t(L.AdaLovelace),
      boost: {
         multipliers: ["storage", "output"],
         buildings: ["PrintingHouse", "Museum"],
      },
      time: "1815 ~ 1852 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "IndustrialAge",
   });

   NapoleonBonaparte: IGreatPersonDefinition = boostOf({
      name: () => t(L.NapoleonBonaparte),
      boost: {
         multipliers: ["storage", "output"],
         buildings: ["CannonWorkshop", "GunpowderMill"],
      },
      time: "1769 ~ 1821 AD",
      value: (level) => level,
      maxLevel: Infinity,
      age: "IndustrialAge",
   });

   CharlesDarwin: IGreatPersonDefinition = {
      name: () => t(L.CharlesDarwin),
      desc: (self, level) => t(L.CharlesDarwinDesc, { value: self.value(level) }),
      time: "1809 ~ 1882 AD",
      value: (level) => level * 2,
      maxLevel: Infinity,
      age: "IndustrialAge",
      tick: (self, level, permanent) => {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: self.value(level),
            source: t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, {
               person: self.name(),
            }),
         });
      },
   };

   FlorenceNightingale: IGreatPersonDefinition = {
      name: () => t(L.FlorenceNightingale),
      desc: (self, level) => t(L.FlorenceNightingaleDesc, { value: self.value(level) }),
      time: "1820 ~ 1910 AD",
      value: (level) => level * 3,
      maxLevel: Infinity,
      age: "IndustrialAge",
      tick: (self, level, permanent) => {
         Tick.next.globalMultipliers.happiness.push({
            value: self.value(level),
            source: t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, {
               person: self.name(),
            }),
         });
      },
   };
}

export type GreatPerson = keyof GreatPersonDefinitions;

interface IGreatPersonBoost {
   multipliers: MultiplierType[];
   buildings: Building[];
}

export interface IGreatPersonDefinition {
   name: () => string;
   desc: (self: IGreatPersonDefinition, level: number) => string;
   value: (level: number) => number;
   time: string;
   maxLevel: number;
   age: TechAge;
   boost?: IGreatPersonBoost;
   tick: (self: IGreatPersonDefinition, level: number, permanent: boolean) => void;
}

function greatPersonBoostDesc(self: IGreatPersonDefinition, level: number) {
   if (!self.boost) {
      throw new Error("`greatPersonBoostDesc` requires `boost` to be defined");
   }
   return t(L.BoostDescription, {
      value: self.value(level),
      multipliers: self.boost.multipliers.map((m) => MultiplierTypeDesc[m]).join(", "),
      buildings: self.boost.buildings.map((b) => Config.Building[b].name()).join(", "),
   });
}

function tickGreatPersonBoost(self: IGreatPersonDefinition, level: number, permanent: boolean) {
   const boost = self.boost;
   if (!boost) {
      throw new Error("`tickGreatPersonBoost` requires `boost` to be defined");
   }
   boost.buildings.forEach((b) => {
      const multiplier: Partial<Multiplier> = {};
      boost.multipliers.forEach((m) => {
         multiplier[m] = self.value(level);
      });
      addMultiplier(
         b,
         multiplier as Multiplier,
         t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, { person: self.name() }),
      );
   });
}

function boostOf(
   def: Omit<IGreatPersonDefinition, "desc" | "tick"> & Pick<Required<IGreatPersonDefinition>, "boost">,
): IGreatPersonDefinition {
   return {
      name: def.name,
      desc: (self, level) => greatPersonBoostDesc(self, level),
      boost: def.boost,
      time: def.time,
      value: def.value,
      maxLevel: def.maxLevel,
      age: def.age,
      tick: (self, level, permanent) => tickGreatPersonBoost(self, level, permanent),
   };
}

function addScienceBasedOnBusyWorkers(self: IGreatPersonDefinition, level: number, permanent: boolean): void {
   const gs = getGameState();
   const { workersBusy, workersAfterHappiness } = getScienceFromWorkers(gs);
   if (workersBusy >= 0.5 * workersAfterHappiness) {
      Tick.next.globalMultipliers.sciencePerBusyWorker.push({
         value: self.value(level),
         source: t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, {
            person: self.name(),
         }),
      });
      Tick.next.globalMultipliers.sciencePerIdleWorker.push({
         value: self.value(level),
         source: t(permanent ? L.SourceGreatPersonPermanent : L.SourceGreatPerson, {
            person: self.name(),
         }),
      });
   }
}
