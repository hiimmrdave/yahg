# yahg
A pure javascript framework-in-progress to create and manipulate hexagonal grids using [graph](https://en.wikipedia.org/wiki/Graph_(discrete_mathematics) concepts.

## using yahg
1. add a reference to graphTheory.js in the head.
1. Create an SVG element in an HTML document.
1. after the DOM is loaded, initialize new Grid, Layout, and SVGRenderer
1. use Grid.populate() and SVGRenderer.render() to display the grid

for now, refer to theorytest.js and graphTheory.html for examples

## status
* graphTheory.js is the current working code.
  * graphTheory.html and theorytest.js provide a demo
* ajaxsheet.js and ajaxtest.html are learning how to include SVG icons
  * icons.css styles the SVG icons
* hexgraph.js is an earlier attempt which still contains useful concepts not yet implemented in newer version
  * correcttest.js, and index.html are the demo for hexgraph.js
* this.css styles the html demos
