import { SVGPathData } from "svg-pathdata";

interface IGraphics {
   lineTo(x: number, y: number): IGraphics;
   moveTo(x: number, y: number): IGraphics;
   bezierCurveTo(cpX: number, cpY: number, cpX2: number, cpY2: number, toX: number, toY: number): IGraphics;
   quadraticCurveTo(cpX: number, cpY: number, toX: number, toY: number): IGraphics;
   closePath(): IGraphics;
}

export function calculatePCA(points: [number, number][]): {
   mean: [number, number];
   eigenvalues: [number, number];
   eigenvectors: [[number, number], [number, number]];
} {
   if (points.length === 0) {
      throw new Error("No points provided");
   }

   // Calculate the mean of x and y
   let meanX = 0;
   let meanY = 0;
   for (const [x, y] of points) {
      meanX += x;
      meanY += y;
   }
   meanX /= points.length;
   meanY /= points.length;

   // Center the points
   const centered = points.map(([x, y]) => [x - meanX, y - meanY]);

   // Compute covariance matrix
   let covXX = 0;
   let covXY = 0;
   let covYY = 0;
   for (const [x, y] of centered) {
      covXX += x * x;
      covXY += x * y;
      covYY += y * y;
   }
   covXX /= points.length;
   covXY /= points.length;
   covYY /= points.length;

   // Covariance matrix: [[covXX, covXY], [covXY, covYY]]
   // Compute eigenvalues
   const trace = covXX + covYY;
   const det = covXX * covYY - covXY * covXY;
   const temp = Math.sqrt((trace * trace) / 4 - det);
   const eig1 = trace / 2 + temp;
   const eig2 = trace / 2 - temp;

   // Compute eigenvectors
   function getEigenvector(eig: number): [number, number] {
      // (covXX - eig) * v1 + covXY * v2 = 0
      // covXY * v1 + (covYY - eig) * v2 = 0
      if (Math.abs(covXY) > 1e-10) {
         // v = [eig - covYY, covXY]
         return [eig - covYY, covXY];
      }
      // If covXY is 0, the matrix is diagonal
      return [1, 0];
   }

   let v1 = getEigenvector(eig1);
   let v2 = getEigenvector(eig2);

   // Normalize eigenvectors
   function normalize([x, y]: [number, number]): [number, number] {
      const len = Math.hypot(x, y);
      return len === 0 ? [0, 0] : [x / len, y / len];
   }
   v1 = normalize(v1);
   v2 = normalize(v2);

   return {
      mean: [meanX, meanY] as [number, number],
      eigenvalues: [eig1, eig2],
      eigenvectors: [v1, v2], // Each is [x, y]
   };
}

export function calculateCentroid(points: [number, number][]): [number, number] {
   let rx = 0;
   let ry = 0;
   for (const [x, y] of points) {
      rx += x;
      ry += y;
   }
   return [rx / points.length, ry / points.length];
}

export function calculateArea(points: [number, number][]): number {
   // Shoelace formula for polygon area
   let area = 0;
   const n = points.length;
   if (n < 3) return 0;
   for (let i = 0; i < n; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[(i + 1) % n];
      area += x0 * y1 - x1 * y0;
   }
   return Math.abs(area) / 2;
}

export function calculateBounds(points: [number, number][]): [number, number, number, number] {
   let minX = Number.POSITIVE_INFINITY;
   let maxX = Number.NEGATIVE_INFINITY;
   let minY = Number.POSITIVE_INFINITY;
   let maxY = Number.NEGATIVE_INFINITY;
   for (const [x, y] of points) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
   }
   return [minX, minY, maxX, maxY];
}

export function drawSVGPath(path: string, g: IGraphics): void {
   let lastX = 0;
   let lastY = 0;
   new SVGPathData(path).commands.forEach((command) => {
      switch (command.type) {
         case SVGPathData.MOVE_TO: {
            if (command.relative) {
               lastX += command.x;
               lastY += command.y;
            } else {
               lastX = command.x;
               lastY = command.y;
            }
            g.moveTo(lastX, lastY);
            break;
         }
         case SVGPathData.HORIZ_LINE_TO: {
            if (command.relative) {
               lastX += command.x;
            } else {
               lastX = command.x;
            }
            g.lineTo(lastX, lastY);
            break;
         }
         case SVGPathData.VERT_LINE_TO: {
            if (command.relative) {
               lastY += command.y;
            } else {
               lastY = command.y;
            }
            g.lineTo(lastX, lastY);
            break;
         }
         case SVGPathData.LINE_TO: {
            if (command.relative) {
               lastX += command.x;
               lastY += command.y;
            } else {
               lastX = command.x;
               lastY = command.y;
            }
            g.lineTo(lastX, lastY);
            break;
         }
         case SVGPathData.CURVE_TO: {
            if (command.relative) {
               g.bezierCurveTo(
                  // First control point
                  lastX + command.x1,
                  lastY + command.y1,
                  // Second control point
                  lastX + command.x2,
                  lastY + command.y2,
                  // End point
                  lastX + command.x,
                  lastY + command.y,
               );
               lastX += command.x;
               lastY += command.y;
            } else {
               g.bezierCurveTo(
                  // First control point
                  command.x1,
                  command.y1,
                  // Second control point
                  command.x2,
                  command.y2,
                  // End point
                  command.x,
                  command.y,
               );
               lastX = command.x;
               lastY = command.y;
            }
            break;
         }
         case SVGPathData.SMOOTH_CURVE_TO: {
            if (command.relative) {
               g.bezierCurveTo(
                  lastX,
                  lastY,
                  lastX + command.x2,
                  lastY + command.y2,
                  lastX + command.x,
                  lastY + command.y,
               );
               lastX += command.x;
               lastY += command.y;
            } else {
               g.bezierCurveTo(lastX, lastY, command.x2, command.y2, command.x, command.y);
               lastX = command.x;
               lastY = command.y;
            }
            break;
         }
         case SVGPathData.QUAD_TO: {
            if (command.relative) {
               g.quadraticCurveTo(
                  lastX + command.x1,
                  lastY + command.y1,
                  lastX + command.x,
                  lastY + command.y,
               );
               lastX += command.x;
               lastY += command.y;
            } else {
               g.quadraticCurveTo(command.x1, command.y1, command.x, command.y);
               lastX = command.x;
               lastY = command.y;
            }
            break;
         }
         case SVGPathData.SMOOTH_QUAD_TO: {
            if (command.relative) {
               g.quadraticCurveTo(lastX, lastY, lastX + command.x, lastY + command.y);
               lastX += command.x;
               lastY += command.y;
            } else {
               g.quadraticCurveTo(lastX, lastY, command.x, command.y);
               lastX = command.x;
               lastY = command.y;
            }
            break;
         }
         case SVGPathData.CLOSE_PATH: {
            g.closePath();
            break;
         }
         default: {
            console.error("Unsupported SVG path command", command);
            break;
         }
      }
   });
}
