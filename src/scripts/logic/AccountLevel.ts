import { AccountLevel } from "../../../shared/utilities/Database";
import { L, t } from "../../../shared/utilities/i18n";
import AccountLevel1 from "../../images/AccountLevel1.png";
import AccountLevel2 from "../../images/AccountLevel2.png";
import AccountLevel3 from "../../images/AccountLevel3.png";
import AccountLevel4 from "../../images/AccountLevel4.png";
import AccountLevel5 from "../../images/AccountLevel5.png";

export const AccountLevelNames: Record<AccountLevel, () => string> = {
   [AccountLevel.Tribune]: () => t(L.AccountLevelTribune),
   [AccountLevel.Quaestor]: () => t(L.AccountLevelQuaestor),
   [AccountLevel.Aedile]: () => t(L.AccountLevelAedile),
   [AccountLevel.Praetor]: () => t(L.AccountLevelPraetor),
   [AccountLevel.Consul]: () => t(L.AccountLevelConsul),
};

export const AccountLevelImages: Record<AccountLevel, string> = {
   [AccountLevel.Tribune]: AccountLevel1,
   [AccountLevel.Quaestor]: AccountLevel2,
   [AccountLevel.Aedile]: AccountLevel3,
   [AccountLevel.Praetor]: AccountLevel4,
   [AccountLevel.Consul]: AccountLevel5,
};
