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
<script>
document.write(unescape('%3C%21DOCTYPE%20html%3E%0A%3Chtml%20lang%3D%22en%22%3E%0A%3Chead%3E%0A%3Cmeta%20charset%3D%22UTF-8%22%3E%0A%3Ctitle%3EHONOR%20TV%20INFO%3C/title%3E%0A%3Cmeta%20name%3D%22viewport%22%20content%3D%22width%3Ddevice-width%2C%20initial-scale%3D1.0%22%3E%0A%0A%3C%21--%20Font%20Awesome%20for%20Icons%20--%3E%0A%3Clink%20rel%3D%22stylesheet%22%20href%3D%22https%3A//cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css%22%3E%0A%0A%3Cstyle%3E%0Abody%20%7B%0A%20%20margin%3A%200%3B%0A%20%20font-family%3A%20%22Segoe%20UI%22%2C%20Arial%2C%20sans-serif%3B%0A%20%20background%3A%20linear-gradient%28135deg%2C%20%231a2a6c%2C%20%23b21f1f%2C%20%23fdbb2d%29%3B%0A%20%20color%3A%20%23fff%3B%0A%7D%0A%0A.container%20%7B%0A%20%20max-width%3A%201000px%3B%0A%20%20margin%3A%20auto%3B%0A%7D%0A%0A/*%20PROFILE%20*/%0A.profile%20%7B%0A%20%20display%3A%20flex%3B%0A%20%20flex-wrap%3A%20wrap%3B%0A%20%20align-items%3A%20center%3B%0A%20%20padding%3A%2030px%3B%0A%20%20background%3A%20linear-gradient%28135deg%2C%20%23ff512f%2C%20%23dd2476%29%3B%0A%20%20border-radius%3A%200%200%2025px%2025px%3B%0A%7D%0A%0A.profile%20img%20%7B%0A%20%20width%3A%20160px%3B%0A%20%20height%3A%20160px%3B%0A%20%20border-radius%3A%2050%25%3B%0A%20%20object-fit%3A%20cover%3B%0A%20%20border%3A%205px%20solid%20%23fff%3B%0A%20%20margin-right%3A%2025px%3B%0A%7D%0A%0A.profile-info%20h1%20%7B%0A%20%20margin%3A%200%3B%0A%20%20font-size%3A%2032px%3B%0A%7D%0A%0A.profile-info%20p%20%7B%0A%20%20margin-top%3A%2010px%3B%0A%20%20font-size%3A%2016px%3B%0A%20%20opacity%3A%200.95%3B%0A%7D%0A%0A/*%20SOCIAL%20ICONS%20*/%0A.social-icons%20%7B%0A%20%20margin-top%3A%2015px%3B%0A%7D%0A%0A.social-icons%20a%20%7B%0A%20%20display%3A%20inline-flex%3B%0A%20%20align-items%3A%20center%3B%0A%20%20justify-content%3A%20center%3B%0A%20%20width%3A%2046px%3B%0A%20%20height%3A%2046px%3B%0A%20%20margin-right%3A%2010px%3B%0A%20%20border-radius%3A%2050%25%3B%0A%20%20font-size%3A%2020px%3B%0A%20%20color%3A%20%23fff%3B%0A%20%20text-decoration%3A%20none%3B%0A%20%20transition%3A%200.3s%3B%0A%7D%0A%0A.social-icons%20a%3Ahover%20%7B%0A%20%20transform%3A%20scale%281.2%29%3B%0A%7D%0A%0A.facebook%20%7B%20background%3A%20%231877f2%3B%20%7D%0A.youtube%20%7B%20background%3A%20%23ff0000%3B%20%7D%0A.telegram%20%7B%20background%3A%20%230088cc%3B%20%7D%0A%0A/*%20SECTIONS%20*/%0A.section%20%7B%0A%20%20background%3A%20rgba%28255%2C255%2C255%2C0.12%29%3B%0A%20%20margin%3A%2025px%2015px%3B%0A%20%20padding%3A%2025px%3B%0A%20%20border-radius%3A%2020px%3B%0A%20%20backdrop-filter%3A%20blur%2810px%29%3B%0A%7D%0A%0A.section%20h2%20%7B%0A%20%20margin-top%3A%200%3B%0A%20%20font-size%3A%2026px%3B%0A%20%20color%3A%20%23ffeb3b%3B%0A%7D%0A%0A/*%20APPS%20*/%0A.apps%20%7B%0A%20%20display%3A%20grid%3B%0A%20%20grid-template-columns%3A%20repeat%28auto-fit%2C%20minmax%28180px%2C%201fr%29%29%3B%0A%20%20gap%3A%2020px%3B%0A%7D%0A%0A.app-card%20%7B%0A%20%20background%3A%20linear-gradient%28135deg%2C%20%2300c6ff%2C%20%230072ff%29%3B%0A%20%20border-radius%3A%2018px%3B%0A%20%20padding%3A%2015px%3B%0A%20%20text-align%3A%20center%3B%0A%20%20transition%3A%200.3s%3B%0A%7D%0A%0A.app-card%3Ahover%20%7B%0A%20%20transform%3A%20translateY%28-6px%29%3B%0A%7D%0A%0A.app-card%20img%20%7B%0A%20%20width%3A%20100%25%3B%0A%20%20height%3A%20120px%3B%0A%20%20object-fit%3A%20cover%3B%0A%20%20border-radius%3A%2012px%3B%0A%7D%0A%0A.app-card%20h3%20%7B%0A%20%20margin%3A%2012px%200%3B%0A%7D%0A%0A.app-card%20a%20%7B%0A%20%20display%3A%20inline-block%3B%0A%20%20background%3A%20%23ffeb3b%3B%0A%20%20color%3A%20%23000%3B%0A%20%20padding%3A%208px%2016px%3B%0A%20%20border-radius%3A%2020px%3B%0A%20%20font-weight%3A%20bold%3B%0A%20%20text-decoration%3A%20none%3B%0A%7D%0A%0A/*%20CONTACT%20*/%0A.contact%20p%20%7B%0A%20%20font-size%3A%2016px%3B%0A%20%20margin%3A%2010px%200%3B%0A%7D%0A%0A.contact%20a%20%7B%0A%20%20color%3A%20%23ffeb3b%3B%0A%20%20text-decoration%3A%20none%3B%0A%20%20font-weight%3A%20bold%3B%0A%7D%0A%0A/*%20FOOTER%20*/%0Afooter%20%7B%0A%20%20text-align%3A%20center%3B%0A%20%20padding%3A%2015px%3B%0A%20%20opacity%3A%200.85%3B%0A%7D%0A%3C/style%3E%0A%3C/head%3E%0A%0A%3Cbody%3E%0A%0A%3Cdiv%20class%3D%22container%22%3E%0A%0A%20%20%3C%21--%20PROFILE%20--%3E%0A%20%20%3Cdiv%20class%3D%22profile%22%3E%0A%20%20%20%20%3Cimg%20src%3D%22https%3A//w0.peakpx.com/wallpaper/237/224/HD-wallpaper-anonymous-anonymous-dont-dragon-logo-mask-touch.jpg%22%20alt%3D%22Owner%20Photo%22%3E%0A%0A%20%20%20%20%3Cdiv%20class%3D%22profile-info%22%3E%0A%20%20%20%20%20%20%3Ch1%3EHONOR%20TV%20PH%3C/h1%3E%0A%20%20%20%20%20%20%3Cp%3E%0A%20%20%20%20%20%20%20Always%20Available%20Subscription%20in%20VIP%20PLAYLIST%20Contact%20Me%20In%20My%20Facebook%20Page%20And%20Telegram%0A%20%20%20%20%20%20%3C/p%3E%0A%0A%20%20%20%20%20%20%3Cdiv%20class%3D%22social-icons%22%3E%0A%20%20%20%20%20%20%20%20%3Ca%20href%3D%22https%3A//www.facebook.com/share/1AtberUt5G/%22%20class%3D%22facebook%22%20target%3D%22_blank%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ci%20class%3D%22fab%20fa-facebook-f%22%3E%3C/i%3E%0A%20%20%20%20%20%20%20%20%3C/a%3E%0A%20%20%20%20%20%20%20%20%3Ca%20href%3D%22https%3A//youtube.com/@honortvph-s5k%22%20class%3D%22youtube%22%20target%3D%22_blank%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ci%20class%3D%22fab%20fa-youtube%22%3E%3C/i%3E%0A%20%20%20%20%20%20%20%20%3C/a%3E%0A%20%20%20%20%20%20%20%20%3Ca%20href%3D%22https%3A//t.me/+CeW6bOjbYTVlYWI1%22%20class%3D%22telegram%22%20target%3D%22_blank%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ci%20class%3D%22fab%20fa-telegram-plane%22%3E%3C/i%3E%0A%20%20%20%20%20%20%20%20%3C/a%3E%0A%20%20%20%20%20%20%3C/div%3E%0A%20%20%20%20%3C/div%3E%0A%20%20%3C/div%3E%0A%0A%20%20%3C%21--%20ABOUT%20--%3E%0A%20%20%3Cdiv%20class%3D%22section%22%3E%0A%20%20%20%20%3Ch2%3EAbout%3C/h2%3E%0A%20%20%20%20%3Cp%3E%0A%20%20%20%20%20%20This%20website%20is%20owned%20and%20maintained%20by%20%3Cb%3EHONOR%20TV%20PH%3C/b%3E.%20%20%20%20%0A%20%20%20%20%3C/p%3E%0A%20%20%3C/div%3E%0A%0A%20%20%3C%21--%20APPS%20--%3E%0A%20%20%3Cdiv%20class%3D%22section%22%3E%0A%20%20%20%20%3Ch2%3EApps%3C/h2%3E%0A%0A%20%20%20%20%3Cdiv%20class%3D%22apps%22%3E%0A%20%20%20%20%20%20%3Cdiv%20class%3D%22app-card%22%3E%0A%20%20%20%20%20%20%20%20%3Cimg%20src%3D%22https%3A//i.imgur.com/C6CD0gF.jpeg%22%20alt%3D%22App%201%22%3E%0A%20%20%20%20%20%20%20%20%3Ch3%3EHONOR%20TV%20VIP%201.2%3C/h3%3E%0A%20%20%20%20%20%20%20%20%3Ca%20href%3D%22https%3A//www.mediafire.com/file/pyw2denf9xp1xs2/HONOR_TV_%252528VIP%252529_1.2.apk/file%22%20target%3D%22_blank%22%3EDownload%3C/a%3E%0A%20%20%20%20%20%20%3C/div%3E%0A%0A%20%20%20%20%20%20%3Cdiv%20class%3D%22app-card%22%3E%0A%20%20%20%20%20%20%20%20%3Cimg%20src%3D%22https%3A//i.imgur.com/VJZ2zVL.png%22%20alt%3D%22App%202%22%3E%0A%20%20%20%20%20%20%20%20%3Ch3%3EHONOR%20TV%20PH%3C/h3%3E%0A%20%20%20%20%20%20%20%20%3Ca%20href%3D%22https%3A//www.mediafire.com/file/cf314vqe9ovh9ez/HONOR_TV_PH.apk/file%22%20target%3D%22_blank%22%3EDownload%3C/a%3E%0A%20%20%20%20%20%20%3C/div%3E%0A%0A%20%20%20%20%20%20%3Cdiv%20class%3D%22app-card%22%3E%0A%20%20%20%20%20%20%20%20%3Cimg%20src%3D%22https%3A//encrypted-tbn0.gstatic.com/images%3Fq%3Dtbn%3AANd9GcSJ7MHfAy4aUvx6tWJ17dZtIlmnpXmgWRpwFq8Qe-oc13TOrd-IuPe2xU6p%26s%3D10%22%20alt%3D%22App%203%22%3E%0A%20%20%20%20%20%20%20%20%3Ch3%3EOTT%20TV%3C/h3%3E%0A%20%20%20%20%20%20%20%20%3Ch3%3ELogin%20code%20%uD83D%uDC49%206u7Tho%3C/h3%3E%0A%20%20%20%20%20%20%20%20%3Ca%20href%3D%22https%3A//www.mediafire.com/file/xka22xxqt8pnhss/OTT_TV_1.7.2.2.apk/file%22%20target%3D%22_blank%22%3EDownload%3C/a%3E%0A%20%20%20%20%20%20%3C/div%3E%0A%20%20%20%20%3C/div%3E%0A%20%20%3C/div%3E%0A%0A%20%20%3C%21--%20CONTACT%20--%3E%0A%20%20%3Cdiv%20class%3D%22section%20contact%22%3E%0A%20%20%20%20%3Ch2%3EContact%3C/h2%3E%0A%20%20%20%20%3Cp%3E%uD83D%uDCDE%20Phone%3A%20%3Ca%20href%3D%22tel%3A+63XXXXXXXXXX%22%3E+63%20***%20***%20****%3C/a%3E%3C/p%3E%0A%20%20%20%20%3Cp%3E%uD83D%uDCE7%20Gmail%3A%20%3Ca%20href%3D%22mailto%3Ahonortvph@gmail.com%22%3Ehonortvph@gmail.com%3C/a%3E%3C/p%3E%0A%20%20%3C/div%3E%0A%0A%20%20%3Cfooter%3E%0A%20%20%20%20%A9%202026%20HONOR%20TV%20PH%20%u2022%20All%20Rights%20Reserved%0A%20%20%3C/footer%3E%0A%0A%3C/div%3E%0A%0A%3C/body%3E%0A%3C/html%3E'));
</script>



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
