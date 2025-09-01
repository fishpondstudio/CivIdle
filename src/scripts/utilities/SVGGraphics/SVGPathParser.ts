import { SVGPathData } from "svg-pathdata";

interface IGraphics {
   lineTo(x: number, y: number): IGraphics;
   moveTo(x: number, y: number): IGraphics;
   bezierCurveTo(cpX: number, cpY: number, cpX2: number, cpY2: number, toX: number, toY: number): IGraphics;
   quadraticCurveTo(cpX: number, cpY: number, toX: number, toY: number): IGraphics;
   closePath(): IGraphics;
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
