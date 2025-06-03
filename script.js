const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const notification = document.getElementById("notification");
const startButton = document.getElementById("startButton");
const randomizeButton = document.getElementById("randomizeButton");

let TILE_SIZE;
const ROAD_COLOR_RANGE = { min: 90, max: 150 };

let courier = { x: 0, y: 0, direction: "right", hasPackage: false };
let source = { x: 0, y: 0 };
let destination = { x: 0, y: 0 };
let mapImage = new Image();
let uploadedImage = null;
let movingInterval;
let roadPositions = [];
let nonRoadPositions = [];
let movingToSource = true;

// Muat gambar peta default
function loadDefaultMap() {
  mapImage.src = "assets/map.png"; // Untuk gambar peta default
  mapImage.onload = () => {
    canvas.width = 1000;
    canvas.height = 700;
    TILE_SIZE = Math.min(canvas.width / mapImage.width, canvas.height / mapImage.height) * 40;
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
    processMap();
  };
}

// Menentukan mana yang jalan dan bukan jalan
function processMap() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  roadPositions = [];
  nonRoadPositions = [];

  for (let y = 0; y < canvas.height; y += TILE_SIZE) {
    for (let x = 0; x < canvas.width; x += TILE_SIZE) {
      let index = (y * canvas.width + x) * 4;
      let r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];

      if (r >= ROAD_COLOR_RANGE.min && r <= ROAD_COLOR_RANGE.max &&
          g >= ROAD_COLOR_RANGE.min && g <= ROAD_COLOR_RANGE.max &&
          b >= ROAD_COLOR_RANGE.min && b <= ROAD_COLOR_RANGE.max) {
        roadPositions.push({ x: x / TILE_SIZE, y: y / TILE_SIZE });
      } else {
        nonRoadPositions.push({ x: x / TILE_SIZE, y: y / TILE_SIZE });
      }
    }
  }

  // console.log("Jalan:", roadPositions);
  // console.log("Bukan Jalan:", nonRoadPositions);

  placeEntities();
}
function placeEntities() {
  if (roadPositions.length < 1 || nonRoadPositions.length < 2) return;

  courier = roadPositions[Math.floor(Math.random() * roadPositions.length)];
  source = findNearestNonRoad(roadPositions[Math.floor(Math.random() * roadPositions.length)]);
  destination = findNearestNonRoad(roadPositions[Math.floor(Math.random() * roadPositions.length)]);
  movingToSource = true;

  drawMap();
  notification.textContent = "Menunggu kurir untuk memulai...";
  startButton.disabled = false;
  randomizeButton.disabled = false;
}
<<<<<<< Updated upstream

// Temukan posisi terdekat yang bukan jalan
function findNearestNonRoad(roadTile) {
  let candidates = nonRoadPositions.filter(pos =>
    Math.abs(pos.x - roadTile.x) <= 1 && Math.abs(pos.y - roadTile.y) <= 1
  );
  return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : nonRoadPositions[0];
}

function drawMap() {
  ctx.drawImage(mapImage, 0, 0);
  drawFlags();
  drawCourier();
}

function drawFlags() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(source.x * TILE_SIZE, source.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = "red";
  ctx.fillRect(destination.x * TILE_SIZE, destination.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function drawCourier() {
  ctx.save();
  ctx.translate((courier.x + 0.5) * TILE_SIZE, (courier.y + 0.5) * TILE_SIZE);
  let angle = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 }[courier.direction];
  ctx.rotate(angle);

  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.moveTo(-10, 15);
  ctx.lineTo(10, 15);
  ctx.lineTo(0, -15);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

