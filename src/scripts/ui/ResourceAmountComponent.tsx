import Tippy from "@tippyjs/react";
import type { Material } from "../../../shared/definitions/MaterialDefinitions";
import { Config } from "../../../shared/logic/Config";
import { Tick } from "../../../shared/logic/TickLogic";
import { formatNumber } from "../../../shared/utilities/Helper";
import { L, t } from "../../../shared/utilities/i18n";

export function ResourceAmountComponent({
   className,
   resource,
   amount,
   showLabel,
   showTooltip,
}: {
   resource: Material;
   amount: number;
   className?: string;
   showLabel: boolean;
   showTooltip: boolean;
}): React.ReactNode {
   let className_ = className ?? "";
   let tooltip = "";
   const diff = (Tick.current.resourceAmount.get(resource) ?? 0) - amount;
   if (diff < 0) {
      className_ += " text-red";
      tooltip = t(L.ResourceNeeded, {
         resource: Config.Material[resource].name(),
         amount: formatNumber(Math.abs(diff)),
      });
   }
   const content = (
      <span className={className_}>
         {showLabel ? Config.Material[resource].name() : null} x{formatNumber(amount)}
      </span>
   );

   if (!showTooltip) {
      return content;
   }

   return (
      <Tippy content={tooltip} disabled={!tooltip}>
         {content}
      </Tippy>
   );
}
