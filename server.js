import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

/* ================= CONFIG ================= */

// Playlists
const playlist1URL = "https://hntv.netlify.app/free-playlist";
const playlist2URL = "https://hntv.netlify.app/free-playlist2";
const altStreamURL = "https://pastebin.com/raw/YctRidwE";

// Forced headers
const FORCED_REFERER = "https://hntv.netlify.app/free-playlist";

// User-Agents WITH NAMES (editable)
let allowedAgents = [
  { name: "OTT Navigator", ua: "OTT Navigator" },
  { name: "OTT Player", ua: "OTT Player" },
  { name: "OTT TV", ua: "OTT TV" }
];

// Last request info
let lastUA = "None";
let lastPlaylist = "None";

/* ================= HOME ================= */
app.get("/", (req, res) => {
  res.send(`
    <h2>👋 Welcome</h2>
    <p>M3U Server is running</p>
    <ul>
      <li>/playlist1.m3u</li>
      <li>/playlist2.m3u</li>
      <li>/dashboard</li>
    </ul>
  `);
});

/* ================= PLAYLIST HANDLER ================= */
async function servePlaylist(req, res, ottURL, playlistName) {
  const userAgent = req.headers["user-agent"] || "";
  lastUA = userAgent;
  lastPlaylist = playlistName;

  const allowed = allowedAgents.some(a =>
    userAgent.includes(a.ua)
  );

  const finalURL = allowed ? ottURL : altStreamURL;

  try {
    const response = await fetch(finalURL, {
      headers: {
        "User-Agent": userAgent || "OTT Navigator",
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
  } catch {
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
app.get("/dashboard", (req, res) => {
  res.send(`
  <html>
  <head>
    <title>OTT Dashboard</title>
    <style>
      body { background:#111;color:#fff;font-family:Arial;padding:20px }
      input,button{padding:6px;margin:4px}
      .box{border:1px solid #333;padding:10px;margin-bottom:10px}
    </style>
  </head>
  <body>

    <h2>📊 User-Agent Dashboard</h2>

    <p><b>Last Playlist:</b> ${lastPlaylist}</p>
    <p><b>Last User-Agent:</b><br>${lastUA}</p>

    <h3>Allowed User-Agents</h3>

    ${allowedAgents.map((a, i) => `
      <div class="box">
        <form method="POST" action="/dashboard/edit">
          <input type="hidden" name="index" value="${i}">
          Name:
          <input name="name" value="${a.name}" required>
          UA:
          <input name="ua" value="${a.ua}" required>
          <button>💾 Save</button>
        </form>
        <form method="POST" action="/dashboard/delete">
          <input type="hidden" name="index" value="${i}">
          <button>❌ Delete</button>
        </form>
      </div>
    `).join("")}

    <h3>➕ Add New User-Agent</h3>
    <form method="POST" action="/dashboard/add">
      Name: <input name="name" required>
      UA: <input name="ua" required>
      <button>Add</button>
    </form>

  </body>
  </html>
  `);
});

/* ================= DASHBOARD ACTIONS ================= */
app.post("/dashboard/add", (req, res) => {
  allowedAgents.push({
    name: req.body.name,
    ua: req.body.ua
  });
  res.redirect("/dashboard");
});

app.post("/dashboard/edit", (req, res) => {
  const i = req.body.index;
  allowedAgents[i] = {
    name: req.body.name,
    ua: req.body.ua
  };
  res.redirect("/dashboard");
});

app.post("/dashboard/delete", (req, res) => {
  allowedAgents.splice(req.body.index, 1);
  res.redirect("/dashboard");
});

/* ================= START ================= */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
