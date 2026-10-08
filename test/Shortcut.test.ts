import { assert, test } from "vitest";
import { DEFAULT_SHORTCUTS } from "../shared/logic/ShortcutDefaults";

test("default keyboard shortcuts cover every shortcut action", () => {
   assert.equal(Object.keys(DEFAULT_SHORTCUTS).length, 30);
   for (const shortcut of Object.values(DEFAULT_SHORTCUTS)) {
      assert.isString(shortcut.key);
      assert.isBoolean(shortcut.ctrl);
      assert.isBoolean(shortcut.alt);
      assert.isBoolean(shortcut.shift);
      assert.isBoolean(shortcut.meta);
   }
});
