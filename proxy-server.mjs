import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get(/^\/reqres\/.*/, async (req, res) => {
  try {
    const path = req.originalUrl.replace("/reqres", "");
    const url = `https://reqres.in${path}`;

    const r = await fetch(url, {
      method: "GET",
      headers: {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "referer": "https://reqres.in/",
        "origin": "https://reqres.in",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
      },
    });

    const body = await r.text();

    // forward content-type if present
    const ct = r.headers.get("content-type");
    if (ct) res.setHeader("content-type", ct);

    res.status(r.status).send(body);
  } catch (e) {
    res.status(500).json({ error: "Proxy error", details: String(e) });
  }
});

app.listen(3000, () => console.log("Proxy running on http://localhost:3000"));
