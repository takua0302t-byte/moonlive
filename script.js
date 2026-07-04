let socket = null;
let reconnectTimer = null;

let fragments = 245;
const maxFragments = 500;
let timerInterval = null;
let moonGod = "---";

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

function connectSocket() {
  socket = new WebSocket("ws://localhost:3000");

  socket.onopen = () => {
    console.log("MoonLive connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "command") {
      executeCommand(data.command);
    }

    if (data.type === "sync") {
      applyState(data.state);
    }
  };

  socket.onclose = () => {
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectSocket, 1000);
  };
}

function sendState() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify({
    type: "update",
    state: {
      fragments,
      maxFragments,
      trial: getTrialText(),
      timer: getTimerText(),
      moonGod
    }
  }));
}

function applyState(state) {
  if (!state) return;

  if (typeof state.fragments === "number") {
    fragments = state.fragments;
    updateGauge(false);
  }

  if (state.trial) {
    setText("trialTitle", state.trial);
    setText("currentTrial", state.trial);
  }

  if (state.timer) {
    setText("trialTimer", "残り時間 " + state.timer);
    setText("timer", state.timer);
  }

  if (state.moonGod) {
    moonGod = state.moonGod;
    setText("moonGodName", moonGod);
    const board = document.getElementById("moonGodBoard");
    if (board && moonGod !== "---") board.classList.add("show");
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function getTrialText() {
  const el = document.getElementById("trialTitle") || document.getElementById("currentTrial");
  return el ? el.textContent : "月の導きを待機中";
}

function getTimerText() {
  const el = document.getElementById("trialTimer") || document.getElementById("timer");
  if (!el) return "--:--";
  return el.textContent.replace("残り時間", "").trim();
}

function randomPick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function updateGauge(shouldSend = true) {
  const gauge = document.getElementById("gaugeFill");
  const fragmentText = document.getElementById("fragments");

  const percent = Math.min((fragments / maxFragments) * 100, 100);

  if (gauge) gauge.style.width = percent + "%";
  if (fragmentText) fragmentText.textContent = fragments;

  if (shouldSend) sendState();

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

  setText("trialTitle", "月の導きを待機中");
  setText("currentTrial", "月の導きを待機中");
  setText("trialTimer", "残り時間 --:--");
  setText("timer", "--:--");

  sendState();
}

function setTrial(trial) {
  setText("trialTitle", trial.text);
  setText("currentTrial", trial.text);
  startTimer(trial.time);
  sendState();
}

function startTimer(seconds) {
  clearInterval(timerInterval);

  let remaining = seconds;

  function render() {
    const min = String(Math.floor(remaining / 60)).padStart(2, "0");
    const sec = String(remaining % 60).padStart(2, "0");
    const text = `${min}:${sec}`;

    setText("trialTimer", "残り時間 " + text);
    setText("timer", text);
  }

  render();

  timerInterval = setInterval(() => {
    remaining--;
    render();
    sendState();

    if (remaining <= 0) {
      clearInterval(timerInterval);
      setText("trialTimer", "残り時間 終了");
      setText("timer", "終了");
      setText("trialTitle", "試練終了");
      setText("currentTrial", "試練終了");
      sendState();
    }
  }, 1000);
}

function showPopup(title, name, text) {
  setText("popupTitle", title);
  setText("popupName", name);
  setText("popupText", text);

  const popup = document.getElementById("popup");
  if (!popup) return;

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

  setTimeout(() => star.remove(), 1600);
}

function smallGift(name = "月の民") {
  const trial = randomPick(smallTrials);
  setTrial(trial);

  showPopup("🌙 月の囁き", name, "小試練が発動\n" + trial.text);
}

function mediumGift(name = "月の民") {
  const trial = randomPick(mediumTrials);
  setTrial(trial);
  flashMoon();

  showPopup("🔔 月の試練", name, "月が強く輝いた\n" + trial.text);
}

function largeGift(name = "月の民") {
  createShootingStar();
  setTimeout(createShootingStar, 250);
  setTimeout(createShootingStar, 500);

  showRoulette(name);
}

function godGift(name = "月の民") {
  moonGod = name;
  playGodScene(name);

  setTimeout(() => {
    setText("moonGodName", moonGod);
    const board = document.getElementById("moonGodBoard");
    if (board) board.classList.add("show");
    sendState();
  }, 6200);
}

function showRoulette(name) {
  const roulette = document.getElementById("roulette");
  const rouletteText = document.getElementById("rouletteText");
  if (!roulette || !rouletteText) return;

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

  if (sceneName) sceneName.textContent = name;

  if (scene) {
    scene.classList.remove("show");
    void scene.offsetWidth;
    scene.classList.add("show");
  }

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

      setTimeout(() => particle.remove(), 2600);
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

function executeCommand(command) {
  const name = command.name || "月の民";

  if (command.type === "smallGift") smallGift(name);
  if (command.type === "mediumGift") mediumGift(name);
  if (command.type === "largeGift") largeGift(name);
  if (command.type === "godGift") godGift(name);
  if (command.type === "addFragments") addFragments(10);
  if (command.type === "resetMoon") resetMoon();
}

window.addEventListener("DOMContentLoaded", () => {
  updateGauge(false);
  connectSocket();
});
