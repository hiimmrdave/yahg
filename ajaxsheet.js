var output = document.getElementById("output");
var target = document.getElementById("target");
var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
svg.setAttribute("width","1000");
svg.setAttribute("height","1000");
svg.setAttribute("viewBox","0 0 1000 1000");
var sheet = new XMLHttpRequest();
sheet.open("GET", "img/icons.svg", true);
sheet.onload = ()=>{
  let anIcon,iName,symChildren,xOff=0,yOff=0,icons = [];
  let svgDoc = sheet.responseXML;
  let svgSyms = svgDoc.querySelectorAll("symbol");
  for (let symbol of svgSyms){
    iName = symbol.id;
    symChildren = svgDoc.getElementById(iName).childNodes;
    anIcon = document.createElementNS("http://www.w3.org/2000/svg","g");
    anIcon.setAttribute("transform",`translate(${xOff},${yOff})`);
    anIcon.setAttribute("class",iName);
    for (let shape of symChildren){
      if (shape.nodeType == 1){
        anIcon.appendChild(shape)
      }
    }
    if (xOff < 900){ xOff += 100 } else { xOff = 0; yOff += 100}
    icons.push(iName);
    svg.appendChild(anIcon);
  }
  target.appendChild(svg);
  output.innerHTML = JSON.stringify(icons,null,"<br/>");
}
sheet.send(null);
