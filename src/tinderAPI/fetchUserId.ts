export async function fetchUserId(xauthToken: string) {
  let response;
  try {
    response = await fetch(
      "https://api.gotinder.com/v2/profile?locale=pl&include=user",
      {
        headers: {
          "X-Auth-Token": xauthToken,
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      }
    );
  } catch (error) {
    console.error("Network error fetching user ID:", error);
    const err = {
      name: "Network error fetching user ID",
      message: error instanceof Error ? error.message : String(error),
      status: 503,
      function: "fetchUserId",
    };
    throw err;
  }
  if (!response.ok) {
    const err = {
      name: "Error fetching user ID",
      message: "Failed to fetch user ID from API",
      status: response.status,
      function: "fetchUserId",
    };
    throw err;
  }
  const data = await response.json();
  return data.data.user._id;
}
