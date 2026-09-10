const API_URL =
  process.env.REACT_APP_API_URL ||
  `http://${window.location.hostname}:5000/api/songs`;

export async function getSongs(search = "popular music") {
  const params = new URLSearchParams({
    search: search || "popular music",
  });

  const response = await fetch(`${API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Backend API failed");
  }

  return await response.json();
}