import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get(/^\/reqres\/.*/, async (req, res) => {
  const path = req.originalUrl.replace("/reqres", "");
  const url = `https://reqres.in${path}`;

  const r = await fetch(url, {
    headers: {
      "accept": "application/json,text/plain,*/*",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
    },
  });

  const text = await r.text();
  res.status(r.status).send(text);
});

app.listen(3000, () => console.log("Proxy running on http://localhost:3000"));
