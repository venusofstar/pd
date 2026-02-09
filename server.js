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
<title>Owner Profile</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Font Awesome for Icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

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
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid #fff;
  margin-right: 25px;
}

.profile-info h1 {
  margin: 0;
  font-size: 32px;
}

.profile-info p {
  margin-top: 10px;
  font-size: 16px;
  opacity: 0.95;
}

/* SOCIAL ICONS */
.social-icons {
  margin-top: 15px;
}

.social-icons a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  margin-right: 10px;
  border-radius: 50%;
  font-size: 20px;
  color: #fff;
  text-decoration: none;
  transition: 0.3s;
}

.social-icons a:hover {
  transform: scale(1.2);
}

.facebook { background: #1877f2; }
.youtube { background: #ff0000; }
.telegram { background: #0088cc; }

/* SECTIONS */
.section {
  background: rgba(255,255,255,0.12);
  margin: 25px 15px;
  padding: 25px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.section h2 {
  margin-top: 0;
  font-size: 26px;
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
  transition: 0.3s;
}

.app-card:hover {
  transform: translateY(-6px);
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

/* CONTACT */
.contact p {
  font-size: 16px;
  margin: 10px 0;
}

.contact a {
  color: #ffeb3b;
  text-decoration: none;
  font-weight: bold;
}

/* FOOTER */
footer {
  text-align: center;
  padding: 15px;
  opacity: 0.85;
}
</style>
</head>

<body>

<div class="container">

  <!-- PROFILE -->
  <div class="profile">
    <img src="https://w0.peakpx.com/wallpaper/237/224/HD-wallpaper-anonymous-anonymous-dont-dragon-logo-mask-touch.jpg" alt="Owner Photo">

    <div class="profile-info">
      <h1>HONOR TV PH</h1>
      <p>
       Always Available Subscription in VIP PLAYLIST Contact Me In My Facebook Page And Telegram
      </p>

      <div class="social-icons">
        <a href="https://www.facebook.com/share/1AtberUt5G/" class="facebook" target="_blank">
          <i class="fab fa-facebook-f"></i>
        </a>
        <a href="https://youtube.com/@honortvph-s5k" class="youtube" target="_blank">
          <i class="fab fa-youtube"></i>
        </a>
        <a href="https://t.me/+CeW6bOjbYTVlYWI1" class="telegram" target="_blank">
          <i class="fab fa-telegram-plane"></i>
        </a>
      </div>
    </div>
  </div>

  <!-- ABOUT -->
  <div class="section">
    <h2>About</h2>
    <p>
      This website is owned and maintained by <b>HONOR TV PH</b>.  
      I specialize in creating apps, websites, and digital platforms
      with a focus on speed, usability, and eye-catching design.
    </p>
  </div>

  <!-- APPS -->
  <div class="section">
    <h2>Apps</h2>

    <div class="apps">
      <div class="app-card">
        <img src="https://i.imgur.com/C6CD0gF.jpeg" alt="App 1">
        <h3>HONOR TV VIP 1.2</h3>
        <a href="https://www.mediafire.com/file/pyw2denf9xp1xs2/HONOR_TV_%2528VIP%2529_1.2.apk/file" target="_blank">Download</a>
      </div>

      <div class="app-card">
        <img src="https://i.imgur.com/VJZ2zVL.png" alt="App 2">
        <h3>HONOR TV PH</h3>
        <a href="https://www.mediafire.com/file/cf314vqe9ovh9ez/HONOR_TV_PH.apk/file" target="_blank">Download</a>
      </div>
    </div>
  </div>

  <!-- CONTACT -->
  <div class="section contact">
    <h2>Contact</h2>
    <p>📞 Phone: <a href="tel:+63XXXXXXXXXX">+63 *** *** ****</a></p>
    <p>📧 Gmail: <a href="mailto:honortvph@gmail.com">honortvph@gmail.com</a></p>
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
