import Tippy from "@tippyjs/react";
import { useState } from "react";
import type { GreatPerson } from "../../../shared/definitions/GreatPersonDefinitions";
import { Config } from "../../../shared/logic/Config";
import { cls, keysOf } from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { getColorCached } from "../utilities/CachedColor";
import "./BirthdayCalendarModal.css";
import { hideModal, showModal } from "./GlobalModal";

export function BirthdayCalendarModal(): React.ReactNode {
   const today = new Date();
   const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
   const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
   const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
   const birthdays = getBirthdaysByDay(month.getMonth());

   return (
      <div className="window birthday-calendar-window col">
         <div className="title-bar">
            <div className="title-bar-text">{$t(L.GameCalendar)}</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label={$t(L.Close)}></button>
            </div>
         </div>
         <div className="window-body birthday-calendar col f1" style={{ overflow: "hidden" }}>
            <div className="row mb10">
               <button
                  className="ph5"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
               >
                  <div className="m-icon small">chevron_left</div>
               </button>
               <button
                  className="ph5 mr10"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
               >
                  <div className="m-icon small">chevron_right</div>
               </button>
               <div className="text-strong" aria-live="polite">
                  {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
               </div>
               <div className="f1" />
               <button
                  className="row"
                  onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}
               >
                  <div className="m-icon small mr5">today</div>
                  <div>{$t(L.Today)}</div>
               </button>
               <button className="row" onClick={() => void showManagePermanentGreatPeople()}>
                  <div className="m-icon small mr5">person_celebrate</div>
                  <div>{$t(L.GreatPeople)}</div>
               </button>
            </div>
            <div className="birthday-calendar-grid f1">
               {getWeekdayNames().map((weekday) => (
                  <div className="birthday-calendar-weekday text-center text-strong" key={weekday}>
                     {weekday}
                  </div>
               ))}
               {Array.from({ length: 42 }, (_, index) => {
                  const day = index - monthStart.getDay() + 1;
                  const isInMonth = day >= 1 && day <= daysInMonth;
                  const isToday =
                     isInMonth &&
                     day === today.getDate() &&
                     month.getMonth() === today.getMonth() &&
                     month.getFullYear() === today.getFullYear();

                  return (
                     <div
                        className={cls(
                           "birthday-calendar-day p5",
                           isToday ? "birthday-calendar-today" : null,
                           isInMonth ? null : "birthday-calendar-day-empty",
                        )}
                        key={index}
                        aria-current={isToday ? "date" : undefined}
                     >
                        {isInMonth && (
                           <>
                              <div className={cls("text-strong mb5", isToday ? "text-orange" : null)}>
                                 {day}
                              </div>
                              <div className="col">
                                 {birthdays.get(day)?.map((greatPerson) => {
                                    const def = Config.GreatPerson[greatPerson];
                                    return (
                                       <Tippy
                                          key={greatPerson}
                                          content={
                                             <>
                                                <div className="text-strong">{def.name()}</div>
                                                <div>{def.desc(def, 1)}</div>
                                             </>
                                          }
                                       >
                                          <div
                                             className="birthday-calendar-person mb2 nowrap pointer"
                                             style={{
                                                backgroundColor: getColorCached(
                                                   Config.TechAge[Config.GreatPerson[greatPerson].age].color,
                                                )
                                                   .setAlpha(0.5)
                                                   .toRgbaString(),
                                             }}
                                             onClick={() => void showManagePermanentGreatPeople(greatPerson)}
                                          >
                                             {Config.GreatPerson[greatPerson].name()}
                                          </div>
                                       </Tippy>
                                    );
                                 })}
                              </div>
                           </>
                        )}
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
   );
}

async function showManagePermanentGreatPeople(greatPerson?: GreatPerson): Promise<void> {
   const { ManagePermanentGreatPersonModal } = await import("./ManagePermanentGreatPersonModal");
   showModal(<ManagePermanentGreatPersonModal adaptiveOnly={false} scrollToGreatPerson={greatPerson} />);
}

function getBirthdaysByDay(month: number): Map<number, GreatPerson[]> {
   const result = new Map<number, GreatPerson[]>();
   keysOf(Config.GreatPerson).forEach((greatPerson) => {
      const birthday = Config.GreatPerson[greatPerson].birthday;
      if (!birthday || birthday.getMonth() !== month) {
         return;
      }
      const day = birthday.getDate();
      const people = result.get(day) ?? [];
      people.push(greatPerson);
      result.set(day, people);
   });
   result.forEach((people) =>
      people.sort((a, b) => Config.GreatPerson[a].name().localeCompare(Config.GreatPerson[b].name())),
   );
   return result;
}

function getWeekdayNames(): string[] {
   return Array.from({ length: 7 }, (_, index) =>
      new Date(2021, 7, index + 1).toLocaleDateString(undefined, { weekday: "short" }),
   );
}
