import { clamp } from "../../../shared/utilities/Helper";

export function ProgressBarComponent({ progress }: { progress: number }): React.ReactNode {
   return (
      <div className="meter">
         <div className="fill" style={{ width: `${clamp(progress * 100, 0, 100)}%` }}></div>
      </div>
   );
}
