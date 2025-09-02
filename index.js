require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");

const { URL } = require("url");

const dns = require("node:dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());

// parse application/json
app.use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});
const urls = [];
app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;

  // Validate URL format
  let hostname;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error("invalid protocol");
    }
    hostname = parsedUrl.hostname;
  } catch {
    return res.json({ error: "invalid url" });
  }

  // DNS lookup to check validity
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    // Store and assign ID
    const short_url = urls.length + 1;
    urls.push({ original_url: url, short_url });

    res.json({ original_url: url, short_url });
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const id = parseInt(req.params.short_url);
  const entry = urls.find((u) => u.short_url === id);

  if (!entry) {
    return res.json({ error: "No short URL found for given input" });
  }
  res.redirect(entry.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
