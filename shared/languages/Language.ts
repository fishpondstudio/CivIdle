// src/shared/logic/Language.ts
import { CZ } from "../languages/cz";
import { DE } from "../languages/de";
import { DK } from "../languages/dk";
import { EN } from "../languages/en";
import { ES } from "../languages/es";
import { FI } from "../languages/fi";
import { FR } from "../languages/fr";
import { JP } from "../languages/jp";
import { KR } from "../languages/kr";
import { NL } from "../languages/nl";
import { PT_BR } from "../languages/pt-BR";
import { RU } from "../languages/ru";
import { TR } from "../languages/tr";
import { ZH_CN } from "../languages/zh-CN";
import { ZH_TW } from "../languages/zh-TW";

export const Languages = {
  cz: CZ,
  de: DE,
  dk: DK,
  en: EN,
  es: ES,
  fi: FI,
  fr: FR,
  jp: JP,
  kr: KR,
  nl: NL,
  "pt-BR": PT_BR,
  ru: RU,
  tr: TR,
  "zh-CN": ZH_CN,
  "zh-TW": ZH_TW,
};

export const ConfigLang = {
  current:
    Object.keys(Languages).find(
      (k) => navigator.language.toLowerCase().startsWith(k.toLowerCase())
    ) || "en",
};

export function getLangPack() {
  return Languages[ConfigLang.current] || EN;
}
