import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

/* ================= CONFIG ================= */

// Playlists
const playlist1URL = "https://hntv.netlify.app/pa-id.html";
const playlist2URL = "https://hntv.netlify.app/pa-id2.html";
const altStreamURL = "https://hntv.netlify.app/free-playlist";

// Forced headers
const FORCED_REFERER = "https://hntv.netlify.app/pa-id.html";

// Allowed OTT apps (ALL versions)
const ALLOWED_OTT_APPS = [
  "OTT TV",
  "OTT Navigator",
  "OTT Player"
];

// ✅ PRE-ALLOWED DEVICE IDs
let allowedDeviceIds = [
  "1fx95ew",
  "prkmm2"
];

// Detected devices
let detectedAgents = [];

// Last request info
let lastUA = "None";
let lastPlaylist = "None";

/* ================= HELPERS ================= */

function extractDeviceId(userAgent) {
  const match = userAgent.match(/;\s*([a-zA-Z0-9]{5,12})\)?$/);
  return match ? match[1] : "UNKNOWN";
}

function extractAppName(userAgent) {
  if (userAgent.includes("OTT TV")) return "OTT TV";
  if (userAgent.includes("OTT Navigator")) return "OTT Navigator";
  if (userAgent.includes("OTT Player")) return "OTT Player";
  return "UNKNOWN";
}

function isAllowedOTT(userAgent) {
  return ALLOWED_OTT_APPS.some(app => userAgent.includes(app));
}

/* ================= HOME ================= */

app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>HONOR TV PH</title>
    <style>
      body{
        margin:0;height:100vh;display:flex;justify-content:center;align-items:center;
        background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);
        font-family:Arial;color:#fff;text-align:center
      }
      .box{
        background:rgba(0,0,0,.45);padding:30px 40px;border-radius:16px;
        box-shadow:0 10px 30px rgba(0,0,0,.5);max-width:420px
      }
      h1{color:#00e5ff;margin:0}
    </style>
  </head>
  <body>
    <div class="box">
      <h1>📺 HONOR TV PH</h1>
      <p>Subscription Always Available</p>
    </div>
  </body>
  </html>
  `);
});

/* ================= PLAYLIST HANDLER ================= */

async function servePlaylist(req, res, ottURL, playlistName) {
  const userAgent = req.headers["user-agent"] || "Unknown UA";
  const deviceId = extractDeviceId(userAgent);
  const appName = extractAppName(userAgent);

  lastUA = userAgent;
  lastPlaylist = playlistName;

  // Track detected devices
  const found = detectedAgents.find(d => d.ua === userAgent);
  if (found) {
    found.count++;
    found.lastSeen = new Date().toLocaleString();
  } else {
    detectedAgents.push({
      ua: userAgent,
      app: appName,
      deviceId,
      count: 1,
      lastSeen: new Date().toLocaleString()
    });
  }

  // 🔐 ACCESS RULE
  const allowed =
    isAllowedOTT(userAgent) &&
    deviceId !== "UNKNOWN" &&
    allowedDeviceIds.includes(deviceId);

  const finalURL = allowed ? ottURL : altStreamURL;

  try {
    const response = await fetch(finalURL, {
      headers: {
        "User-Agent": userAgent,
        "Referer": FORCED_REFERER,
        "Origin": FORCED_REFERER
      }
    });

    if (!response.ok) {
      return res.status(response.status).send("Stream fetch error");
    }

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Access-Control-Allow-Origin", "*");
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
}

/* ================= PLAYLIST ROUTES ================= */

app.get("/playlist1.m3u", (req, res) =>
  servePlaylist(req, res, playlist1URL, "playlist1.m3u")
);

app.get("/playlist2.m3u", (req, res) =>
  servePlaylist(req, res, playlist2URL, "playlist2.m3u")
);

/* ================= DASHBOARD ================= */

app.get("/hrtvdashboard", (req, res) => {
  res.send(`
  <html>
  <head>
    <title>Customer Dashboard</title>
    <style>
      body{background:#111;color:#fff;font-family:Arial;padding:20px}
      .box{border:1px solid #333;padding:10px;margin-bottom:10px}
      button{padding:6px;cursor:pointer}
      .id{color:#00e5ff}
    </style>
  </head>
  <body>

    <h2>👤 Customer Dashboard</h2>

    <p><b>Last Playlist:</b> ${lastPlaylist}</p>
    <p><b>Last User-Agent:</b><br>${lastUA}</p>

    <h3>🔓 Allowed Device IDs</h3>
    ${
      allowedDeviceIds.length === 0
        ? "<p>No allowed devices yet</p>"
        : allowedDeviceIds.map(id => `
            <div class="box">
              📱 Device ID: <b class="id">${id}</b>
            </div>
          `).join("")
    }

    <h3>🕵️ Detected Devices</h3>
    ${
      detectedAgents.length === 0
        ? "<p>No detected devices yet</p>"
        : detectedAgents.map(d => `
          <div class="box">
            <b>App:</b> ${d.app}<br>
            <b>Device ID:</b> <span class="id">${d.deviceId}</span><br><br>
            <b>User-Agent:</b><br>${d.ua}<br><br>
            <b>Requests:</b> ${d.count}<br>
            <b>Last Seen:</b> ${d.lastSeen}<br><br>

            <form method="POST" action="/hrtvdashboard/allow-device">
              <input type="hidden" name="deviceId" value="${d.deviceId}">
              <button>✅ Allow Device</button>
            </form>
          </div>
        `).join("")
    }

  </body>
  </html>
  `);
});

/* ================= DASHBOARD ACTION ================= */

app.post("/hrtvdashboard/allow-device", (req, res) => {
  const { deviceId } = req.body;

  if (deviceId && !allowedDeviceIds.includes(deviceId)) {
    allowedDeviceIds.push(deviceId);
  }

  res.redirect("/hrtvdashboard");
});

/* ================= START ================= */

app.listen(PORT, () => {
  console.log(`✅ HONOR TV PH server running on port ${PORT}`);
});
