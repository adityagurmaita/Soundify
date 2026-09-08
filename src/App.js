import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { getSongs } from "./services/musicApi";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import AuthPage from "./AuthPage";

function App() {
  const audioRef = useRef(null);
  const searchRef = useRef(null);
  const accountRef = useRef(null);

  // ================= MUSIC =================

  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("soundify-volume");
    return saved !== null ? Number(saved) : 0.7;
  });

  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const [activePage, setActivePage] = useState("home");

  // ================= LIKED SONGS =================

  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem("soundify-liked-songs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ================= PLAYLISTS =================

  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem("soundify-playlists");

      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 1,
              name: "My Favorites",
              songs: [],
            },
          ];
    } catch {
      return [];
    }
  });

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  // ================= FIREBASE AUTH =================

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ================= ACCOUNT =================

  const [showAccount, setShowAccount] = useState(false);

  const song = songs[currentSong];

  // ================= FIREBASE AUTH STATE =================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ================= SAVE LIKED SONGS =================

  useEffect(() => {
    localStorage.setItem(
      "soundify-liked-songs",
      JSON.stringify(likedSongs)
    );
  }, [likedSongs]);

  // ================= SAVE PLAYLISTS =================

  useEffect(() => {
    localStorage.setItem(
      "soundify-playlists",
      JSON.stringify(playlists)
    );
  }, [playlists]);

  // ================= SAVE VOLUME =================

  useEffect(() => {
    localStorage.setItem("soundify-volume", volume.toString());
  }, [volume]);

  // ================= CLOSE ACCOUNT OUTSIDE =================

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target)
      ) {
        setShowAccount(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ================= LOAD SONGS =================

  useEffect(() => {
    loadSongs();
  }, [query]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSongs(query);

      setSongs(data);
      setCurrentSong(0);
      setProgress(0);
      setIsPlaying(false);
    } catch (err) {
      console.error(err);

      setError("Songs load nahi ho paaye. Server check karo.");
    } finally {
      setLoading(false);
    }
  };

  // ================= AUDIO =================

  useEffect(() => {
    if (!audioRef.current || !song) return;

    audioRef.current.load();

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.log("Playback error:", err);
      });
    }
  }, [currentSong, song]);

  // ================= VOLUME =================

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
  }, [volume, muted]);

  // ================= KEYBOARD =================

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === "Space" &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        togglePlay();
      }

      if (e.code === "ArrowRight") {
        nextSong();
      }

      if (e.code === "ArrowLeft") {
        previousSong();
      }

      if (e.code === "Escape") {
        setSearch("");
        setShowAccount(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  // ================= PLAY / PAUSE =================

  const togglePlay = () => {
    if (!audioRef.current || !song) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  // ================= NEXT =================

  const nextSong = () => {
    if (!songs.length) return;

    let nextIndex;

    if (repeat) {
      nextIndex = currentSong;
    } else if (shuffle && songs.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * songs.length);
      } while (nextIndex === currentSong);
    } else {
      nextIndex = (currentSong + 1) % songs.length;
    }

    setCurrentSong(nextIndex);
    setProgress(0);
    setIsPlaying(true);
  };

  // ================= PREVIOUS =================

  const previousSong = () => {
    if (!songs.length) return;

    if (
      audioRef.current &&
      audioRef.current.currentTime > 5
    ) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }

    const previousIndex =
      currentSong === 0
        ? songs.length - 1
        : currentSong - 1;

    setCurrentSong(previousIndex);
    setProgress(0);
    setIsPlaying(true);
  };

  // ================= PROGRESS =================

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration;

    if (duration && !isNaN(duration)) {
      setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;

    const value = Number(e.target.value);
    const duration = audioRef.current.duration;

    if (duration) {
      audioRef.current.currentTime = (value / 100) * duration;
      setProgress(value);
    }
  };

  // ================= SONG ENDED =================

  const handleEnded = () => {
    if (repeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;

        audioRef.current.play().catch(() => {});
      }

      return;
    }

    nextSong();
  };

  // ================= LIKE =================

  const isLiked = (id) => {
    return likedSongs.some((item) => item.id === id);
  };

  const toggleLike = () => {
    if (!song) return;

    setLikedSongs((prev) => {
      if (prev.some((item) => item.id === song.id)) {
        return prev.filter((item) => item.id !== song.id);
      }

      return [...prev, song];
    });
  };

  // ================= SEARCH =================

  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      setQuery("");
      return;
    }

    setActivePage("home");
    setQuery(value);
  };

  const openSearch = () => {
    setActivePage("home");
    setShowAccount(false);

    setTimeout(() => {
      searchRef.current?.focus();
    }, 100);
  };

  // ================= NAVIGATION =================

  const goHome = () => {
    setActivePage("home");
    setSelectedPlaylist(null);
    setShowAccount(false);
  };

  const showLiked = () => {
    setActivePage("liked");
    setSelectedPlaylist(null);
    setShowAccount(false);
  };

  const showLibrary = () => {
    setActivePage("library");
    setSelectedPlaylist(null);
    setShowAccount(false);
  };

  // ================= PLAYLIST =================

  const createPlaylist = () => {
    const name = window.prompt("Playlist ka naam enter karo:");

    if (!name || !name.trim()) return;

    const newPlaylist = {
      id: Date.now(),
      name: name.trim(),
      songs: [],
    };

    setPlaylists((prev) => [...prev, newPlaylist]);

    setActivePage("library");
    setShowAccount(false);
  };

  const addToPlaylist = (playlistId) => {
    if (!song) return;

    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id !== playlistId) {
          return playlist;
        }

        if (
          playlist.songs.some(
            (item) => item.id === song.id
          )
        ) {
          alert("Song already playlist mein hai.");
          return playlist;
        }

        return {
          ...playlist,
          songs: [...playlist.songs, song],
        };
      })
    );

    alert("Song playlist mein add ho gaya 🎵");
  };

  const deletePlaylist = (playlistId) => {
    const confirmDelete = window.confirm(
      "Kya tum ye playlist delete karna chahte ho?"
    );

    if (!confirmDelete) return;

    setPlaylists((prev) =>
      prev.filter((playlist) => playlist.id !== playlistId)
    );

    setSelectedPlaylist(null);
    setActivePage("library");
  };

  // ================= CATEGORY SEARCH =================

  const searchPlaylist = (type) => {
    setActivePage("home");
    setSearch(type);
    setQuery(type);
  };

  // ================= PLAY SONG =================

  const playSong = (index) => {
    setCurrentSong(index);
    setProgress(0);
    setIsPlaying(true);
    setActivePage("home");
  };

  // ================= FIREBASE LOGOUT =================

  const logout = async () => {
    const confirmLogout = window.confirm(
      "Kya tum logout karna chahte ho?"
    );

    if (!confirmLogout) return;

    try {
      await signOut(auth);

      setShowAccount(false);
      setIsPlaying(false);
    } catch (error) {
      console.error("Logout error:", error);

      alert("Logout nahi ho paya. Dobara try karo.");
    }
  };

  // ================= FORMAT TIME =================

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) {
      return "0:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentTime = audioRef.current
    ? audioRef.current.currentTime
    : 0;

  const duration = audioRef.current
    ? audioRef.current.duration
    : song?.duration || 0;

  // ================= AUTH LOADING =================

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#030807",
          color: "#18f66b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        Loading Soundify...
      </div>
    );
  }

  // ================= LOGIN PAGE =================

  if (!user) {
    return <AuthPage />;
  }

  // ================= USER NAME =================

  const userName =
    user.displayName ||
    user.email?.split("@")[0] ||
    "User";

  // ================= RENDER =================

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        {/* LOGO */}

        <h1 className="logo">
          Sound<span>ify</span>
        </h1>

        {/* SIDEBAR SCROLL CONTENT */}

        <div className="sidebar-scroll-area">

          {/* MAIN MENU */}

          <div className="menu">

            <button
              className={
                activePage === "home"
                  ? "active"
                  : ""
              }
              onClick={goHome}
            >
              🏠 Home
            </button>

            <button onClick={openSearch}>
              🔎 Search
            </button>

            <button
              className={
                activePage === "liked"
                  ? "active"
                  : ""
              }
              onClick={showLiked}
            >
              ❤️ Liked Songs
            </button>

            <button
              className={
                activePage === "library"
                  ? "active"
                  : ""
              }
              onClick={showLibrary}
            >
              🎵 Your Library
            </button>

          </div>

          {/* PLAYLIST */}

          <div className="playlist">

            <h3>PLAYLIST</h3>

            <p
              onClick={() =>
                searchPlaylist("Trending")
              }
            >
              🔥 Trending Songs
            </p>

            <p
              onClick={() =>
                searchPlaylist("Chill")
              }
            >
              🎧 Chill Music
            </p>

            <p
              onClick={() =>
                searchPlaylist("Workout")
              }
            >
              💪 Workout
            </p>

            <p
              onClick={() =>
                searchPlaylist("Night")
              }
            >
              🌙 Night Vibes
            </p>

            <p onClick={createPlaylist}>
              ➕ Create Playlist
            </p>

            {playlists.map((playlist) => (
              <p
                key={playlist.id}
                onClick={() => {
                  setSelectedPlaylist(playlist);
                  setActivePage("playlist");
                  setShowAccount(false);
                }}
              >
                📁 {playlist.name}
              </p>
            ))}

          </div>

        </div>

        {/* ================= SIDEBAR ACCOUNT ================= */}

        <div
          className="sidebar-account"
          ref={accountRef}
        >

          {/* ACCOUNT POPUP */}

          {showAccount && (
            <div className="sidebar-account-menu">

              <button
                type="button"
                onClick={showLiked}
              >
                <span className="account-menu-icon">
                  ♥
                </span>

                <span>
                  Liked Songs
                </span>
              </button>

              <button
                type="button"
                onClick={showLibrary}
              >
                <span className="account-menu-icon">
                  ♫
                </span>

                <span>
                  Your Library
                </span>
              </button>

              <div className="account-menu-line"></div>

              <button
                type="button"
                className="account-logout"
                onClick={logout}
              >
                <span className="account-menu-icon">
                  ↪
                </span>

                <span>
                  Log out
                </span>
              </button>

            </div>
          )}

          {/* ACCOUNT BUTTON */}

          <button
            type="button"
            className="sidebar-profile"
            onClick={() =>
              setShowAccount(!showAccount)
            }
          >

            <div className="sidebar-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="sidebar-user-info">

              <strong>
                {userName}
              </strong>

              <span>
                {user.email}
              </span>

            </div>

            <span className="sidebar-arrow">
              {showAccount ? "⌃" : "⌄"}
            </span>

          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main">

        {/* HEADER */}

        <header>

          <div>

            <h2>
              {activePage === "liked"
                ? "Your Liked Songs ❤️"
                : activePage === "library"
                ? "Your Library 🎵"
                : activePage === "playlist"
                ? selectedPlaylist?.name
                : `hey ${userName} 👋`}
            </h2>

          </div>

        </header>

        {/* ================= SEARCH ================= */}

        {activePage === "home" && (
          <form
            className="search-box"
            onSubmit={handleSearch}
          >

            <input
              ref={searchRef}
              type="text"
              placeholder="What do you want to listen to?"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <button type="submit">
              Search
            </button>

          </form>
        )}

        {/* ================= STATUS ================= */}

        {loading && (
          <div className="status">
            🎵 Loading songs...
          </div>
        )}

        {error && (
          <div className="status error">
            ❌ {error}
          </div>
        )}

        {/* ================= HOME PLAYER ================= */}

        {!loading &&
          song &&
          activePage === "home" && (
            <>

              {/* MAIN PLAYER */}

              <section className="player-section">

                <div
                  className={`album ${
                    isPlaying ? "playing" : ""
                  }`}
                >

                  <img
                    src={song.image}
                    alt={song.title}
                  />

                  {isPlaying && (
                    <div className="equalizer">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )}

                </div>

                <div className="song-info">

                  <p>
                    NOW PLAYING
                  </p>

                  <h1>
                    {song.title}
                  </h1>

                  <p>
                    {song.artist}
                  </p>

                  <p className="album-name">
                    {song.album}
                  </p>

                  <button
                    className={`like ${
                      isLiked(song.id)
                        ? "liked"
                        : ""
                    }`}
                    onClick={toggleLike}
                  >
                    {isLiked(song.id)
                      ? "♥"
                      : "♡"}
                  </button>

                </div>

              </section>

              {/* PROGRESS */}

              <section className="progress-section">

                <input
                  className="progress-bar"
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                />

                <div className="time">

                  <span>
                    {formatTime(currentTime)}
                  </span>

                  <span>
                    {formatTime(duration)}
                  </span>

                </div>

              </section>

              {/* CONTROLS */}

              <div className="controls">

                <button
                  className="control-btn"
                  onClick={() =>
                    setShuffle(!shuffle)
                  }
                  title="Shuffle"
                >
                  {shuffle ? "🔀" : "↝"}
                </button>

                <button
                  className="control-btn"
                  onClick={previousSong}
                >
                  ⏮
                </button>

                <button
                  className="play-btn"
                  onClick={togglePlay}
                >
                  {isPlaying ? "❚❚" : "▶"}
                </button>

                <button
                  className="control-btn"
                  onClick={nextSong}
                >
                  ⏭
                </button>

                <button
                  className="control-btn"
                  onClick={() =>
                    setRepeat(!repeat)
                  }
                  title="Repeat"
                >
                  {repeat ? "🔁" : "↻"}
                </button>

              </div>

              {/* VOLUME */}

              <div className="volume">

                <span
                  onClick={() =>
                    setMuted(!muted)
                  }
                  style={{
                    cursor: "pointer",
                  }}
                >
                  {muted || volume === 0
                    ? "🔇"
                    : volume < 0.5
                    ? "🔉"
                    : "🔊"}
                </span>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={
                    muted ? 0 : volume
                  }
                  onChange={(e) => {
                    const value =
                      Number(e.target.value);

                    setVolume(value);

                    if (value > 0) {
                      setMuted(false);
                    }
                  }}
                />

              </div>

              {/* SONG LIST */}

              <section className="recent">

                <h2>
                  {query
                    ? `Search results for "${query}"`
                    : "Popular Songs"}
                </h2>

                <div className="song-list">

                  {songs.map(
                    (item, index) => (
                      <div
                        key={item.id}
                        className={`song-card ${
                          index === currentSong
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          playSong(index)
                        }
                      >

                        <img
                          src={item.image}
                          alt={item.title}
                        />

                        <div>

                          <h4>
                            {item.title}
                          </h4>

                          <p>
                            {item.artist}
                          </p>

                        </div>

                        <span>
                          {formatTime(
                            item.duration
                          )}
                        </span>

                      </div>
                    )
                  )}

                </div>

              </section>

            </>
          )}
          {/* ================= DISCOVER HERO ================= */}

{!loading && song && activePage === "home" && (
  <section className="discover-hero">

    <div className="discover-content">
      <span className="discover-label">
        SOUNDIFY • DISCOVER
      </span>

      <h1>
        Discover New
        <br />
        <span>Sounds.</span>
      </h1>

      <p>
        Find something new to listen to and let
        the music set the mood.
      </p>

      <button
        className="discover-btn"
        onClick={() => playSong(currentSong)}
      >
        ▶ Play Now
      </button>
    </div>

    <div className="discover-art">
      <div className="discover-glow"></div>

      <img
        src={song.image}
        alt={song.title}
      />
    </div>

  </section>
)}

        {/* ================= LIKED ================= */}

        {!loading &&
          activePage === "liked" && (
            <section className="recent">

              <h2>
                ❤️ Liked Songs
              </h2>

              {likedSongs.length === 0 ? (
                <div className="status">

                  💔 Abhi koi liked song nahi hai.

                  <br />
                  <br />

                  Song play karo aur ❤️ dabao.

                </div>
              ) : (
                <div className="song-list">

                  {likedSongs.map(
                    (item, index) => (
                      <div
                        key={item.id}
                        className="song-card"
                        onClick={() => {

                          setSongs(likedSongs);
                          setCurrentSong(index);
                          setActivePage("home");
                          setIsPlaying(true);

                        }}
                      >

                        <img
                          src={item.image}
                          alt={item.title}
                        />

                        <div>

                          <h4>
                            {item.title}
                          </h4>

                          <p>
                            {item.artist}
                          </p>

                        </div>

                        <span>
                          {formatTime(
                            item.duration
                          )}
                        </span>

                      </div>
                    )
                  )}

                </div>
              )}

            </section>
          )}

        {/* ================= LIBRARY ================= */}

        {!loading &&
          activePage === "library" && (
            <section className="recent">

              <h2>
                🎵 Your Library
              </h2>

              <button
                onClick={createPlaylist}
                style={{
                  marginBottom: "20px",
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "20px",
                  background: "#1ed760",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ➕ Create Playlist
              </button>

              <div className="song-list">

                {playlists.map(
                  (playlist) => (
                    <div
                      key={playlist.id}
                      className="song-card"
                      onClick={() => {

                        setSelectedPlaylist(
                          playlist
                        );

                        setActivePage(
                          "playlist"
                        );

                      }}
                    >

                      <div>

                        <h4>
                          📁 {playlist.name}
                        </h4>

                        <p>
                          {
                            playlist.songs.length
                          }{" "}
                          songs
                        </p>

                      </div>

                      <span>
                        ▶
                      </span>

                    </div>
                  )
                )}

              </div>

            </section>
          )}

        {/* ================= PLAYLIST ================= */}

        {!loading &&
          activePage === "playlist" &&
          selectedPlaylist && (
            <section className="recent">

              <h2>
                📁 {selectedPlaylist.name}
              </h2>

              <button
                onClick={() =>
                  deletePlaylist(
                    selectedPlaylist.id
                  )
                }
                style={{
                  marginBottom: "20px",
                  padding: "9px 16px",
                  border: "none",
                  borderRadius: "20px",
                  background: "#ff4d4d",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                🗑 Delete Playlist
              </button>

              {selectedPlaylist.songs.length ===
              0 ? (
                <div className="status">
                  🎵 Playlist empty hai.
                </div>
              ) : (
                <div className="song-list">

                  {selectedPlaylist.songs.map(
                    (item, index) => (
                      <div
                        key={item.id}
                        className="song-card"
                        onClick={() => {

                          setSongs(
                            selectedPlaylist.songs
                          );

                          setCurrentSong(index);
                          setActivePage("home");
                          setIsPlaying(true);

                        }}
                      >

                        <img
                          src={item.image}
                          alt={item.title}
                        />

                        <div>

                          <h4>
                            {item.title}
                          </h4>

                          <p>
                            {item.artist}
                          </p>

                        </div>

                        <span>
                          {formatTime(
                            item.duration
                          )}
                        </span>

                      </div>
                    )
                  )}

                </div>
              )}

            </section>
          )}

        {/* ================= ADD PLAYLIST ================= */}

        {!loading &&
          song &&
          activePage === "home" &&
          playlists.length > 0 && (
            <section
              className="recent"
              style={{
                marginTop: "30px",
              }}
            >

              <h2>
                ➕ Add to Playlist
              </h2>

              <div className="song-list">

                {playlists.map(
                  (playlist) => (
                    <div
                      key={playlist.id}
                      className="song-card"
                      onClick={() =>
                        addToPlaylist(
                          playlist.id
                        )
                      }
                    >

                      <div>

                        <h4>
                          📁 {playlist.name}
                        </h4>

                        <p>
                          {
                            playlist.songs.length
                          }{" "}
                          songs
                        </p>

                      </div>

                      <span>
                        +
                      </span>

                    </div>
                  )
                )}

              </div>

            </section>
          )}

        {/* ================= FOOTER ================= */}

        <footer
          style={{
            textAlign: "center",
            marginTop: "70px",
            padding: "25px 10px",
            borderTop: "1px solid #1c1c1c",
            color: "#666",
            fontSize: "13px",
          }}
        >
          Made with ❤️ by{" "}

          <span
            style={{
              color: "#1ed760",
              fontWeight: "bold",
            }}
          >
            Aditya Gurmaita
          </span>
        </footer>

        {/* ================= AUDIO ================= */}

        <audio
          ref={audioRef}
          src={song?.audio}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />

        {/* ================= RIGHT NOW PLAYING ================= */}

        {!loading &&
          song &&
          activePage === "home" && (
            <aside className="right-player">

              <div className="right-player-title">

                <span>
                  NOW PLAYING
                </span>

                <span className="live-dot"></span>

              </div>

              {/* ALBUM */}

              <div className="right-album">

                <img
                  src={song.image}
                  alt={song.title}
                />

                {isPlaying && (
                  <div className="right-equalizer">

                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>

                  </div>
                )}

              </div>

              {/* SONG INFO */}

              <div className="right-song-info">

                <div>

                  <h2>
                    {song.title}
                  </h2>

                  <p>
                    {song.artist}
                  </p>

                  <small>
                    {song.album}
                  </small>

                </div>

                <button
                  className={`right-like ${
                    isLiked(song.id)
                      ? "liked"
                      : ""
                  }`}
                  onClick={toggleLike}
                >
                  {isLiked(song.id)
                    ? "♥"
                    : "♡"}
                </button>

              </div>

              {/* RIGHT PROGRESS */}

              <div className="right-progress">

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                />

                <div>

                  <span>
                    {formatTime(currentTime)}
                  </span>

                  <span>
                    {formatTime(duration)}
                  </span>

                </div>

              </div>

              {/* RIGHT CONTROLS */}

              <div className="right-controls">

                <button
                  onClick={() =>
                    setShuffle(!shuffle)
                  }
                  className={
                    shuffle
                      ? "active-control"
                      : ""
                  }
                >
                  🔀
                </button>

                <button
                  onClick={previousSong}
                >
                  ⏮
                </button>

                <button
                  className="right-play"
                  onClick={togglePlay}
                >
                  {isPlaying
                    ? "❚❚"
                    : "▶"}
                </button>

                <button
                  onClick={nextSong}
                >
                  ⏭
                </button>

                <button
                  onClick={() =>
                    setRepeat(!repeat)
                  }
                  className={
                    repeat
                      ? "active-control"
                      : ""
                  }
                >
                  🔁
                </button>

              </div>

              {/* RIGHT VOLUME */}

              <div className="right-volume">

                <span
                  onClick={() =>
                    setMuted(!muted)
                  }
                >
                  {muted || volume === 0
                    ? "🔇"
                    : volume < 0.5
                    ? "🔉"
                    : "🔊"}
                </span>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={
                    muted ? 0 : volume
                  }
                  onChange={(e) => {

                    const value =
                      Number(e.target.value);

                    setVolume(value);

                    if (value > 0) {
                      setMuted(false);
                    }

                  }}
                />

              </div>

              {/* UP NEXT */}

              <div className="up-next">

                <h3>
                  Up Next
                </h3>

                {songs
                  .filter(
                    (_, index) =>
                      index !== currentSong
                  )
                  .slice(0, 4)
                  .map((item) => {

                    const index =
                      songs.findIndex(
                        (s) =>
                          s.id === item.id
                      );

                    return (
                      <div
                        className="up-next-song"
                        key={item.id}
                        onClick={() =>
                          playSong(index)
                        }
                      >

                        <img
                          src={item.image}
                          alt={item.title}
                        />

                        <div>

                          <strong>
                            {item.title}
                          </strong>

                          <span>
                            {item.artist}
                          </span>

                        </div>

                        <small>
                          {formatTime(
                            item.duration
                          )}
                        </small>

                      </div>
                    );

                  })}

              </div>

            </aside>
          )}

      </main>

    </div>
  );
}

export default App;