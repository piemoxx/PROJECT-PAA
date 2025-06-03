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
            let r = pixels[index],
                g = pixels[index + 1],
                b = pixels[index + 2];

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
} <<
<<
<<
< Updated upstream

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

function isValidRoadTile(x, y) {
    const imageData = ctx.getImageData(x * TILE_SIZE, y * TILE_SIZE, 1, 1).data;
    const r = imageData[0],
        g = imageData[1],
        b = imageData[2];
    return r >= ROAD_COLOR_RANGE.min && r <= ROAD_COLOR_RANGE.max &&
        g >= ROAD_COLOR_RANGE.min && g <= ROAD_COLOR_RANGE.max &&
        b >= ROAD_COLOR_RANGE.min && b <= ROAD_COLOR_RANGE.max;
}

// A* pathfinding algorithm
// Algoritma pencarian jalur A* untuk menemukan jalur terpendek
function findPath(start, target) {
    // Priority queue using an array sorted by f-score
    const openSet = [{ x: start.x, y: start.y, path: [], g: 0, f: 0 }];
    const visited = new Set();

    // Calculate heuristic (Manhattan distance)
    function heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    while (openSet.length > 0) {
        // Sort by f-score and take the lowest
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();
        const key = `${current.x},${current.y}`;

        if (visited.has(key)) continue;
        visited.add(key);

        // Check if we're adjacent to target
        if ((Math.abs(current.x - target.x) === 1 && current.y === target.y) ||
            (Math.abs(current.y - target.y) === 1 && current.x === target.x)) {
            return current.path;
        }

        // Explore neighbors (up, down, left, right)
        const neighbors = [
            { x: current.x + 1, y: current.y }, // Right
            { x: current.x - 1, y: current.y }, // Left
            { x: current.x, y: current.y + 1 }, // Down
            { x: current.x, y: current.y - 1 }, // Up
        ];

        for (const neighbor of neighbors) {
            if (isValidRoadTile(neighbor.x, neighbor.y)) {
                // Calculate g score (cost from start)
                const g = current.g + 1;
                // Calculate f score (g + heuristic)
                const f = g + heuristic(neighbor, target);

                openSet.push({
                    x: neighbor.x,
                    y: neighbor.y,
                    path: [...current.path, neighbor],
                    g: g,
                    f: f
                });
            }
        }
    }

    return null; // No path found
}
function moveCourierToDestination() {
  let target = movingToSource ? source : destination;

  // Find a path to the target
  const path = findPath(courier, target);

  if (path && path.length > 0) {
    // Move to the next tile in the path
    const nextTile = path[0];
    courier.direction = getDirection(courier, nextTile);
    courier.x = nextTile.x;
    courier.y = nextTile.y;

    // Check if the courier is directly adjacent to the target (not diagonally)
    if ((Math.abs(courier.x - target.x) === 1 && courier.y === target.y) ||
        (Math.abs(courier.y - target.y) === 1 && courier.x === target.x)) {
      // Stop the courier
      clearInterval(movingInterval);

      // Adjust direction to face the flag
      setTimeout(() => {
        courier.direction = getDirection(courier, target);
        drawMap();
      }, 150);

      if (movingToSource) {
        notification.textContent = "Sampai di lokasi pengambilan. Mengambil paket...";
        setTimeout(() => {
          movingToSource = false;
          courier.hasPackage = true;
          // Restart the interval to continue moving to the destination
          movingInterval = setInterval(moveCourierToDestination, 250);
        }, 1000); // Menunggu berapa lama kurir berhenti di flag
      } else {
        notification.textContent = "Sampai di lokasi pengantaran. Mengantarkan paket...";
        setTimeout(() => {
          notification.textContent = "Pengiriman selesai!";
          startButton.disabled = true;
          showCelebration(); // Menampilkan animasi selesai pengiriman
        }, 1000); // 
      }
    } else {
      // Update notification to show progress
      notification.textContent = movingToSource
        ? "Kurir sedang menuju ke lokasi pengambilan"
        : "Kurir sedang menuju ke lokasi pengantaran";
    }
  } else {
    notification.textContent = "Tidak ada jalur yang tersedia!";
    clearInterval(movingInterval);
    return;
  }

  drawMap();
}

// Get the direction from the current position to the next position
function getDirection(current, next) {
  if (next.x > current.x) return "right";
  if (next.x < current.x) return "left";
  if (next.y > current.y) return "down";
  if (next.y < current.y) return "up";
  return "right"; // Default direction
}


// START: Animasi selesai
function showCelebration() {
  const celebrationContainer = document.getElementById('celebrationContainer');
  celebrationContainer.style.display = 'block';

  const successMessage = document.getElementById('successMessage');
  successMessage.style.display = 'block';

  createFireworks();
  createConfetti();

  document.getElementById('continueButton').addEventListener('click', () => {
    celebrationContainer.style.display = 'none';
    successMessage.style.display = 'none';
    celebrationContainer.innerHTML = '';
    randomizeButton.disabled = false;
  });
}

function createFireworks() {
  const container = document.getElementById('celebrationContainer');
  const colors = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'];

  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * (window.innerHeight / 2);

      for (let j = 0; j < 30; j++) {
        const particle = document.createElement('div');
        particle.className = 'firework';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        container.appendChild(particle);

        setTimeout(() => {
          if (container.contains(particle)) {
            container.removeChild(particle);
          }
        }, 1000);
      }
    }, i * 300);
  }
}

function createConfetti() {
  const container = document.getElementById('celebrationContainer');
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    const left = Math.random() * 100;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const delay = Math.random() * 3;

    confetti.style.left = `${left}%`;
    confetti.style.backgroundColor = color;
    confetti.style.animationDelay = `${delay}s`;

    container.appendChild(confetti);

    setTimeout(() => {
      if (container.contains(confetti)) {
        container.removeChild(confetti);
      }
    }, 4000 + delay * 1000);
  }
}
// END: Animasi selesai

startButton.addEventListener("click", () => {
  clearInterval(movingInterval);
  movingInterval = setInterval(moveCourierToDestination, 250);
  startButton.disabled = true;
  randomizeButton.disabled = true;
});

randomizeButton.addEventListener("click", () => {
  processMap();
});
document.getElementById("uploadImage").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      mapImage.src = event.target.result;
      mapImage.onload = () => {
        canvas.width = mapImage.width;
        canvas.height = mapImage.height;
        ctx.drawImage(mapImage, 0, 0);
        processMap();
      };
    };
    reader.readAsDataURL(file);
  }
});

loadDefaultMap();