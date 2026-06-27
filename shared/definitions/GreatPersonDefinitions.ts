import { getScienceFromWorkers } from "../logic/BuildingLogic";
import { Config } from "../logic/Config";
import { getGameState } from "../logic/GameStateLogic";
import { getTransportStat } from "../logic/IntraTickCache";
import type { MultiplierType, MultiplierWithStability } from "../logic/TickLogic";
import { MultiplierFlag, MultiplierTypeDesc, Tick } from "../logic/TickLogic";
import { addMultiplier } from "../logic/Update";
import { formatNumber, hasFlag, mapSafePush, setFlag } from "../utilities/Helper";
import { $t, L } from "../utilities/i18n";
import type { Building } from "./BuildingDefinitions";
import type { City } from "./CityDefinitions";
import type { TechAge } from "./TechDefinitions";

export class GreatPersonDefinitions {
   // Bronze /////////////////////////////////////////////////////////////////////////////////////////////////

   Hammurabi: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Hammurabi),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["House", "Hut"],
      },
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "BronzeAge",
      time: "c. 1800s BC",
      wikipedia: "Hammurabi",
   });

   RamessesII: IGreatPersonDefinition = {
      name: () => $t(L.RamessesII),
      desc: (self, level) => $t(L.RamessesIIDesc, { value: formatNumber(self.value(level)) }),
      time: "c. 1300s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "BronzeAge",
      wikipedia: "Ramesses_II",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.builderCapacity.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   TangOfShang: IGreatPersonDefinition = {
      name: () => $t(L.TangOfShang),
      desc: (self, level) => $t(L.TangOfShangDesc, { value: formatNumber(self.value(level)) }),
      time: "c. 1600s BC",
      value: (level) => level * 0.5,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "BronzeAge",
      wikipedia: "Tang_of_Shang",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   Hatshepsut: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Hatshepsut),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Aqueduct", "Brickworks"],
      },
      time: "c. 1507 ~ 1458 BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "BronzeAge",
      wikipedia: "Hatshepsut",
   });

   SargonOfAkkad: IGreatPersonDefinition = boostOf({
      name: () => $t(L.SargonOfAkkad),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["LoggingCamp", "LumberMill"],
      },
      time: "c. 2334 ~2279 BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "BronzeAge",
      wikipedia: "Sargon_of_Akkad",
   });

   Narmer: IGreatPersonDefinition = {
      name: () => $t(L.Narmer),
      desc: (self, level) =>
         $t(L.AdaptiveGreatPersonDesc, {
            value: formatNumber(self.value(level)),
            age: Config.TechAge[self.age].name(),
         }),
      time: "c. 3100s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "BronzeAge",
      wikipedia: "Narmer",
      tick: tickAdaptiveGreatPerson,
      type: GreatPersonType.Adaptive,
   };

   // Iron ///////////////////////////////////////////////////////////////////////////////////////////////////

   Agamemnon: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Agamemnon),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["StoneQuarry", "Marbleworks"],
      },
      time: "c. 1200s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IronAge",
      wikipedia: "Agamemnon",
   });

   DukeOfZhou: IGreatPersonDefinition = boostOf({
      name: () => $t(L.DukeOfZhou),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CopperMiningCamp", "Blacksmith"],
      },
      time: "c. 1000s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IronAge",
      wikipedia: "Duke_of_Zhou",
   });

   Dido: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Dido),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["DairyFarm", "PoultryFarm"],
      },
      time: "c. 800s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IronAge",
      wikipedia: "Dido",
   });

   Zoroaster: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Zoroaster),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CottonPlantation", "CottonMill"],
      },
      time: "c. 1500s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IronAge",
      wikipedia: "Zoroaster",
   });

   Samsuiluna: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Samsuiluna),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Marbleworks"],
      },
      time: "c. 1700s BC",
      value: (level) => 2 * level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IronAge",
      city: "Babylon",
      wikipedia: "Samsu-iluna",
   });

   KingDavid: IGreatPersonDefinition = {
      name: () => $t(L.KingDavid),
      desc: (self, level) =>
         $t(L.AdaptiveGreatPersonDesc, {
            value: formatNumber(self.value(level)),
            age: Config.TechAge[self.age].name(),
         }),
      time: "c. 1000s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IronAge",
      wikipedia: "David",
      tick: tickAdaptiveGreatPerson,
      type: GreatPersonType.Adaptive,
   };

   // Classical //////////////////////////////////////////////////////////////////////////////////////////////

   Aeschylus: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Aeschylus),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["FlourMill", "Bakery"],
      },
      time: "c. 500s",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Aeschylus",
   });

   Ashurbanipal: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Ashurbanipal),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Sandpit", "Glassworks"],
      },
      time: "c. 685 ~ 631 BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Ashurbanipal",
   });

   NebuchadnezzarII: IGreatPersonDefinition = boostOf({
      name: () => $t(L.NebuchadnezzarII),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["WheatFarm", "Brewery"],
      },
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Nebuchadnezzar_II",
   });

   Herodotus: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Herodotus),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["PaperMaker", "MusiciansGuild"],
      },
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Herodotus",
   });

   CyrusII: IGreatPersonDefinition = boostOf({
      name: () => $t(L.CyrusII),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["IronMiningCamp", "IronForge"],
      },
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Cyrus_the_Great",
   });

   Socrates: IGreatPersonDefinition = {
      name: () => $t(L.Socrates),
      desc: (self, level) => $t(L.SocratesDesc, { value: formatNumber(self.value(level)) }),
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Socrates",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   Aristophanes: IGreatPersonDefinition = {
      name: () => $t(L.Aristophanes),
      desc: (self, level) => $t(L.AristophanesDesc, { value: formatNumber(self.value(level)) }),
      time: "446 ~ 386 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Aristophanes",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.happiness.push({ value: Config.GreatPerson[self].value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   Confucius: IGreatPersonDefinition = {
      name: () => $t(L.Confucius),
      desc: (self, level) => $t(L.ConfuciusDescV2, { value: formatNumber(self.value(level)) }),
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Confucius",
      tick: (self, level, source) => {
         addScienceBasedOnBusyWorkers(Config.GreatPerson[self].value(level), source);
      },
      type: GreatPersonType.Normal,
   };

   Homer: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Homer),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Stable", "PoetrySchool"],
      },
      time: "c. 800s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Homer",
   });

   HannoTheNavigator: IGreatPersonDefinition = {
      name: () => $t(L.HannoTheNavigator),
      desc: (self, level) => $t(L.WuZetianDesc, { value: formatNumber(self.value(level)) }),
      time: "c. 500s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Hanno_the_Navigator",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.transportCapacity.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
      city: "Carthaginian",
   };

   Hannibal: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Hannibal),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["SiegeWorkshop", "SwordForge"],
      },
      time: "246 ~ 183 BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      city: "Carthaginian",
      wikipedia: "Hannibal",
   });

   Aristotle: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Aristotle),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Library"],
      },
      time: "384 ~ 322 BC",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      city: "Athens",
      wikipedia: "Aristotle",
   });

   JuliusCaesar: IGreatPersonDefinition = boostOf({
      name: () => $t(L.JuliusCaesar),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["GoldMiningCamp"],
      },
      time: "100 ~ 44 BC",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      city: "Rome",
      wikipedia: "Julius_Caesar",
      birthday: new Date(100, 6, 12),
   });

   Archimedes: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Archimedes),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Caravansary", "Warehouse"],
      },
      time: "c. 200 BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Archimedes",
   });

   EmperorWuOfHan: IGreatPersonDefinition = boostOf({
      name: () => $t(L.EmperorWuOfHan),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Caravansary"],
      },
      time: "156 ~ 87 BC",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      city: "Beijing",
      wikipedia: "Emperor_Wu_of_Han",
      birthday: new Date(-155, 6, 14),
   });

   QinShiHuang: IGreatPersonDefinition = boostOf({
      name: () => $t(L.QinShiHuang),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["ChariotWorkshop", "Armory"],
      },
      time: "c. 200s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Qin_Shi_Huang",
   });

   Cleopatra: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Cleopatra),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Shrine"],
      },
      city: "Memphis",
      time: "70 ~ 30 BC",
      value: (level) => 2 * level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Cleopatra",
   });

   Zenobia: IGreatPersonDefinition = {
      name: () => $t(L.Zenobia),
      desc: (self, level) => $t(L.ZenobiaDesc, { value: formatNumber(self.value(level)) }),
      time: "240 ~ 274 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Zenobia",
      tick: (self, level, source) => {},
      type: GreatPersonType.LevelBoost,
   };

   Plato: IGreatPersonDefinition = {
      name: () => $t(L.Plato),
      desc: (self, level) => $t(L.WildCardGreatPersonDescV2),
      time: "427 ~ 348 BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Plato",
      tick: (self, level, source) => {},
      type: GreatPersonType.Wildcard,
   };

   AshokaTheGreat: IGreatPersonDefinition = {
      name: () => $t(L.AshokaTheGreat),
      desc: (self, level) => $t(L.PromotionGreatPersonDescV2),
      time: "304 ~ 232 BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Ashoka",
      tick: (self, level, source) => {},
      type: GreatPersonType.Promotion,
   };

   Laozi: IGreatPersonDefinition = {
      name: () => $t(L.Laozi),
      desc: (self, level) =>
         $t(L.AdaptiveGreatPersonDesc, {
            value: formatNumber(self.value(level)),
            age: Config.TechAge[self.age].name(),
         }),
      time: "c. 600s BC",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ClassicalAge",
      wikipedia: "Laozi",
      tick: tickAdaptiveGreatPerson,
      type: GreatPersonType.Adaptive,
   };

   // Middle Age /////////////////////////////////////////////////////////////////////////////////////////////

   Justinian: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Justinian),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["FurnitureWorkshop", "GarmentWorkshop"],
      },
      time: "482 ~ 565 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      wikipedia: "Justinian_I",
   });

   IsidoreOfMiletus: IGreatPersonDefinition = {
      name: () => $t(L.IsidoreOfMiletus),
      desc: (self, level) => $t(L.IsidoreOfMiletusDesc, { value: formatNumber(self.value(level)) }),
      time: "c. 500 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      wikipedia: "Isidore_of_Miletus",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.builderCapacity.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   Charlemagne: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Charlemagne),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["SwordForge", "KnightCamp"],
      },
      time: "747 ~ 814 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      wikipedia: "Charlemagne",
      birthday: new Date(742, 3, 2),
   });

   HarunAlRashid: IGreatPersonDefinition = boostOf({
      name: () => $t(L.HarunAlRashid),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CheeseMaker", "Mosque"],
      },
      time: "763 ~ 809 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      wikipedia: "Harun_al-Rashid",
   });

   WuZetian: IGreatPersonDefinition = {
      name: () => $t(L.WuZetian),
      desc: (self, level) => $t(L.WuZetianDesc, { value: formatNumber(self.value(level)) }),
      time: "624 ~ 705 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      wikipedia: "Wu_Zetian",
      birthday: new Date(624, 1, 17),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.transportCapacity.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   Xuanzang: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Xuanzang),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Library", "Pagoda"],
      },
      time: "602 ~ 664 AD",
      value: (level) => 1 * level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      wikipedia: "Xuanzang",
   });

   Rurik: IGreatPersonDefinition = {
      name: () => $t(L.Rurik),
      desc: (self, level) => $t(L.RurikDesc, { value: formatNumber(self.value(level)) }),
      time: "624 ~ 705 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      wikipedia: "Rurik",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.happiness.push({ value: Config.GreatPerson[self].value(level), source });
      },
      type: GreatPersonType.Normal,
   };

   Fibonacci: IGreatPersonDefinition = {
      name: () => $t(L.Fibonacci),
      desc: (self, level) =>
         $t(L.FibonacciDescV2, {
            idle: formatNumber(self.value(level) / 2),
            busy: formatNumber(self.value(level)),
         }),
      time: "c. 1170 ~ 1250 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      wikipedia: "Fibonacci",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({
            value: Config.GreatPerson[self].value(level) / 2,
            source,
         });
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   Saladin: IGreatPersonDefinition = {
      name: () => $t(L.Saladin),
      desc: (self, level) => $t(L.WildCardGreatPersonDescV2),
      time: "1137 ~ 1193 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      wikipedia: "Saladin",
      tick: (self, level, source) => {},
      type: GreatPersonType.Wildcard,
   };

   MarcoPolo: IGreatPersonDefinition = {
      name: () => $t(L.MarcoPolo),
      desc: (self, level) => $t(L.PromotionGreatPersonDescV2),
      time: "1254 ~ 1324 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      wikipedia: "Marco_Polo",
      tick: (self, level, source) => {},
      type: GreatPersonType.Promotion,
   };

   GenghisKhan: IGreatPersonDefinition = {
      name: () => $t(L.GenghisKhan),
      desc: (self, level) =>
         $t(L.AdaptiveGreatPersonDesc, {
            value: formatNumber(self.value(level)),
            age: Config.TechAge[self.age].name(),
         }),
      time: "c. 1162 ~ 1227 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "MiddleAge",
      wikipedia: "Genghis_Khan",
      tick: tickAdaptiveGreatPerson,
      type: GreatPersonType.Adaptive,
   };

   // Renaissance ////////////////////////////////////////////////////////////////////////////////////////////

   RembrandtVanRijn: IGreatPersonDefinition = boostOf({
      name: () => $t(L.RembrandtVanRijn),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["PaintersGuild"],
      },
      time: "1606 ~ 1669 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      city: "Dutch",
      wikipedia: "Rembrandt",
      birthday: new Date(1606, 6, 15),
   });

   LeonardoDaVinci: IGreatPersonDefinition = boostOf({
      name: () => $t(L.LeonardoDaVinci),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["PaintersGuild", "University"],
      },
      time: "1452 ~ 1519 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      wikipedia: "Leonardo_da_Vinci",
      birthday: new Date(1452, 3, 15),
   });

   JohannesKepler: IGreatPersonDefinition = boostOf({
      name: () => $t(L.JohannesKepler),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Shrine", "LensWorkshop"],
      },
      time: "1571 ~ 1630 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      wikipedia: "Johannes_Kepler",
      birthday: new Date(1571, 11, 27),
   });

   AntonieVanLeeuwenhoek: IGreatPersonDefinition = boostOf({
      name: () => $t(L.AntonieVanLeeuwenhoek),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["LensWorkshop"],
      },
      time: "1632 ~ 1723 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      city: "Dutch",
      wikipedia: "Antonie_van_Leeuwenhoek",
      birthday: new Date(1632, 9, 24),
   });

   GalileoGalilei: IGreatPersonDefinition = {
      name: () => $t(L.GalileoGalilei),
      desc: (self, level) => $t(L.GalileoGalileiDesc, { value: formatNumber(self.value(level)) }),
      time: "1564 ~ 1642 AD",
      value: (level) => level * 1,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      wikipedia: "Galileo_Galilei",
      birthday: new Date(1564, 1, 15),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   MartinLuther: IGreatPersonDefinition = boostOf({
      name: () => $t(L.MartinLuther),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Church", "School"],
      },
      time: "1483 ~ 1546 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      wikipedia: "Martin_Luther",
      birthday: new Date(1483, 10, 10),
   });

   OdaNobunaga: IGreatPersonDefinition = boostOf({
      name: () => $t(L.OdaNobunaga),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["FrigateBuilder"],
      },
      time: "1534 ~ 1582 AD",
      value: (level) => 2 * level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      city: "Kyoto",
      wikipedia: "Oda_Nobunaga",
      birthday: new Date(1534, 5, 23),
   });

   WilliamShakespeare: IGreatPersonDefinition = boostOf({
      name: () => $t(L.WilliamShakespeare),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["WritersGuild", "ActorsGuild"],
      },
      time: "1564 ~ 1616 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      wikipedia: "William_Shakespeare",
      birthday: new Date(1564, 3, 23),
   });

   ReneDescartes: IGreatPersonDefinition = boostOf({
      name: () => $t(L.ReneDescartes),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["School"],
      },
      time: "1596 ~ 1650 AD",
      value: (level) => 2 * level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      wikipedia: "Ren%C3%A9_Descartes",
      birthday: new Date(1596, 2, 31),
   });

   ZhengHe: IGreatPersonDefinition = boostOf({
      name: () => $t(L.ZhengHe),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CaravelBuilder", "GalleonBuilder"],
      },
      time: "1371 ~ 1435 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      wikipedia: "Zheng_He",
   });

   CosimoDeMedici: IGreatPersonDefinition = boostOf({
      name: () => $t(L.CosimoDeMedici),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["GoldMiningCamp", "CoinMint"],
      },
      time: "1389 ~ 1464 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      wikipedia: "Cosimo_de%27_Medici",
      birthday: new Date(1389, 8, 27),
   });

   IsaacNewton: IGreatPersonDefinition = {
      name: () => $t(L.IsaacNewton),
      desc: (self, level) => $t(L.IsaacNewtonDescV2, { value: formatNumber(self.value(level)) }),
      time: "1642 ~ 1727 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      wikipedia: "Isaac_Newton",
      birthday: new Date(1643, 0, 4),
      tick: (self, level, source) => {
         addScienceBasedOnBusyWorkers(Config.GreatPerson[self].value(level), source);
      },
      type: GreatPersonType.Normal,
   };

   GeorgiusAgricola: IGreatPersonDefinition = boostOf({
      name: () => $t(L.GeorgiusAgricola),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["SiegeWorkshop", "CoalMine"],
      },
      time: "1494 ~ 1555 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      wikipedia: "Georgius_Agricola",
      birthday: new Date(1494, 2, 24),
   });

   Voltaire: IGreatPersonDefinition = boostOf({
      name: () => $t(L.Voltaire),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Museum"],
      },
      time: "1694 ~ 1778 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      city: "French",
      wikipedia: "Voltaire",
      birthday: new Date(1694, 10, 21),
   });

   Michelangelo: IGreatPersonDefinition = {
      name: () => $t(L.Michelangelo),
      desc: (self, level) => $t(L.WildCardGreatPersonDescV2),
      time: "1475 ~ 1564 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      wikipedia: "Michelangelo",
      birthday: new Date(1475, 2, 6),
      tick: (self, level, source) => {},
      type: GreatPersonType.Wildcard,
   };

   JohannesGutenberg: IGreatPersonDefinition = {
      name: () => $t(L.JohannesGutenberg),
      desc: (self, level) => $t(L.PromotionGreatPersonDescV2),
      time: "1393 ~ 1406 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      wikipedia: "Johannes_Gutenberg",
      tick: (self, level, source) => {},
      type: GreatPersonType.Promotion,
   };

   ThomasGresham: IGreatPersonDefinition = boostOf({
      name: () => $t(L.ThomasGresham),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["BondMarket"],
      },
      time: "1519 ~ 1579 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      city: "English",
      wikipedia: "Thomas_Gresham",
   });

   SuleimanI: IGreatPersonDefinition = boostOf({
      name: () => $t(L.SuleimanI),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Bank"],
      },
      time: "1519 ~ 1579 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      city: "Ottoman",
      wikipedia: "Suleiman_the_Magnificent",
      birthday: new Date(1494, 10, 6),
   });

   ChristopherColumbus: IGreatPersonDefinition = {
      name: () => $t(L.ChristopherColumbus),
      desc: (self, level) =>
         $t(L.AdaptiveGreatPersonDesc, {
            value: formatNumber(self.value(level)),
            age: Config.TechAge[self.age].name(),
         }),
      time: "1451 ~ 1506 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "RenaissanceAge",
      wikipedia: "Christopher_Columbus",
      tick: tickAdaptiveGreatPerson,
      type: GreatPersonType.Adaptive,
   };

   // Industrial /////////////////////////////////////////////////////////////////////////////////////////////

   JamesWatt: IGreatPersonDefinition = boostOf({
      name: () => $t(L.JamesWatt),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Steamworks", "DynamiteWorkshop"],
      },
      time: "1736 ~ 1819 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "James_Watt",
      birthday: new Date(1736, 0, 30),
   });

   VincentVanGogh: IGreatPersonDefinition = boostOf({
      name: () => $t(L.VincentVanGogh),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["WindTurbine"],
      },
      time: "1853 ~ 1890 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      city: "Dutch",
      wikipedia: "Vincent_van_Gogh",
      birthday: new Date(1853, 2, 30),
   });

   IsambardKingdomBrunel: IGreatPersonDefinition = boostOf({
      name: () => $t(L.IsambardKingdomBrunel),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["FrigateBuilder", "ConcretePlant"],
      },
      time: "1806 ~ 1859 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "Isambard_Kingdom_Brunel",
      birthday: new Date(1806, 3, 9),
   });

   GeorgeWashington: IGreatPersonDefinition = boostOf({
      name: () => $t(L.GeorgeWashington),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Parliament"],
      },
      time: "1732 ~ 1799 AD",
      value: (level) => 2 * level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      city: "NewYork",
      wikipedia: "George_Washington",
      birthday: new Date(1732, 1, 22),
   });

   LouisSullivan: IGreatPersonDefinition = {
      name: () => $t(L.LouisSullivan),
      desc: (self, level) => $t(L.LouisSullivanDesc, { value: formatNumber(self.value(level)) }),
      time: "1856 ~ 1924 AD",
      value: (level) => level * 3,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "Louis_Sullivan",
      birthday: new Date(1856, 8, 3),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.builderCapacity.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   KarlMarx: IGreatPersonDefinition = boostOf({
      name: () => $t(L.KarlMarx),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Courthouse", "Parliament"],
      },
      time: "1818 ~ 1883 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "Karl_Marx",
      birthday: new Date(1818, 4, 5),
   });

   AdaLovelace: IGreatPersonDefinition = boostOf({
      name: () => $t(L.AdaLovelace),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["PrintingHouse", "Museum"],
      },
      time: "1815 ~ 1852 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "Ada_Lovelace",
      birthday: new Date(1815, 11, 10),
   });

   NapoleonBonaparte: IGreatPersonDefinition = boostOf({
      name: () => $t(L.NapoleonBonaparte),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CannonWorkshop", "GunpowderMill"],
      },
      time: "1769 ~ 1821 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "Napoleon",
      birthday: new Date(1769, 7, 15),
   });

   CharlesDarwin: IGreatPersonDefinition = {
      name: () => $t(L.CharlesDarwin),
      desc: (self, level) => $t(L.CharlesDarwinDesc, { value: formatNumber(self.value(level)) }),
      time: "1809 ~ 1882 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "Charles_Darwin",
      birthday: new Date(1809, 1, 12),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   CarlFriedrichGauss: IGreatPersonDefinition = {
      name: () => $t(L.CarlFriedrichGauss),
      desc: (self, level) =>
         $t(L.CarlFriedrichGaussDesc, {
            idle: formatNumber(0.5 * self.value(level)),
            busy: formatNumber(1.5 * self.value(level)),
         }),
      time: "c. 1777 ~ 1855 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "Carl_Friedrich_Gauss",
      birthday: new Date(1777, 3, 30),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({
            value: 0.5 * Config.GreatPerson[self].value(level),
            source,
         });
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: 1.5 * Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   FlorenceNightingale: IGreatPersonDefinition = {
      name: () => $t(L.FlorenceNightingale),
      desc: (self, level) => $t(L.FlorenceNightingaleDesc, { value: formatNumber(self.value(level)) }),
      time: "1820 ~ 1910 AD",
      value: (level) => level * 3,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "Florence_Nightingale",
      birthday: new Date(1820, 4, 12),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.happiness.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   JPMorgan: IGreatPersonDefinition = boostOf({
      name: () => $t(L.JPMorgan),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["BondMarket", "RifleFactory"],
      },
      time: "1837 ~ 1913 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "J._P._Morgan",
      birthday: new Date(1837, 3, 17),
   });

   AndrewCarnegie: IGreatPersonDefinition = boostOf({
      name: () => $t(L.AndrewCarnegie),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Bank", "SteelMill"],
      },
      time: "1837 ~ 1913 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "Andrew_Carnegie",
      birthday: new Date(1835, 10, 25),
   });

   AkbarTheGreat: IGreatPersonDefinition = {
      name: () => $t(L.AkbarTheGreat),
      desc: (self, level) =>
         $t(L.PlusXLevelToXBuilding, {
            value: formatNumber(self.value(level)),
            building: Config.Building.RedFort.name(),
         }),
      time: "1542 ~ 1605 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.LevelBoost,
      city: "Indian",
      wikipedia: "Akbar",
      birthday: new Date(1542, 9, 15),
   };

   ThomasEdison: IGreatPersonDefinition = {
      name: () => $t(L.ThomasEdison),
      desc: (self, level) => $t(L.WildCardGreatPersonDescV2),
      time: "1847 ~ 1931 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "Thomas_Edison",
      birthday: new Date(1847, 1, 11),
      tick: (self, level, source) => {},
      type: GreatPersonType.Wildcard,
   };

   AdamSmith: IGreatPersonDefinition = {
      name: () => $t(L.AdamSmith),
      desc: (self, level) => $t(L.PromotionGreatPersonDescV2),
      time: "1723 ~ 1790 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "Adam_Smith",
      tick: (self, level, source) => {},
      type: GreatPersonType.Promotion,
   };

   MichaelFaraday: IGreatPersonDefinition = {
      name: () => $t(L.MichaelFaraday),
      desc: (self, level) =>
         $t(L.AdaptiveGreatPersonDesc, {
            value: formatNumber(self.value(level)),
            age: Config.TechAge[self.age].name(),
         }),
      time: "1791 ~ 1867 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      wikipedia: "Michael_Faraday",
      birthday: new Date(1791, 8, 22),
      tick: tickAdaptiveGreatPerson,
      type: GreatPersonType.Adaptive,
   };

   Beethoven: IGreatPersonDefinition = {
      name: () => $t(L.Beethoven),
      desc: (self, level) =>
         $t(L.PlusXLevelToXBuilding, {
            value: formatNumber(self.value(level)),
            building: Config.Building.CologneCathedral.name(),
         }),
      time: "1770 ~ 1827 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.LevelBoost,
      city: "German",
      wikipedia: "Ludwig_van_Beethoven",
   };

   Tchaikovsky: IGreatPersonDefinition = {
      name: () => $t(L.Tchaikovsky),
      desc: (self, level) =>
         $t(L.PlusXLevelToXBuilding, {
            value: formatNumber(self.value(level)),
            building: Config.Building.Hermitage.name(),
         }),
      time: "1840 ~ 1893 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "IndustrialAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.LevelBoost,
      city: "Russian",
      wikipedia: "Pyotr_Ilyich_Tchaikovsky",
      birthday: new Date(1840, 4, 7),
   };

   // World Wars /////////////////////////////////////////////////////////////////////////////////////////////

   JohnDRockefeller: IGreatPersonDefinition = boostOf({
      name: () => $t(L.JohnDRockefeller),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["OilWell", "StockExchange"],
      },
      time: "1839 ~ 1937 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "John_D._Rockefeller",
      birthday: new Date(1839, 6, 8),
   });

   RudolfDiesel: IGreatPersonDefinition = boostOf({
      name: () => $t(L.RudolfDiesel),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["OilRefinery", "LocomotiveFactory"],
      },
      time: "1858 ~ 1913 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Rudolf_Diesel",
      birthday: new Date(1858, 2, 18),
   });

   PierreDeCoubertin: IGreatPersonDefinition = boostOf({
      name: () => $t(L.PierreDeCoubertin),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["PublishingHouse", "Stadium"],
      },
      time: "1863 ~ 1937 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Pierre_de_Coubertin",
      birthday: new Date(1863, 0, 1),
   });

   CharlesParsons: IGreatPersonDefinition = boostOf({
      name: () => $t(L.CharlesParsons),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CoalPowerPlant", "IroncladBuilder"],
      },
      time: "1854 ~ 1931 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Charles_Algernon_Parsons",
      birthday: new Date(1854, 5, 13),
   });

   RichardJordanGatling: IGreatPersonDefinition = boostOf({
      name: () => $t(L.RichardJordanGatling),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["GatlingGunFactory", "TankFactory"],
      },
      time: "1818 ~ 1903 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Richard_Jordan_Gatling",
      birthday: new Date(1818, 8, 12),
   });

   JosephPulitzer: IGreatPersonDefinition = boostOf({
      name: () => $t(L.JosephPulitzer),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["MagazinePublisher", "Pizzeria"],
      },
      time: "1847 ~ 1911 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Joseph_Pulitzer",
      birthday: new Date(1847, 3, 10),
   });

   CharlesMartinHall: IGreatPersonDefinition = boostOf({
      name: () => $t(L.CharlesMartinHall),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["NaturalGasWell", "AluminumSmelter"],
      },
      time: "1863 ~ 1914 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Charles_Martin_Hall",
      birthday: new Date(1863, 11, 6),
   });

   MarieCurie: IGreatPersonDefinition = boostOf({
      name: () => $t(L.MarieCurie),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CableFactory", "UraniumMine"],
      },
      time: "1867 ~ 1934 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Marie_Curie",
      birthday: new Date(1867, 10, 7),
   });

   AlbertEinstein: IGreatPersonDefinition = boostOf({
      name: () => $t(L.AlbertEinstein),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["ResearchLab"],
      },
      time: "1879 ~ 1955 AD",
      value: (level) => 2 * level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Albert_Einstein",
      birthday: new Date(1879, 2, 14),
   });

   AlanTuring: IGreatPersonDefinition = {
      name: () => $t(L.AlanTuring),
      desc: (self, level) => $t(L.AlanTuringDesc, { value: formatNumber(self.value(level)) }),
      time: "1912 ~ 1954 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Alan_Turing",
      birthday: new Date(1912, 5, 23),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   NielsBohr: IGreatPersonDefinition = {
      name: () => $t(L.NielsBohr),
      desc: (self, level) => $t(L.NielsBohrDescV2, { value: formatNumber(self.value(level)) }),
      time: "1885 ~ 1962 AD",
      value: (level) => level * 3,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Niels_Bohr",
      birthday: new Date(1885, 9, 7),
      tick: (self, level, source) => {
         addScienceBasedOnBusyWorkers(Config.GreatPerson[self].value(level), source);
      },
      type: GreatPersonType.Normal,
   };

   AmeliaEarhart: IGreatPersonDefinition = boostOf({
      name: () => $t(L.AmeliaEarhart),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["BiplaneFactory", "GasPowerPlant"],
      },
      time: "1897 ~ 1937 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Amelia_Earhart",
      birthday: new Date(1897, 6, 24),
   });

   HenryFord: IGreatPersonDefinition = boostOf({
      name: () => $t(L.HenryFord),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CarFactory", "PlasticsFactory", "GasPlasticsPlant"],
      },
      time: "1863 ~ 1947 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Henry_Ford",
      birthday: new Date(1863, 6, 30),
   });

   JosephMonier: IGreatPersonDefinition = boostOf({
      name: () => $t(L.JosephMonier),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["RebarPlant", "ReinforcedConcretePlant"],
      },
      time: "1823 ~ 1906 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Joseph_Monier",
      birthday: new Date(1823, 10, 8),
   });

   OttoVonBismarck: IGreatPersonDefinition = boostOf({
      name: () => $t(L.OttoVonBismarck),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["BattleshipBuilder"],
      },
      time: "1815 ~ 1898 AD",
      value: (level) => 2 * level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      city: "German",
      wikipedia: "Otto_von_Bismarck",
      birthday: new Date(1815, 3, 1),
   });

   MahatmaGandhi: IGreatPersonDefinition = {
      name: () => $t(L.MahatmaGandhi),
      desc: (self, level) => $t(L.WildCardGreatPersonDescV2),
      time: "1869 ~ 1948 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Mahatma_Gandhi",
      birthday: new Date(1869, 9, 2),
      tick: (self, level, source) => {},
      type: GreatPersonType.Wildcard,
   };

   PabloPicasso: IGreatPersonDefinition = {
      name: () => $t(L.PabloPicasso),
      desc: (self, level) => $t(L.PromotionGreatPersonDescV2),
      time: "1881 ~ 1973 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Pablo_Picasso",
      birthday: new Date(1881, 9, 25),
      tick: (self, level, source) => {},
      type: GreatPersonType.Promotion,
   };

   JohnVonNeumann: IGreatPersonDefinition = {
      name: () => $t(L.JohnVonNeumann),
      desc: (self, level) => $t(L.JohnVonNeumannDesc, { value: formatNumber(self.value(level)) }),
      time: "1903 ~ 1957 AD",
      value: (level) => level * 3,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "John_von_Neumann",
      birthday: new Date(1903, 11, 28),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   CharlieChaplin: IGreatPersonDefinition = {
      name: () => $t(L.CharlieChaplin),
      desc: (self, level) => $t(L.CharlieChaplinDesc, { value: formatNumber(self.value(level)) }),
      time: "1889 ~ 1977 AD",
      value: (level) => level * 4,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Charlie_Chaplin",
      birthday: new Date(1889, 3, 16),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.happiness.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   FrankLloydWright: IGreatPersonDefinition = {
      name: () => $t(L.FrankLloydWright),
      desc: (self, level) => $t(L.FrankLloydWrightDesc, { value: formatNumber(self.value(level)) }),
      time: "1867 ~ 1959 AD",
      value: (level) => level * 4,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Frank_Lloyd_Wright",
      birthday: new Date(1867, 5, 8),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.builderCapacity.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   HeitorVillaLobos: IGreatPersonDefinition = boostOf({
      name: () => $t(L.HeitorVillaLobos),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["RadioStation"],
      },
      time: "1887 ~ 1959 AD",
      value: (level) => 2 * level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      city: "Brazilian",
      wikipedia: "Heitor_Villa-Lobos",
      birthday: new Date(1887, 2, 5),
   });

   RabindranathTagore: IGreatPersonDefinition = boostOf({
      name: () => $t(L.RabindranathTagore),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Embassy"],
      },
      time: "1861 ~ 1941 AD",
      value: (level) => 2 * level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      city: "Indian",
      wikipedia: "Rabindranath_Tagore",
      birthday: new Date(1861, 4, 7),
   });

   OskarSchindler: IGreatPersonDefinition = {
      name: () => $t(L.OskarSchindler),
      desc: (self, level) =>
         $t(L.AdaptiveGreatPersonDesc, {
            value: formatNumber(self.value(level)),
            age: Config.TechAge[self.age].name(),
         }),
      time: "1908 ~ 1974 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      wikipedia: "Oskar_Schindler",
      birthday: new Date(1908, 3, 28),
      tick: tickAdaptiveGreatPerson,
      type: GreatPersonType.Adaptive,
   };

   JohnBradfield: IGreatPersonDefinition = {
      name: () => $t(L.JohnBradfield),
      desc: (self, level) =>
         $t(L.PlusXLevelToXBuilding, {
            value: formatNumber(self.value(level)),
            building: Config.Building.SydneyHarbourBridge.name(),
         }),
      time: "1867 ~ 1943 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "WorldWarAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.LevelBoost,
      city: "Australian",
      wikipedia: "John_Bradfield",
      birthday: new Date(1867, 11, 26),
   };

   // Cold Wars /////////////////////////////////////////////////////////////////////////////////////////////

   JRobertOppenheimer: IGreatPersonDefinition = boostOf({
      name: () => $t(L.JRobertOppenheimer),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["UraniumEnrichmentPlant", "AtomicFacility"],
      },
      time: "1904 ~ 1967 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      wikipedia: "J._Robert_Oppenheimer",
      birthday: new Date(1904, 3, 22),
   });

   WaltDisney: IGreatPersonDefinition = boostOf({
      name: () => $t(L.WaltDisney),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["MovieStudio", "RadioStation"],
      },
      time: "1901 ~ 1966 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      wikipedia: "Walt_Disney",
      birthday: new Date(1901, 11, 5),
   });

   WernherVonBraun: IGreatPersonDefinition = boostOf({
      name: () => $t(L.WernherVonBraun),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["RocketFactory", "ArtilleryFactory"],
      },
      time: "1912 ~ 1977 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      wikipedia: "Wernher_von_Braun",
      birthday: new Date(1912, 2, 23),
   });

   ChesterWNimitz: IGreatPersonDefinition = boostOf({
      name: () => $t(L.ChesterWNimitz),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["BattleshipBuilder", "HydroDam"],
      },
      time: "1885 ~ 1966 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      wikipedia: "Chester_W._Nimitz",
      birthday: new Date(1885, 1, 24),
   });

   FrankWhittle: IGreatPersonDefinition = boostOf({
      name: () => $t(L.FrankWhittle),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["AirplaneFactory", "FighterJetPlant"],
      },
      time: "1907 ~ 1996 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      wikipedia: "Frank_Whittle",
      birthday: new Date(1907, 5, 1),
   });

   EnricoFermi: IGreatPersonDefinition = boostOf({
      name: () => $t(L.EnricoFermi),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["NuclearPowerPlant", "SubmarineYard"],
      },
      time: "1901 ~ 1954 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      wikipedia: "Enrico_Fermi",
      birthday: new Date(1901, 8, 29),
   });

   PhiloFarnsworth: IGreatPersonDefinition = boostOf({
      name: () => $t(L.PhiloFarnsworth),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["TVStation", "NuclearMissileSilo"],
      },
      time: "1906 ~ 1971 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      wikipedia: "Philo_Farnsworth",
      birthday: new Date(1906, 7, 19),
   });

   TerryFox: IGreatPersonDefinition = boostOf({
      name: () => $t(L.TerryFox),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["TVStation"],
      },
      time: "1958 ~ 1981 AD",
      value: (level) => level * 2,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      city: "Canadian",
      wikipedia: "Terry_Fox",
      birthday: new Date(1958, 6, 28),
   });

   SergeiKorolev: IGreatPersonDefinition = boostOf({
      name: () => $t(L.SergeiKorolev),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["SatelliteFactory", "SpacecraftFactory"],
      },
      time: "1907 ~ 1966 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      wikipedia: "Sergei_Korolev",
      birthday: new Date(1907, 0, 12),
   });

   GeorgeCMarshall: IGreatPersonDefinition = boostOf({
      name: () => $t(L.GeorgeCMarshall),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["Embassy", "ForexMarket"],
      },
      time: "1880 ~ 1959 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      wikipedia: "George_C._Marshall",
      birthday: new Date(1880, 11, 31),
   });

   RobertNoyce: IGreatPersonDefinition = boostOf({
      name: () => $t(L.RobertNoyce),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["SemiconductorFab", "SiliconSmelter"],
      },
      time: "1927 ~ 1990 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      wikipedia: "Robert_Noyce",
      birthday: new Date(1927, 11, 12),
   });

   FriedrichHayek: IGreatPersonDefinition = boostOf({
      name: () => $t(L.FriedrichHayek),
      boost: {
         multipliers: ["output"],
         buildings: ["SwissBank"],
      },
      time: "1899 ~ 1992 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      wikipedia: "Friedrich_Hayek",
      birthday: new Date(1899, 4, 8),
   });

   AndreyKolmogorov: IGreatPersonDefinition = boostOf({
      name: () => $t(L.AndreyKolmogorov),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["SatelliteFactory", "Cosmodrome"],
      },
      time: "1903 ~ 1987 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      city: "Russian",
      wikipedia: "Andrey_Kolmogorov",
      birthday: new Date(1903, 3, 25),
   });

   PaulSamuelson: IGreatPersonDefinition = {
      name: () => $t(L.PaulSamuelson),
      desc: (self, level) =>
         $t(L.BuildingLevelBoostDesc, {
            value: formatNumber(self.value(level)),
            building: Config.Building.SwissBank.name(),
         }),
      time: "1915 ~ 2009 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {
         const swissBank = Tick.current.specialBuildings.get("SwissBank");
         if (swissBank) {
            mapSafePush(Tick.next.levelBoost, swissBank.tile, {
               value: Config.GreatPerson[self].value(level),
               source: source,
            });
         }
      },
      type: GreatPersonType.Normal,
      wikipedia: "Paul_Samuelson",
      birthday: new Date(1915, 4, 15),
   };

   JamesWatson: IGreatPersonDefinition = {
      name: () => $t(L.JamesWatson),
      desc: (self, level) => $t(L.JamesWatsonDesc, { value: formatNumber(self.value(level)) }),
      time: "1928 ~ ",
      value: (level) => level * 4,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
      wikipedia: "James_Watson",
      birthday: new Date(1928, 3, 6),
   };

   RichardFeynman: IGreatPersonDefinition = {
      name: () => $t(L.RichardFeynman),
      desc: (self, level) => $t(L.RichardFeynmanDesc, { value: formatNumber(self.value(level)) }),
      time: "1918 ~ 1988 AD",
      value: (level) => level * 4,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {
         addScienceBasedOnBusyWorkers(Config.GreatPerson[self].value(level), source);
      },
      type: GreatPersonType.Normal,
      wikipedia: "Richard_Feynman",
      birthday: new Date(1918, 4, 11),
   };

   LinusPauling: IGreatPersonDefinition = {
      name: () => $t(L.LinusPauling),
      desc: (self, level) => $t(L.LinusPaulingDesc, { value: formatNumber(self.value(level)) }),
      time: "1901 ~ 1994 AD",
      value: (level) => level * 3,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
      wikipedia: "Linus_Pauling",
      birthday: new Date(1901, 1, 28),
   };

   IMPei: IGreatPersonDefinition = {
      name: () => $t(L.IMPei),
      desc: (self, level) => $t(L.IMPeiDesc, { value: formatNumber(self.value(level)) }),
      time: "1917 ~ 2019 AD",
      value: (level) => level * 5,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.builderCapacity.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
      wikipedia: "I._M._Pei",
      birthday: new Date(1917, 3, 26),
   };

   BobHope: IGreatPersonDefinition = {
      name: () => $t(L.BobHope),
      desc: (self, level) => $t(L.BobHopeDesc, { value: formatNumber(self.value(level)) }),
      time: "1903 ~ 2003 AD",
      value: (level) => level * 5,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.happiness.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
      wikipedia: "Bob_Hope",
      birthday: new Date(1903, 4, 29),
   };

   ElvisPresley: IGreatPersonDefinition = {
      name: () => $t(L.ElvisPresley),
      desc: (self, level) => $t(L.WildCardGreatPersonDescV2),
      time: "1935 ~ 1977 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Wildcard,
      wikipedia: "Elvis_Presley",
      birthday: new Date(1935, 0, 8),
   };

   YuriGagarin: IGreatPersonDefinition = {
      name: () => $t(L.YuriGagarin),
      desc: (self, level) => $t(L.PromotionGreatPersonDescV2),
      time: "1934 ~ 1968 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.Promotion,
      wikipedia: "Yuri_Gagarin",
      birthday: new Date(1934, 2, 9),
   };

   NeilArmstrong: IGreatPersonDefinition = {
      name: () => $t(L.NeilArmstrong),
      desc: (self, level) =>
         $t(L.AdaptiveGreatPersonDesc, {
            value: formatNumber(self.value(level)),
            age: Config.TechAge[self.age].name(),
         }),
      time: "1930 ~ 2012 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: tickAdaptiveGreatPerson,
      type: GreatPersonType.Adaptive,
      wikipedia: "Neil_Armstrong",
      birthday: new Date(1930, 7, 5),
   };

   Pele: IGreatPersonDefinition = {
      name: () => $t(L.Pele),
      desc: (self, level) =>
         $t(L.PlusXLevelToXBuilding, {
            value: formatNumber(self.value(level)),
            building: Config.Building.ItaipuDam.name(),
         }),
      time: "1940 ~ 2022 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "ColdWarAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.LevelBoost,
      city: "Brazilian",
      wikipedia: "Pel%C3%A9",
      birthday: new Date(1940, 9, 23),
   };

   // Information ////////////////////////////////////////////////////////////////////////////////////////////

   TimBernersLee: IGreatPersonDefinition = boostOf({
      name: () => $t(L.TimBernersLee),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["InternetServiceProvider", "OpticalFiberPlant"],
      },
      time: "1955 ~ ",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Tim_Berners-Lee",
      birthday: new Date(1955, 5, 8),
   });

   GordonMoore: IGreatPersonDefinition = boostOf({
      name: () => $t(L.GordonMoore),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["ComputerFactory", "SupercomputerLab"],
      },
      time: "1929 ~ 2023 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Gordon_Moore",
      birthday: new Date(1929, 0, 3),
   });

   DennisRitchie: IGreatPersonDefinition = boostOf({
      name: () => $t(L.DennisRitchie),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["SoftwareCompany", "MaglevFactory"],
      },
      time: "1941 ~ 2011 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Dennis_Ritchie",
      birthday: new Date(1941, 8, 9),
   });

   HymanGRickover: IGreatPersonDefinition = boostOf({
      name: () => $t(L.HymanGRickover),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["AircraftCarrierYard", "NuclearSubmarineYard"],
      },
      time: "1900 ~ 1986 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Hyman_G._Rickover",
      birthday: new Date(1900, 0, 27),
   });

   HarryMarkowitz: IGreatPersonDefinition = boostOf({
      name: () => $t(L.HarryMarkowitz),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["MutualFund", "HedgeFund"],
      },
      time: "1927 ~ 2023 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Harry_Markowitz",
      birthday: new Date(1927, 7, 24),
   });

   JohnCarmack: IGreatPersonDefinition = boostOf({
      name: () => $t(L.JohnCarmack),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["ComputerLab", "CivOasis"],
      },
      time: "1970 ~ ",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "John_Carmack",
      birthday: new Date(1970, 7, 20),
   });

   SatoshiNakamoto: IGreatPersonDefinition = boostOf({
      name: () => $t(L.SatoshiNakamoto),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CivTok", "BitcoinMiner"],
      },
      time: "??? ~ ???",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Satoshi_Nakamoto",
   });

   CarlSagan: IGreatPersonDefinition = boostOf({
      name: () => $t(L.CarlSagan),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["SpaceCenter", "Peacekeeper"],
      },
      time: "1934 ~ 1996 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Carl_Sagan",
      birthday: new Date(1934, 10, 9),
   });

   JohnMcCarthy: IGreatPersonDefinition = boostOf({
      name: () => $t(L.JohnMcCarthy),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["CivGPT", "RobocarFactory"],
      },
      time: "1927 ~ 2011 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "John_McCarthy_(computer_scientist)",
      birthday: new Date(1927, 8, 4),
   });

   BrianSchmidt: IGreatPersonDefinition = boostOf({
      name: () => $t(L.BrianSchmidt),
      boost: {
         multipliers: ["output", "storage"],
         buildings: ["FusionFuelPlant", "FusionPowerPlant"],
      },
      time: "1967 ~ ",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      city: "Australian",
      wikipedia: "Brian_Schmidt",
      birthday: new Date(1967, 1, 24),
   });

   StephenHawking: IGreatPersonDefinition = {
      name: () => $t(L.StephenHawking),
      desc: (self, level) => $t(L.WildCardGreatPersonDescV2),
      time: "1942 ~ 2018 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Stephen_Hawking",
      birthday: new Date(1942, 0, 8),
      tick: (self, level, source) => {},
      type: GreatPersonType.Wildcard,
   };

   ZahaHadid: IGreatPersonDefinition = {
      name: () => $t(L.ZahaHadid),
      desc: (self, level) => $t(L.ZahaHadidDesc, { value: formatNumber(self.value(level)) }),
      time: "1950 ~ 2016 AD",
      value: (level) => level * 6,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Zaha_Hadid",
      birthday: new Date(1950, 9, 31),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.builderCapacity.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   PeterHiggs: IGreatPersonDefinition = {
      name: () => $t(L.PeterHiggs),
      desc: (self, level) => $t(L.PeterHiggsDesc, { value: formatNumber(self.value(level)) }),
      time: "1929 ~ 2024 AD",
      value: (level) => level * 5,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Peter_Higgs",
      birthday: new Date(1929, 4, 29),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerBusyWorker.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   GabrielGarciaMarquez: IGreatPersonDefinition = {
      name: () => $t(L.GabrielGarciaMarquez),
      desc: (self, level) => $t(L.GabrielGarciaMarquezDesc, { value: formatNumber(self.value(level)) }),
      time: "1927 ~ 2014 AD",
      value: (level) => level * 6,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Gabriel_Garc%C3%ADa_M%C3%A1rquez",
      birthday: new Date(1927, 2, 6),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.happiness.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   MaryamMirzakhani: IGreatPersonDefinition = {
      name: () => $t(L.MaryamMirzakhani),
      desc: (self, level) => $t(L.MaryamMirzakhaniDesc, { value: formatNumber(self.value(level)) }),
      time: "1977 ~ 2017 AD",
      value: (level) => level * 4,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Maryam_Mirzakhani",
      birthday: new Date(1977, 4, 12),
      tick: (self, level, source) => {
         Tick.next.globalMultipliers.sciencePerIdleWorker.push({
            value: Config.GreatPerson[self].value(level),
            source,
         });
      },
      type: GreatPersonType.Normal,
   };

   SidMeier: IGreatPersonDefinition = {
      name: () => $t(L.SidMeier),
      desc: (self, level) =>
         $t(L.AdaptiveGreatPersonDesc, {
            value: formatNumber(self.value(level)),
            age: Config.TechAge[self.age].name(),
         }),
      time: "1954 ~ ",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Sid_Meier",
      birthday: new Date(1954, 1, 24),
      tick: tickAdaptiveGreatPerson,
      type: GreatPersonType.Adaptive,
   };

   WilliamShepherd: IGreatPersonDefinition = {
      name: () => $t(L.WilliamShepherd),
      desc: (self, level) =>
         $t(L.PlusXLevelToXBuilding, {
            value: formatNumber(self.value(level)),
            building: Config.Building.InternationalSpaceStation.name(),
         }),
      time: "1949 ~ ",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "William_Shepherd",
      birthday: new Date(1949, 6, 26),
      tick: (self, level, source) => {},
      type: GreatPersonType.LevelBoost,
   };

   LeeKuanYew: IGreatPersonDefinition = {
      name: () => $t(L.LeeKuanYew),
      desc: (self, level) =>
         $t(L.PlusXLevelToXBuilding, {
            value: formatNumber(self.value(level)),
            building: Config.Building.MarinaBaySands.name(),
         }),
      time: "1923 ~ 2015 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Lee_Kuan_Yew",
      birthday: new Date(1923, 8, 16),
      tick: (self, level, source) => {},
      type: GreatPersonType.LevelBoost,
   };

   EmmanuelleCharpentier: IGreatPersonDefinition = {
      name: () => $t(L.EmmanuelleCharpentier),
      desc: (self, level) =>
         $t(L.PlusXLevelToXBuilding, {
            value: formatNumber(self.value(level)),
            building: Config.Building.PalmJumeirah.name(),
         }),
      time: "1968 ~ ",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Emmanuelle_Charpentier",
      birthday: new Date(1968, 11, 11),
      tick: (self, level, source) => {},
      type: GreatPersonType.LevelBoost,
   };

   DanAlderson: IGreatPersonDefinition = {
      name: () => $t(L.DanAlderson),
      desc: (self, level) =>
         $t(L.PlusXLevelToXBuilding, {
            value: formatNumber(self.value(level)),
            building: Config.Building.AldersonDisk.name(),
         }),
      time: "1941 ~ 1989 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Dan_Alderson",
      tick: (self, level, source) => {},
      type: GreatPersonType.LevelBoost,
   };

   FreemanDyson: IGreatPersonDefinition = {
      name: () => $t(L.FreemanDyson),
      desc: (self, level) =>
         $t(L.PlusXLevelToXBuilding, {
            value: formatNumber(self.value(level)),
            building: Config.Building.DysonSphere.name(),
         }),
      time: "1923 ~ 2020 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Freeman_Dyson",
      birthday: new Date(1923, 11, 15),
      tick: (self, level, source) => {},
      type: GreatPersonType.LevelBoost,
   };

   VeraRubin: IGreatPersonDefinition = {
      name: () => $t(L.VeraRubin),
      desc: (self, level) =>
         $t(L.PlusXLevelToXBuilding, {
            value: formatNumber(self.value(level)),
            building: Config.Building.MatrioshkaBrain.name(),
         }),
      time: "1923 ~ 2020 AD",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      wikipedia: "Vera_Rubin",
      birthday: new Date(1928, 6, 23),
      tick: (self, level, source) => {},
      type: GreatPersonType.LevelBoost,
   };

   GeoffreyHinton: IGreatPersonDefinition = {
      name: () => $t(L.GeoffreyHinton),
      desc: (self, level) =>
         $t(L.PlusXLevelToXBuilding, {
            value: formatNumber(self.value(level)),
            building: Config.Building.Habitat67.name(),
         }),
      time: "1947 ~ ",
      value: (level) => level,
      maxLevel: Number.POSITIVE_INFINITY,
      age: "InformationAge",
      tick: (self, level, source) => {},
      type: GreatPersonType.LevelBoost,
      city: "Canadian",
      wikipedia: "Geoffrey_Hinton",
      birthday: new Date(1947, 11, 6),
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
   Adaptive = 3,
   LevelBoost = 4,
}

export const UpgradeableGreatPersonTypes: Record<GreatPersonType, boolean> = {
   [GreatPersonType.Normal]: true,
   [GreatPersonType.Wildcard]: false,
   [GreatPersonType.Promotion]: false,
   [GreatPersonType.Adaptive]: true,
   [GreatPersonType.LevelBoost]: true,
};

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
   tick: (self: GreatPerson, level: number, source: string, flag: GreatPersonTickFlag) => void;
   wikipedia: string;
   birthday?: Date;
}

function greatPersonBoostDesc(self: IGreatPersonDefinition, level: number) {
   if (!self.boost) {
      throw new Error("`greatPersonBoostDesc` requires `boost` to be defined");
   }
   return $t(L.BoostDescription, {
      value: formatNumber(self.value(level)),
      multipliers: self.boost.multipliers.map((m) => MultiplierTypeDesc[m]()).join(", "),
      buildings: self.boost.buildings.map((b) => Config.Building[b].name()).join(", "),
   });
}

function tickGreatPersonBoost(self: GreatPerson, level: number, source: string, flag: GreatPersonTickFlag) {
   const boost = Config.GreatPerson[self].boost;
   if (!boost) {
      throw new Error("`tickGreatPersonBoost` requires `boost` to be defined");
   }
   boost.buildings.forEach((b) => {
      const multiplier: Partial<MultiplierWithStability> = {};
      boost.multipliers.forEach((m) => {
         multiplier[m] = Config.GreatPerson[self].value(level);
      });
      multiplier.flag = hasFlag(flag, GreatPersonTickFlag.AgeWisdom)
         ? MultiplierFlag.AgeWisdom
         : MultiplierFlag.GreatPerson;
      if (hasFlag(flag, GreatPersonTickFlag.Unstable)) {
         multiplier.flag = setFlag(multiplier.flag, MultiplierFlag.Unstable);
      }
      addMultiplier(b, multiplier as MultiplierWithStability, source);
   });
}

export enum GreatPersonTickFlag {
   None = 0,
   Unstable = 1 << 0,
   AgeWisdom = 1 << 1,
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
      wikipedia: def.wikipedia,
      birthday: def.birthday,
      type: GreatPersonType.Normal,
      tick: tickGreatPersonBoost,
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

export function tickAdaptiveGreatPerson(
   greatPerson: GreatPerson,
   level: number,
   source: string,
   greatPersonFlag: GreatPersonTickFlag,
): void {
   const gs = getGameState();
   const building = gs.adaptiveGreatPeople.get(greatPerson);
   if (!building) {
      return;
   }
   if (Config.Building[building].output.Worker) {
      return;
   }
   let flag = MultiplierFlag.GreatPerson;
   if (hasFlag(greatPersonFlag, GreatPersonTickFlag.Unstable)) {
      flag = setFlag(flag, MultiplierFlag.Unstable);
   }
   addMultiplier(
      building,
      {
         output: Config.GreatPerson[greatPerson].value(level),
         storage: Config.GreatPerson[greatPerson].value(level),
         flag,
      },
      source,
   );
}
