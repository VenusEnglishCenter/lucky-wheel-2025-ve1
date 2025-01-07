const sectors = [
  { color: "yellow", text: "red", label: "Lì xì 1.000.000", probability: 0.02 },
  { color: "red", text: "yellow", label: "Lì xì 800.000", probability: 0.05 },
  { color: "yellow", text: "red", label: "Lì xì 700.000", probability: 0.1 },
  { color: "red", text: "yellow", label: "Lì xì 500.000", probability: 0.2 },
  { color: "yellow", text: "red", label: "Lì xì 1.686.868", probability: 0.01 },
  { color: "red", text: "yellow", label: "Lì xì 300.000", probability: 0.62 },
];

const events = {
  listeners: {},
  addListener: function (eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(fn);
  },
  fire: function (eventName, ...args) {
    if (this.listeners[eventName]) {
      for (let fn of this.listeners[eventName]) {
        fn(...args);
      }
    }
  },
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector("#spin");
const resultEl = document.querySelector("#result");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;

const friction = 0.991;
let angVel = 0;
let ang = 0;

let spinButtonClicked = false;

// Hàm chọn mục tiêu dựa trên xác suất
function getIndexByProbability() {
  const expandedProbabilities = [];
  sectors.forEach((sector, index) => {
    let occurrences = Math.round(sector.probability * 100);

    // Thêm các mục vào mảng dựa trên xác suất
    for (let i = 0; i < occurrences; i++) {
      expandedProbabilities.push(index);
    }
  });

  const randomIndex = Math.floor(Math.random() * expandedProbabilities.length);
  return expandedProbabilities[randomIndex];
}

// Hàm xác định mục hiện tại dựa trên góc quay
function getIndexByAngle() {
  const index = Math.floor(tot - (ang / TAU) * tot) % tot;
  return index >= 0 ? index : index + tot;
}

// Vẽ từng sector
function drawSector(sector, i) {
  const ang = arc * i;
  ctx.save();

  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "center";
  ctx.fillStyle = sector.text;
  ctx.font = "bold 20px 'Lato', sans-serif";
  ctx.fillText(sector.label, rad * 0.6, 10);

  ctx.restore();
}

function rotate() {
  const index = getIndexByAngle();
  const sector = sectors[index];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

  spinEl.textContent = !angVel ? "SPIN" : sector.label;
  spinEl.style.background = sector.color;
  spinEl.style.color = sector.text;
}

function frame() {
  if (!angVel && spinButtonClicked) {
    const finalSector = sectors[getIndexByAngle()];
    events.fire("spinEnd", finalSector);
    spinButtonClicked = false;
    return;
  }

  angVel *= friction;
  if (angVel < 0.002) angVel = 0;
  ang += angVel;
  ang %= TAU;
  rotate();
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

function init() {
  sectors.forEach(drawSector);
  rotate();
  engine();

  spinEl.addEventListener("click", () => {
    if (!angVel) {
      const targetIndex = getIndexByProbability(); // Sử dụng xác suất để chọn mục tiêu
      const targetAngle = TAU * (tot - targetIndex) / tot;
      const spins = 3;
      angVel = rand(0.25, 0.35);
      ang = spins * TAU + targetAngle;
      console.log(`Target sector: ${sectors[targetIndex].label}`);
    }
    spinButtonClicked = true;
  });
}

init();

events.addListener("spinEnd", (sector) => {
  const resultMessage = `CHÚC MỪNG BẠN ĐÃ QUAY TRÚNG ${sector.label}`;
  console.log(resultMessage);
  resultEl.textContent = resultMessage;
  resultEl.style.display = "block";
});
