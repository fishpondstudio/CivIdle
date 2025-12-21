import Tippy from "@tippyjs/react";
import { cls } from "../../../shared/utilities/Helper";
import { useFloatingMode, useGameOptions, useGameState } from "../Global";
import { Todo, TodoList } from "../logic/Todo";
import { getCurrentTutorial } from "../logic/Tutorial";
import { playClick } from "../visuals/Sound";
import { showModal } from "./GlobalModal";
import { highlightElement } from "./HighlightElement";
import { html } from "./RenderHTMLComponent";
import { TutorialModal } from "./TutorialModal";

export function TopLeftPanel(): React.ReactNode {
   const isFloating = useFloatingMode();
   return (
      <div id="top-left-panel" className={cls(isFloating ? "is-floating" : null)}>
         <TutorialComponent />
         <TodoComponent />
      </div>
   );
}

let clearHighlightPanel: (() => void) | undefined;

function TutorialComponent(): React.ReactNode {
   const gs = useGameState();
   const options = useGameOptions();
   if (!options.showTutorial) {
      return null;
   }
   const tutorial = getCurrentTutorial(gs);
   if (!tutorial) {
      return null;
   }
   const [progress, total] = tutorial.progress(gs);
   return (
      <Tippy placement="right" content={html(tutorial.desc())}>
         <div
            onMouseOver={() => {
               clearHighlightPanel?.();
               if (tutorial.selector) {
                  clearHighlightPanel = highlightElement(tutorial.selector);
               }
            }}
            onMouseOut={() => {
               clearHighlightPanel?.();
               clearHighlightPanel = undefined;
            }}
            className="warning-banner pointer row g5"
            style={{ width: 300, padding: 5 }}
            onClick={() => {
               playClick();
               showModal(<TutorialModal />);
            }}
         >
            <div className="m-icon small text-orange">school</div>
            <div className="f1 text-strong">{tutorial?.name()}</div>
            {tutorial.video && <div className="m-icon small text-orange">ondemand_video</div>}
            <div>
               {progress}/{total}
            </div>
         </div>
      </Tippy>
   );
}

function TodoComponent(): React.ReactNode {
   const options = useGameOptions();
   const isFloating = useFloatingMode();
   if (options.showTutorial) {
      return null;
   }
   return (
      <div className="row g5">
         {Array.from(options.pinnedTodos.keys()).map((id) => {
            return <TodoTab key={id} todo={id as Todo} disableClick={isFloating} />;
         })}
         {TodoList.filter((id) => !options.pinnedTodos.has(id)).map((id) => {
            return <TodoTab key={id} todo={id as Todo} disableClick={isFloating} />;
         })}
      </div>
   );
}

function TodoTab({ todo, disableClick }: { todo: Todo; disableClick: boolean }): React.ReactNode {
   const gs = useGameState();
   const options = useGameOptions();
   const config = Todo[todo];
   if (!config) {
      return null;
   }
   if (options.disabledTodos.has(todo)) {
      return null;
   }
   if (!config.condition(gs, options)) {
      return null;
   }
   const value = config.value?.(gs, options);
   return (
      <Tippy
         maxWidth={config.maxWidth}
         placement="bottom"
         content={
            <>
               <div className="text-strong">{config.name()}</div>
               {config.desc(gs, options)}
            </>
         }
      >
         <div
            className={cls("todo pointer", config.className, options.pinnedTodos.has(todo) ? "pinned" : null)}
            key={config.name()}
            onClick={() => {
               if (disableClick) {
                  return;
               }
               playClick();
               config.onClick(gs, options);
            }}
         >
            <div className="m-icon">{config.icon}</div>
            {value && <div className="count">{value}</div>}
         </div>
      </Tippy>
   );
}
