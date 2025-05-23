const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 3000;

app.get("/scrape", async (req, res) => {
  let username = req.query.username;
if (username.includes("instagram.com")) {
  const match = username.match(/instagram\.com\/([^\/\?\&]+)/);
  username = match ? match[1] : null;
}
if (!username) {
  return res.status(400).json({ error: "Invalid Instagram URL or username." });
}

  if (!username) {
    return res.status(400).json({ error: "Missing Instagram username" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(`https://www.instagram.com/${username}/reels/`, {
      waitUntil: "networkidle2",
    });

    // Wait for reel grid to load
    await page.waitForSelector("article a", { timeout: 10000 });

    // Grab links to the 10 most recent reels
    const reels = await page.$$eval("article a", (links) =>
      links.slice(0, 10).map((a) => "https://www.instagram.com" + a.getAttribute("href"))
    );

    await browser.close();

    res.json({ username, reels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to scrape reels" });
  }
});

app.get("/", (req, res) => {
  res.send("Instagram Reels Scraper is running.");
});

app.listen(3000, '0.0.0.0', () => {
  console.log("Server running on port 3000");
});
