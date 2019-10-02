const
  // shape -- one of [ "hex", "tri", "para", "star", "empty" ]
  // size -- size of grid
  // order -- insertion order of hex coordinates
  gridParams = {
    size: 3,
    shape: "star"
  },
  grid = new Grid( gridParams ),

  // origin -- the x,y of the center of cell 0,0,0
  // theta -- the angle of rotation of the grid and cells
  // cellSize -- the x,y size of the cells
  layoutParams = {
    origin: new Point({ x: 250, y: 250 }),
    theta: 0,
    cellSize: new Point({ x:20, y: 20 })
  },
  layout = new Layout( layoutParams ),

  // id -- the html id of the rendering context (SVG only right now)
  // size -- the x,y size of the rendering element
  // layout -- the layout object to use for rendering
  // grid -- the grid to render
  rendParams = { layout, grid },
  renderer = new SVGRenderer( rendParams );

function rend () {
  let lastChild;
  while (lastChild = renderer.context.lastChild) {
    renderer.context.removeChild(lastChild)
  }
  renderer.render();
}
grid.populate();
renderer.render();
