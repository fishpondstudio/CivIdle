import { ChatAttributes, UserAttributes } from "../../../shared/utilities/Database";
import { clearFlag, hasFlag, setFlag } from "../../../shared/utilities/Helper";
import { Fonts } from "../visuals/Fonts";

export function getUserFont(attr: UserAttributes): keyof typeof Fonts | undefined {
   if (hasFlag(attr, UserAttributes.Font1)) {
      return Fonts.RobotoSlab;
   }
   if (hasFlag(attr, UserAttributes.Font2)) {
      return Fonts.Quicksand;
   }
   if (hasFlag(attr, UserAttributes.Font3)) {
      return Fonts.Oswald;
   }
   if (hasFlag(attr, UserAttributes.Font4)) {
      return Fonts.GermaniaOne;
   }
   return undefined;
}

export function getChatFont(attr: ChatAttributes): keyof typeof Fonts | undefined {
   if (hasFlag(attr, ChatAttributes.Font1)) {
      return Fonts.RobotoSlab;
   }
   if (hasFlag(attr, ChatAttributes.Font2)) {
      return Fonts.Quicksand;
   }
   if (hasFlag(attr, ChatAttributes.Font3)) {
      return Fonts.Oswald;
   }
   if (hasFlag(attr, ChatAttributes.Font4)) {
      return Fonts.GermaniaOne;
   }
   return undefined;
}

export function setUserFont(attr: UserAttributes, font: UserFont): UserAttributes {
   switch (font) {
      case "Default":
         attr = clearFlag(attr, UserAttributes.Font1);
         attr = clearFlag(attr, UserAttributes.Font2);
         attr = clearFlag(attr, UserAttributes.Font3);
         attr = clearFlag(attr, UserAttributes.Font4);
         break;
      case Fonts.RobotoSlab:
         attr = setFlag(attr, UserAttributes.Font1);
         attr = clearFlag(attr, UserAttributes.Font2);
         attr = clearFlag(attr, UserAttributes.Font3);
         attr = clearFlag(attr, UserAttributes.Font4);
         break;
      case Fonts.Quicksand:
         attr = clearFlag(attr, UserAttributes.Font1);
         attr = setFlag(attr, UserAttributes.Font2);
         attr = clearFlag(attr, UserAttributes.Font3);
         attr = clearFlag(attr, UserAttributes.Font4);
         break;
      case Fonts.Oswald:
         attr = clearFlag(attr, UserAttributes.Font1);
         attr = clearFlag(attr, UserAttributes.Font2);
         attr = setFlag(attr, UserAttributes.Font3);
         attr = clearFlag(attr, UserAttributes.Font4);
         break;
      case Fonts.GermaniaOne:
         attr = clearFlag(attr, UserAttributes.Font1);
         attr = clearFlag(attr, UserAttributes.Font2);
         attr = clearFlag(attr, UserAttributes.Font3);
         attr = setFlag(attr, UserAttributes.Font4);
         break;
   }
   return attr;
}

export const UserFont = [
   "Default",
   Fonts.RobotoSlab,
   Fonts.Quicksand,
   Fonts.Oswald,
   Fonts.GermaniaOne,
] as const;
export type UserFont = (typeof UserFont)[number];
