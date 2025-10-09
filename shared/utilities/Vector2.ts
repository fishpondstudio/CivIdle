interface IHaveXY {
   x: number;
   y: number;
}

interface IVector2 {
   x: number;
   y: number;
   add(val: IHaveXY, result?: IVector2): IVector2;
   addSelf(val: IHaveXY): IVector2;
   subtract(val: IHaveXY): IVector2;
   subtractSelf(val: IHaveXY): IVector2;
   multiply(scalar: number): IVector2;
   multiplySelf(scalar: number): IVector2;
   divide(scalar: number): IVector2;
   divideSelf(scalar: number): IVector2;
   dot(other: IHaveXY): number;
   cross(other: IHaveXY): number;
   hadamard(other: IHaveXY): IVector2;
   hadamardSelf(other: IHaveXY): IVector2;
   length(): number;
   lengthSqr(): number;
   normalize(): IVector2;
   normalizeSelf(): IVector2;
   rotateByRadians(radians: number): IVector2;
   rotateByDegrees(degrees: number): IVector2;
}

interface Vec2Constructor {
   new (x: number, y: number): IVector2;
   (): void;
}

const Vector2 = function (this: IVector2, x: number, y: number): void {
   this.x = x;
   this.y = y;
} as Vec2Constructor;

Vector2.prototype.add = function (val: IHaveXY, result?: IVector2): IVector2 {
   if (result) {
      result.x += val.x;
      result.y += val.y;
      return result;
   }
   return new Vector2(this.x + val.x, this.y + val.y);
};

Vector2.prototype.addSelf = function (val: IHaveXY): IVector2 {
   this.x = this.x + val.x;
   this.y = this.y + val.y;
   return this;
};

Vector2.prototype.subtract = function (val: IHaveXY): IVector2 {
   return new Vector2(this.x - val.x, this.y - val.y);
};

Vector2.prototype.subtractSelf = function (val: IHaveXY): IVector2 {
   this.x = this.x - val.x;
   this.y = this.y - val.y;
   return this;
};

Vector2.prototype.multiply = function (scalar: number): IVector2 {
   return new Vector2(this.x * scalar, this.y * scalar);
};

Vector2.prototype.multiplySelf = function (scalar: number): IVector2 {
   this.x = this.x * scalar;
   this.y = this.y * scalar;
   return this;
};

Vector2.prototype.divide = function (scalar: number): IVector2 {
   return new Vector2(this.x / scalar, this.y / scalar);
};

Vector2.prototype.divideSelf = function (scalar: number): IVector2 {
   this.x = this.x / scalar;
   this.y = this.y / scalar;
   return this;
};

Vector2.prototype.dot = function (other: IHaveXY): number {
   return this.x * other.x + this.y * other.y;
};

Vector2.prototype.cross = function (other: IHaveXY): number {
   return this.x * other.y - other.x * this.y;
};

Vector2.prototype.hadamard = function (other: IHaveXY): IVector2 {
   return new Vector2(this.x * other.x, this.y * other.y);
};

Vector2.prototype.hadamardSelf = function (other: IHaveXY): IVector2 {
   this.x = this.x * other.x;
   this.y = this.y * other.y;
   return this;
};

Vector2.prototype.length = function (): number {
   return Math.sqrt(this.lengthSqr());
};

Vector2.prototype.lengthSqr = function (): number {
   return this.x ** 2 + this.y ** 2;
};

Vector2.prototype.normalize = function (): IVector2 {
   const length = this.length();
   return new Vector2(this.x / length, this.y / length);
};

Vector2.prototype.normalizeSelf = function (): IVector2 {
   const length = this.length();
   this.x = this.x / length;
   this.y = this.y / length;
   return this;
};

Vector2.prototype.rotateByRadians = function (radians: number): IVector2 {
   const cos = Math.cos(radians);
   const sin = Math.sin(radians);
   return new Vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
};

Vector2.prototype.rotateByDegrees = function (degrees: number): IVector2 {
   return this.rotateByRadians((degrees * Math.PI) / 180);
};

export function lerpVector2(p1: IHaveXY, p2: IHaveXY, amount: number, result?: IHaveXY): IHaveXY {
   const x = p1.x + (p2.x - p1.x) * amount;
   const y = p1.y + (p2.y - p1.y) * amount;
   if (result) {
      result.x = x;
      result.y = y;
      return result;
   }
   return { x, y };
}

export function v2({ x, y }: IHaveXY): IVector2 {
   return new Vector2(x, y);
}

export { Vector2 };
