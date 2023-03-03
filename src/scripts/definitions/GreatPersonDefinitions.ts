import { L, t } from "../utilities/i18n";

export class GreatPersonDefinitions {
   Cincinnatus: IGreatPersonDefinition = {
      name: () => t(L.Cincinnatus),
      desc: () => t(L.CincinnatusDesc),
      value: (level) => level,
      maxLevel: Infinity,
      time: "c. 500s BC",
   };

   ScipioAfricanus: IGreatPersonDefinition = {
      name: () => t(L.ScipioAfricanus),
      desc: () => t(L.ScipioAfricanusDesc),
      value: (level) => level,
      maxLevel: Infinity,
      time: "c. 200s BC",
   };

   // Hammurabi: IGreatPersonDefinition = {
   //    name: () => t(L.Hammurabi),
   //    time: "c. 1800s BC",
   // };

   // TangOfShang: IGreatPersonDefinition = {
   //    name: () => t(L.TangOfShang),
   //    time: "c. 1600s BC",
   // };

   // RamessesII: IGreatPersonDefinition = {
   //    name: () => t(L.RamessesII),
   //    time: "c. 1300s BC",
   // };

   // Agamemnon: IGreatPersonDefinition = {
   //    name: () => t(L.Agamemnon),
   //    time: "c. 1200s BC",
   // };

   // SargonOfAkkad: IGreatPersonDefinition = {
   //    name: () => t(L.SargonOfAkkad),
   //    time: "c. 2300s BC",
   // };

   // Khufu: IGreatPersonDefinition = {
   //    name: () => t(L.Khufu),
   //    time: "c. 2500s BC",
   // };

   // Dido: IGreatPersonDefinition = {
   //    name: () => t(L.Dido),
   //    time: "c. 800s BC",
   // };

   // Homer: IGreatPersonDefinition = {
   //    name: () => t(L.Homer),
   //    time: "c. 800s BC",
   // };

   // DukeOfZhou: IGreatPersonDefinition = {
   //    name: () => t(L.DukeOfZhou),
   //    time: "c. 1000s BC",
   // };

   // Ashurbanipal: IGreatPersonDefinition = {
   //    name: () => t(L.Ashurbanipal),
   //    time: "c. 600s BC",
   // };

   // NebuchadnezzarII: IGreatPersonDefinition = {
   //    name: () => t(L.NebuchadnezzarII),
   //    time: "c. 500s BC",
   // };

   // LaoZi: IGreatPersonDefinition = {
   //    name: () => t(L.LaoZi),
   //    time: "c. 600s BC",
   // };

   // Solon: IGreatPersonDefinition = {
   //    name: () => t(L.Solon),
   //    time: "c. 600s BC",
   // };

   // CyrusII: IGreatPersonDefinition = {
   //    name: () => t(L.CyrusII),
   //    time: "c. 500s BC",
   // };

   // DariusI: IGreatPersonDefinition = {
   //    name: () => t(L.DariusI),
   //    time: "c. 500s BC",
   // };

   // Confucius: IGreatPersonDefinition = {
   //    name: () => t(L.Confucius),
   //    time: "c. 500s BC",
   // };

   // Socrates: IGreatPersonDefinition = {
   //    name: () => t(L.Socrates),
   //    time: "c. 400s BC",
   // };

   // Aeschylus: IGreatPersonDefinition = {
   //    name: () => t(L.Aeschylus),
   //    time: "c. 400s BC",
   // };

   // Protagoras: IGreatPersonDefinition = {
   //    name: () => t(L.Protagoras),
   //    time: "c. 400s BC",
   // };

   // Herodotus: IGreatPersonDefinition = {
   //    name: () => t(L.Herodotus),
   //    time: "c. 400s BC",
   // };

   // Hippocrates: IGreatPersonDefinition = {
   //    name: () => t(L.Hippocrates),
   //    time: "c. 400s BC",
   // };

   // Plato: IGreatPersonDefinition = {
   //    name: () => t(L.Plato),
   //    time: "c. 300s BC",
   // };

   // Aristotle: IGreatPersonDefinition = {
   //    name: () => t(L.Aristotle),
   //    time: "c. 300s BC",
   // };

   // AlexanderIII: IGreatPersonDefinition = {
   //    name: () => t(L.AlexanderIII),
   //    time: "c. 300s BC",
   // };

   // Ashoka: IGreatPersonDefinition = {
   //    name: () => t(L.Ashoka),
   //    time: "c. 200s BC",
   // };

   // Hannibal: IGreatPersonDefinition = {
   //    name: () => t(L.Hannibal),
   //    time: "c. 200s BC",
   // };

   // QinShiHuang: IGreatPersonDefinition = {
   //    name: () => t(L.QinShiHuang),
   //    time: "c. 200s BC",
   // };

   // JuliusCaesar: IGreatPersonDefinition = {
   //    name: () => t(L.JuliusCaesar),
   //    time: "100 BC ~ 44 BC",
   // };

   // SimaQian: IGreatPersonDefinition = {
   //    name: () => t(L.SimaQian),
   //    time: "c. 100s BC",
   // };

   // Augustus: IGreatPersonDefinition = {
   //    name: () => t(L.Augustus),
   //    time: "27 BC ~ 14 BC",
   // };

   // CaiLun: IGreatPersonDefinition = {
   //    name: () => t(L.CaiLun),
   //    time: "63 AD ~ 121 AD",
   // };

   // Cleopatra: IGreatPersonDefinition = {
   //    name: () => t(L.Cleopatra),
   //    time: "69 BC ~ 30 BC",
   // };
}

export type GreatPerson = keyof GreatPersonDefinitions;

export interface IGreatPersonDefinition {
   name: () => string;
   desc: () => string;
   value: (level: number) => number;
   time: string;
   maxLevel: number;
}
