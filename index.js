const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 3000;

app.get("/scrape", async (req, res) => {
  const { username } = req.query;

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});