import { EN } from "../languages/en";

export function t(str: string, substitutions?: Record<string, string | number>) {
   const translation = str;
   if (translation) {
      return transformPhrase(translation, substitutions);
   }
   return `⚠️${str}`;
}

function transformPhrase(phrase: string, substitutions?: Record<string, any>) {
   if (typeof phrase !== "string") {
      throw new TypeError("Polyglot.transformPhrase expects argument #1 to be string");
   }
   if (substitutions === null) {
      return phrase;
   }
   let result = phrase;
   const interpolationRegex = /%\{(.*?)\}/g;
   const options = substitutions;
   // Interpolate: Creates a `RegExp` object for each interpolation placeholder.
   result = result.replace(interpolationRegex, (expression, argument) => {
      if (!options || options[argument] === undefined) {
         return expression;
      }
      return options[argument];
   });
   return result;
}

export const L = EN;
