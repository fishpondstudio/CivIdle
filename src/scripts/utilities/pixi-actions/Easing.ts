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

const bounceOut: EasingFunction = function (x) {
   const n1 = 7.5625;
   const d1 = 2.75;

   if (x < 1 / d1) {
      return n1 * x * x;
   } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
   } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
   } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
   }
};

export const Easing = {
   Linear: (x) => x,
   InQuad: function (x) {
      return x * x;
   },
   OutQuad: function (x) {
      return 1 - (1 - x) * (1 - x);
   },
   InOutQuad: function (x) {
      return x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2;
   },
   InCubic: function (x) {
      return x * x * x;
   },
   OutCubic: function (x) {
      return 1 - pow(1 - x, 3);
   },
   InOutCubic: function (x) {
      return x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2;
   },
   InQuart: function (x) {
      return x * x * x * x;
   },
   OutQuart: function (x) {
      return 1 - pow(1 - x, 4);
   },
   InOutQuart: function (x) {
      return x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2;
   },
   InQuint: function (x) {
      return x * x * x * x * x;
   },
   OutQuint: function (x) {
      return 1 - pow(1 - x, 5);
   },
   InOutQuint: function (x) {
      return x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2;
   },
   InSine: function (x) {
      return 1 - cos((x * PI) / 2);
   },
   OutSine: function (x) {
      return sin((x * PI) / 2);
   },
   InOutSine: function (x) {
      return -(cos(PI * x) - 1) / 2;
   },
   InExpo: function (x) {
      return x === 0 ? 0 : pow(2, 10 * x - 10);
   },
   OutExpo: function (x) {
      return x === 1 ? 1 : 1 - pow(2, -10 * x);
   },
   InOutExpo: function (x) {
      return x === 0
         ? 0
         : x === 1
           ? 1
           : x < 0.5
              ? pow(2, 20 * x - 10) / 2
              : (2 - pow(2, -20 * x + 10)) / 2;
   },
   InCirc: function (x) {
      return 1 - sqrt(1 - pow(x, 2));
   },
   OutCirc: function (x) {
      return sqrt(1 - pow(x - 1, 2));
   },
   InOutCirc: function (x) {
      return x < 0.5 ? (1 - sqrt(1 - pow(2 * x, 2))) / 2 : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2;
   },
   InBack: function (x) {
      return c3 * x * x * x - c1 * x * x;
   },
   OutBack: function (x) {
      return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
   },
   InOutBack: function (x) {
      return x < 0.5
         ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
         : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
   },
   InElastic: function (x) {
      return x === 0 ? 0 : x === 1 ? 1 : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4);
   },
   OutElastic: function (x) {
      return x === 0 ? 0 : x === 1 ? 1 : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1;
   },
   InOutElastic: function (x) {
      return x === 0
         ? 0
         : x === 1
           ? 1
           : x < 0.5
              ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
              : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1;
   },
   InBounce: function (x) {
      return 1 - bounceOut(1 - x);
   },
   OutBounce: bounceOut,
   InOutBounce: function (x) {
      return x < 0.5 ? (1 - bounceOut(1 - 2 * x)) / 2 : (1 + bounceOut(2 * x - 1)) / 2;
   },
} satisfies Record<string, EasingFunction>;
