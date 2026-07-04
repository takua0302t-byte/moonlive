let fragments = 245;
const maxFragments = 500;
let moonGod = "---";
let timerInterval = null;

const smallTrials = [
  { text: "30秒間、片手操作", time: 30 },
  { text: "語尾に「🌙」をつける", time: 60 },
  { text: "10秒間その場で待機", time: 10 },
  { text: "次の判断はコメントに従う", time: 45 },
  { text: "1分間、強気プレイ", time: 60 }
];

const mediumTrials = [
  { text: "1分間、低感度プレイ", time: 60 },
  { text: "60秒間、徒歩縛り", time: 60 },
  { text: "次の試合で救助優先", time: 120 },
  { text: "1分間、索敵禁止", time: 60 },
  { text: "次のチェイスで板温存", time: 90 }
];

const rouletteTrials = [
  { text: "片手プレイ 60秒", time: 60 },
  { text: "コメント命令 1回", time: 60 },
  { text: "救助最優先", time: 120 },
  { text: "チェイス縛り", time: 90 },
  { text: "月神の選択", time: 120 },
  { text: "ノーリアクション縛り", time: 60 },
  { text: "全力で褒める縛り", time: 60 }
];

function getName() {
  return window.controlName || "月の民";
}

function randomPick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function updateGauge() {
  const gauge = document.getElementById("gaugeFill");
  const fragmentText = document.getElementById("fragments");

  const percent = Math.min((fragments / maxFragments) * 100, 100);

  gauge.style.width = percent + "%";
  fragmentText.textContent = fragments;

  if (fragments >= maxFragments) {
    fullMoonEvent();
  }
}

function addFragments(amount) {
  fragments += amount;
  if (fragments > maxFragments) fragments = maxFragments;
  updateGauge();
}

function resetMoon() {
  fragments = 0;
  updateGauge();

  document.getElementById("currentTrial").textContent = "月の導きを待機中";
  document.getElementById("timer").textContent = "--:--";
}

function setTrial(trial) {
  document.getElementById("currentTrial").textContent = trial.text;
  startTimer(trial.time);
}

function startTimer(seconds) {
  clearInterval(timerInterval);

  let remaining = seconds;
  const timer = document.getElementById("timer");

  function render() {
    const min = String(Math.floor(remaining / 60)).padStart(2, "0");
    const sec = String(remaining % 60).padStart(2, "0");
    timer.textContent = `${min}:${sec}`;
  }

  render();

  timerInterval = setInterval(() => {
    remaining--;
    render();

    if (remaining <= 0) {
      clearInterval(timerInterval);
      timer.textContent = "終了";
      document.getElementById("currentTrial").textContent = "試練終了";
    }
  }, 1000);
}

function showPopup(title, name, text) {
  const popup = document.getElementById("popup");

  document.getElementById("popupTitle").textContent = title;
  document.getElementById("popupName").textContent = name;
  document.getElementById("popupText").textContent = text;

  popup.classList.remove("show");
  void popup.offsetWidth;
  popup.classList.add("show");
}

function flashMoon() {
  const moon = document.getElementById("mainMoon");
  if (!moon) return;

  moon.classList.remove("flash");
  void moon.offsetWidth;
  moon.classList.add("flash");
}

function createShootingStar() {
  const star = document.createElement("div");
  star.className = "shooting-star";
  star.style.top = 80 + Math.random() * 420 + "px";
  star.style.left = "-220px";

  document.body.appendChild(star);

  setTimeout(() => {
    star.remove();
  }, 1600);
}

function smallGift() {
  const name = getName();
  const trial = randomPick(smallTrials);

  setTrial(trial);

  showPopup(
    "🌙 月の囁き",
    name,
    "小試練が発動\n" + trial.text
  );
}

function mediumGift() {
  const name = getName();
  const trial = randomPick(mediumTrials);

  setTrial(trial);
  flashMoon();

  showPopup(
    "🔔 月の試練",
    name,
    "月が強く輝いた\n" + trial.text
  );
}

function largeGift() {
  const name = getName();

  createShootingStar();
  setTimeout(createShootingStar, 250);
  setTimeout(createShootingStar, 500);

  showRoulette(name);
}

function godGift() {
  const name = getName();

  moonGod = name;
  playGodScene(name);

  setTimeout(() => {
    document.getElementById("moonGodName").textContent = moonGod;
    document.getElementById("moonGodBoard").classList.add("show");
  }, 6200);
}

function showRoulette(name) {
  const roulette = document.getElementById("roulette");
  const rouletteText = document.getElementById("rouletteText");

  roulette.classList.remove("show");
  void roulette.offsetWidth;
  roulette.classList.add("show");

  let count = 0;

  const interval = setInterval(() => {
    const temp = randomPick(rouletteTrials);
    rouletteText.textContent = temp.text;
    count++;

    if (count >= 22) {
      clearInterval(interval);

      const finalTrial = randomPick(rouletteTrials);
      rouletteText.textContent = "決定：" + finalTrial.text;

      setTrial(finalTrial);

      showPopup(
        "⭐ 月の審判",
        name,
        "流れ星が夜空を駆けた\n試練：" + finalTrial.text
      );
    }
  }, 110);
}

function playGodScene(name) {
  const scene = document.getElementById("godScene");
  const sceneName = document.getElementById("godSceneName");

  sceneName.textContent = name;

  scene.classList.remove("show");
  void scene.offsetWidth;
  scene.classList.add("show");

  createGodParticles();
}

function createGodParticles() {
  for (let i = 0; i < 85; i++) {
    setTimeout(() => {
      const particle = document.createElement("div");
      particle.className = "god-particle";

      particle.style.left = Math.random() * window.innerWidth + "px";
      particle.style.top = Math.random() * window.innerHeight + "px";

      document.body.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 2600);
    }, i * 36);
  }
}

function fullMoonEvent() {
  flashMoon();

  showPopup(
    "🌕 満月到達",
    "月の民",
    "みんなの応援で\n今宵の月が満ちた"
  );
}

function showGiftWindow() {
  const giftWindow = document.getElementById("giftWindow");
  if (!giftWindow) return;

  giftWindow.classList.remove("show");
  void giftWindow.offsetWidth;
  giftWindow.classList.add("show");
}

function createAmbientStars() {
  const layer = document.getElementById("ambientStars");
  if (!layer) return;

  layer.innerHTML = "";

  for (let i = 0; i < 75; i++) {
    const star = document.createElement("div");
    star.className = "star-dot";

    star.style.left = Math.random() * window.innerWidth + "px";
    star.style.top = Math.random() * window.innerHeight + "px";
    star.style.animationDelay = Math.random() * 3 + "s";
    star.style.animationDuration = 2.5 + Math.random() * 2.8 + "s";

    layer.appendChild(star);
  }
}

function createMoonOrb() {
  const layer = document.getElementById("moonParticles");
  if (!layer) return;

  const orb = document.createElement("div");
  orb.className = "moon-orb";

  const centerX = window.innerWidth / 2;

  orb.style.left = centerX - 45 + Math.random() * 90 + "px";
  orb.style.top = 70 + Math.random() * 140 + "px";
  orb.style.animationDuration = 3 + Math.random() * 2 + "s";

  layer.appendChild(orb);

  setTimeout(() => {
    orb.remove();
  }, 5200);
}

function createAmbientShootingStar() {
  if (Math.random() > 0.45) return;

  createShootingStar();
}

function startAmbientEffects() {
  createAmbientStars();

  setInterval(createMoonOrb, 760);
  setInterval(createAmbientShootingStar, 5200);
}

window.addEventListener("storage", (event) => {
  if (event.key !== "moonliveCommand") return;

  const command = JSON.parse(event.newValue);
  if (!command) return;

  executeControlCommand(command);
});

function executeControlCommand(command) {
  window.controlName = command.name || "月の民";

  if (command.type === "smallGift") smallGift();
  if (command.type === "mediumGift") mediumGift();
  if (command.type === "largeGift") largeGift();
  if (command.type === "godGift") godGift();
  if (command.type === "addFragments") addFragments(10);
  if (command.type === "resetMoon") resetMoon();
  if (command.type === "showGift") showGiftWindow();
}

window.addEventListener("DOMContentLoaded", () => {
  updateGauge();
  startAmbientEffects();
});