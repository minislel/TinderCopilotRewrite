import { duoMatch } from "@/types/duoMatch";

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
export async function categorizeIntercept(endpoint: string, data: unknown) {
  if (endpoint.includes("/profile")) {
    profileIntercepts.push({ endpoint, data });
  } else if (endpoint.includes("/user")) {
    userIntercepts.push({ endpoint, data });
  } else if (endpoint.includes("/conversations")) {
    groupConversationsIntercepts.push({ endpoint, data });
  } else if (endpoint.includes("/matches?")) {
    matchListIntercepts.push({ endpoint, data });
    console.log("Match List Intercept Data:", (data as any).data?.matches);
    for (const match of (data as any)?.data?.matches as any) {
      if (match.duo) {
        console.log("Duo Match Found:", match);
      }
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
      }
    }
  } else if (endpoint.includes("/matches/")) {
    matchIntercepts.push({ endpoint, data });
  }
}
