import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { hasFlag, toggleFlag } from "../../../shared/utilities/Helper";

export enum BuildingFilter {
   None = 0,
   Wonder = 1 << 0,
   Tier1 = 1 << 1,
   Tier2 = 1 << 2,
   Tier3 = 1 << 3,
   Tier4 = 1 << 4,
   Tier5 = 1 << 5,
   Tier6 = 1 << 6,
   Tier7 = 1 << 7,
   Tier8 = 1 << 8,
   Tier9 = 1 << 9,
   Tier10 = 1 << 10,
   Tier11 = 1 << 11,
   Tier12 = 1 << 12,

   NotBuilt = 1 << 28,
}

export function Filter({
   tooltip,
   children,
   filter,
   current,
   savedFilter,
   onFilterChange,
}: React.PropsWithChildren<{
   tooltip?: string;
   filter: BuildingFilter;
   current: BuildingFilter;
   savedFilter: BuildingFilter;
   onFilterChange: (f: BuildingFilter) => void;
}>): React.ReactNode {
   const content = (
      <button
         className={classNames({
            active: hasFlag(filter, current),
         })}
         style={{ width: 27, padding: 0 }}
         onClick={() => {
            savedFilter = toggleFlag(filter, current);
            onFilterChange(savedFilter);
         }}
      >
         {children}
      </button>
   );
   if (!tooltip) {
      return content;
   }
   return <Tippy content={tooltip}>{content}</Tippy>;
}
