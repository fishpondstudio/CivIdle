import type { GameState } from "../../../shared/logic/GameState";
import { formatNumber } from "../../../shared/utilities/Helper";

export function FormatNumber({
   value,
   binary,
}: { value: number | undefined | null; binary?: boolean }): React.ReactNode {
   return formatNumber(value, binary ?? false, false);
}

export function fmtNumber(value: number | undefined | null, gs: GameState): React.ReactNode {
   return formatNumber(value, false, false);
}
