interface IHaveXY {
    x: number;
    y: number;
}
export declare class Vector2 {
    x: number;
    y: number;
    /**
     * Create a vector with the given components.
     * @param x - The component of the x-axis.
     * @param y - The component of the y-axis.
     * @returns The vector.
     */
    static of({ x, y }: IHaveXY): Vector2;
    static lerp(p1: IHaveXY, p2: IHaveXY, amount: number): IHaveXY;
    /**
     * Create a vector with the given components.
     * @param x - The component of the x-axis.
     * @param y - The component of the y-axis.
     * @returns The vector.
     */
    constructor(x: number, y: number);
    /**
     * Add another vector to the vector.
     * @param val - The vector to be added.
     * @returns The resulting vector of the addition.
     */
    add(val: IHaveXY, result?: Vector2): Vector2;
    addSelf(val: IHaveXY): Vector2;
    /**
     * Subtract another vector from the vector.
     * @param val - The vector to be added.
     * @returns The resulting vector of the subtraction.
     */
    subtract(val: IHaveXY): Vector2;
    subtractSelf(val: IHaveXY): Vector2;
    /**
     * Multiply the vector by a scalar.
     * @param scalar - The scalar the vector will be multiplied by.
     * @returns The resulting vector of the multiplication.
     */
    multiply(scalar: number): Vector2;
    multiplySelf(scalar: number): Vector2;
    /**
     * Divide the vector by a scalar.
     * @param scalar - The scalar the vector will be divided by.
     * @returns The resulting vector of the division.
     */
    divide(scalar: number): Vector2;
    divideSelf(scalar: number): Vector2;
    /**
     * Calculate the dot product of the vector and another vector.
     * @param other - The other vector used for calculating the dot product.
     * @returns The dot product.
     */
    dot(other: IHaveXY): number;
    /**
     * Calculate the cross product of the vector and another vector. The cross product of two vectors `a` and `b` is defined as `a.x * b.y - a.y * b.x`.
     * @param other - The other vector used for calculating the cross product.
     * @returns The cross product.
     */
    cross(other: IHaveXY): number;
    /**
     * Calculate the Hadamard product of the vector and another vector.
     * @param other - The other vector used for calculating the Hadamard product.
     * @returns The Hadamard product.
     */
    hadamard(other: IHaveXY): Vector2;
    hadamardSelf(other: IHaveXY): Vector2;
    /**
     * Calculate the length of the vector using the L2 norm.
     * @returns The length.
     */
    length(): number;
    lengthSqr(): number;
    /**
     * Normalize the vector using the L2 norm.
     * @returns The normalized vector.
     */
    normalize(): Vector2;
    normalizeSelf(): Vector2;
    /**
     * Rotate the vector by the given radians counterclockwise.
     * @param radians - The radians the vector will be rotated by.
     * @returns The rotated vector.
     */
    rotateByRadians(radians: number): Vector2;
    /**
     * Rotate the vector by the given degrees counterclockwise.
     * @param degrees - The degrees the vector will be rotated by.
     * @returns The rotated vector.
     */
    rotateByDegrees(degrees: number): Vector2;
}
export declare function v2({ x, y }: IHaveXY): Vector2;
export {};
//# sourceMappingURL=Vector2.d.ts.map