const stage = new Konva.Stage({
  container: "stage-container",
  width: document.getElementById("stage-container").clientWidth,
  height: document.getElementById("stage-container").clientHeight
});

const layer = new Konva.Layer();
stage.add(layer);

let panMode = false;
let lastPanPos = null;

window.addEventListener("keydown", e => {
  if (e.code === "Space") {
    panMode = true;
    document.body.style.cursor = "grab";
    e.preventDefault();
  }
});

window.addEventListener("keyup", e => {
  if (e.code === "Space") {
    panMode = false;
    lastPanPos = null;
    document.body.style.cursor = "default";
  }
});

stage.on("wheel", e => {
  e.evt.preventDefault();

  const scaleBy = 1.025;
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();
  if (!pointer) return;

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale
  };

  const direction = e.evt.deltaY > 0 ? -1 : 1;
  let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
  newScale = Math.max(0.4, Math.min(4, newScale));

  stage.scale({ x: newScale, y: newScale });
  stage.position({
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale
  });

  stage.batchDraw();
});

stage.on("mousedown touchstart", () => {
  if (!panMode) return;
  lastPanPos = stage.getPointerPosition();
  document.body.style.cursor = "grabbing";
});

stage.on("mousemove touchmove", () => {
  if (!panMode || !lastPanPos) return;

  const pos = stage.getPointerPosition();
  if (!pos) return;

  stage.x(stage.x() + pos.x - lastPanPos.x);
  stage.y(stage.y() + pos.y - lastPanPos.y);

  lastPanPos = pos;
  stage.batchDraw();
});

stage.on("mouseup touchend mouseleave", () => {
  lastPanPos = null;
  if (panMode) document.body.style.cursor = "grab";
});

function getStagePointer() {
  const pointer = stage.getPointerPosition();
  if (!pointer) return null;

  const transform = stage.getAbsoluteTransform().copy();
  transform.invert();

  return transform.point(pointer);
}

let bg = null;
let selected = null;
let counts = {};
let polygonMode = false;
let polygonPoints = [];
let tempLine = null;
let vertexHandles = [];

const tr = new Konva.Transformer();
layer.add(tr);

const luogoSelect = document.getElementById("luogo");
const placeTitle = document.getElementById("placeTitle");

const outline = {
  shadowColor: "white",
  shadowBlur: 5,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowOpacity: 1
};

function updateLegend() {
  const box = document.getElementById("legendList");
  box.innerHTML = "";

  Object.keys(counts).forEach(k => {
    if (counts[k] > 0) {
      const row = document.createElement("div");
      row.className = "legend-item";
      row.innerHTML = `<span>${k}</span><b>x${counts[k]}</b>`;
      box.appendChild(row);
    }
  });
}

function loadImage(src) {
  const img = new Image();

  img.onload = () => {
    if (bg) bg.destroy();

    const maxW = stage.width() * 0.98;
    const maxH = stage.height() * 0.96;
    const scale = Math.min(maxW / img.width, maxH / img.height);

    bg = new Konva.Image({
      image: img,
      x: (stage.width() - img.width * scale) / 2,
      y: (stage.height() - img.height * scale) / 2,
      width: img.width * scale,
      height: img.height * scale,
      listening: true
    });

    layer.add(bg);
    bg.moveToBottom();
    layer.draw();
  };

  img.src = src;
}

function selectNode(node) {
  selected = node;
  tr.nodes([node]);
  hideVertices();
  layer.draw();
}

function getCenterPoint() {
  return getStagePointer() || {
    x: (stage.width() / 2 - stage.x()) / stage.scaleX(),
    y: (stage.height() / 2 - stage.y()) / stage.scaleY()
  };
}

function addArea(label, color, stroke, dashed = false) {
  counts[label] = (counts[label] || 0) + 1;
  updateLegend();

  const center = getCenterPoint();

  const rect = new Konva.Rect({
    x: center.x - 90,
    y: center.y - 55,
    width: 180,
    height: 100,
    fill: color,
    stroke: stroke,
    strokeWidth: 3,
    dash: dashed ? [10, 6] : [],
    draggable: true,
    name: label,
    ...outline
  });

  rect.on("click tap", () => selectNode(rect));
  layer.add(rect);
  selectNode(rect);
}

function addEstintore() {
  counts["Estintore"] = (counts["Estintore"] || 0) + 1;
  updateLegend();

  const center = getCenterPoint();

  const g = new Konva.Group({
    x: center.x,
    y: center.y,
    draggable: true,
    name: "Estintore",
    ...outline
  });

  g.add(new Konva.Rect({
    x: -13,
    y: -20,
    width: 26,
    height: 40,
    fill: "#e63946",
    stroke: "#990000",
    strokeWidth: 2,
    cornerRadius: 4
  }));

  g.add(new Konva.Text({
    text: "E",
    x: -10,
    y: -12,
    width: 20,
    align: "center",
    fill: "white",
    fontSize: 22,
    fontStyle: "bold"
  }));

  g.on("click tap", () => selectNode(g));
  layer.add(g);
  selectNode(g);
}

function addSoccorso() {
  counts["Punto primo soccorso"] = (counts["Punto primo soccorso"] || 0) + 1;
  updateLegend();

  const center = getCenterPoint();

  const g = new Konva.Group({
    x: center.x,
    y: center.y,
    draggable: true,
    name: "Punto primo soccorso",
    ...outline
  });

  g.add(new Konva.Rect({
    x: -22,
    y: -22,
    width: 44,
    height: 44,
    fill: "#1f9d55",
    cornerRadius: 5
  }));

  g.add(new Konva.Text({
    text: "+",
    x: -20,
    y: -22,
    width: 40,
    align: "center",
    fill: "white",
    fontSize: 40,
    fontStyle: "bold"
  }));

  g.on("click tap", () => selectNode(g));
  layer.add(g);
  selectNode(g);
}

function addWC() {
  counts["WC"] = (counts["WC"] || 0) + 1;
  updateLegend();

  const center = getCenterPoint();

  const g = new Konva.Group({
    x: center.x,
    y: center.y,
    draggable: true,
    name: "WC",
    ...outline
  });

  g.add(new Konva.Circle({
    x: 0,
    y: 0,
    radius: 25,
    fill: "#3a86ff",
    stroke: "#0b4f9c",
    strokeWidth: 2
  }));

  g.add(new Konva.Text({
    text: "WC",
    x: -24,
    y: -10,
    width: 48,
    align: "center",
    fill: "white",
    fontSize: 18,
    fontStyle: "bold"
  }));

  g.on("click tap", () => selectNode(g));
  layer.add(g);
  selectNode(g);
}

function addAccesso() {
  counts["Accessi principali"] = (counts["Accessi principali"] || 0) + 1;
  updateLegend();

  const center = getCenterPoint();

  const arrow = new Konva.Arrow({
    x: center.x - 70,
    y: center.y,
    points: [0, 0, 140, 0],
    pointerLength: 16,
    pointerWidth: 16,
    stroke: "#224ecf",
    fill: "#224ecf",
    strokeWidth: 6,
    pointerAtBeginning: true,
    draggable: true,
    name: "Accessi principali",
    ...outline
  });

  arrow.on("click tap", () => selectNode(arrow));
  layer.add(arrow);
  selectNode(arrow);
}

function addViaFuga() {
  counts["Vie di fuga"] = (counts["Vie di fuga"] || 0) + 1;
  updateLegend();

  const center = getCenterPoint();

  const arrow = new Konva.Arrow({
    x: center.x - 80,
    y: center.y,
    points: [0, 0, 170, 0],
    pointerLength: 20,
    pointerWidth: 20,
    stroke: "#168a2d",
    fill: "#168a2d",
    strokeWidth: 7,
    dash: [14, 8],
    draggable: true,
    name: "Vie di fuga",
    ...outline
  });

  arrow.on("click tap", () => selectNode(arrow));
  layer.add(arrow);
  selectNode(arrow);
}

document.getElementById("gazeboBtn").onclick = () =>
  addArea("Gazebo / Somministrazione", "rgba(128,0,255,0.20)", "#7b2cbf");

document.getElementById("palcoBtn").onclick = () =>
  addArea("Palco", "rgba(69,123,157,0.22)", "#457b9d");

document.getElementById("tavoliBtn").onclick = () =>
  addArea("Tavoli / Area consumo", "rgba(120,72,0,0.20)", "#7f5539", true);

document.getElementById("pubblicoBtn").onclick = () =>
  addArea("Area pubblico", "rgba(255,196,0,0.22)", "#f0a500", true);

document.getElementById("estintoreBtn").onclick = addEstintore;
document.getElementById("soccorsoBtn").onclick = addSoccorso;
document.getElementById("wcBtn").onclick = addWC;
document.getElementById("accessoBtn").onclick = addAccesso;
document.getElementById("arrowBtn").onclick = addViaFuga;

luogoSelect.addEventListener("change", () => {
  const option = luogoSelect.options[luogoSelect.selectedIndex];
  placeTitle.textContent = option.dataset.title;
  clearObjects();
  resetView();
  loadImage(luogoSelect.value);
});

document.getElementById("upload").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  placeTitle.textContent = "ORTOFOTO PERSONALIZZATA";

  const reader = new FileReader();
  reader.onload = ev => {
    clearObjects();
    resetView();
    loadImage(ev.target.result);
  };
  reader.readAsDataURL(file);
});

document.getElementById("polyBtn").addEventListener("click", () => {
  polygonMode = true;
  polygonPoints = [];
  hideVertices();

  if (tempLine) tempLine.destroy();

  tempLine = new Konva.Line({
    points: [],
    stroke: "red",
    strokeWidth: 3,
    dash: [10, 6],
    ...outline
  });

  layer.add(tempLine);
});

stage.on("click tap", e => {
  if (polygonMode) {
    const p = getStagePointer();
    if (!p) return;

    polygonPoints.push(p.x, p.y);
    tempLine.points(polygonPoints);
    layer.draw();
    return;
  }

  if (e.target === stage || e.target === bg) {
    tr.nodes([]);
    selected = null;
    hideVertices();
    layer.draw();
  }
});

document.getElementById("closePoly").addEventListener("click", () => {
  if (polygonPoints.length < 6) return;

  if (tempLine) tempLine.destroy();

  const poly = new Konva.Line({
    points: polygonPoints,
    closed: true,
    fill: "rgba(255,0,0,0.12)",
    stroke: "red",
    strokeWidth: 3,
    dash: [10, 6],
    draggable: true,
    name: "Perimetro manifestazione",
    ...outline
  });

  poly.on("click tap", () => showVertices(poly));
  poly.on("dragmove", () => showVertices(poly));

  layer.add(poly);

  counts["Perimetro manifestazione"] =
    (counts["Perimetro manifestazione"] || 0) + 1;

  updateLegend();

  polygonMode = false;
  polygonPoints = [];
  showVertices(poly);
});

function showVertices(poly) {
  selected = poly;
  tr.nodes([]);
  hideVertices();

  const pts = poly.points();

  for (let i = 0; i < pts.length; i += 2) {
    const h = new Konva.Circle({
      x: pts[i] + poly.x(),
      y: pts[i + 1] + poly.y(),
      radius: 7,
      fill: "red",
      stroke: "white",
      strokeWidth: 2,
      draggable: true
    });

    h.on("dragmove", () => {
      const newPts = poly.points().slice();
      newPts[i] = h.x() - poly.x();
      newPts[i + 1] = h.y() - poly.y();
      poly.points(newPts);
      layer.draw();
    });

    vertexHandles.push(h);
    layer.add(h);
  }

  layer.draw();
}

function hideVertices() {
  vertexHandles.forEach(v => v.destroy());
  vertexHandles = [];
}

document.getElementById("textBtn").addEventListener("click", () => {
  const value = document.getElementById("customText").value || "Testo";

  const text = new Konva.Text({
    text: value,
    fontSize: 16,
    fontStyle: "bold",
    fill: "#111",
    padding: 10
  });

  const boxWidth = text.width();
  const boxHeight = text.height();
  const center = getCenterPoint();

  const group = new Konva.Group({
    x: center.x - boxWidth / 2,
    y: center.y - boxHeight / 2,
    draggable: true,
    name: "Testo",
    ...outline
  });

  const rect = new Konva.Rect({
    width: boxWidth,
    height: boxHeight,
    fill: "white",
    stroke: "#111",
    strokeWidth: 2,
    cornerRadius: 6
  });

  group.add(rect);
  group.add(text);

  group.on("click tap", () => selectNode(group));

  layer.add(group);
  selectNode(group);
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  if (!selected) return;

  const name = selected.name();

  if (counts[name]) {
    counts[name]--;
    updateLegend();
  }

  selected.destroy();
  selected = null;
  tr.nodes([]);
  hideVertices();
  layer.draw();
});

function clearObjects() {
  layer.children.forEach(child => {
    if (child !== bg && child !== tr) child.destroy();
  });

  counts = {};
  updateLegend();
  selected = null;
  tr.nodes([]);
  hideVertices();
  layer.draw();
}

function resetView() {
  stage.position({ x: 0, y: 0 });
  stage.scale({ x: 1, y: 1 });
  stage.batchDraw();
}

document.getElementById("clearBtn").addEventListener("click", clearObjects);

document.getElementById("pdfBtn").addEventListener("click", async () => {
  tr.nodes([]);
  hideVertices();
  layer.draw();

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("portrait", "mm", "a4");

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 210, 297, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("PLANIMETRIA DELL'EVENTO", 105, 14, { align: "center" });

  pdf.setFontSize(13);
  pdf.text(placeTitle.textContent, 105, 23, { align: "center" });

  const oldX = stage.x();
  const oldY = stage.y();
  const oldScaleX = stage.scaleX();
  const oldScaleY = stage.scaleY();

  stage.position({ x: 0, y: 0 });
  stage.scale({ x: 1, y: 1 });
  stage.batchDraw();

  const cropX = bg.x();
  const cropY = bg.y();
  const cropW = bg.width();
  const cropH = bg.height();

  const img = stage.toDataURL({
    x: cropX,
    y: cropY,
    width: cropW,
    height: cropH,
    pixelRatio: 3
  });

  stage.position({ x: oldX, y: oldY });
  stage.scale({ x: oldScaleX, y: oldScaleY });
  stage.batchDraw();

  const boxX = 8;
  const boxY = 30;
  const boxW = 194;
  const boxH = 200;

  pdf.setDrawColor(30, 30, 30);
  pdf.setLineWidth(0.4);
  pdf.rect(boxX, boxY, boxW, boxH);

  const imgRatio = cropW / cropH;
  const boxRatio = boxW / boxH;

  let drawW, drawH, drawX, drawY;

  if (imgRatio > boxRatio) {
    drawW = boxW - 2;
    drawH = drawW / imgRatio;
    drawX = boxX + 1;
    drawY = boxY + (boxH - drawH) / 2;
  } else {
    drawH = boxH - 2;
    drawW = drawH * imgRatio;
    drawX = boxX + (boxW - drawW) / 2;
    drawY = boxY + 1;
  }

  pdf.addImage(img, "PNG", drawX, drawY, drawW, drawH);

  pdf.rect(8, 236, 94, 42);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("LEGENDA", 13, 245);

  let y = 254;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);

  Object.keys(counts).forEach(k => {
    if (counts[k] > 0 && y < 274) {
      pdf.text(`${k} x${counts[k]}`, 13, y);
      y += 5;
    }
  });

  pdf.rect(108, 236, 94, 42);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("NOTE", 113, 245);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);

  const note = document.getElementById("notes").value || "";
  pdf.text(pdf.splitTextToSize(note, 82), 113, 254);

  pdf.setFontSize(7.5);
  pdf.setTextColor(100);
  pdf.text("Documento allegato al dossier evento", 8, 288);
  pdf.text("Scala non rilevata", 170, 288);

  pdf.save("planimetria_evento.pdf");
});

loadImage(luogoSelect.value);
