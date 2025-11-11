import { duoMatch } from "@/types/duoMatch";
import { Profile } from "@/types/profile";

export const fetchIntercepts: { endpoint: string; data: unknown }[] = [];
export const profileIntercepts: { endpoint: string; data: unknown }[] = [];
export const userIntercepts: { endpoint: string; data: unknown }[] = [];
export const groupConversationsIntercepts: {
  endpoint: string;
  data: unknown;
}[] = [];
export const matchIntercepts: { endpoint: string; data: unknown }[] = [];
export const matchListIntercepts: { endpoint: string; data: unknown }[] = [];
export const duoMatchList: Set<duoMatch> = new Set();
export const userProfile: Profile = {} as Profile;
export const profilesList: Map<string, Profile> = new Map();
export async function categorizeIntercept(endpoint: string, data: unknown) {
  if (endpoint.includes("/profile")) {
    profileIntercepts.push({ endpoint, data });
    parseUserProfile(data);
  } else if (endpoint.includes("/user")) {
    userIntercepts.push({ endpoint, data });
  } else if (endpoint.includes("/conversations")) {
    groupConversationsIntercepts.push({ endpoint, data });
  } else if (endpoint.includes("/matches?")) {
    matchListIntercepts.push({ endpoint, data });
    console.log("Match List Intercept Data:", (data as any).data?.matches);
    parseDuoMatches(data);
  } else if (endpoint.includes("/matches/")) {
    matchIntercepts.push({ endpoint, data });
  }
}
function parseUserProfile(data: any): void {
  if (
    userProfile.id === undefined &&
    (data as unknown as any).data?.user?._id
  ) {
    userProfile.id = (data as unknown as any).data.user._id;
  }
  if (
    userProfile.name === undefined &&
    (data as unknown as any).data?.user?.name
  ) {
    userProfile.name = (data as unknown as any).data.user.name;
  }
  if (
    userProfile.age === undefined &&
    (data as unknown as any).data?.user?.age
  ) {
    userProfile.age = (data as unknown as any).data.user.age;
  }
  if (
    userProfile.bio === undefined &&
    (data as unknown as any).data?.user?.bio
  ) {
    userProfile.bio =
      (data as unknown as any).data.user.bio ?? "No bio available";
  }
  if (
    userProfile.jobs === undefined &&
    (data as unknown as any).data?.user?.jobs
  ) {
    userProfile.jobs =
      (data as unknown as any).data.user.jobs?.[0]?.title ?? "No job listed";
  }
  if (
    userProfile.user_interests === undefined &&
    (data as unknown as any).data?.user?.user_interests
  ) {
    userProfile.user_interests =
      (
        data as unknown as any
      ).data.user.user_interests?.selected_interests?.map((i: any) => i.name) ??
      [];
  }
  if (
    userProfile.descriptors === undefined &&
    (data as unknown as any).data?.user?.selected_descriptors
  ) {
    userProfile.descriptors =
      (data as unknown as any).data.user.selected_descriptors?.map(
        (desc: any) =>
          desc.choice_selections?.[0]
            ? `${desc.name}: ${desc.choice_selections[0].name}`
            : desc.name
      ) ?? [];
  }
  if (
    userProfile.schools === undefined &&
    (data as unknown as any).data?.user?.schools
  ) {
    userProfile.schools =
      (data as unknown as any).data.user.schools?.[0]?.name ??
      "No school listed";
  }
}
function parseDuoMatches(data: any): void {
  for (const match of (data as any)?.data?.matches as any) {
    let participants: Array<string> = [];
    if (match.duo) {
      const allUniqueIds = [
        ...new Set(match.other_group_participants.map((obj: any) => obj._id)),
      ];
      const otherIds = allUniqueIds.filter(
        (id) => id !== match.duo.partners[0]
      );
      participants = [match.duo.partners[0], ...otherIds];
      console.log("Participants for duoMatch:", participants);
      duoMatchList.add({ id: match._id, participants });
    }
  }
}
