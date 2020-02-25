const inputs = document.querySelector('form[id="params"]'),
  renderContext = document.querySelector("#hg"),
  fback = document.querySelector("#st"),
  sub = document.querySelector("#submain"),
  svgns = "http://www.w3.org/2000/svg";

inputs.onchange = rend;

function getIntValue(elementId) {
  return parseInt(document.getElementById(elementId).value, 10);
}
function getRadioValue(elementName) {
  return document.querySelector(`input[name="` + elementName + `"]:checked`)
    .value;
}
function getFloat(elementId) {
  return parseFloat(document.querySelector("#" + elementId).value, 10);
}
function getCheckbox(elementId) {
  return document.getElementById(elementId).checked;
}
function getForm() {
  const gridParams = {
      size: getIntValue("gs1"),
      shape: getRadioValue("shape"),
      order: getIntValue("order")
    },
    layoutParams = {
      origin: { x: getIntValue("orx"), y: getIntValue("ory") },
      theta: (getFloat("orientation") * Math.PI) / 12,
      cellSize: { x: getIntValue("hsx"), y: getIntValue("hsy") }
    },
    rendParams = {
      id: "hg",
      size: { x: getIntValue("csx"), y: getIntValue("csy") }
    };
  return { gridParams, layoutParams, rendParams };
}

let grid, renderer, layout;
function makeGraph() {
  const params = getForm();
  layout = new Layout(params.layoutParams);
  grid = new Grid(params.gridParams);
  renderer = new SVGRenderer(params.rendParams);
  return { layout, grid, renderer };
}

function createG() {
  return document.createElementNS(svgns, "g");
}
function createLine() {
  return document.createElementNS(svgns, "line");
}

function rend() {
  let lastChild;
  while ((lastChild = renderContext.lastChild)) {
    renderContext.removeChild(lastChild);
  }
  const { layout, grid, renderer } = makeGraph();
  grid.populate();
  renderer.render(grid, layout, getCheckbox("dbug"));
  let gridG = createG();
  gridG.id = "grid";
  gridG.setAttribute("stroke", "rgba(0,0,0,0.25)");
  for (let x = renderer.size.x; x >= 0; x -= 50) {
    let xline = createLine();
    let yline = createLine();
    xline.setAttribute("x1", x);
    xline.setAttribute("x2", x);
    xline.setAttribute("y1", 0);
    xline.setAttribute("y2", renderer.size.y);
    yline.setAttribute("y1", x);
    yline.setAttribute("y2", x);
    yline.setAttribute("x1", 0);
    yline.setAttribute("x2", renderer.size.x);
    gridG.appendChild(xline);
    gridG.appendChild(yline);
  }
  renderContext.appendChild(gridG);
}
rend();

renderContext.addEventListener("click", e => {
  //if (!e.target.matches(".cell")) { return; }
  let qrs = layout.pointToCell({ x: e.offsetX, y: e.offsetY });
  fback.innerHTML = `<p>${JSON.stringify(qrs)}</p>`;
});
