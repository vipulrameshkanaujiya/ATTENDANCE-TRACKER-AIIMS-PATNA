// Serverless polyfills for pdfjs-dist (used by pdf-parse)
// Vercel Node.js functions lack browser APIs like DOMMatrix

if (typeof globalThis.DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    constructor(_init?: any) {}
    static fromMatrix() { return new (globalThis as any).DOMMatrix(); }
    static fromFloat32Array() { return new (globalThis as any).DOMMatrix(); }
    static fromFloat64Array() { return new (globalThis as any).DOMMatrix(); }
    multiply() { return this; }
    translate() { return this; }
    scale() { return this; }
    rotate() { return this; }
    invertSelf() { return this; }
    transformPoint(p: any) { return p; }
  };
}

if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  };
}

if (typeof globalThis.Path2D === "undefined") {
  (globalThis as any).Path2D = class Path2D {
    moveTo() {}
    lineTo() {}
    closePath() {}
    rect() {}
    arc() {}
    bezierCurveTo() {}
    quadraticCurveTo() {}
  };
}

export {};