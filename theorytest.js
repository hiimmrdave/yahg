const inputs = document.querySelector('form[id="params"]'),
  renderContext = document.querySelector("#hg");

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

function rend() {
  let lastChild;
  while ((lastChild = renderContext.lastChild)) {
    renderContext.removeChild(lastChild);
  }
  const { layout, grid, renderer } = makeGraph();
  grid.populate();
  renderer.render(grid, layout, getCheckbox("dbug"));
}
rend();

const sub = document.querySelector("#submain");
//const fback = document.querySelector("#st");

fetch("./img/icons.svg")
  .then(res => res.text())
  .then(
    text => new DOMParser().parseFromString(text, "image/svg+xml").firstChild
  )
  .then(doc => {
    sub.appendChild(doc);
  });
