import { type Resource } from "../definitions/ResourceDefinitions";
import { type Tile } from "../utilities/Helper";
import { TypedEvent } from "../utilities/TypedEvent";

interface IPreferences {
   disabledResources: Map<Tile, Set<Resource>>;
}

export const Preferences: IPreferences = {
   disabledResources: new Map(),
};

export const OnPreferencesChanged = new TypedEvent<IPreferences>();

export function notifyPreferencesChanged(pref?: IPreferences) {
   OnPreferencesChanged.emit(pref ?? Preferences);
}
