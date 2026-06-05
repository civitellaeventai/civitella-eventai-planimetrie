const stage = new Konva.Stage({
  container: "stage-container",
  width: document.getElementById("stage-container").clientWidth,
  height: document.getElementById("stage-container").clientHeight
});

const layer = new Konva.Layer();
stage.add(layer);

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

function addArea(label, color, stroke, dashed = false) {
  counts[label] = (counts[label] || 0) + 1;
  updateLegend();

  const rect = new Konva.Rect({
    x: stage.width() / 2 - 90,
    y: stage.height() / 2 - 55,
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

  const g = new Konva.Group({
    x: stage.width() / 2,
    y: stage.height() / 2,
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

  const g = new Konva.Group({
    x: stage.width() / 2,
    y: stage.height() / 2,
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

  const g = new Konva.Group({
    x: stage.width() / 2,
    y: stage.height() / 2,
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

  const arrow = new Konva.Arrow({
    x: stage.width() / 2 - 70,
    y: stage.height() / 2,
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

  const arrow = new Konva.Arrow({
    x: stage.width() / 2 - 80,
    y: stage.height() / 2,
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
  loadImage(luogoSelect.value);
});

document.getElementById("upload").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  placeTitle.textContent = "ORTOFOTO PERSONALIZZATA";

  const reader = new FileReader();
  reader.onload = ev => loadImage(ev.target.result);
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
    const p = stage.getPointerPosition();
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

  const group = new Konva.Group({
    x: stage.width() / 2 - boxWidth / 2,
    y: stage.height() / 2 - boxHeight / 2,
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

document.getElementById("clearBtn").addEventListener("click", clearObjects);

document.getElementById("pdfBtn").addEventListener("click", async () => {
  tr.nodes([]);
  hideVertices();
  layer.draw();

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("landscape", "mm", "a4");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("PLANIMETRIA DELL'EVENTO", 148, 15, { align: "center" });

  pdf.setFontSize(13);
  pdf.text(placeTitle.textContent, 148, 24, { align: "center" });

  const img = stage.toDataURL({ pixelRatio: 2 });
  pdf.addImage(img, "PNG", 10, 32, 205, 145);

  pdf.setFontSize(12);
  pdf.text("LEGENDA", 225, 36);

  let y = 46;

  Object.keys(counts).forEach(k => {
    if (counts[k] > 0) {
      pdf.setFont("helvetica", "normal");
      pdf.text(`${k} x${counts[k]}`, 225, y);
      y += 8;
    }
  });

  pdf.setFont("helvetica", "bold");
  pdf.text("NOTE", 225, 125);

  pdf.setFont("helvetica", "normal");
  const note = document.getElementById("notes").value || "";
  pdf.text(pdf.splitTextToSize(note, 60), 225, 134);

  pdf.save("planimetria_evento.pdf");
});

loadImage(luogoSelect.value);
