export async function fetchUserMatches(xauthToken: string) {
  let response;
  try {
    response = await fetch(
      "https://api.gotinder.com/v2/matches?count=60&include_conversations=true",
      {
        headers: {
          "X-Auth-Token": xauthToken,
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      }
    );
  } catch (error) {
    console.error("Network error fetching user matches:", error);
    const err = {
      name: "Network error fetching user matches",
      message: error instanceof Error ? error.message : String(error),
      status: 503,
      function: "fetchUserMatches",
    };
    throw err;
  }
  if (!response.ok) {
    const err = {
      name: "Error fetching user matches",
      message: "Failed to fetch user matches from API",
      status: response.status,
      function: "fetchUserMatches",
    };
    throw err;
  }
  const data = await response.json();
  return data.data.matches;
}
