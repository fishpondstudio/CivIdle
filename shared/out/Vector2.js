"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v2 = exports.Vector2 = void 0;
class Vector2 {
    /**
     * Create a vector with the given components.
     * @param x - The component of the x-axis.
     * @param y - The component of the y-axis.
     * @returns The vector.
     */
    static of({ x, y }) {
        return new Vector2(x, y);
    }
    static lerp(p1, p2, amount) {
        return { x: p1.x + (p2.x - p1.x) * amount, y: p1.y + (p2.y - p1.y) * amount };
    }
    /**
     * Create a vector with the given components.
     * @param x - The component of the x-axis.
     * @param y - The component of the y-axis.
     * @returns The vector.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * Add another vector to the vector.
     * @param val - The vector to be added.
     * @returns The resulting vector of the addition.
     */
    add(val, result) {
        if (result) {
            result.x += val.x;
            result.y += val.y;
            return result;
        }
        return new Vector2(this.x + val.x, this.y + val.y);
    }
    addSelf(val) {
        this.x = this.x + val.x;
        this.y = this.y + val.y;
        return this;
    }
    /**
     * Subtract another vector from the vector.
     * @param val - The vector to be added.
     * @returns The resulting vector of the subtraction.
     */
    subtract(val) {
        return new Vector2(this.x - val.x, this.y - val.y);
    }
    subtractSelf(val) {
        this.x = this.x - val.x;
        this.y = this.y - val.y;
        return this;
    }
    /**
     * Multiply the vector by a scalar.
     * @param scalar - The scalar the vector will be multiplied by.
     * @returns The resulting vector of the multiplication.
     */
    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
    multiplySelf(scalar) {
        this.x = this.x * scalar;
        this.y = this.y * scalar;
        return this;
    }
    /**
     * Divide the vector by a scalar.
     * @param scalar - The scalar the vector will be divided by.
     * @returns The resulting vector of the division.
     */
    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }
    divideSelf(scalar) {
        this.x = this.x / scalar;
        this.y = this.y / scalar;
        return this;
    }
    /**
     * Calculate the dot product of the vector and another vector.
     * @param other - The other vector used for calculating the dot product.
     * @returns The dot product.
     */
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }
    /**
     * Calculate the cross product of the vector and another vector. The cross product of two vectors `a` and `b` is defined as `a.x * b.y - a.y * b.x`.
     * @param other - The other vector used for calculating the cross product.
     * @returns The cross product.
     */
    cross(other) {
        return this.x * other.y - other.x * this.y;
    }
    /**
     * Calculate the Hadamard product of the vector and another vector.
     * @param other - The other vector used for calculating the Hadamard product.
     * @returns The Hadamard product.
     */
    hadamard(other) {
        return new Vector2(this.x * other.x, this.y * other.y);
    }
    hadamardSelf(other) {
        this.x = this.x * other.x;
        this.y = this.y * other.y;
        return this;
    }
    /**
     * Calculate the length of the vector using the L2 norm.
     * @returns The length.
     */
    length() {
        return Math.sqrt(this.lengthSqr());
    }
    lengthSqr() {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2);
    }
    /**
     * Normalize the vector using the L2 norm.
     * @returns The normalized vector.
     */
    normalize() {
        const length = this.length();
        return new Vector2(this.x / length, this.y / length);
    }
    normalizeSelf() {
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
    rotateByRadians(radians) {
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        return new Vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
    /**
     * Rotate the vector by the given degrees counterclockwise.
     * @param degrees - The degrees the vector will be rotated by.
     * @returns The rotated vector.
     */
    rotateByDegrees(degrees) {
        return this.rotateByRadians((degrees * Math.PI) / 180);
    }
}
exports.Vector2 = Vector2;
function v2({ x, y }) {
    return new Vector2(x, y);
}
exports.v2 = v2;
