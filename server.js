const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

let state = {
  moon: 0,
  maxMoon: 500,
  trialName: "",
  trialEnd: 0
};

let clients = [];

function sendState() {
  const data = `data: ${JSON.stringify(state)}\n\n`;
  clients.forEach(res => res.write(data));
}

function serveFile(res, fileName, type) {
  fs.readFile(path.join(__dirname, fileName), (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });

    clients.push(res);
    res.write(`data: ${JSON.stringify(state)}\n\n`);

    req.on("close", () => {
      clients = clients.filter(c => c !== res);
    });
    return;
  }

  if (parsed.pathname === "/add") {
    state.moon = Math.min(state.maxMoon, state.moon + Number(parsed.query.amount || 0));
    sendState();
    res.end("ok");
    return;
  }

  if (parsed.pathname === "/reset") {
    state.moon = 0;
    sendState();
    res.end("ok");
    return;
  }

  if (parsed.pathname === "/startTrial") {
    state.trialName = parsed.query.name || "試練";
    const seconds = Number(parsed.query.seconds || 180);
    state.trialEnd = Date.now() + seconds * 1000;
    sendState();
    res.end("ok");
    return;
  }

  if (parsed.pathname === "/clearTrial") {
    state.trialName = "";
    state.trialEnd = 0;
    sendState();
    res.end("ok");
    return;
  }

  let filePath = parsed.pathname === "/" ? "/control.html" : parsed.pathname;
  filePath = filePath.replace("/", "");

  const ext = path.extname(filePath);
  serveFile(res, filePath, types[ext] || "text/plain");
});

server.listen(3000, () => {
  console.log("MoonLive System 起動中 → http://127.0.0.1:3000/control.html");
});