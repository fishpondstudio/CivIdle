interface IHaveXY {
   x: number;
   y: number;
}

export class Vector2 {
   /**
    * Create a vector with the given components.
    * @param x - The component of the x-axis.
    * @param y - The component of the y-axis.
    * @returns The vector.
    */
   public static of({ x, y }: IHaveXY): Vector2 {
      return new Vector2(x, y);
   }

   public static lerp(p1: IHaveXY, p2: IHaveXY, amount: number): IHaveXY {
      return { x: p1.x + (p2.x - p1.x) * amount, y: p1.y + (p2.y - p1.y) * amount };
   }

   /**
    * Create a vector with the given components.
    * @param x - The component of the x-axis.
    * @param y - The component of the y-axis.
    * @returns The vector.
    */
   public constructor(public x: number, public y: number) {}

   /**
    * Add another vector to the vector.
    * @param val - The vector to be added.
    * @returns The resulting vector of the addition.
    */
   public add(val: IHaveXY, result?: Vector2): Vector2 {
      if (result) {
         result.x += val.x;
         result.y += val.y;
         return result;
      }
      return new Vector2(this.x + val.x, this.y + val.y);
   }
   public addSelf(val: IHaveXY): Vector2 {
      this.x = this.x + val.x;
      this.y = this.y + val.y;
      return this;
   }

   /**
    * Subtract another vector from the vector.
    * @param val - The vector to be added.
    * @returns The resulting vector of the subtraction.
    */
   public subtract(val: IHaveXY): Vector2 {
      return new Vector2(this.x - val.x, this.y - val.y);
   }
   public subtractSelf(val: IHaveXY): Vector2 {
      this.x = this.x - val.x;
      this.y = this.y - val.y;
      return this;
   }

   /**
    * Multiply the vector by a scalar.
    * @param scalar - The scalar the vector will be multiplied by.
    * @returns The resulting vector of the multiplication.
    */
   public multiply(scalar: number): Vector2 {
      return new Vector2(this.x * scalar, this.y * scalar);
   }
   public multiplySelf(scalar: number): Vector2 {
      this.x = this.x * scalar;
      this.y = this.y * scalar;
      return this;
   }

   /**
    * Divide the vector by a scalar.
    * @param scalar - The scalar the vector will be divided by.
    * @returns The resulting vector of the division.
    */
   public divide(scalar: number): Vector2 {
      return new Vector2(this.x / scalar, this.y / scalar);
   }
   public divideSelf(scalar: number): Vector2 {
      this.x = this.x / scalar;
      this.y = this.y / scalar;
      return this;
   }

   /**
    * Calculate the dot product of the vector and another vector.
    * @param other - The other vector used for calculating the dot product.
    * @returns The dot product.
    */
   public dot(other: IHaveXY): number {
      return this.x * other.x + this.y * other.y;
   }

   /**
    * Calculate the cross product of the vector and another vector. The cross product of two vectors `a` and `b` is defined as `a.x * b.y - a.y * b.x`.
    * @param other - The other vector used for calculating the cross product.
    * @returns The cross product.
    */
   public cross(other: IHaveXY): number {
      return this.x * other.y - other.x * this.y;
   }

   /**
    * Calculate the Hadamard product of the vector and another vector.
    * @param other - The other vector used for calculating the Hadamard product.
    * @returns The Hadamard product.
    */
   public hadamard(other: IHaveXY): Vector2 {
      return new Vector2(this.x * other.x, this.y * other.y);
   }

   public hadamardSelf(other: IHaveXY): Vector2 {
      this.x = this.x * other.x;
      this.y = this.y * other.y;
      return this;
   }

   /**
    * Calculate the length of the vector using the L2 norm.
    * @returns The length.
    */
   public length(): number {
      return Math.sqrt(this.lengthSqr());
   }

   public lengthSqr(): number {
      return Math.pow(this.x, 2) + Math.pow(this.y, 2);
   }

   /**
    * Normalize the vector using the L2 norm.
    * @returns The normalized vector.
    */
   public normalize(): Vector2 {
      const length = this.length();
      return new Vector2(this.x / length, this.y / length);
   }

   public normalizeSelf(): Vector2 {
      const length = this.length();
      this.x = this.x / length;
      this.y = this.y / length;
      return this;
   }

   /**
    * Rotate the vector by the given radians counterclockwise.
    * @param radians - The radians the vector will be rotated by.
    * @returns The rotated vector.
    */
   public rotateByRadians(radians: number): Vector2 {
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      return new Vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
   }

   /**
    * Rotate the vector by the given degrees counterclockwise.
    * @param degrees - The degrees the vector will be rotated by.
    * @returns The rotated vector.
    */
   public rotateByDegrees(degrees: number): Vector2 {
      return this.rotateByRadians((degrees * Math.PI) / 180);
   }
}

export function v2({ x, y }: IHaveXY): Vector2 {
   return new Vector2(x, y);
}
