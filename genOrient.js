const svgns = "http://www.w3.org/2000/svg"
const svg = document.createElementNS(svgns,'svg');
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

function someCells(){
  let cells = [];
  for ( let aa = 0; aa < 5; aa++){
    for ( let bb = 0 ; bb < 5; bb++ ){
      cells.push([aa,bb]);
    }
  }
  return cells;
}
