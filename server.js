import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// Stream URLs
const ottStreamURL = "https://hntv.netlify.app/free-playlist";
const altStreamURL = "https://pastebin.com/raw/YctRidwE";

// Editable Allowed OTT User-Agents
let allowedAgents = [
  "OTT Navigator",
  "OTT Player",
  "OTT TV"
];

// Track last user agent
let lastUserAgent = "None";

// 🔒 Forced Referer
const FORCED_REFERER = "https://hntv.netlify.app/free-playlist";

/* ===========================
   STREAM ROUTE
=========================== */
app.get("/", async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  lastUserAgent = userAgent;

  const isAllowedOTTApp = allowedAgents.some(agent =>
    userAgent.includes(agent)
  );

  const streamURL = isAllowedOTTApp ? ottStreamURL : altStreamURL;

  try {
    const response = await fetch(streamURL, {
      headers: {
        "User-Agent": userAgent || "OTT Navigator",
        "Referer": FORCED_REFERER,
        "Origin": FORCED_REFERER,
        "Cache-Control": "no-cache"
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
});

/* ===========================
   DASHBOARD UI
=========================== */
app.get("/dashboard", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>OTT Dashboard</title>
        <style>
          body { font-family: Arial; background:#111; color:#fff; padding:20px }
          input, button { padding:6px }
          .ua { margin:5px 0 }
          button { margin-left:10px }
        </style>
      </head>
      <body>
        <h2>📺 OTT User-Agent Dashboard</h2>

        <p><b>Last Detected User-Agent:</b><br>${lastUserAgent}</p>

        <h3>Allowed User-Agents</h3>
        ${allowedAgents.map(ua => `
          <div class="ua">
            ${ua}
            <form method="POST" action="/dashboard/delete" style="display:inline">
              <input type="hidden" name="ua" value="${ua}">
              <button>❌ Remove</button>
            </form>
          </div>
        `).join("")}

        <h3>Add New User-Agent</h3>
        <form method="POST" action="/dashboard/add">
          <input name="ua" placeholder="New User-Agent" required>
          <button>➕ Add</button>
        </form>
      </body>
    </html>
  `);
});

/* ===========================
   DASHBOARD ACTIONS
=========================== */
app.post("/dashboard/add", (req, res) => {
  const ua = req.body.ua;
  if (ua && !allowedAgents.includes(ua)) {
    allowedAgents.push(ua);
  }
  res.redirect("/dashboard");
});

app.post("/dashboard/delete", (req, res) => {
  allowedAgents = allowedAgents.filter(ua => ua !== req.body.ua);
  res.redirect("/dashboard");
});

/* ===========================
   START SERVER
=========================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
