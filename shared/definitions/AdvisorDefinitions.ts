import { L, t } from "../utilities/i18n";

export interface IAdvisor {
   title: string;
   content: string;
}

export const Advisors = {
   Happiness: {
      title: t(L.AdvisorHappinessTitle),
      content: t(L.AdvisorHappinessContent),
   },
   Wonder: {
      title: t(L.AdvisorWonderTitle),
      content: t(L.AdvisorWonderContent),
   },
   Science: {
      title: t(L.AdvisorScienceTitle),
      content: t(L.AdvisorScienceContent),
   },
   Worker: {
      title: t(L.AdvisorWorkerTitle),
      content: t(L.AdvisorWorkerContent),
   },
   Storage: {
      title: t(L.AdvisorStorageTitle),
      content: t(L.AdvisorStorageContent),
   },
   Tradition: {
      title: t(L.AdvisorTraditionTitle),
      content: t(L.AdvisorTraditionContent),
   },
   Electricity: {
      title: t(L.AdvisorTraditionTitle),
      content: t(L.AdvisorTraditionContent),
   },
} satisfies Record<string, IAdvisor>;

export type Advisor = keyof typeof Advisors;
