// since grids use the terms "vertex" and "edge", those terms
// in a graph context will be called "node" and "link", respectively.

const
  DIRECTIONS = [
    { q: 1, r: 0, s: -1 },
    { q: 1, r: -1, s: 0 },
    { q: 0, r: -1, s: 1 },
    { q: -1, r: 0, s: 1 },
    { q: -1, r: 1, s: 0 },
    { q: 0, r: 1, s: -1 }
  ],
  HALF_DIRECTIONS = [
    { q: 0.5, r: 0, s: -0.5 },
    { q: 0.5, r: -0.5, s: 0 },
    { q: 0, r: -0.5, s: 0.5 },
    { q: -0.5, r: 0, s: 0.5 },
    { q: -0.5, r: 0.5, s: 0 },
    { q: 0, r: 0.5, s: -0.5 }
  ],
  DIAGONALS =[
    { q: 2, r: -1, s: -1 },
    { q: 1, r: -2, s: 1 },
    { q: -1, r: -1, s: 2 },
    { q: -2, r: 1, s: 1 },
    { q: -1, r: 2, s: -1 },
    { q: 1, r: 1, s: -2 }
  ],
  HALF_PI = Math.PI / 2,
	PI_OVER_THREE = Math.PI / 3,
	PI_OVER_SIX = Math.PI / 6,
  SQRT_THREE = Math.sqrt(3);

function thousandthRound ( n ) {
	return Math.round( n * 1000 ) / 1000 + 0;
}

class HexNode {
  constructor () {
    this.id;
    this.links = new Set();
  }

  hasLink ( {id} ) {
    return this.links.has( id );
  }

  unlink ( {id} ) {
    if ( this.hasLink( {id} ) ){
      return false;
    }
    this.links.delete( id );
    return true;
  }

  link ( {id} ) {
    if ( this.hasLink( {id} ) ){
      return false;
    }
    this.links.add( id );
    return this.links;
  }

  equals ( {id} ) {
    return ( this.id === id );
  }
}

class Cell extends HexNode {
  constructor ( { q, r, s = -q-r } ) {
		super();
    this.q = q + 0;
    this.r = r + 0;
    this.s = s + 0;
    this.id = `${q},${r},${s}`;
    if ( this.q + this.r + this.s != 0 ) {
      console.log("invalid coordinates");
    }
    this.links = new Set();
  }

  plus ( {q,r,s} ) {
    return new Cell( {
      q: this.q + q,
      r: this.r + r,
      s: this.s + s
    } );
  }

  minus ( {q,r,s} ) {
    return new Cell( {
      q: this.q - q,
      r: this.r - r,
      s: this.s - s
    } );
  }

	times ( factor ) {
		return new Cell( {
			q: this.q * factor,
			r: this.r * factor,
			s: this.s * factor
		} );
	}

  get round () {
    const
      round = {
        q: Math.round( this.q ),
        r: Math.round( this.r ),
        s: Math.round( this.s )
      },
      offset = {
        q: Math.round( this.q - round.q ),
        r: Math.round( this.r - round.r ),
        s: Math.round( this.s - round.s )
      };
    if ( offset.q > offset.r && offset.q > offset.s ) {
      round.q = -1 * round.r - round.s;
    } else if ( offset.r > offset.s ) {
      round.r = -1 * round.q - round.s;
    } else {
      round.s = -1 * round.q - round.r;
    }
    return new Cell( round );
  }

  get cells () {
    // six cells neighboring this cell
    return DIRECTIONS.map(
      function (vector) {
        return new Cell( this.plus(vector) );
      }, this );
  }

  get diagonals () {
    return DIAGONALS.map(
      function (vector) {
        return new Cell( this.plus(vector) );
      }, this );
  }

  get vertices () {
    // six vertices of this cell
    const vertCells = [
      this,
      this.cells[1],
      this.cells[3],
      this,
      this.cells[4],
      this.cells[0]
    ];
    let vert = -1;
    return vertCells.map(
      function (cell) {
        vert = -vert;
        return new Vert( cell, vert );
    });
  }

  get edges () {
    // six edges of this cell
    return HALF_DIRECTIONS.map( ({ q, r, s }) => {
      q += this.q;
      r += this.r;
      s += this.s;
      return new Edge( {q, r, s} );
    });
  }

  distance ( cell ) {
    return 0;
  }

  length ( cell ) {
    return 0;
  }

  static lerp ( a, b, t ) {
    return new Cell( { q: 0, r: 0, s: 0 } );
  }

  static line ( a, b ) {
    return [];
  }
}

class Vert extends HexNode {
  constructor ({q,r,s},v) {
		super();
    this.q = q + 0;
    this.r = r + 0;
    this.s = s + 0;
    this.v = v;
    this.id = `${q},${r},${s},${v}`;
    if ( this.q + this.r + this.s != 0 || ![-1,1].includes(this.v)){
      console.log("invalid Vert");
    }
  }

  get cell () {
    return new Cell({ q: this.q, r: this.r, s: this.s });
  }

  get cells () {
    // three cells which share this vertex
    return [
      this.cell,
      ,

    ];
  }

  get vertices () {
    const { q, r, s, v } = this,
      negV = -1 * v,
      neighborOffset = ( v === 1 ) ? 0 : 3,
      cell = new Cell( { q, r, s } ),
      [ neighborA, neighborB ] = cell.neighbors.slice( neighborOffset ),
      diagonal = cell.diagonals[neighborOffset];
    return [
      new Vert( neighborA, negV ),
      new Vert( neighborB, negV ),
      new Vert( diagonal, negV )
    ];
  }

  get edges () {
    // three edges which have this vertex as an endpoint
    return [
      ,
      ,

    ];
  }
}

class Edge extends HexNode {
  constructor ( {q,r,s} ) {
		super();
    this.q = q;
    this.r = r;
    this.s = s;
    this.id = `${q},${r},${s}`;
  }

  get cells () {
    // two cells which share an edge
    return [
      new Cell(),
      new Cell()
    ];
  }

  get vertices () {
    // two vertices at endpoints of an edge
    return [
      new Vert(),
      new Vert()
    ];
  }

  get edges () {
    // four edges which share an endpoint with this edge
    return [
      ,
      ,
      ,

    ];
  }
}

class Graph {
  constructor () {
    this.nodes = new Set();
  }

  hasNode ( {id} ) {
    const hOP = this.hasOwnProperty( id ),
      sHV = this.nodes.has( id );
    return hOP && sHV;
  }

  addNode ( node ) {
    if ( this.hasNode(node) ) {
      console.log("node already exists in this map");
    }
    this[node.id] = node;
    this.nodes.add( node.id );
    return this[node.id];
  }

  removeNode ( {id} ) {
    if ( !this.hasNode( {id} ) ) {
      console.log("no such node");
      return false;
    }
    //remove links to node
    for ( const node of this.nodes ) {
      this[node].unlink( {id} );
      if ( this[id].links.size === 0 ) {
        if (this[node].id === id) {
          continue;
        }
        this.removeNode( this[node] );
      }
    }
    //remove node
    delete this[id];
    this.nodes.delete( id );
    return true;
  }
}

class Grid extends Graph {
  constructor ({ shape = "hex", size = 2, order = 0 } = {}) {
		super();
		this.size = size;
    const VALID_SHAPES = [ "hex", "tri", "para", "star", "empty" ];
    if ( VALID_SHAPES.includes( shape ) ) {
      this.shape = shape;
    } else {
      this.shape = "empty";
      console.log("invalid shape");
    }
		this.order = ["qrs","qsr","rqs","rsq","sqr","srq"][order];
  }

  populate () {
    const gridFunc = this.shape + "Grid";
    this[gridFunc]();
  }

	depopulate () {
		for ( const node of this.nodes ) {
			this.removeNode( this[node] );
		}
	}

  addCell ( a, b ) {
    const ab = [a, b, -1 * a - b],
			ins = {
				q: ab[this.order.indexOf("q")],
				r: ab[this.order.indexOf("r")],
				s: ab[this.order.indexOf("s")]
			},
      cell = new Cell( { q: ins.q, r: ins.r, s: ins.s } );
		if ( !this.hasNode( cell ) ) {
			this.addNode( cell );
		}
    for ( const vert of cell.vertices ){
      if ( !this.hasNode( vert ) ){
        this.addNode( vert );
      }
      cell.link( vert );
      vert.link( cell );
    }
  }

  hexGrid () {
    for ( let ia = -this.size; ia <= this.size; ia++ ) {
      for ( let ib = -this.size; ib <= this.size; ib++ ){
        if ( Math.abs(ia) + Math.abs(ib) + Math.abs(-ia-ib) < this.size * 2 ) {
          this.addCell( ia, ib );
        }
      }
    }
  }

  triGrid () {
		for ( let ia = 0; ia <= this.size; ia++ ) {
      for ( let ib = 0; ib <= this.size - ia; ib++ ) {
        this.addCell( ia, ib );
      }
    }
  }

  paraGrid () {
    for ( let ia = 0; ia <= this.size; ia++ ) {
      for ( let ib = 0; ib <= this.size; ib++ ) {
        this.addCell( ia, ib );
      }
    }
  }

  starGrid () {
    for ( let ia = -this.size; ia <= this.size; ia++ ) {
      for ( let ib = -this.size; ib <= this.size; ib++ ) {
        this.addCell( ia, ib );
        this.addCell( -ia-ib, ib );
        this.addCell( ia, -ia-ib );
      }
    }
  }
}

// rendering specifics

class Point {
  constructor ({x,y}) {
    this.x = thousandthRound(x);
    this.y = thousandthRound(y);
  }
}

class Orientation {
  constructor ( { theta = 0 } = {} ) {
    this.f = {
      q: {
        x: thousandthRound( Math.sin( theta + PI_OVER_THREE ) * SQRT_THREE ),
        y: thousandthRound( Math.cos( theta + PI_OVER_THREE ) * SQRT_THREE )
      },
      r: {
        x: thousandthRound( Math.sin( theta ) * SQRT_THREE ),
        y: thousandthRound( Math.cos( theta ) * SQRT_THREE )
      }
    };
	  this.b = {
      q: {
        x: thousandthRound( Math.cos( theta - 3 ) * -2/3 ),
        y: thousandthRound( Math.sin( theta - 3 ) * -2/3 )
      },
      r: {
        x: thousandthRound( Math.sin( theta - 1 ) * 2/3 ),
        y: thousandthRound( Math.cos( theta - 1 ) * 2/3 )
      }
    };
	  this.v = {
      x: thousandthRound( Math.cos( theta ) ),
      y: thousandthRound( -1 * Math.sin( theta ) )
    }
  }
}


class Layout {
  constructor ( {
		theta = 0,
		cellSize = new Point( { x: 50, y: 50 } ),
		origin = new Point( { x: 0, y: 0 } )
		} = {} ) {
    this.orientation = new Orientation({ theta });
    this.size = cellSize;
    this.origin = origin;
  }

  cellToPoint ( c ) {
    const o = this.orientation,
      x = (o.f.q.x * c.q + o.f.r.x * c.r) * this.size.x + this.origin.x,
      y = (o.f.q.y * c.q + o.f.r.y * c.r) * this.size.y + this.origin.y;
    return new Point( { x, y } );
  }

	vertToPoint ( v ) {
		const o = this.orientation,
			x = o.v.x * this.size.x * v.v + this.cellToPoint( v.cell ).x,
			y = o.v.y * this.size.y * v.v + this.cellToPoint( v.cell ).y;
		return new Point( { x, y })
	}

	edgeToPoint ( e ) {
		return;
	}

  pointToCell ( p ) {
    const o = this.orientation,
      pt = new Point( {
        x: ( p.x - this.origin.x ) / this.size.x,
        y: ( p.y - this.origin.y ) / this.size.y
      } ),
      q = pt.x * o.b.q.x + pt.y * o.b.q.y,
      r = pt.x * o.b.r.x + pt.y * o.b.r.y;
    return new Cell( { q, r, s: -q-r } );
  }

	pointToVert ( p ) {
		return;
	}

	pointToEdge ( e ) {
		return;
	}

	vertsToPoints ( cell ) {
		return cell.vertices.map(vert => this.vertToPoint(vert));
	}
}

class Renderer {
	constructor ( {
	id = "hg",
	size = new Point({ x: 500, y: 500 }),
	layout = new Layout(),
	grid = new Grid(),
	} = {} ) {
	this.size = size;
	this.grid = grid;
	this.layout = layout;
	this.context = document.getElementById( id );
	}

	cellPath ( cell ) {
		const verts = this.layout.vertsToPoints( cell )
		let ret = verts.map( v => `L ${v.x},${v.y}` );
		ret.unshift( `M ${verts[5].x},${verts[5].y}` )
		return ret.join( " " ) + " z";
	}
}

class SVGRenderer extends Renderer {
	constructor ( { id, size, grid, layout } = {} ) {
		super( { id, size, grid, layout })
		this.context.style.width = this.size.x;
		this.context.style.height = this.size.y;
	}

	static get svgns () {
		return "http://www.w3.org/2000/svg";
	}

	svgElement ( element ) {
		return document.createElementNS(SVGRenderer.svgns,element);
	}

	buildCell ( cell ) {
		let path = this.svgElement( "path" );
		const
			center = this.layout.cellToPoint( cell ),
			attribs = [
				[ "data-q", cell.q ],
				[ "data-r", cell.r ],
				[ "data-s", cell.s ],
				[ "d", this.cellPath( cell ) ]
			],
			styles = {
				transformOrigin: `${center.x}px ${center.y}px`
			};
		for ( const attrib of attribs ) {
			path.setAttribute( attrib[0], attrib[1] );
		}
		path.classList.add( "cell" );
		Object.assign( path.style, styles );
		return path;
	}

	render () {
		for ( const node of this.grid.nodes ) {
			if ( this.grid[node].constructor.name == "Cell" ){
				this.context.appendChild( this.buildCell( this.grid[node] ) );
			}
		}
	}
}
