import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

/* ================= CONFIG ================= */

const playlist1URL = "https://hntv.netlify.app/pa-id.html";
const playlist2URL = "https://hntv.netlify.app/pa-id2.html";
const altStreamURL = "https://hntv.netlify.app/free-playlist";

const FORCED_REFERER = "https://hntv.netlify.app/pa-id.html";

const ALLOWED_OTT_APPS = ["OTT TV", "OTT Navigator", "OTT Player"];

// ✅ Allowed devices with NAME
let allowedDevices = [
  { name: "Denis Yap #1", deviceId: "1fx95ew" },
  { name: "Denis Yap #2", deviceId: "prkmm2" }
];

let detectedAgents = [];
let lastUA = "None";
let lastPlaylist = "None";

/* ================= HELPERS ================= */

function extractDeviceId(ua) {
  const m = ua.match(/;\s*([a-zA-Z0-9]{5,12})\)?$/);
  return m ? m[1] : "UNKNOWN";
}

function extractAppName(ua) {
  if (ua.includes("OTT TV")) return "OTT TV";
  if (ua.includes("OTT Navigator")) return "OTT Navigator";
  if (ua.includes("OTT Player")) return "OTT Player";
  return "UNKNOWN";
}

function isAllowedOTT(ua) {
  return ALLOWED_OTT_APPS.some(app => ua.includes(app));
}

function isDeviceAllowed(deviceId) {
  return allowedDevices.some(d => d.deviceId === deviceId);
}

/* ================= HOME ================= */

app.get("/", (req, res) => {
  res.send(`<h1 style="color:#00e5ff;text-align:center">📺 HONOR TV PH</h1>`);
});

/* ================= PLAYLIST HANDLER ================= */

async function servePlaylist(req, res, ottURL, playlistName) {
  const ua = req.headers["user-agent"] || "";
  const deviceId = extractDeviceId(ua);
  const appName = extractAppName(ua);

  lastUA = ua;
  lastPlaylist = playlistName;

  const found = detectedAgents.find(d => d.ua === ua);
  if (found) {
    found.count++;
    found.lastSeen = new Date().toLocaleString();
  } else {
    detectedAgents.push({
      ua,
      app: appName,
      deviceId,
      count: 1,
      lastSeen: new Date().toLocaleString()
    });
  }

  const allowed =
    isAllowedOTT(ua) &&
    deviceId !== "UNKNOWN" &&
    isDeviceAllowed(deviceId);

  const finalURL = allowed ? ottURL : altStreamURL;

  try {
    const r = await fetch(finalURL, {
      headers: {
        "User-Agent": ua,
        "Referer": FORCED_REFERER,
        "Origin": FORCED_REFERER
      }
    });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    r.body.pipe(res);
  } catch {
    res.status(500).send("Server error");
  }
}

/* ================= ROUTES ================= */

app.get("/playlist1.m3u", (req, res) =>
  servePlaylist(req, res, playlist1URL, "playlist1")
);

app.get("/playlist2.m3u", (req, res) =>
  servePlaylist(req, res, playlist2URL, "playlist2")
);

/* ================= DASHBOARD ================= */

app.get("/hrtvdashboard", (req, res) => {
  res.send(`
  <html>
  <head>
    <title>Device Dashboard</title>
    <style>
      body{background:#111;color:#fff;font-family:Arial;padding:20px}
      .box{border:1px solid #333;padding:10px;margin-bottom:10px}
      input{padding:5px}
      button{padding:5px;cursor:pointer}
      .id{color:#00e5ff}
    </style>
  </head>
  <body>

  <h2>🔓 Allowed Devices</h2>

  ${allowedDevices.map((d,i)=>`
    <div class="box">
      <form method="POST" action="/device/edit">
        <input type="hidden" name="index" value="${i}">
        Name: <input name="name" value="${d.name}">
        Device ID: <input name="deviceId" value="${d.deviceId}">
        <button>💾 Save</button>
      </form>
      <form method="POST" action="/device/delete">
        <input type="hidden" name="index" value="${i}">
        <button>❌ Delete</button>
      </form>
    </div>
  `).join("")}

  <h3>➕ Add Device</h3>
  <form method="POST" action="/device/add">
    Name: <input name="name" required>
    Device ID: <input name="deviceId" required>
    <button>Add</button>
  </form>

  <h2>🕵️ Detected Devices</h2>

  ${detectedAgents.map(d=>`
    <div class="box">
      <b>App:</b> ${d.app}<br>
      <b>Device ID:</b> <span class="id">${d.deviceId}</span><br>
      <b>Requests:</b> ${d.count}<br>
      <b>Last Seen:</b> ${d.lastSeen}<br><br>

      <form method="POST" action="/device/allow">
        <input type="hidden" name="deviceId" value="${d.deviceId}">
        <input type="hidden" name="name" value="${d.app}">
        <button>✅ Allow Device</button>
      </form>
    </div>
  `).join("")}

  </body>
  </html>
  `);
});

/* ================= DASHBOARD ACTIONS ================= */

app.post("/device/add", (req,res)=>{
  allowedDevices.push({
    name: req.body.name,
    deviceId: req.body.deviceId
  });
  res.redirect("/hrtvdashboard");
});

app.post("/device/edit", (req,res)=>{
  const i = req.body.index;
  allowedDevices[i] = {
    name: req.body.name,
    deviceId: req.body.deviceId
  };
  res.redirect("/hrtvdashboard");
});

app.post("/device/delete", (req,res)=>{
  allowedDevices.splice(req.body.index,1);
  res.redirect("/hrtvdashboard");
});

app.post("/device/allow", (req,res)=>{
  if (!isDeviceAllowed(req.body.deviceId)) {
    allowedDevices.push({
      name: req.body.name,
      deviceId: req.body.deviceId
    });
  }
  res.redirect("/hrtvdashboard");
});

/* ================= START ================= */

app.listen(PORT, ()=>{
  console.log("✅ HONOR TV PH running on port", PORT);
});
