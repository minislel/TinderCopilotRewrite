import { Message } from "@/types";
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
export const userProfile: Profile = {} as Profile;

export const duoMatchList: Map<string, Array<string>> = new Map();
export const profilesList: Map<string, Profile> = new Map();
export const groupConversationsList: Map<string, Array<Message>> = new Map();
export const matchMessagesList: Map<string, Array<Message>> = new Map();

export async function categorizeIntercept(endpoint: string, data: unknown) {
  if (endpoint.includes("/profile")) {
    profileIntercepts.push({ endpoint, data });
    parseUserProfile(data);
  } else if (endpoint.includes("/user")) {
    userIntercepts.push({ endpoint, data });
    parseProfile(data);
  } else if (endpoint.includes("/conversations")) {
    groupConversationsIntercepts.push({ endpoint, data });
    parseGroupConversations(data, endpoint);
  } else if (endpoint.includes("/matches")) {
    if ((data as any).data?.matches) {
      for (const match of (data as any).data?.matches) {
        if (match.type && match.type === "group_match") {
          parseDuoMatch(match);
        } else if (endpoint.includes("message=1")) {
          parseMostRecentMatchMessage(match);
        }
      }
    }

    matchIntercepts.push({ endpoint, data });

    if (endpoint.includes("messages")) {
      parseMatchMessages(data);
    }
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
function parseDuoMatch(match: any): void {
  let participants: Array<string> = [];
  if (match.duo) {
    const allUniqueIds = [
      ...new Set(match.other_group_participants.map((obj: any) => obj._id)),
    ];
    const otherIds = allUniqueIds.filter((id) => id !== match.duo.partners[0]);
    participants = [match.duo.partners[0], ...otherIds];
    duoMatchList.set(match._id, participants);
  }
}
function parseGroupConversations(data: any, endpoint: string): void {
  const conversations = data as any;
  const conversationId = endpoint.split("/").pop()?.split("=").pop();
  const messagesStripped = parseMessageObjects(conversations);
  if (conversationId && messagesStripped.length > 0) {
    groupConversationsList.set(conversationId, messagesStripped);
  }
}
function parseProfile(data: any): void {
  const userData = (data as any)?.results;
  if (userData) {
    const ProfileData: Profile = {
      id: userData._id,
      name: userData.name ?? "No name",
      age: userData.age ?? 0,
      bio: userData.bio ?? "No bio available",
      jobs: userData.jobs?.[0]?.title ?? "No job listed",
      user_interests:
        userData.user_interests?.selected_interests?.map((i: any) => i.name) ??
        [],
      descriptors:
        userData.selected_descriptors?.map((desc: any) =>
          desc.choice_selections?.[0]
            ? `${desc.name}: ${desc.choice_selections[0].name}`
            : desc.name
        ) ?? [],
      schools: userData.schools?.[0]?.name ?? "No school listed",
    };
    profilesList.set(ProfileData.id, ProfileData);
    console.log("Parsed profile:", ProfileData);
  }
}
function parseMessageObjects(data: any): Array<Message> {
  let index = 0;
  const ObjectMessages = data.data?.messages || data.messages;
  const messagesStripped: Array<Message> = ObjectMessages.map(
    (msg: any): Message => {
      return {
        sentDate: msg.sent_date ?? msg.created_date,
        from: msg.from ?? msg.user_id,
        content: msg.message ?? msg.text,
        index: index++,
      };
    }
  );
  return messagesStripped;
}
function parseMatchMessages(data: any): void {
  const matchMessages = (data as any)?.data?.messages;
  if (matchMessages) {
    const threadId = matchMessages[0]?.match_id;
    const messagesStripped = parseMessageObjects(data);
    console.log("Parsed match messages:", messagesStripped, threadId);
    if (!threadId) return;
    if (matchMessagesList.has(threadId)) {
      const existingMessages = matchMessagesList.get(threadId) || [];
      const combinedMessages = mergeMessages(
        existingMessages,
        messagesStripped
      );
      matchMessagesList.set(threadId, combinedMessages);
    } else {
      matchMessagesList.set(threadId, messagesStripped);
    }
  }
}
function parseMostRecentMatchMessage(match: any): void {
  const strippedMessages: Array<Message> = parseMessageObjects(match);
  console.log("Parsed most recent match message:", strippedMessages, match._id);
  if (matchMessagesList.has(match._id)) {
    const existingMessages = matchMessagesList.get(match._id) || [];
    const combinedMessages = mergeMessages(existingMessages, strippedMessages);
    matchMessagesList.set(match._id, combinedMessages);
  } else {
    matchMessagesList.set(match._id, strippedMessages);
  }
}
function mergeMessages(arr1: Message[], arr2: Message[]): Message[] {
  const combined = [...arr1, ...arr2];
  const uniqueMap = new Map<string, Message>();
  for (const msg of combined) {
    const key = `${msg.sentDate}-${msg.content}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, msg);
    }
  }
  const uniqueMessages = Array.from(uniqueMap.values()).sort(
    (a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime()
  );
  return uniqueMessages.map((msg, i) => ({ ...msg, index: i }));
}
