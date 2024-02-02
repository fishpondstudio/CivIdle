import { notifyGameOptionsUpdate } from "../../../shared/logic/GameStateLogic";
import { useGameOptions } from "../Global";
import { playClick } from "../visuals/Sound";

export function MapOptionsComponent(): React.ReactNode {
    const options = useGameOptions();
    return (
        <div className="row">
            <div className="f1">Storage Percentages</div>
            <div
            onClick={() => {
               options.mapStoragePercentage = !options.mapStoragePercentage;
               playClick();
               notifyGameOptionsUpdate(options);
            }}
            className="ml10 pointer"
         >
            {options.mapStoragePercentage ? (
               <div className="m-icon text-green">toggle_on</div>
            ) : (
               <div className="m-icon text-grey">toggle_off</div>
            )}
         </div>            
        </div>
    );
}