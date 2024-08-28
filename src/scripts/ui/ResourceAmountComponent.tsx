import Tippy from "@tippyjs/react";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import { Config } from "../../../shared/logic/Config";
import { Tick } from "../../../shared/logic/TickLogic";
import { formatNumber } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";

export function ResourceAmountComponent({
   className,
   resource,
   amount,
   showLabel,
}: { resource: Resource; amount: number; className?: string; showLabel: boolean }): React.ReactNode {
   let className_ = className ?? "";
   let tooltip = "";
   const diff = (Tick.current.resourceAmount.get(resource) ?? 0) - amount;
   if (diff < 0) {
      className_ += " text-red";
      tooltip = t(L.ResourceNeeded, {
         resource: Config.Resource[resource].name(),
         amount: formatNumber(Math.abs(diff)),
      });
   }
   return (
      <Tippy content={tooltip} disabled={!tooltip}>
         <span className={className_}>
            {showLabel ? Config.Resource[resource].name() : null} x{formatNumber(amount)}
         </span>
      </Tippy>
   );
}
