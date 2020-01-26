const inputs = document.querySelector('form[id="params"]'),
  iconSelect = document.querySelector('select[name="icon"]'),
  field = document.querySelector("#stest"),
  resetG = document.querySelector("#resetgraph"),
  showC = document.querySelector("#showcoords");

inputs.onchange = rend;
resetG.onclick = rend;
showC.onclick = showCoords;

var graph,
  layout,
  cells,
  sDoc,
  sSheet = new XMLHttpRequest();

sSheet.open("GET", "img/icons.svg", true);
sSheet.onload = () => {
  sDoc = sSheet.responseXML;
  let sID, sTitle, sOption, sName;
  const sSyms = sDoc.querySelectorAll("symbol");
  for (let sprite of sSyms) {
    sID = sprite.id;
    sOption = document.createElement("option");
    sOption.setAttribute("value", sID);
    sTitle = sprite.querySelector("title").textContent;
    sName = document.createTextNode(sTitle);
    sOption.appendChild(sName);
    iconSelect.appendChild(sOption);
  }
};
sSheet.send(null);

/* silly throb effect corrector
field.addEventListener("mouseover",(e)=>{
  if (!e.target.matches(".hex")) return;
  e.preventDefault();
  field.appendChild(e.target);
}, false); */

field.addEventListener(
  "click",
  e => {
    if (!e.target.matches(".hex")) return;
    let hex = e.target,
      q = hex.getAttribute("data-q"),
      r = hex.getAttribute("data-r"),
      s = hex.getAttribute("data-s"),
      qrs = { q: q, r: r, s: s };
    let icn = iconSelect.value;
    addIcon(icn, field, sDoc, qrs);
    return;
  },
  false
);

function addIcon(ic, sv, src, h) {
  const val = getForm();
  let shape = document.importNode(src.querySelector(`#${ic}`), true),
    myShape = document.createElementNS("http://www.w3.org/2000/svg", "g"),
    hC = layout.hexToPix(h),
    loc = `${h.q}.${h.r}.${h.s}`,
    curIcons = document.querySelectorAll(`g[data-loc="${loc}"]`),
    xSca = val.hexSize.x / 75,
    ySca = val.hexSize.y / 75,
    xOff = hC.x - 50 * xSca,
    yOff = hC.y - 50 * ySca;
  for (let thisIc of curIcons) {
    sv.removeChild(thisIc);
  }
  myShape.setAttribute(
    "transform",
    `translate(${xOff} ${yOff}) scale(${xSca},${ySca})`
  );
  myShape.setAttribute("data-loc", loc);
  for (const myNode of shape.childNodes) {
    if (myNode.nodeType == 1) {
      myShape.appendChild(myNode);
    }
  }
  myShape.setAttribute("class", ic);
  sv.appendChild(myShape);
}

function getForm() {
  this.shape = document.querySelector('input[name="shape"]:checked').value;
  this.size = parseInt(document.getElementById("gs1").value, 10);
  this.width = parseInt(document.getElementById("gs2").value, 10);
  this.order = parseInt(document.getElementById("order").value, 10);
  this.theta =
    parseFloat(document.getElementById("orientation").value, 10) *
    (Math.PI / 12);
  this.hexSize = {
    x: parseInt(document.getElementById("hsx").value, 10),
    y: parseInt(document.getElementById("hsy").value, 10)
  };
  this.origin = {
    x: parseInt(document.getElementById("orx").value, 10),
    y: parseInt(document.getElementById("ory").value, 10)
  };
  this.renderSize = {
    x: parseInt(document.getElementById("csx").value, 10),
    y: parseInt(document.getElementById("csy").value, 10)
  };
  return this;
}

function drawLine(a, b) {
  const myLine = Hex.line(a, b);
  for (const cell of myLine) {
    const thisHex = document.querySelector(
      `[data-q="${cell.q}"][data-r="${cell.r}"][data-s="${cell.s}"]`
    );
    thisHex.classList.add("redhex");
  }
}

function showCoords() {
  cells = field.querySelectorAll(".hex");
  for (const cell of cells) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const myCell = {
      q: cell.getAttribute("data-q"),
      r: cell.getAttribute("data-r"),
      s: cell.getAttribute("data-s")
    };
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("x", layout.hexToPix(myCell).x);
    text.setAttribute("y", layout.hexToPix(myCell).y);
    text.textContent = `${myCell.q}, ${myCell.r}, ${myCell.s}`;
    field.appendChild(text);
  }
}

function rend() {
  const val = getForm();
  graph = new Graph(val);
  layout = new Layout(val);
  const rsvgobj = {
    id: "stest",
    size: val.renderSize,
    graph: graph,
    layout: layout
  };
  let render = new RenderSVG(rsvgobj);
  let lastChild;
  while ((lastChild = field.lastChild)) field.removeChild(lastChild);
  render.render();
  return;
}

rend();

let canvRO = {
    id: "ctest",
    size: getForm().renderSize,
    graph: new Graph(getForm()),
    layout: new Layout(getForm())
  },
  canvRender = new RenderCanvas(canvRO);
canvRender.render();
