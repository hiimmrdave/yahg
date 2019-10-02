"use strict";

// some mathing that is handy with hexagons
const HALF_PI = Math.PI / 2,
  PI_OVER_THREE = Math.PI / 3,
  SQRT_3 = Math.sqrt(3),
  SQRT_THREE = SQRT_3,
  PI_OVER_SIX = Math.PI / 6,
  GRAPH_SHAPES = ["hex","tri","dia","para","star","rect","empty"];

// round to 3 decimal places, because that's plenty
function thousandthRound(n) {
	return Math.round(n * 1000) / 1000;
}

function orientation ( t ) {
  return {
    f: {
      q: {
        x: thousandthRound( Math.sin( t + PI_OVER_THREE ) * SQRT_THREE ),
        y: thousandthRound( Math.cos( t + PI_OVER_THREE ) * SQRT_THREE )
      },
      r: {
        x: thousandthRound( Math.sin( t ) * SQRT_THREE ),
        y: thousandthRound( Math.cos( t ) * SQRT_THREE )
      }
    },
    b: {
      q: {
        x: thousandthRound( Math.sin( t - 3 ) * -2/3 ),
        y: thousandthRound( Math.cos( t - 3 ) * -2/3 )
      },
      r: {
        x: thousandthRound( Math.sin( t - 1 ) * 2/3 ),
        y: thousandthRound( Math.cos( t - 1 ) * 2/3 )
      }
    },
    v: {
      x: thousandthRound( Math.cos(t) ),
      y: thousandthRound( -1 * Math.sin(t) )
    }
  };
}

// Do I need to destructure constructors?
// Do I care whether a "point" is a coordinate or a vector?
class Point {
	constructor (x,y) {
		this.x = thousandthRound(x);
		this.y = thousandthRound(y);
	}
}

class Hex {
	constructor (q, r, s) {
		this.q = q + 0;
		this.r = r + 0;
		this.s = s + 0;
	}

	// some useful hex vectors
	static get directionVectors () {
    return [
      new Hex(1, 0, -1),
      new Hex(1, -1, 0),
      new Hex(0, -1, 1),
	  	new Hex(-1, 0, 1),
      new Hex(-1, 1, 0),
      new Hex(0, 1, -1)
    ];
	}
  static get diagonalVectors () {
		return [
      new Hex(2, -1, -1),
      new Hex(1, -2, 1),
      new Hex(-1, -1, 2),
			new Hex(-2, 1, 1),
      new Hex(-1, 2, -1),
      new Hex(1, 1, -2)
    ];
	}
	static neighbors (h) {
		return Hex.directionVectors.map(dir => Hex.plus(h,dir));
	}
  static diagonals (h) {
    return Hex.diagonalVectors.map(diag => Hex.plus(h,diag));
  }
	static get nudge () {
		return new Hex(1e-6, 1e-6, -2e-6);
	}

	// definitions to compare and move between cells
	// TODO: rename all of these?
	static equals (a,b) {
		return (a.q == b.q && a.r == b.r && a.s == b.s);
	}
	static plus (a,b) {
		return new Hex(a.q + b.q, a.r + b.r, a.s + b.s);
	}
	static minus (a,b) {
		return new Hex(a.q - b.q, a.r - b.r, a.s - b.s);
	}
	static times (h,f) {
		return Hex.round(new Hex(h.q * f, h.r * f, h.s * f));
	}
	static len (h) {
		return Math.max(Math.abs(h.q), Math.abs(h.r), Math.abs(h.s));
	}
	static dist (a,b) {
		return Hex.len(Hex.minus(a,b));
	}
	// fix variable names
	static round (h) {
		let q = Math.round(h.q),
			r = Math.round(h.r),
			s =  Math.round(h.s),
			qOff = Math.abs(h.q - q),
			rOff = Math.abs(h.r - r),
			sOff = Math.abs(h.s - s);
		if (qOff > rOff && qOff > sOff){
			q = -r - s;
		} else if (rOff > sOff){
			r = -q - s;
		} else {
			s = -q - r;
		}
		return new Hex(q,r,s);
	}
	// destructure? fix variable names
	// this formula reduces floating-point error
	static lerp (a, b, t) {
		return new Hex(
			a.q * (1-t) + b.q * t,
			a.r * (1-t) + b.r * t,
			a.s * (1-t) + b.s * t
		)
	}
	// do this without ret? fix variable names
	static line (a,b) {
		let d = Hex.dist(a,b),
			ret = [],
			step = 1/Math.max(d,1),
			an = Hex.plus(a,Hex.nudge),
			bn = Hex.plus(b,Hex.nudge),
			ii = 0;
		for (; ii <= d; ii++){
			ret.push(Hex.round(Hex.lerp(an, bn, step * ii)));
		}
		return ret;
	}

	// TODO: implement other groups (hex, tri, para, rect)

	// fix variable names.
	static vertices (h) {
		const [n0, n1, ,n3, n4] = Hex.neighbors(h);
		return [
			new Vertex(h.q, h.r, h.s, 1),
			new Vertex(n1.q, n1.r, n1.s, -1),
			new Vertex(n3.q, n3.r, n3.s, 1),
			new Vertex(h.q, h.r, h.s, -1),
			new Vertex(n4.q, n4.r, n4.s, 1),
			new Vertex(n0.q, n0.r, n0.s, -1)
		];
	}
}

// define a vertex and methods for comparing and moving between vertices
class Vertex {
	constructor(q,r,s,v){
		this.q=q;
		this.r=r;
		this.s=s;
		this.v=v;
		console.assert([1,-1].includes(this.v),{err:"v must be 1 or -1"});
	}
	get cell () {
		return new Hex(this.q,this.r,this.s);
	}
	//change method names?
	static equals (a,b) {
		return (a.q == b.q && a.r == b.r && a.s == b.s && a.v == b.v);
	}
	// this method is a mess and won't work.
	static adjacentVerts (v) {
		let iOff = (v===1) ? 0 : 3,
      nV = -1*v.v;
		let a=Hex.diagonals(this.cell)[iOff];
		let b=Hex.neighbors(this.cell)[iOff];
		let c=Hex.neighbors(this.cell)[iOff+1];
		let vA = new Vertex(a.q,a.r,a.s,nV);
		let vB = new Vertex(b.q,b.r,b.s,nV);
		let vC = new Vertex(c.q,c.r,c.s,nV);
		return [vA,vB,vC];
	}
}

// arrange graph on cartesian coordinate system
class Layout {
	constructor({theta,hexSize,origin}){
		this.orient = orientation(theta);
		this.size = hexSize;
		this.origin = origin;
	}
	hexToPix(h){
		let R = this.orient,
			size = this.size,
			O = this.origin,
			x = (R.f.q.x * h.q + R.f.r.x * h.r) * size.x + O.x,
			y = (R.f.q.y * h.q + R.f.r.y * h.r) * size.y + O.y;
		return new Point(x,y);
	}
	pixToHex(p){
		let R = this.orient,
			size = this.size,
			O = this.origin,
			pt = new Point((p.x - O.x)/size.x, (p.y - O.y)/size.y),
			q = R.b.q.x * pt.x + R.b.q.y * pt.y,
			r = R.b.r.x * pt.x + R.b.r.y * pt.y;
		return new Hex(q,r,-1*r-q);
	}
	vertToPix(v){
		let R = this.orient, size = this.size,
			hC = this.hexToPix(v.cell),
			x = (R.v.x*size.x*v.v) + hC.x,
			y = (R.v.y*size.y*v.v) + hC.y;
		return new Point(x,y);
	}
	vertsToPix(h){
		return Hex.vertices(h).map(vert => this.vertToPix(vert));
	}
}

// shape is one of "hex", "tri", "dia", "para", "rect", "star"
class Graph {
	constructor ({shape, size, width, order}) {
		this.cells = [];
		this.verts = [];
		if(GRAPH_SHAPES.includes(shape)) {
			this.shape = shape;
		} else {
			throw "can't generate that shape";
		}
		this.long = size;
		this.wide = ["para","rect"].includes(shape) ? width : size;
		// smells like a constant. HEX_INSERT_ORDERS. solve another way?
		this.order = ["qrs","qsr","rqs","rsq","sqr","srq"][order];

		// set up a group of cells and insert them in the Graph
		// how does this even work? these variable names are a nightmare
		// this whole switch is a nightmare, really.
		switch (shape) {
			case "hex":
				for (let ia = -this.long; ia <= this.long; ia++){
					let b1 = Math.max(-this.long, -ia - this.long),
						b2 = Math.min(this.long, -ia + this.long);
					for (let ib = b1; ib <= b2; ib++){
						this.insHex(ia,ib);
					}
				}
				break;
			case "tri":
				for (let ia = 0; ia <= this.long; ia++){
					for (let ib = 0; ib <= this.long - ia; ib++){
						this.insHex(ia,ib);
					}
				}
				break;
			case "dia":
			case "para":
				for (let ia = 0; ia <= this.long; ia++){
					for (let ib = 0; ib <= this.wide; ib++){
						this.insHex(ia,ib);
					}
				}
				break;
			case "rect":
				for (let ia = 0; ia < this.long; ia++){
					let aoff = ia>>1;
					for (let ib = -aoff; ib < this.wide - aoff; ib++){
						this.insHex(ia,ib);
					}
				}
				break;
      case "star":
        for ( let ia = -this.long; ia <= this.long; ia++ ) {
          for ( let ib = -this.long; ib <= this.long; ib++ ) {
            this.insHex( ia, ib );
            this.insHex( -ia-ib, ib );
            this.insHex( ia, -ia-ib );
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
	static get shapes () {
		return ["hex","tri","dia","para","rect","empty"];
	}
	insHex (a,b) {
		let ab = [a, b, -1 * a - b],
			ins = {
				q: ab[this.order.indexOf("q")],
				r: ab[this.order.indexOf("r")],
				s: ab[this.order.indexOf("s")]
			},
			duplicate = this.cells.some(e => Hex.equals(e,ins));
		if (!duplicate) {
			this.cells.push(new Hex(ins.q, ins.r, ins.s));
		}
	}
	insVert (v) {
		let duplicate = this.verts.some(e => Vertex.equals(e,v));
		if (!duplicate) {
			this.verts.push(v);
		}
	}
}

// common methods for both renderers
class Render {
	constructor({id,size,graph,layout}){
		this.size = size;
		this.graph = graph;
		this.layout = layout;
		this.context = document.getElementById(id);
	}
	hexPath (hex) {
		const verts = this.layout.vertsToPix(hex);
		let ret = verts.map(v => `L ${v.x},${v.y}`);
		ret.unshift(`M ${verts[5].x},${verts[5].y}`);
		return ret.join(" ");
	}
}

// render graph as SVG
class RenderSVG extends Render {
	constructor ({id,size,graph,layout}){
		super({id,size,graph,layout});
		this.context.style.width=this.size.x;
		this.context.style.height=this.size.y;
	}
	buildPolygon (hex) {
		let polygon =
			document.createElementNS("http://www.w3.org/2000/svg","path");
		const attributes = [
				["data-q",hex.q],
				["data-r",hex.r],
				["data-s",hex.s],
				["d",this.hexPath(hex)]
			],
			styles = {
				transformOrigin:
					`${this.layout.hexToPix(hex).x}px ${this.layout.hexToPix(hex).y}px`
			};
		for (const attrib of attributes){
			polygon.setAttribute(attrib[0],attrib[1]);
		}
		polygon.classList.add("hex");
		Object.assign(polygon.style,styles);
		return polygon;
	}
	render () {
		for (const cell of this.graph.cells){
			this.context.appendChild(this.buildPolygon(cell));
		}
	}
}

// render graph as Canvas
class RenderCanvas extends Render {
	constructor ({id,size,graph,layout}){
		super({id,size,graph,layout});
		this.ctx = this.context.getContext('2d');
		this.context.width = size.x;
		this.context.height = size.y;
	}
	drawHex(hex){
		const path = new Path2D(this.hexPath(hex));
		this.ctx.stroke(path);
	}
	render() {
		for (const cell of this.graph.cells){
			this.drawHex(cell);
		}
	}
}
