import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// Stream URLs
const ottStreamURL = "https://hntv.netlify.app/free-playlist";
const altStreamURL = "https://pastebin.com/raw/YctRidwE";

// User-Agent list with NAMES
let allowedAgents = [
  { name: "OTT Navigator", ua: "OTT Navigator" },
  { name: "OTT Player", ua: "OTT Player" },
  { name: "OTT TV", ua: "OTT TV" }
];

let lastUserAgent = "None";

// Forced Referer
const FORCED_REFERER = "https://hntv.netlify.app/free-playlist";

/* ================= STREAM ================= */
app.get("/", async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  lastUserAgent = userAgent;

  const isAllowedOTTApp = allowedAgents.some(a =>
    userAgent.includes(a.ua)
  );

  const streamURL = isAllowedOTTApp ? ottStreamURL : altStreamURL;

  try {
    const response = await fetch(streamURL, {
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
});

/* ================= DASHBOARD ================= */
app.get("/dashboard", (req, res) => {
  res.send(`
  <html>
  <head>
    <title>OTT Dashboard</title>
    <style>
      body { background:#111;color:#fff;font-family:Arial;padding:20px }
      input,button{padding:6px;margin:3px}
      .box{border:1px solid #333;padding:10px;margin-bottom:10px}
    </style>
  </head>
  <body>
    <h2>📺 User-Agent Dashboard</h2>

    <p><b>Last Detected UA:</b><br>${lastUserAgent}</p>

    <h3>Allowed User-Agents</h3>

    ${allowedAgents.map((a, i) => `
      <div class="box">
        <form method="POST" action="/dashboard/edit">
          <input type="hidden" name="index" value="${i}">
          Name: <input name="name" value="${a.name}" required>
          UA: <input name="ua" value="${a.ua}" required>
          <button>✏️ Save</button>
        </form>
        <form method="POST" action="/dashboard/delete">
          <input type="hidden" name="index" value="${i}">
          <button>❌ Delete</button>
        </form>
      </div>
    `).join("")}

    <h3>Add New User-Agent</h3>
    <form method="POST" action="/dashboard/add">
      Name: <input name="name" required>
      UA: <input name="ua" required>
      <button>➕ Add</button>
    </form>

  </body>
  </html>
  `);
});

/* ================= ACTIONS ================= */
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
  console.log(`Server running on port ${PORT}`);
});
