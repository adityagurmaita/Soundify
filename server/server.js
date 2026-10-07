const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Music Player API is running 🎵"
  });
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/songs", async (req, res) => {
  try {
    const query = String(req.query.search || "popular music").trim().slice(0, 200);

    const params = new URLSearchParams({
      term: query,
      media: "music",
      entity: "song",
      limit: "30"
    });

    const response = await fetch(
      `https://itunes.apple.com/search?${params.toString()}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      throw new Error("iTunes API failed");
    }

    const data = await response.json();

    const songs = data.results
      .filter((track) => track.previewUrl)
      .map((track) => ({
        id: track.trackId,
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName,
        image: track.artworkUrl100
          ? track.artworkUrl100.replace("100x100", "600x600")
          : "",
        audio: track.previewUrl,
        duration: 30,
        preview: true,
        sourceUrl: track.trackViewUrl
      }));

    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Songs load nahi ho paaye"
    });
  }
});

const PORT = process.env.PORT || 5000;

if (require.main === module) app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
module.exports = app;
