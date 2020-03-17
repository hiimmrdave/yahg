/* since grids use the terms "vertex" and "edge", those terms
   in a graph context will be called "node" and "link", respectively.
   ⬡
 */

const DIRECTIONS = [
    { q: 1, r: 0, s: -1 },
    { q: 1, r: -1, s: 0 },
    { q: 0, r: -1, s: 1 },
    { q: -1, r: 0, s: 1 },
    { q: -1, r: 1, s: 0 },
    { q: 0, r: 1, s: -1 }
  ],
  DIAGONALS = [
    { q: 2, r: -1, s: -1 },
    { q: 1, r: -2, s: 1 },
    { q: -1, r: -1, s: 2 },
    { q: -2, r: 1, s: 1 },
    { q: -1, r: 2, s: -1 },
    { q: 1, r: 1, s: -2 }
  ],
  //  HALF_PI = Math.PI / 2,
  PI_OVER_THREE = Math.PI / 3,
  //  PI_OVER_SIX = Math.PI / 6,
  SQRT_THREE = Math.sqrt(3);
//
function thousandthRound(n) {
  return Math.round(n * 1000) / 1000 + 0;
}

function lerp(m, n, t) {
  return m * (1 - t) + n * t;
}

class HexNode {
  constructor({ q, r, s = -q - r }) {
    this.q = q;
    this.r = r;
    this.s = s;
    this.id = `${q},${r},${s}`;
    this.links = new WeakMap();
  }

  equals({ id }) {
    return this.id === id;
  }
}

class Cell extends HexNode {
  constructor({ q, r, s = -q - r }) {
    super({ q, r, s });
    this.q = q + 0;
    this.r = r + 0;
    this.s = s + 0;
    this.id = `${q},${r},${s}`;
    this.type = "Cell";
    if (this.q + this.r + this.s != 0) {
      console.log("invalid coordinates");
    }
  }

  static plus(a, b) {
    return new Cell({
      q: a.q + b.q,
      r: a.r + b.r,
      s: a.s + b.s
    });
  }

  static minus(a, b) {
    return new Cell({
      q: a.q - b.q,
      r: a.r - b.r,
      s: a.s - b.s
    });
  }

  static times(cell, factor) {
    return new Cell({
      q: cell.q * factor,
      r: cell.r * factor,
      s: cell.s * factor
    });
  }

  get round() {
    const round = {
        q: Math.round(this.q),
        r: Math.round(this.r),
        s: Math.round(this.s)
      },
      offset = {
        q: Math.abs(this.q - round.q),
        r: Math.abs(this.r - round.r),
        s: Math.abs(this.s - round.s)
      };
    if (offset.q > offset.r && offset.q > offset.s) {
      round.q = -1 * round.r - round.s;
    } else if (offset.r > offset.s) {
      round.r = -1 * round.q - round.s;
    } else {
      round.s = -1 * round.q - round.r;
    }
    return new Cell(round);
  }

  // six cells neighboring this cell
  get cells() {
    return DIRECTIONS.map(function(vector) {
      return new Cell(Cell.plus(this, vector));
    }, this);
  }

  get diagonals() {
    return DIAGONALS.map(function(vector) {
      return new Cell(Cell.plus(this, vector));
    }, this);
  }

  // TODO sorta ugly
  // six vertices of this cell
  get vertices() {
    const vertCells = [
      this,
      this.cells[1],
      this.cells[3],
      this,
      this.cells[4],
      this.cells[0]
    ];
    let vert = -1;
    return vertCells.map(function(cell) {
      vert = -vert;
      return new Vert(cell, vert);
    });
  }

  // six edges of this cell
  get edges() {
    return DIRECTIONS.map(
      dir => new Edge(Cell.plus(this, Cell.times(dir, 0.5)))
    );
  }

  static distance(a, b) {
    return Cell.length(Cell.minus(a, b));
  }

  static length(cell) {
    return Math.max(Math.abs(cell.q), Math.abs(cell.r), Math.abs(cell.s));
  }

  // TODO fix this, don't be lazy
  static lerp(a, b, t) {
    return new Cell({
      q: lerp(a.q, b.q, t),
      r: lerp(a.r, b.r, t),
      s: lerp(a.s, b.s, t)
    }).round;
  }

  // TODO can this be written more functionally?
  static line(a, b) {
    const d = Cell.distance(a, b);
    const step = 1 / Math.max(d, 1);
    let cells = [];
    for (let i = 0; i <= step; i++) {
      cells.push(Cell.lerp(a, b, step * i));
    }
    return cells;
  }
}

class Vert extends HexNode {
  constructor({ q, r, s }, v) {
    super({ q, r, s });
    this.v = v;
    this.id = `${q},${r},${s},${v}`;
    this.type = "Vert";
    if (this.q + this.r + this.s != 0 || ![-1, 1].includes(this.v)) {
      console.log("invalid Vert");
    }
  }

  // returns the Cell that this Vert "belongs" to
  get cell() {
    return new Cell({ q: this.q, r: this.r, s: this.s });
  }

  /* 
  TODO: returns three Cells which share this Vert
  get cells () {
    return [
      this.cell,
      new Cell(),
      new Cell()
    ];
  }
  ...somehow */

  // returns three Verts that share edges with this Vert
  get vertices() {
    const { q, r, s, v } = this,
      negV = -1 * v,
      neighborOffset = v === 1 ? 0 : 3,
      cell = new Cell({ q, r, s }),
      [neighborA, neighborB] = cell.neighbors.slice(neighborOffset),
      diagonal = cell.diagonals[neighborOffset];
    return [
      new Vert(neighborA, negV),
      new Vert(neighborB, negV),
      new Vert(diagonal, negV)
    ];
  }

  /* 
  TODO: returns three Edges which have this Vert as an endpoint
  get edges () {
    return [
      new Edge(),
      new Edge(),
      new Edge()
    ];
  }
  ...somehow */
}

class Edge extends HexNode {
  constructor({ q, r, s }) {
    super({ q, r, s });
    this.type = "Edge";
  }

  /* 
  TODO: returns two cells which share this edge
  get cells () {
    return [
      new Cell(),
      new Cell()
    ];
  }
  ...somehow */

  /* 
  TODO: returns two vertices at endpoints of this edge
  get vertices () {
    return [
      new Vert(),
      new Vert()
    ];
  }
  ...somehow */

  /*  
  TODO: returns four edges which share an endpoint with this edge
  get edges () {
    return [
      new Edge(),
      new Edge(),
      new Edge(),
      new Edge()
    ];
  }
  ...somehow */
}

// eslint-disable-next-line no-unused-vars
class Grid {
  constructor({ shape = "hex", size = 2, order = 0 } = {}) {
    this.nodes = new Set();
    this.size = size;
    const VALID_SHAPES = ["hex", "tri", "para", "star", "empty"];
    if (VALID_SHAPES.includes(shape)) {
      this.shape = shape;
    } else {
      this.shape = "empty";
      console.log("invalid shape");
    }
    this.order = ["qrs", "qsr", "rqs", "rsq", "sqr", "srq"][order];
  }

  /*
  ! this is side-effecty and state-dependent
  */
  populate() {
    this[this.shape + "Grid"]();
    return this.nodes;
  }

  /*
  ! this is side-effecty
  */
  depopulate() {
    this.nodes.clear();
    return this.nodes;
  }

  /*
  ! this is side-effecty and state-dependent
  */
  addCell(a, b) {
    const ab = [a, b, -1 * a - b],
      ins = {
        q: ab[this.order.indexOf("q")],
        r: ab[this.order.indexOf("r")],
        s: ab[this.order.indexOf("s")]
      },
      cell = new Cell({ q: ins.q, r: ins.r, s: ins.s });
    this.nodes.add(cell);
    for (const vert of cell.vertices) {
      this.nodes.add(vert);
      cell.links.set(vert, { type: "hasVert" });
      vert.links.set(cell, { type: "hasCell" });
    }
    for (const edge of cell.edges) {
      this.nodes.add(edge);
      cell.links.set(edge, { type: "hasEdge" });
      edge.links.set(cell, { type: "hasCell" });
    }
  }
  /*
  TODO: these can all be improved?
  */

  hexGrid() {
    for (let ia = -this.size; ia <= this.size; ia++) {
      for (let ib = -this.size; ib <= this.size; ib++) {
        if (Math.abs(ia) + Math.abs(ib) + Math.abs(-ia - ib) < this.size * 2) {
          this.addCell(ia, ib);
        }
      }
    }
  }

  triGrid() {
    for (let ia = 0; ia <= this.size; ia++) {
      for (let ib = 0; ib <= this.size - ia; ib++) {
        this.addCell(ia, ib);
      }
    }
  }

  paraGrid() {
    for (let ia = 0; ia <= this.size; ia++) {
      for (let ib = 0; ib <= this.size; ib++) {
        this.addCell(ia, ib);
      }
    }
  }

  starGrid() {
    for (let ia = -this.size; ia <= this.size; ia++) {
      for (let ib = -this.size; ib <= this.size; ib++) {
        this.addCell(ia, ib);
        this.addCell(-ia - ib, ib);
        this.addCell(ia, -ia - ib);
      }
    }
  }
}

// * rendering specifics

class Point {
  constructor({ x, y }) {
    this.x = thousandthRound(x);
    this.y = thousandthRound(y);
  }
}

class Orientation {
  constructor({ theta = 0 } = {}) {
    this.f = {
      q: {
        x: thousandthRound(Math.sin(theta + PI_OVER_THREE) * SQRT_THREE),
        y: thousandthRound(Math.cos(theta + PI_OVER_THREE) * SQRT_THREE)
      },
      r: {
        x: thousandthRound(Math.sin(theta) * SQRT_THREE),
        y: thousandthRound(Math.cos(theta) * SQRT_THREE)
      }
    };
    /*
    TODO: this part doesn't work yet
    TODO: I have do do some geometry and linear algebra
    */
    this.b = {
      q: {
        x: thousandthRound((Math.cos(theta) * 2) / 3),
        y: thousandthRound((Math.sin(theta) * 2) / 3)
      },
      r: {
        x: thousandthRound((Math.cos(theta - 4 * PI_OVER_THREE) * 2) / 3),
        y: thousandthRound((Math.sin(theta - 4 * PI_OVER_THREE) * 2) / 3)
      }
    };
    this.v = {
      x: thousandthRound(Math.cos(theta)),
      y: thousandthRound(-1 * Math.sin(theta))
    };
  }
}

// eslint-disable-next-line no-unused-vars
class Layout {
  constructor({
    theta = 0,
    cellSize = new Point({ x: 50, y: 50 }),
    origin = new Point({ x: 0, y: 0 })
  } = {}) {
    this.orientation = new Orientation({ theta });
    this.size = cellSize;
    this.origin = origin;
  }

  nodeToPoint(c) {
    const o = this.orientation,
      x = (o.f.q.x * c.q + o.f.r.x * c.r) * this.size.x + this.origin.x,
      y = (o.f.q.y * c.q + o.f.r.y * c.r) * this.size.y + this.origin.y;
    return new Point({ x, y });
  }

  vertToPoint(v) {
    const o = this.orientation,
      x = o.v.x * this.size.x * v.v + this.nodeToPoint(v.cell).x,
      y = o.v.y * this.size.y * v.v + this.nodeToPoint(v.cell).y;
    return new Point({ x, y });
  }

  /* 
  TODO: return the point at the midpoint of an Edge
  this involves finding the correct relative coordinates of the edge in qrs space
  edgeToPoint ( e ) {
    return;
  }
  ...somehow
  */

  pointToCell(p) {
    const o = this.orientation,
      pt = new Point({
        x: (p.x - this.origin.x) / this.size.x,
        y: (p.y - this.origin.y) / this.size.y
      }),
      q = thousandthRound(o.b.q.x * pt.x + o.b.q.y * pt.y),
      r = thousandthRound(o.b.r.x * pt.x + o.b.r.y * pt.y),
      s = thousandthRound(-q - r);
    console.log({ p, pt, q, r, s });
    return new Cell({ q, r, s });
  }

  /*
  TODO: return the Vert nearest a given Point
  pointToVert ( p ) {
    return;
  }
  ...somehow */

  /*
  TODO: return the edge nearest a given Point
  pointToEdge ( e ) {
    return;
  }
  ...somehow */

  vertsToPoints(cell) {
    return cell.vertices.map(vert => this.vertToPoint(vert));
  }
}

class Renderer {
  constructor({ size = new Point({ x: 500, y: 500 }) } = {}) {
    this.size = size;
  }

  static cellPath(cell, layout) {
    const verts = layout.vertsToPoints(cell);
    let ret = verts.map(v => `L ${v.x},${v.y}`);
    ret.unshift(`M ${verts[5].x},${verts[5].y}`);
    return ret.join(" ") + " z";
  }
}

// eslint-disable-next-line no-unused-vars
class SVGRenderer extends Renderer {
  constructor({ id, size } = {}) {
    super({ size });
    this.context = document.getElementById(id);
    this.context.style.width = this.size.x;
    this.context.style.height = this.size.y;
  }

  static get svgns() {
    return "http://www.w3.org/2000/svg";
  }

  static svgElement(element) {
    return document.createElementNS(SVGRenderer.svgns, element);
  }

  static buildCell(cell, layout) {
    let path = SVGRenderer.svgElement("path");
    const center = layout.nodeToPoint(cell),
      attribs = [
        ["data-q", cell.q],
        ["data-r", cell.r],
        ["data-s", cell.s],
        ["d", Renderer.cellPath(cell, layout)]
      ],
      styles = {
        transformOrigin: `${center.x}px ${center.y}px`
      };
    for (const attrib of attribs) {
      path.setAttribute(attrib[0], attrib[1]);
    }
    path.classList.add("cell");
    Object.assign(path.style, styles);
    return path;
  }

  static labelNode(node, layout) {
    let text = SVGRenderer.svgElement("text");
    const center =
        node.type == "Vert"
          ? layout.vertToPoint(node)
          : layout.nodeToPoint(node),
      nodeColors = {
        Cell: "red",
        Edge: "blue",
        Vert: "green"
      },
      attribs = [
        ["data-q", node.q],
        ["data-r", node.r],
        ["data-s", node.s],
        ["text-anchor", "middle"],
        ["alignment-baseline", "middle"],
        ["fill", nodeColors[node.type]],
        ["x", center.x],
        ["y", center.y]
      ];
    for (const attrib of attribs) {
      text.setAttribute(attrib[0], attrib[1]);
    }
    text.appendChild(document.createTextNode(node.id));
    return text;
  }

  // TODO refactor to more functional style?
  render(grid, layout, debug = false) {
    grid.nodes.forEach(node => {
      if (node.type == "Cell") {
        this.context.appendChild(SVGRenderer.buildCell(node, layout));
      }
      if (["Edge", "Cell"].includes(node.type) && debug) {
        this.context.appendChild(SVGRenderer.labelNode(node, layout));
      }
      /*if (node.type == "Vert" && debug) {
        this.context.appendChild(SVGRenderer.labelNode(node, layout));
      }*/
    });
  }
}

// eslint-disable-next-line no-unused-vars
class CanvasRenderer extends Renderer {
  constructor({ id, size } = {}) {
    super({ size });
    this.canvas = document.getElementById(id);
    this.context = this.canvas.getContext("2d");
    this.canvas.width = size.x;
    this.canvas.height = size.y;
  }

  drawCell(cell, layout) {
    const path = new Path2D(Renderer.cellPath(cell, layout));
    this.context.stroke(path);
  }

  render(grid, layout, debug = false) {
    grid.nodes.forEach(node => {
      if (node.type == "Cell") {
        this.drawCell(node, layout);
      }
      if (debug) {
        console.log(node.id);
      }
    });
  }
}
