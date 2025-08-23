import { formatNumber } from "../../../shared/utilities/Helper";

export function FormatNumber({
   value,
   binary,
}: { value: number | undefined | null; binary?: boolean }): React.ReactNode {
   return formatNumber(value, binary ?? false);
}
