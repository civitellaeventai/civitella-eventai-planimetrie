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

    const maxW = stage.width() * 0.92;
    const maxH = stage.height() * 0.88;
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

function addSymbol(label, icon, color) {
  counts[label] = (counts[label] || 0) + 1;
  updateLegend();

  const group = new Konva.Group({
    x: stage.width() / 2 - 45,
    y: stage.height() / 2 - 45,
    draggable: true,
    name: label
  });

  const circle = new Konva.Circle({
    x: 45,
    y: 35,
    radius: 30,
    fill: "white",
    stroke: color,
    strokeWidth: 4
  });

  const symbol = new Konva.Text({
    text: icon,
    x: 0,
    y: 13,
    width: 90,
    align: "center",
    fontSize: 28
  });

  const text = new Konva.Text({
    text: label,
    x: -15,
    y: 70,
    width: 120,
    align: "center",
    fontSize: 12,
    fill: "#111"
  });

  group.add(circle, symbol, text);
  group.on("click tap", () => selectNode(group));
  layer.add(group);
  selectNode(group);
}

document.querySelectorAll("[data-tool='symbol']").forEach(btn => {
  btn.addEventListener("click", () => {
    addSymbol(btn.dataset.label, btn.dataset.icon, btn.dataset.color);
  });
});

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
    dash: [10, 6]
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
    name: "Perimetro"
  });

  poly.on("click tap", () => showVertices(poly));
  poly.on("dragmove", () => showVertices(poly));

  layer.add(poly);
  counts["Perimetro"] = (counts["Perimetro"] || 0) + 1;
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

document.getElementById("arrowBtn").addEventListener("click", () => {
  const arrow = new Konva.Arrow({
    x: stage.width() / 2 - 80,
    y: stage.height() / 2,
    points: [0, 0, 180, 0],
    pointerLength: 20,
    pointerWidth: 20,
    stroke: "green",
    fill: "green",
    strokeWidth: 8,
    draggable: true,
    name: "Via di fuga"
  });

  arrow.on("click tap", () => selectNode(arrow));
  layer.add(arrow);
  selectNode(arrow);

  counts["Via di fuga"] = (counts["Via di fuga"] || 0) + 1;
  updateLegend();
});

document.getElementById("textBtn").addEventListener("click", () => {
  const value = document.getElementById("customText").value || "Testo";

  const group = new Konva.Group({
    x: stage.width() / 2 - 100,
    y: stage.height() / 2 - 35,
    draggable: true,
    name: "Testo"
  });

  group.add(new Konva.Rect({
    width: 210,
    height: 70,
    fill: "white",
    stroke: "#111",
    strokeWidth: 2,
    cornerRadius: 6
  }));

  group.add(new Konva.Text({
    text: value,
    width: 200,
    padding: 10,
    fontSize: 15,
    fill: "#111"
  }));

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
