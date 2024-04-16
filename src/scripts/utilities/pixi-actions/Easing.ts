export type EasingFunction = (progress: number) => number;

const pow = Math.pow;
const sqrt = Math.sqrt;
const sin = Math.sin;
const cos = Math.cos;
const PI = Math.PI;
const c1 = 1.70158;
const c2 = c1 * 1.525;
const c3 = c1 + 1;
const c4 = (2 * PI) / 3;
const c5 = (2 * PI) / 4.5;

const bounceOut: EasingFunction = (x) => {
   const n1 = 7.5625;
   const d1 = 2.75;
   if (x < 1 / d1) {
      return n1 * x * x;
   }
   if (x < 2 / d1) {
      // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
      return n1 * (x -= 1.5 / d1) * x + 0.75;
   }
   if (x < 2.5 / d1) {
      // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
   }
   // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
   return n1 * (x -= 2.625 / d1) * x + 0.984375;
};

export const Easing = {
   Linear: (x) => x,
   InQuad: (x) => x * x,
   OutQuad: (x) => 1 - (1 - x) * (1 - x),
   InOutQuad: (x) => (x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2),
   InCubic: (x) => x * x * x,
   OutCubic: (x) => 1 - pow(1 - x, 3),
   InOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2),
   InQuart: (x) => x * x * x * x,
   OutQuart: (x) => 1 - pow(1 - x, 4),
   InOutQuart: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2),
   InQuint: (x) => x * x * x * x * x,
   OutQuint: (x) => 1 - pow(1 - x, 5),
   InOutQuint: (x) => (x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2),
   InSine: (x) => 1 - cos((x * PI) / 2),
   OutSine: (x) => sin((x * PI) / 2),
   InOutSine: (x) => -(cos(PI * x) - 1) / 2,
   InExpo: (x) => (x === 0 ? 0 : pow(2, 10 * x - 10)),
   OutExpo: (x) => (x === 1 ? 1 : 1 - pow(2, -10 * x)),
   InOutExpo: (x) =>
      x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? pow(2, 20 * x - 10) / 2 : (2 - pow(2, -20 * x + 10)) / 2,
   InCirc: (x) => 1 - sqrt(1 - pow(x, 2)),
   OutCirc: (x) => sqrt(1 - pow(x - 1, 2)),
   InOutCirc: (x) => (x < 0.5 ? (1 - sqrt(1 - pow(2 * x, 2))) / 2 : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2),
   InBack: (x) => c3 * x * x * x - c1 * x * x,
   OutBack: (x) => 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2),
   InOutBack: (x) =>
      x < 0.5
         ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
         : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2,
   InElastic: (x) => (x === 0 ? 0 : x === 1 ? 1 : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4)),
   OutElastic: (x) => (x === 0 ? 0 : x === 1 ? 1 : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1),
   InOutElastic: (x) =>
      x === 0
         ? 0
         : x === 1
           ? 1
           : x < 0.5
             ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
             : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1,
   InBounce: (x) => 1 - bounceOut(1 - x),
   OutBounce: bounceOut,
   InOutBounce: (x) => (x < 0.5 ? (1 - bounceOut(1 - 2 * x)) / 2 : (1 + bounceOut(2 * x - 1)) / 2),
} satisfies Record<string, EasingFunction>;
