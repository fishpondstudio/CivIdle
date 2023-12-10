import { L, t } from "../utilities/i18n";

export function TechPrerequisiteItemComponent({
   name,
   unlocked,
   action,
}: {
   name: JSX.Element | string;
   unlocked: boolean;
   action: () => void;
}): React.ReactNode {
   return (
      <div className="row mv5">
         {unlocked ? (
            <div className="m-icon small text-green mr5">check_circle</div>
         ) : (
            <div className="m-icon small text-red mr5">cancel</div>
         )}
         <div className="f1">{name}</div>
         <div className="text-link" onClick={action}>
            {t(L.ViewTechnology)}
         </div>
      </div>
   );
}
