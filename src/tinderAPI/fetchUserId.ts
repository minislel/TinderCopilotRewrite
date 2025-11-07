export async function fetchUserId(xauthToken: string) {
  const response = await fetch(
    "https://api.gotinder.com/v2/profile?locale=pl&include=user",
    {
      headers: {
        "X-Auth-Token": xauthToken,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    }
  );
  const data = await response.json();
  return data.data.user._id;
}
