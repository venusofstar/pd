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

/* ================= HOME ================= */
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>HONOR TV PH – Official Info</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

<meta name="description" content="HONOR TV PH official information page. App details, contact info, and community links.">
<meta name="robots" content="index, follow">

<style>
body {
  margin: 0;
  font-family: "Segoe UI", Arial, sans-serif;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
  color: #fff;
}

.container {
  max-width: 1000px;
  margin: auto;
}

/* PROFILE */
.profile {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 30px;
  background: linear-gradient(135deg, #ff512f, #dd2476);
  border-radius: 0 0 25px 25px;
}

.profile img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  margin-right: 20px;
}

.profile-info h1 {
  margin: 0;
  font-size: 32px;
}

.profile-info p {
  margin-top: 10px;
  font-size: 15px;
  opacity: 0.95;
}

/* SOCIAL */
.social-icons {
  margin-top: 15px;
}

.social-icons a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-right: 10px;
  border-radius: 50%;
  font-size: 20px;
  color: #fff;
  text-decoration: none;
  transition: 0.3s;
}

.social-icons a:hover {
  transform: scale(1.15);
}

.facebook { background: #1877f2; }
.youtube { background: #ff0000; }
.telegram { background: #0088cc; }

/* SECTION */
.section {
  background: rgba(255,255,255,0.12);
  margin: 25px 15px;
  padding: 25px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.section h2 {
  margin-top: 0;
  font-size: 24px;
  color: #ffeb3b;
}

/* APPS */
.apps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.app-card {
  background: linear-gradient(135deg, #00c6ff, #0072ff);
  border-radius: 18px;
  padding: 15px;
  text-align: center;
}

.app-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
}

.app-card h3 {
  margin: 12px 0;
}

.app-card a {
  display: inline-block;
  background: #ffeb3b;
  color: #000;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  text-decoration: none;
}

/* FOOTER */
footer {
  text-align: center;
  padding: 20px;
  font-size: 14px;
  opacity: 0.85;
}
</style>
</head>

<body>

<div class="container">

  <!-- PROFILE -->
  <div class="profile">
    <img src="https://w0.peakpx.com/wallpaper/237/224/HD-wallpaper-anonymous-anonymous-dont-dragon-logo-mask-touch.jpg" alt="HONOR TV PH Logo">

    <div class="profile-info">
      <h1>HONOR TV PH</h1>
      <p>
        Official information page for HONOR TV PH.<br>
        This website provides app details, updates, and community links only.
      </p>

      <div class="social-icons">
        <a href="https://www.facebook.com/share/1AtberUt5G/" class="facebook" target="_blank" rel="noopener">
          <i class="fab fa-facebook-f"></i>
        </a>
        <a href="https://youtube.com/@honortvph-s5k" class="youtube" target="_blank" rel="noopener">
          <i class="fab fa-youtube"></i>
        </a>
        <a href="https://t.me/+CeW6bOjbYTVlYWI1" class="telegram" target="_blank" rel="noopener">
          <i class="fab fa-telegram-plane"></i>
        </a>
      </div>
    </div>
  </div>

  <!-- ABOUT -->
  <div class="section">
    <h2>About</h2>
    <p>
      HONOR TV PH is an independent platform that shares application information and community updates.
      We do not host files directly on this website.
    </p>
  </div>

  <!-- APPS -->
  <div class="section">
    <h2>Applications</h2>

    <p style="font-size:14px;opacity:0.9;">
      ⚠️ Downloads are hosted on third-party services. Please review files before installing.
    </p>

    <div class="apps">

      <div class="app-card">
        <img src="https://i.imgur.com/C6CD0gF.jpeg" alt="HONOR TV VIP">
        <h3>HONOR TV VIP 1.2</h3>
        <a href="https://www.mediafire.com/file/pyw2denf9xp1xs2/HONOR_TV_%2528VIP%2529_1.2.apk/file" target="_blank" rel="noopener">View Download</a>
      </div>

      <div class="app-card">
        <img src="https://i.imgur.com/VJZ2zVL.png" alt="HONOR TV PH App">
        <h3>HONOR TV PH</h3>
        <a href="https://www.mediafire.com/file/cf314vqe9ovh9ez/HONOR_TV_PH.apk/file" target="_blank" rel="noopener">View Download</a>
      </div>

      <div class="app-card">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJ7MHfAy4aUvx6tWJ17dZtIlmnpXmgWRpwFq8Qe-oc13TOrd-IuPe2xU6p&s=10" alt="OTT TV">
        <h3>OTT TV</h3>
        <p style="font-size:14px;">Login Code: <b>6u7Tho</b></p>
        <a href="https://www.mediafire.com/file/xka22xxqt8pnhss/OTT_TV_1.7.2.2.apk/file" target="_blank" rel="noopener">View Download</a>
      </div>

    </div>
  </div>

  <!-- CONTACT -->
  <div class="section">
    <h2>Contact</h2>
    <p>📧 Email: <a href="mailto:honortvph@gmail.com" style="color:#ffeb3b;">honortvph@gmail.com</a></p>
    <p>📱 Community support is available via Facebook and Telegram.</p>
  </div>

  <!-- LEGAL -->
  <div class="section">
    <h2>Legal</h2>
    <p style="font-size:14px;">
      This site does not collect personal data and does not host files directly.
      All trademarks belong to their respective owners.
    </p>
  </div>

  <footer>
    © 2026 HONOR TV PH • All Rights Reserved
  </footer>

</div>

</body>
</html>
  `);
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
