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

// Allowed User-Agents (editable)
let allowedAgents = [
  { name: "My OTT PLAYER", ua: "OTT Player/1.7.4.1 (Linux;Android 13; en; ewzbl4)" },
  { name: "My OTT NAVIGATOR", ua: "OTT Navigator/1.7.3.1 (Linux;Android 13; en; zdokxl)" },
  { name: "My OTT TV", ua: "OTT TV/1.7.2.2 (Linux;Android 13; en; 1mfhuaz)" }
];

// Detected User-Agents (auto)
let detectedAgents = [];

// Last request info
let lastUA = "None";
let lastPlaylist = "None";

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
  lastUA = userAgent;
  lastPlaylist = playlistName;

  // Save detected UA
  const found = detectedAgents.find(d => d.ua === userAgent);
  if (found) {
    found.count++;
    found.lastSeen = new Date().toLocaleString();
  } else {
    detectedAgents.push({
      ua: userAgent,
      count: 1,
      lastSeen: new Date().toLocaleString()
    });
  }

  const allowed = allowedAgents.some(a =>
    userAgent.includes(a.ua)
  );

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
    <title>Costumer</title>
    <style>
      body{background:#111;color:#fff;font-family:Arial;padding:20px}
      input,button{padding:6px;margin:4px}
      .box{border:1px solid #333;padding:10px;margin-bottom:10px}
      button{cursor:pointer}
    </style>
  </head>
  <body>

    <h2>👤 Customer dashboard</h2>

    <p><b>Last Playlist:</b> ${lastPlaylist}</p>
    <p><b>Last User-Agent:</b><br>${lastUA}</p>

    <h3>✅ Allowed User-Agents</h3>

    ${allowedAgents.map((a, i) => `
      <div class="box">
        <form method="POST" action="/hrtvdashboard/edit">
          <input type="hidden" name="index" value="${i}">
          Name:
          <input name="name" value="${a.name}" required>
          UA:
          <input name="ua" value="${a.ua}" required>
          <button>💾 Save</button>
        </form>
        <form method="POST" action="/hrtvdashboard/delete">
          <input type="hidden" name="index" value="${i}">
          <button>❌ Delete</button>
        </form>
      </div>
    `).join("")}

    <h3>➕ Add New Allowed UA</h3>
    <form method="POST" action="/hrtvdashboard/add">
      Name: <input name="name" required>
      UA: <input name="ua" required>
      <button>Add</button>
    </form>

    <h3>🕵️ Detected User-Agents</h3>

    ${detectedAgents.length === 0 ? "<p>No detected user-agents yet</p>" : ""}

    ${detectedAgents.map(d => `
      <div class="box">
        <b>UA:</b><br>${d.ua}<br><br>
        <b>Requests:</b> ${d.count}<br>
        <b>Last Seen:</b> ${d.lastSeen}
        <form method="POST" action="/hrtvdashboard/allow">
          <input type="hidden" name="ua" value="${d.ua}">
          <button>✅ Add to Allowed</button>
        </form>
      </div>
    `).join("")}

  </body>
  </html>
  `);
});

/* ================= DASHBOARD ACTIONS ================= */
app.post("/hrtvdashboard/add", (req, res) => {
  allowedAgents.push({
    name: req.body.name,
    ua: req.body.ua
  });
  res.redirect("/hrtvdashboard");
});

app.post("/hrtvdashboard/edit", (req, res) => {
  const i = req.body.index;
  allowedAgents[i] = {
    name: req.body.name,
    ua: req.body.ua
  };
  res.redirect("/hrtvdashboard");
});

app.post("/hrtvdashboard/delete", (req, res) => {
  allowedAgents.splice(req.body.index, 1);
  res.redirect("/hrtvdashboard");
});

app.post("/hrtvdashboard/allow", (req, res) => {
  const ua = req.body.ua;
  const exists = allowedAgents.some(a => a.ua === ua);
  if (!exists) {
    allowedAgents.push({
      name: "Detected Device",
      ua
    });
  }
  res.redirect("/hrtvdashboard");
});

/* ================= START ================= */
app.listen(PORT, () => {
  console.log(`✅ HONOR TV PH server running on port ${PORT}`);
});
