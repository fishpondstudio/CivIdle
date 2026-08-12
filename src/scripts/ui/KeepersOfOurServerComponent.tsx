import { useState } from "react";
import { BIRTHDAY_COOLDOWN_DAYS } from "../../../shared/logic/Constants";
import { UserAttributes } from "../../../shared/utilities/Database";
import { hasFlag, isNullOrUndefined } from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { OnUserChanged, client, useUser } from "../rpc/RPCClient";
import { playError, playSuccess } from "../visuals/Sound";
import { showToast } from "./GlobalModal";
import { html } from "./RenderHTMLComponent";
import { MiscTextureComponent } from "./TextureSprites";
import { UserFont, getUserFont, setUserFont } from "./UserFont";

const monthNames = Array.from({ length: 12 }, (_, month) =>
   new Date(Date.UTC(2000, month, 1)).toLocaleString(undefined, { month: "long", timeZone: "UTC" }),
);

function getDaysInMonth(month: number): number {
   return new Date(Date.UTC(2000, month + 1, 0)).getUTCDate();
}

export function KeepersOfOurServerComponent(): React.ReactNode {
   const user = useUser();
   const [specialDay, setSpecialDay] = useState<{ month: number; day: number } | undefined>(
      user?.birthday ?? undefined,
   );
   const days = isNullOrUndefined(specialDay)
      ? []
      : Array.from({ length: getDaysInMonth(specialDay.month) }, (_, day) => day + 1);
   if (!user || !hasFlag(user.attr, UserAttributes.DLC3)) {
      return null;
   }
   return (
      <fieldset>
         <legend className="row g5">
            <MiscTextureComponent name="Supporter2" scale={0.15} />
            {$t(L.KeepOurServerOnPackOptions)}
         </legend>
         <div className="row">
            <div className="f1">{$t(L.PlayerHandleFont)}</div>
            <select
               value={getUserFont(user.attr)}
               onChange={async (e) => {
                  try {
                     const font = e.target.value as UserFont;
                     user.attr = setUserFont(user.attr, font);
                     OnUserChanged.emit({ ...user });
                     OnUserChanged.emit(await client.changeFont(UserFont.indexOf(font)));
                  } catch (error) {
                     showToast(String(error));
                     playError();
                  }
               }}
               style={{ fontFamily: getUserFont(user.attr) }}
            >
               {UserFont.map((option) => {
                  return (
                     <option key={option} value={option} style={{ fontFamily: option }}>
                        {option}
                     </option>
                  );
               })}
            </select>
         </div>
         <div className="separator" />
         <div className="row g5">
            <div>{$t(L.SpecialDay)}</div>
            <div className="f1" />
            <select
               value={specialDay?.month ?? ""}
               onChange={(e) => {
                  const month = Number(e.target.value);
                  setSpecialDay({
                     month,
                     day: Math.min(specialDay?.day ?? 1, getDaysInMonth(month)),
                  });
               }}
            >
               <option value="" disabled>
                  {$t(L.Month)}
               </option>
               {monthNames.map((month, index) => (
                  <option key={month} value={index}>
                     {month}
                  </option>
               ))}
            </select>
            <select
               disabled={isNullOrUndefined(specialDay)}
               value={specialDay?.day ?? ""}
               onChange={(e) => {
                  if (!isNullOrUndefined(specialDay)) {
                     setSpecialDay({ ...specialDay, day: Number(e.target.value) });
                  }
               }}
            >
               <option value="" disabled>
                  {$t(L.Day)}
               </option>
               {days.map((day) => (
                  <option key={day} value={day}>
                     {day}
                  </option>
               ))}
            </select>
            <button
               disabled={user.birthday?.month === specialDay?.month && user.birthday?.day === specialDay?.day}
               onClick={async () => {
                  if (!isNullOrUndefined(specialDay)) {
                     try {
                        user.birthday = await client.setBirthday(specialDay.month, specialDay.day);
                        showToast($t(L.OperationSuccessful));
                        OnUserChanged.emit({ ...user });
                        playSuccess();
                     } catch (e) {
                        showToast(String(e));
                        setSpecialDay(user.birthday ?? undefined);
                        playError();
                     }
                  }
               }}
            >
               {$t(L.Save)}
            </button>
         </div>
         <div className="separator" />
         {html($t(L.OnYourSpecialDayDesc, { cooldown: BIRTHDAY_COOLDOWN_DAYS }), "text-desc")}
      </fieldset>
   );
}
