const API_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? `http://${window.location.hostname}:5000/api/songs`
    : "https://soundify-suuo.onrender.com/api/songs");

export async function getSongs(search = "popular music") {
  const params = new URLSearchParams({
    search: search || "popular music",
  });

  const response = await fetch(`${API_URL}?${params.toString()}`, { signal: AbortSignal.timeout(20000) });

  if (!response.ok) {
    throw new Error("Backend API failed");
  }

  return await response.json();
}