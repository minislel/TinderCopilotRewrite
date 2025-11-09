import { Profile } from "@/types";
export async function fetchProfileData(
  profileId: string,
  xauthToken: string
): Promise<Profile> {
  let response;
  let profile: Profile;
  try {
    response = await fetch(`https://api.gotinder.com/user/${profileId}`, {
      headers: {
        "x-auth-token": xauthToken,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      },
    });
  } catch (error) {
    console.error("Network error fetching profile:", profileId, error);
    const err = {
      name: "Network error fetching profile:",
      message: error instanceof Error ? error.message : String(error),
      status: 503,
      function: "fetchProfileData",
    };
    throw err;
  }
  if (!response.ok) {
    const err = {
      name: "Error fetching profile " + profileId,
      message: "Failed to fetch profile from API",
      status: response.status,
      function: "fetchProfileData",
    };
    throw err;
  }
  const result = await response.json();
  const prof = result.results;
  profile = {
    id: prof._id,
    name: prof.name,
    age: prof.age,
    bio: prof.bio ?? "No bio available",
    user_interests:
      prof.user_interests?.selected_interests?.map((i: any) => i.name) ?? [],
    jobs: prof.jobs?.[0]?.title ?? "No job listed",
    descriptors:
      prof.selected_descriptors?.map((desc: any) =>
        desc.choice_selections?.[0]
          ? `${desc.name}: ${desc.choice_selections[0].name}`
          : desc.name
      ) ?? [],
    schools: prof.schools?.[0]?.name ?? "No school listed",
  };

  return profile;
}
