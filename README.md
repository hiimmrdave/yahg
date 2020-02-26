# yahg

A pure javascript framework-in-progress to create and manipulate hexagonal grids using [graph](<https://en.wikipedia.org/wiki/Graph_(discrete_mathematics)>) concepts.

## using yahg

1. add a reference to graphTheory.js in the head.
1. Create an SVG element in an HTML document.
1. after the DOM is loaded, initialize new Grid, Layout, and SVGRenderer
1. use Grid.populate() and SVGRenderer.render() to display the grid

for now, refer to theorytest.js and graphTheory.html for examples

## status

- graphTheory.js is the current working code.
  - index.html and theorytest.js provide a demo
- this.css styles the html demos
- readme.md is severely behind
https://horsedreamer.github.io/yahg/index.html is a demo in browser

clicking the svg can give the x,y and q,r,s coordinates, but it's not right yet. specifically, x and y are correct, q is probably right, and r and s are wrong if you're not in orientation angle 0.
