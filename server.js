import express from "express";
import fetch from "node-fetch";
import admin from "firebase-admin";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

/* ================= FIREBASE ================= */
// Load your Firebase service account key JSON
const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/* ================= CONFIG ================= */
const playlist1URL = "https://hntv.netlify.app/pa-id.html";
const playlist2URL = "https://hntv.netlify.app/pa-id2.html";
const altStreamURL = "https://hntv.netlify.app/free-playlist";
const FORCED_REFERER = "https://hntv.netlify.app/pa-id.html";

/* ================= FIRESTORE HELPERS ================= */
async function getAllowedAgents() {
  const snap = await db.collection("allowedAgents").get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function saveDetectedUA(userAgent) {
  const ref = db.collection("detectedAgents").doc(encodeURIComponent(userAgent));
  const docSnap = await ref.get();

  if (docSnap.exists) {
    await ref.update({
      count: admin.firestore.FieldValue.increment(1),
      lastSeen: new Date().toLocaleString()
    });
  } else {
    await ref.set({
      ua: userAgent,
      count: 1,
      lastSeen: new Date().toLocaleString()
    });
  }
}

async function updateStats(playlist, ua) {
  await db.collection("stats").doc("last").set({
    lastPlaylist: playlist,
    lastUA: ua,
    time: new Date().toLocaleString()
  });
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

  await saveDetectedUA(userAgent);
  await updateStats(playlistName, userAgent);

  const allowedAgents = await getAllowedAgents();
  const allowed = allowedAgents.some(a => userAgent.includes(a.ua));
  const finalURL = allowed ? ottURL : altStreamURL;

  try {
    const response = await fetch(finalURL, {
      headers: {
        "User-Agent": userAgent,
        "Referer": FORCED_REFERER,
        "Origin": FORCED_REFERER
      }
    });

    if (!response.ok) return res.status(response.status).send("Stream fetch error");

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
app.get("/hrtvdashboard", async (req, res) => {
  const allowedAgents = await getAllowedAgents();
  const detectedSnap = await db.collection("detectedAgents").get();
  const detectedAgents = detectedSnap.docs.map(d => d.data());
  const statsDoc = await db.collection("stats").doc("last").get();
  const stats = statsDoc.exists ? statsDoc.data() : {};

  res.send(`
  <html>
  <head>
    <title>HONOR TV PH Dashboard</title>
    <style>
      body{background:#111;color:#fff;font-family:Arial;padding:20px}
      input,button{padding:6px;margin:4px}
      .box{border:1px solid #333;padding:10px;margin-bottom:10px}
      button{cursor:pointer}
    </style>
  </head>
  <body>

    <h2>👤 Customer dashboard</h2>

    <p><b>Last Playlist:</b> ${stats.lastPlaylist || "None"}</p>
    <p><b>Last User-Agent:</b><br>${stats.lastUA || "None"}</p>

    <h3>✅ Allowed User-Agents</h3>
    ${allowedAgents.map(a => `
      <div class="box">
        <form method="POST" action="/hrtvdashboard/edit">
          <input type="hidden" name="id" value="${a.id}">
          Name: <input name="name" value="${a.name}" required>
          UA: <input name="ua" value="${a.ua}" required>
          <button>💾 Save</button>
        </form>
        <form method="POST" action="/hrtvdashboard/delete">
          <input type="hidden" name="id" value="${a.id}">
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
        <b>UA:</b><br>${d.ua}<br>
        <b>Requests:</b> ${d.count}<br>
        <b>Last Seen:</b> ${d.lastSeen}
      </div>
    `).join("")}

  </body>
  </html>
  `);
});

/* ================= DASHBOARD ACTIONS ================= */
app.post("/hrtvdashboard/add", async (req, res) => {
  await db.collection("allowedAgents").add({
    name: req.body.name,
    ua: req.body.ua
  });
  res.redirect("/hrtvdashboard");
});

app.post("/hrtvdashboard/edit", async (req, res) => {
  const ref = db.collection("allowedAgents").doc(req.body.id);
  await ref.update({
    name: req.body.name,
    ua: req.body.ua
  });
  res.redirect("/hrtvdashboard");
});

app.post("/hrtvdashboard/delete", async (req, res) => {
  const ref = db.collection("allowedAgents").doc(req.body.id);
  await ref.delete();
  res.redirect("/hrtvdashboard");
});

/* ================= START ================= */
app.listen(PORT, () => {
  console.log(`✅ HONOR TV PH server running on port ${PORT}`);
});
