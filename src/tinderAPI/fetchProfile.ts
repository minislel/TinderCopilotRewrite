import { Profile } from "@/types";
export async function fetchProfileData(
  profileId: string,
  xauthToken: string
): Promise<Profile> {
  try {
    const response = await fetch(`https://api.gotinder.com/user/${profileId}`, {
      headers: {
        "x-auth-token": xauthToken,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      },
    });
    let result = await response.json();
    let prof = result.results;
    let profile: Profile = {
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
  } catch (e) {
    console.error("Error fetching profile data:", e);
  }
  return {
    id: "Unknown",
    name: "Unknown",
    age: 0,
    bio: "No bio available",
    jobs: "No job listed",
    user_interests: [],
    descriptors: [],
    schools: "No school listed",
  };
}
