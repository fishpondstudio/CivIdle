import { forEach } from "../../../shared/utilities/Helper";

export function jsxMapOf<K extends string, V>(
   obj: Partial<Record<K, V>> | undefined,
   func: (key: K, value: V, index: number) => JSX.Element[] | JSX.Element | null,
   ifEmpty: () => JSX.Element | null = () => null,
): JSX.Element[] | JSX.Element | null {
   const result: JSX.Element[] = [];
   let i = 0;
   forEach(obj, (k, v) => {
      const ele = func(k, v, i);
      if (ele) {
         if (Array.isArray(ele)) {
            ele.forEach((e) => result.push(e));
         } else {
            result.push(ele);
         }
      }
      ++i;
   });
   if (result.length === 0) {
      return ifEmpty();
   }
   return result;
}

export function jsxMMapOf<K, V>(
   obj: Map<K, V> | undefined,
   func: (key: K, value: V) => JSX.Element[] | JSX.Element | null,
   ifEmpty: () => JSX.Element | null = () => null,
): JSX.Element[] | JSX.Element | null {
   const result: JSX.Element[] = [];
   obj?.forEach((v, k) => {
      const ele = func(k, v);
      if (ele) {
         if (Array.isArray(ele)) {
            ele.forEach((e) => result.push(e));
         } else {
            result.push(ele);
         }
      }
   });
   if (result.length === 0) {
      return ifEmpty();
   }
   return result;
}
