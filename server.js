const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

let state = {
  fragments: 245,
  maxFragments: 500,
  trial: "月の導きを待機中",
  timer: "--:--",
  moonGod: "---"
};

function broadcast(payload) {
  const message = JSON.stringify(payload);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.send(JSON.stringify({
    type: "sync",
    state
  }));

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "command") {
        broadcast({
          type: "command",
          command: data.command
        });
      }

      if (data.type === "update") {
        state = {
          ...state,
          ...data.state
        };

        broadcast({
          type: "sync",
          state
        });
      }
    } catch (error) {
      console.log("Invalid message:", error.message);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(3000, () => {
  console.log("MoonLive Server 起動中");
  console.log("配信画面: http://localhost:3000/");
  console.log("操作画面: http://localhost:3000/control.html");
});