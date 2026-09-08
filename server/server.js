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

app.get("/api/songs", async (req, res) => {
  try {
    const query = req.query.search || "popular music";

    const params = new URLSearchParams({
      term: query,
      media: "music",
      entity: "song",
      limit: "30"
    });

    const response = await fetch(
      `https://itunes.apple.com/search?${params.toString()}`
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
        duration: Math.floor(track.trackTimeMillis / 1000)
      }));

    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Songs load nahi ho paaye"
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});