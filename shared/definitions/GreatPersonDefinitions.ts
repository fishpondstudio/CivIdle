import { getScienceFromWorkers } from "../logic/BuildingLogic";
import { Config } from "../logic/Config";
import { getGameState } from "../logic/GameStateLogic";
import { getTransportStat } from "../logic/IntraTickCache";
import type { Multiplier, MultiplierType } from "../logic/TickLogic";
import { MultiplierTypeDesc, Tick } from "../logic/TickLogic";
import { addMultiplier } from "../logic/Update";
import { L, t } from "../utilities/i18n";
import type { Building } from "./BuildingDefinitions";
import type { City } from "./CityDefinitions";
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
      maxLevel: Number.POSITIVE_INFINITY,
      age: "BronzeAge",
      time: "c. 1800s BC",
   });

   RamessesII: IGreatPersonDefinition = {
      name: () => t(L.RamessesII),
      desc: (self, level) => t(L.RamessesIIDesc, { value: self.value(level) }),
      time: "c. 1300s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "BronzeAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.builderCapacity.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   TangOfShang: IGreatPersonDefinition = {
      name: () => t(L.TangOfShang),
      desc: (self, level) => t(L.TangOfShangDesc, { value: self.value(level) }),
      time: "c. 1600s BC",
      value: (level) => level * 0.5,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "BronzeAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   Hatshepsut: IGreatPersonDefinition = boostOf({
      name: () => t(L.Hatshepsut),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Aqueduct", "Brickworks"],
      },
      time: "c. 1507 ~ 1458 BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
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
      maxLevel: Number.POSITIVE_INFINITY,
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
      maxLevel: Number.POSITIVE_INFINITY,
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
      maxLevel: Number.POSITIVE_INFINITY,
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
      maxLevel: Number.POSITIVE_INFINITY,
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
      maxLevel: Number.POSITIVE_INFINITY,
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
      maxLevel: Number.POSITIVE_INFINITY,
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
      maxLevel: Number.POSITIVE_INFINITY,
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
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
   });

   Herodotus: IGreatPersonDefinition = boostOf({
      name: () => t(L.Herodotus),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["PaperMaker", "MusiciansGuild"],
      },
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
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
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
   });

   Socrates: IGreatPersonDefinition = {
      name: () => t(L.Socrates),
      desc: (self, level) => t(L.SocratesDesc, { value: self.value(level) }),
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   Aristophanes: IGreatPersonDefinition = {
      name: () => t(L.Aristophanes),
      desc: (self, level) => t(L.AristophanesDesc, { value: self.value(level) }),
      time: "446 ~ 386 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.happiness.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   Confucius: IGreatPersonDefinition = {
      name: () => t(L.Confucius),
      desc: (self, level) => t(L.ConfuciusDescV2, { value: self.value(level) }),
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      tick: (self, level, source) => {
         addScienceBasedOnBusyWorkers(self.value(level), source);
      },
      type: GreatPersonType.Normal,
   };

   Archimedes: IGreatPersonDefinition = boostOf({
      name: () => t(L.Archimedes),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Caravansary", "Warehouse"],
      },
      time: "c. 200 BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
   });

   EmperorWuOfHan: IGreatPersonDefinition = boostOf({
      name: () => t(L.EmperorWuOfHan),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Caravansary"],
      },
      time: "156 ~ 87 BC",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      city: "Beijing",
   });

   QinShiHuang: IGreatPersonDefinition = boostOf({
      name: () => t(L.QinShiHuang),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["ChariotWorkshop", "Armory"],
      },
      time: "c. 200s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
   });

   Zenobia: IGreatPersonDefinition = {
      name: () => t(L.Zenobia),
      desc: (self, level) => t(L.ZenobiaDesc, { value: self.value(level) }),
      time: "240 ~ 274 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Normal,
   };

   Plato: IGreatPersonDefinition = {
      name: () => t(L.Plato),
      desc: (self, level) => t(L.WildCardGreatPersonDesc),
      time: "427 ~ 348 BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Wildcard,
   };

   AshokaTheGreat: IGreatPersonDefinition = {
      name: () => t(L.AshokaTheGreat),
      desc: (self, level) => t(L.PromotionGreatPersonDesc),
      time: "304 ~ 232 BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Promotion,
   };

   // Middle Age /////////////////////////////////////////////////////////////////////////////////////////////

   Justinian: IGreatPersonDefinition = boostOf({
      name: () => t(L.Justinian),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["FurnitureWorkshop", "GarmentWorkshop"],
      },
      time: "482 ~ 565 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
   });

   IsidoreOfMiletus: IGreatPersonDefinition = {
      name: () => t(L.IsidoreOfMiletus),
      desc: (self, level) => t(L.IsidoreOfMiletusDesc, { value: self.value(level) }),
      time: "c. 500 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.builderCapacity.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   Charlemagne: IGreatPersonDefinition = boostOf({
      name: () => t(L.Charlemagne),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["SwordForge", "KnightCamp"],
      },
      time: "747 ~ 814 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
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
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
   });

   WuZetian: IGreatPersonDefinition = {
      name: () => t(L.WuZetian),
      desc: (self, level) => t(L.WuZetianDesc, { value: self.value(level) }),
      time: "624 ~ 705 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.transportCapacity.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   Xuanzang: IGreatPersonDefinition = boostOf({
      name: () => t(L.Xuanzang),
      boost: {
         multipliers: ["output"],
         buildings: ["Library", "Pagoda"],
      },
      time: "602 ~ 664 AD",
      value: (level) => 1 * level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
   });

   Rurik: IGreatPersonDefinition = {
      name: () => t(L.Rurik),
      desc: (self, level) => t(L.RurikDesc, { value: self.value(level) }),
      time: "624 ~ 705 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.happiness.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   Fibonacci: IGreatPersonDefinition = {
      name: () => t(L.Fibonacci),
      desc: (self, level) => t(L.FibonacciDescV2, { idle: self.value(level) / 2, busy: self.value(level) }),
      time: "c. 1170 ~ 1250 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({ value: self.value(level) / 2, source });
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   Saladin: IGreatPersonDefinition = {
      name: () => t(L.Saladin),
      desc: (self, level) => t(L.WildCardGreatPersonDesc),
      time: "1137 ~ 1193 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Wildcard,
   };

   MarcoPolo: IGreatPersonDefinition = {
      name: () => t(L.MarcoPolo),
      desc: (self, level) => t(L.PromotionGreatPersonDesc),
      time: "1254 ~ 1324 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Promotion,
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
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
   });

   JohannesKepler: IGreatPersonDefinition = boostOf({
      name: () => t(L.JohannesKepler),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Shrine", "LensWorkshop"],
      },
      time: "1571 ~ 1630 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
   });

   GalileoGalilei: IGreatPersonDefinition = {
      name: () => t(L.GalileoGalilei),
      desc: (self, level) => t(L.GalileoGalileiDesc, { value: self.value(level) }),
      time: "1564 ~ 1642 AD",
      value: (level) => level * 1,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   MartinLuther: IGreatPersonDefinition = boostOf({
      name: () => t(L.MartinLuther),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Church", "School"],
      },
      time: "1483 ~ 1546 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
   });

   WilliamShakespeare: IGreatPersonDefinition = boostOf({
      name: () => t(L.WilliamShakespeare),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["WritersGuild", "ActorsGuild"],
      },
      time: "1564 ~ 1616 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
   });

   ReneDescartes: IGreatPersonDefinition = boostOf({
      name: () => t(L.ReneDescartes),
      boost: {
         multipliers: ["output"],
         buildings: ["School"],
      },
      time: "1596 ~ 1650 AD",
      value: (level) => 2 * level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
   });

   ZhengHe: IGreatPersonDefinition = boostOf({
      name: () => t(L.ZhengHe),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CaravelBuilder", "GalleonBuilder"],
      },
      time: "1371 ~ 1435 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
   });

   CosimoDeMedici: IGreatPersonDefinition = boostOf({
      name: () => t(L.CosimoDeMedici),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["GoldMiningCamp", "CoinMint"],
      },
      time: "1389 ~ 1464 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
   });

   IsaacNewton: IGreatPersonDefinition = {
      name: () => t(L.IsaacNewton),
      desc: (self, level) => t(L.IsaacNewtonDescV2, { value: self.value(level) }),
      time: "1642 ~ 1727 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      tick: (self, level, source) => {
         addScienceBasedOnBusyWorkers(self.value(level), source);
      },
      type: GreatPersonType.Normal,
   };

   GeorgiusAgricola: IGreatPersonDefinition = boostOf({
      name: () => t(L.GeorgiusAgricola),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["SiegeWorkshop", "CoalMine"],
      },
      time: "1494 ~ 1555 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
   });

   Michelangelo: IGreatPersonDefinition = {
      name: () => t(L.Michelangelo),
      desc: (self, level) => t(L.WildCardGreatPersonDesc),
      time: "1475 ~ 1564 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Wildcard,
   };

   JohannesGutenberg: IGreatPersonDefinition = {
      name: () => t(L.JohannesGutenberg),
      desc: (self, level) => t(L.PromotionGreatPersonDesc),
      time: "1393 ~ 1406 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Promotion,
   };

   // Industrial /////////////////////////////////////////////////////////////////////////////////////////////

   JamesWatt: IGreatPersonDefinition = boostOf({
      name: () => t(L.JamesWatt),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Steamworks", "DynamiteWorkshop"],
      },
      time: "1736 ~ 1819 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
   });

   IsambardKingdomBrunel: IGreatPersonDefinition = boostOf({
      name: () => t(L.IsambardKingdomBrunel),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["FrigateBuilder", "ConcretePlant"],
      },
      time: "1806 ~ 1859 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
   });

   LouisSullivan: IGreatPersonDefinition = {
      name: () => t(L.LouisSullivan),
      desc: (self, level) => t(L.LouisSullivanDesc, { value: self.value(level) }),
      time: "1856 ~ 1924 AD",
      value: (level) => level * 3,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.builderCapacity.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   KarlMarx: IGreatPersonDefinition = boostOf({
      name: () => t(L.KarlMarx),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Courthouse", "Parliament"],
      },
      time: "1818 ~ 1883 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
   });

   AdaLovelace: IGreatPersonDefinition = boostOf({
      name: () => t(L.AdaLovelace),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["PrintingHouse", "Museum"],
      },
      time: "1815 ~ 1852 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
   });

   NapoleonBonaparte: IGreatPersonDefinition = boostOf({
      name: () => t(L.NapoleonBonaparte),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CannonWorkshop", "GunpowderMill"],
      },
      time: "1769 ~ 1821 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
   });

   CharlesDarwin: IGreatPersonDefinition = {
      name: () => t(L.CharlesDarwin),
      desc: (self, level) => t(L.CharlesDarwinDesc, { value: self.value(level) }),
      time: "1809 ~ 1882 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   CarlFriedrichGauss: IGreatPersonDefinition = {
      name: () => t(L.CarlFriedrichGauss),
      desc: (self, level) =>
         t(L.CarlFriedrichGaussDesc, { idle: 0.5 * self.value(level), busy: 1.5 * self.value(level) }),
      time: "c. 1777 ~ 1855 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({ value: 0.5 * self.value(level), source });
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({ value: 1.5 * self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   FlorenceNightingale: IGreatPersonDefinition = {
      name: () => t(L.FlorenceNightingale),
      desc: (self, level) => t(L.FlorenceNightingaleDesc, { value: self.value(level) }),
      time: "1820 ~ 1910 AD",
      value: (level) => level * 3,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.happiness.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   JPMorgan: IGreatPersonDefinition = boostOf({
      name: () => t(L.JPMorgan),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["BondMarket", "RifleFactory"],
      },
      time: "1837 ~ 1913 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
   });

   AndrewCarnegie: IGreatPersonDefinition = boostOf({
      name: () => t(L.AndrewCarnegie),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Bank", "SteelMill"],
      },
      time: "1837 ~ 1913 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
   });

   ThomasEdison: IGreatPersonDefinition = {
      name: () => t(L.ThomasEdison),
      desc: (self, level) => t(L.WildCardGreatPersonDesc),
      time: "1847 ~ 1931 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Wildcard,
   };

   AdamSmith: IGreatPersonDefinition = {
      name: () => t(L.AdamSmith),
      desc: (self, level) => t(L.PromotionGreatPersonDesc),
      time: "1723 ~ 1790 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Promotion,
   };

   // World Wars /////////////////////////////////////////////////////////////////////////////////////////////

   JohnDRockefeller: IGreatPersonDefinition = boostOf({
      name: () => t(L.JohnDRockefeller),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["OilWell", "StockExchange"],
      },
      time: "1839 ~ 1937 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
   });

   RudolfDiesel: IGreatPersonDefinition = boostOf({
      name: () => t(L.RudolfDiesel),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["OilRefinery", "LocomotiveFactory"],
      },
      time: "1858 ~ 1913 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
   });

   PierreDeCoubertin: IGreatPersonDefinition = boostOf({
      name: () => t(L.PierreDeCoubertin),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["PublishingHouse", "Stadium"],
      },
      time: "1863 ~ 1937 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
   });

   CharlesParsons: IGreatPersonDefinition = boostOf({
      name: () => t(L.CharlesParsons),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CoalPowerPlant", "IroncladBuilder"],
      },
      time: "1854 ~ 1931 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
   });

   RichardJordanGatling: IGreatPersonDefinition = boostOf({
      name: () => t(L.RichardJordanGatling),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["GatlingGunFactory", "TankFactory"],
      },
      time: "1818 ~ 1903 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
   });

   JosephPulitzer: IGreatPersonDefinition = boostOf({
      name: () => t(L.JosephPulitzer),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["MagazinePublisher", "Pizzeria"],
      },
      time: "1847 ~ 1911 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
   });

   CharlesMartinHall: IGreatPersonDefinition = boostOf({
      name: () => t(L.CharlesMartinHall),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["NaturalGasWell", "AluminumSmelter"],
      },
      time: "1863 ~ 1914 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
   });

   MarieCurie: IGreatPersonDefinition = boostOf({
      name: () => t(L.MarieCurie),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CableFactory", "UraniumMine"],
      },
      time: "1867 ~ 1934 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
   });

   AlbertEinstein: IGreatPersonDefinition = boostOf({
      name: () => t(L.AlbertEinstein),
      boost: {
         multipliers: ["output"],
         buildings: ["ResearchLab"],
      },
      time: "1879 ~ 1955 AD",
      value: (level) => 2 * level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
   });

   AlanTuring: IGreatPersonDefinition = {
      name: () => t(L.AlanTuring),
      desc: (self, level) => t(L.AlanTuringDesc, { value: self.value(level) }),
      time: "1912 ~ 1954 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   NielsBohr: IGreatPersonDefinition = {
      name: () => t(L.NielsBohr),
      desc: (self, level) => t(L.NielsBohrDescV2, { value: self.value(level) }),
      time: "1885 ~ 1962",
      value: (level) => level * 3,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      tick: (self, level, source) => {
         addScienceBasedOnBusyWorkers(self.value(level), source);
      },
      type: GreatPersonType.Normal,
   };

   AmeliaEarhart: IGreatPersonDefinition = boostOf({
      name: () => t(L.AmeliaEarhart),
      boost: {
         multipliers: ["output"],
         buildings: ["BiplaneFactory", "GasPowerPlant"],
      },
      time: "1897 ~ 1937 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
   });

   HenryFord: IGreatPersonDefinition = boostOf({
      name: () => t(L.HenryFord),
      boost: {
         multipliers: ["output"],
         buildings: ["CarFactory", "PlasticsFactory"],
      },
      time: "1863 ~ 1947 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
   });

   MahatmaGandhi: IGreatPersonDefinition = {
      name: () => t(L.MahatmaGandhi),
      desc: (self, level) => t(L.WildCardGreatPersonDesc),
      time: "1869 ~ 1948 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Wildcard,
   };

   PabloPicasso: IGreatPersonDefinition = {
      name: () => t(L.PabloPicasso),
      desc: (self, level) => t(L.PromotionGreatPersonDesc),
      time: "1881 ~ 1973 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Promotion,
   };

   JohnVonNeumann: IGreatPersonDefinition = {
      name: () => t(L.JohnVonNeumann),
      desc: (self, level) => t(L.JohnVonNeumannDesc, { value: self.value(level) }),
      time: "1903 ~ 1957 AD",
      value: (level) => level * 3,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   CharlieChaplin: IGreatPersonDefinition = {
      name: () => t(L.CharlieChaplin),
      desc: (self, level) => t(L.CharlieChaplinDesc, { value: self.value(level) }),
      time: "1889 ~ 1977 AD",
      value: (level) => level * 4,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.happiness.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   FrankLloydWright: IGreatPersonDefinition = {
      name: () => t(L.FrankLloydWright),
      desc: (self, level) => t(L.FrankLloydWrightDesc, { value: self.value(level) }),
      time: "1867 ~ 1959 AD",
      value: (level) => level * 4,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.builderCapacity.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   // Cold Wars /////////////////////////////////////////////////////////////////////////////////////////////

   JRobertOppenheimer: IGreatPersonDefinition = boostOf({
      name: () => t(L.JRobertOppenheimer),
      boost: {
         multipliers: ["output"],
         buildings: ["UraniumEnrichmentPlant", "AtomicFacility"],
      },
      time: "1904 ~ 1967 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
   });

   WaltDisney: IGreatPersonDefinition = boostOf({
      name: () => t(L.WaltDisney),
      boost: {
         multipliers: ["output"],
         buildings: ["MovieStudio", "RadioStation"],
      },
      time: "1901 ~ 1966 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
   });

   WernherVonBraun: IGreatPersonDefinition = boostOf({
      name: () => t(L.WernherVonBraun),
      boost: {
         multipliers: ["output"],
         buildings: ["RocketFactory", "ArtilleryFactory"],
      },
      time: "1912 ~ 1977 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
   });

   ChesterWNimitz: IGreatPersonDefinition = boostOf({
      name: () => t(L.ChesterWNimitz),
      boost: {
         multipliers: ["output"],
         buildings: ["BattleshipBuilder", "HydroDam"],
      },
      time: "1885 ~ 1966 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
   });

   FrankWhittle: IGreatPersonDefinition = boostOf({
      name: () => t(L.FrankWhittle),
      boost: {
         multipliers: ["output"],
         buildings: ["AirplaneFactory", "FighterJetPlant"],
      },
      time: "1907 ~ 1996 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
   });

   EnricoFermi: IGreatPersonDefinition = boostOf({
      name: () => t(L.EnricoFermi),
      boost: {
         multipliers: ["output"],
         buildings: ["NuclearPowerPlant", "SubmarineYard"],
      },
      time: "1901 ~ 1954 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
   });

   PhiloFarnsworth: IGreatPersonDefinition = boostOf({
      name: () => t(L.PhiloFarnsworth),
      boost: {
         multipliers: ["output"],
         buildings: ["TVStation", "NuclearMissileSilo"],
      },
      time: "1906 ~ 1971 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
   });

   SergeiKorolev: IGreatPersonDefinition = boostOf({
      name: () => t(L.SergeiKorolev),
      boost: {
         multipliers: ["output"],
         buildings: ["SatelliteFactory", "SpacecraftFactory"],
      },
      time: "1907 ~ 1966 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
   });

   GeorgeCMarshall: IGreatPersonDefinition = boostOf({
      name: () => t(L.GeorgeCMarshall),
      boost: {
         multipliers: ["output"],
         buildings: ["Embassy", "ForexMarket"],
      },
      time: "1880 ~ 1959 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
   });

   RobertNoyce: IGreatPersonDefinition = boostOf({
      name: () => t(L.RobertNoyce),
      boost: {
         multipliers: ["output"],
         buildings: ["SemiconductorFab", "SiliconSmelter"],
      },
      time: "1927 ~ 1990 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
   });

   ElvisPresley: IGreatPersonDefinition = {
      name: () => t(L.ElvisPresley),
      desc: (self, level) => t(L.WildCardGreatPersonDesc),
      time: "1935 ~ 1977 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Wildcard,
   };

   JamesWatson: IGreatPersonDefinition = {
      name: () => t(L.JamesWatson),
      desc: (self, level) => t(L.JamesWatsonDesc, { value: self.value(level) }),
      time: "1928 ~ AD",
      value: (level) => level * 4,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   RichardFeynman: IGreatPersonDefinition = {
      name: () => t(L.RichardFeynman),
      desc: (self, level) => t(L.RichardFeynmanDesc, { value: self.value(level) }),
      time: "1918 ~ 1988",
      value: (level) => level * 4,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {
         addScienceBasedOnBusyWorkers(self.value(level), source);
      },
      type: GreatPersonType.Normal,
   };

   LinusPauling: IGreatPersonDefinition = {
      name: () => t(L.LinusPauling),
      desc: (self, level) => t(L.LinusPaulingDesc, { value: self.value(level) }),
      time: "1901 ~ 1994",
      value: (level) => level * 3,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   IMPei: IGreatPersonDefinition = {
      name: () => t(L.IMPei),
      desc: (self, level) => t(L.IMPeiDesc, { value: self.value(level) }),
      time: "1917 ~ 2019 AD",
      value: (level) => level * 5,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.builderCapacity.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   BobHope: IGreatPersonDefinition = {
      name: () => t(L.BobHope),
      desc: (self, level) => t(L.BobHopeDesc, { value: self.value(level) }),
      time: "1903 ~ 2003 AD",
      value: (level) => level * 5,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.happiness.push({ value: self.value(level), source });
      },
      type: GreatPersonType.Normal,
   };
}

export type GreatPerson = keyof GreatPersonDefinitions;

interface IGreatPersonBoost {
   multipliers: MultiplierType[];
   buildings: Building[];
}

export enum GreatPersonType {
   Normal = 0,
   Wildcard = 1,
   Promotion = 2,
}

export interface IGreatPersonDefinition {
   name: () => string;
   desc: (self: IGreatPersonDefinition, level: number) => string;
   value: (level: number) => number;
   type: GreatPersonType;
   time: string;
   maxLevel: number;
   age: TechAge;
   boost?: IGreatPersonBoost;
   city?: City;
   tick: (self: IGreatPersonDefinition, level: number, source: string) => void;
}

function greatPersonBoostDesc(self: IGreatPersonDefinition, level: number) {
   if (!self.boost) {
      throw new Error("`greatPersonBoostDesc` requires `boost` to be defined");
   }
   return t(L.BoostDescription, {
      value: self.value(level),
      multipliers: self.boost.multipliers.map((m) => MultiplierTypeDesc[m]()).join(", "),
      buildings: self.boost.buildings.map((b) => Config.Building[b].name()).join(", "),
   });
}

function tickGreatPersonBoost(self: IGreatPersonDefinition, level: number, source: string) {
   const boost = self.boost;
   if (!boost) {
      throw new Error("`tickGreatPersonBoost` requires `boost` to be defined");
   }
   boost.buildings.forEach((b) => {
      const multiplier: Partial<Multiplier> = {};
      boost.multipliers.forEach((m) => {
         multiplier[m] = self.value(level);
      });
      addMultiplier(b, multiplier as Multiplier, source);
   });
}

function boostOf(
   def: Omit<IGreatPersonDefinition, "desc" | "tick" | "type"> &
      Pick<Required<IGreatPersonDefinition>, "boost">,
): IGreatPersonDefinition {
   return {
      name: def.name,
      desc: (self, level) => greatPersonBoostDesc(self, level),
      boost: def.boost,
      time: def.time,
      value: def.value,
      maxLevel: def.maxLevel,
      age: def.age,
      city: def.city,
      type: GreatPersonType.Normal,
      tick: (self, level, source) => tickGreatPersonBoost(self, level, source),
   };
}

export function addScienceBasedOnBusyWorkers(value: number, name: string): void {
   const gs = getGameState();
   const { workersBusy, workersAfterHappiness } = getScienceFromWorkers(gs);
   const transportStat = getTransportStat(gs);
   if (workersBusy >= 0.5 * workersAfterHappiness && transportStat.totalFuel <= 0.5 * workersBusy) {
      Tick.next.globalMultipliers.sciencePerBusyWorker.push({ value, source: name });
      Tick.next.globalMultipliers.sciencePerIdleWorker.push({ value, source: name });
   }
}
