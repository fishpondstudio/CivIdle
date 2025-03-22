import { AccountLevel } from "../../../shared/utilities/Database";
import { L, t } from "../../../shared/utilities/i18n";

export const AccountLevelNames: Record<AccountLevel, () => string> = {
   [AccountLevel.Tribune]: () => t(L.AccountLevelTribune),
   [AccountLevel.Quaestor]: () => t(L.AccountLevelQuaestor),
   [AccountLevel.Aedile]: () => t(L.AccountLevelAedile),
   [AccountLevel.Praetor]: () => t(L.AccountLevelPraetor),
   [AccountLevel.Consul]: () => t(L.AccountLevelConsul),
};
