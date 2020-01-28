"use strict";

// some mathing that is handy with hexagons
const PI_OVER_THREE = Math.PI / 3,
  SQRT_3 = Math.sqrt(3),
  SQRT_THREE = SQRT_3,
  GRAPH_SHAPES = ["hex", "tri", "dia", "para", "star", "rect", "empty"];

// round to 3 decimal places, because that's plenty
function thousandthRound(n) {
  return Math.round(n * 1000) / 1000;
}

function orientation(t) {
  return {
    b: {
      q: {
        x: thousandthRound((Math.sin(t - 3) * -2) / 3),
        y: thousandthRound((Math.cos(t - 3) * -2) / 3)
      },
      r: {
        x: thousandthRound((Math.sin(t - 1) * 2) / 3),
        y: thousandthRound((Math.cos(t - 1) * 2) / 3)
      }
    },
    v: {
      x: thousandthRound(Math.cos(t)),
      y: thousandthRound(-1 * Math.sin(t))
    }
  };
}

// arrange graph on cartesian coordinate system
class Layout {
  constructor({ theta, hexSize, origin }) {
    this.orient = orientation(theta);
    this.size = hexSize;
    this.origin = origin;
  }
  hexToPix(h) {
    let R = this.orient,
      size = this.size,
      O = this.origin,
      x = (R.f.q.x * h.q + R.f.r.x * h.r) * size.x + O.x,
      y = (R.f.q.y * h.q + R.f.r.y * h.r) * size.y + O.y;
    return new Point(x, y);
  }
  pixToHex(p) {
    let R = this.orient,
      size = this.size,
      O = this.origin,
      pt = new Point((p.x - O.x) / size.x, (p.y - O.y) / size.y),
      q = R.b.q.x * pt.x + R.b.q.y * pt.y,
      r = R.b.r.x * pt.x + R.b.r.y * pt.y;
    return new Hex(q, r, -1 * r - q);
  }
  vertToPix(v) {
    let R = this.orient,
      size = this.size,
      hC = this.hexToPix(v.cell),
      x = R.v.x * size.x * v.v + hC.x,
      y = R.v.y * size.y * v.v + hC.y;
    return new Point(x, y);
  }
  vertsToPix(h) {
    return Hex.vertices(h).map(vert => this.vertToPix(vert));
  }
}

// shape is one of "hex", "tri", "dia", "para", "rect", "star"
class Graph {
  constructor({ shape, size, width, order }) {
    this.cells = [];
    this.verts = [];
    if (GRAPH_SHAPES.includes(shape)) {
      this.shape = shape;
    } else {
      throw "can't generate that shape";
    }
    this.long = size;
    this.wide = ["para", "rect"].includes(shape) ? width : size;
    // smells like a constant. HEX_INSERT_ORDERS. solve another way?
    this.order = ["qrs", "qsr", "rqs", "rsq", "sqr", "srq"][order];

    // set up a group of cells and insert them in the Graph
    // how does this even work? these variable names are a nightmare
    // this whole switch is a nightmare, really.
    switch (shape) {
      case "hex":
        for (let ia = -this.long; ia <= this.long; ia++) {
          let b1 = Math.max(-this.long, -ia - this.long),
            b2 = Math.min(this.long, -ia + this.long);
          for (let ib = b1; ib <= b2; ib++) {
            this.insHex(ia, ib);
          }
        }
        break;
      case "tri":
        for (let ia = 0; ia <= this.long; ia++) {
          for (let ib = 0; ib <= this.long - ia; ib++) {
            this.insHex(ia, ib);
          }
        }
        break;
      case "dia":
      case "para":
        for (let ia = 0; ia <= this.long; ia++) {
          for (let ib = 0; ib <= this.wide; ib++) {
            this.insHex(ia, ib);
          }
        }
        break;
      case "rect":
        for (let ia = 0; ia < this.long; ia++) {
          let aoff = ia >> 1;
          for (let ib = -aoff; ib < this.wide - aoff; ib++) {
            this.insHex(ia, ib);
          }
        }
        break;
      case "star":
        for (let ia = -this.long; ia <= this.long; ia++) {
          for (let ib = -this.long; ib <= this.long; ib++) {
            this.insHex(ia, ib);
            this.insHex(-ia - ib, ib);
            this.insHex(ia, -ia - ib);
          }
        }
        break;
      case "empty":
        break;
      default:
        console.log("nope");
    }

    // find the vertices of each cell and insert them in the Graph
    for (const cell of this.cells) {
      for (const vert of Hex.vertices(cell)) {
        this.insVert(vert);
      }
    }
  }
  // should this just be a constant? VALID_SHAPES?
  static get shapes() {
    return ["hex", "tri", "dia", "para", "rect", "empty"];
  }
  insHex(a, b) {
    let ab = [a, b, -1 * a - b],
      ins = {
        q: ab[this.order.indexOf("q")],
        r: ab[this.order.indexOf("r")],
        s: ab[this.order.indexOf("s")]
      },
      duplicate = this.cells.some(e => Hex.equals(e, ins));
    if (!duplicate) {
      this.cells.push(new Hex(ins.q, ins.r, ins.s));
    }
  }
  insVert(v) {
    let duplicate = this.verts.some(e => Vertex.equals(e, v));
    if (!duplicate) {
      this.verts.push(v);
    }
  }
}

// render graph as Canvas
class RenderCanvas extends Render {
  constructor({ id, size, graph, layout }) {
    super({ id, size, graph, layout });
    this.ctx = this.context.getContext("2d");
    this.context.width = size.x;
    this.context.height = size.y;
  }
  drawHex(hex) {
    const path = new Path2D(this.hexPath(hex));
    this.ctx.stroke(path);
  }
  render() {
    for (const cell of this.graph.cells) {
      this.drawHex(cell);
    }
  }
}
