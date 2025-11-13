import { Message, Profile } from "@/types/";
import { sendMessageToContentScript } from "@/background/background";
export class InterceptStorage {
  private fetchIntercepts: { endpoint: string; data: unknown }[] = [];

  private duoMatchList: Map<string, Array<string>> = new Map();
  private profilesList: Map<string, Profile> = new Map();
  private messagesList: Map<string, Array<Message>> = new Map();
  public userProfile: Profile = {} as Profile;

  constructor() {
    this.fetchIntercepts = [];
    this.duoMatchList = new Map<string, Array<string>>();
    this.profilesList = new Map<string, Profile>();
    this.messagesList = new Map<string, Array<Message>>();
  }

  public handleIntercept(endpoint: string, data: unknown): void {
    console.log("Intercepted fetch to:", endpoint, data);
    this.fetchIntercepts.push({ endpoint, data });

    if (endpoint.includes("/profile")) {
      this.parseUserProfile(data);
    } else if (endpoint.includes("/user")) {
      this.parseProfile(data);
    } else if (endpoint.includes("/conversations")) {
      this.parseGroupConversations(data, endpoint);
    } else if (endpoint.includes("/matches")) {
      if ((data as any).data?.matches) {
        for (const match of (data as any).data?.matches) {
          if (match.type && match.type === "group_match") {
            this.parseDuoMatch(match);
          } else if (endpoint.includes("message=1")) {
            this.parseMostRecentMatchMessage(match);
          }
        }
      }
      if (endpoint.includes("messages")) {
        this.parseMatchMessages(data);
      }
    }
  }
  private parseUserProfile(data: any): void {
    if (
      this.userProfile.id === undefined &&
      (data as unknown as any).data?.user?._id
    ) {
      this.userProfile.id = (data as unknown as any).data.user._id;
      console.log("User ID set to:", this.userProfile.id);
      sendMessageToContentScript("setUserId", this.userProfile.id);
    }
    if (
      this.userProfile.name === undefined &&
      (data as unknown as any).data?.user?.name
    ) {
      this.userProfile.name = (data as unknown as any).data.user.name;
    }
    if (
      this.userProfile.age === undefined &&
      (data as unknown as any).data?.user?.age
    ) {
      this.userProfile.age = (data as unknown as any).data.user.age;
    }
    if (
      this.userProfile.bio === undefined &&
      (data as unknown as any).data?.user?.bio
    ) {
      this.userProfile.bio =
        (data as unknown as any).data.user.bio ?? "No bio available";
    }
    if (
      this.userProfile.jobs === undefined &&
      (data as unknown as any).data?.user?.jobs
    ) {
      this.userProfile.jobs =
        (data as unknown as any).data.user.jobs?.[0]?.title ?? "No job listed";
    }
    if (
      this.userProfile.user_interests === undefined &&
      (data as unknown as any).data?.user?.user_interests
    ) {
      this.userProfile.user_interests =
        (
          data as unknown as any
        ).data.user.user_interests?.selected_interests?.map(
          (i: any) => i.name
        ) ?? [];
    }
    if (
      this.userProfile.descriptors === undefined &&
      (data as unknown as any).data?.user?.selected_descriptors
    ) {
      this.userProfile.descriptors =
        (data as unknown as any).data.user.selected_descriptors?.map(
          (desc: any) =>
            desc.choice_selections?.[0]
              ? `${desc.name}: ${desc.choice_selections[0].name}`
              : desc.name
        ) ?? [];
    }
    if (
      this.userProfile.schools === undefined &&
      (data as unknown as any).data?.user?.schools
    ) {
      this.userProfile.schools =
        (data as unknown as any).data.user.schools?.[0]?.name ??
        "No school listed";
    }
  }
  private parseDuoMatch(match: any): void {
    let participants: Array<string> = [];
    if (match.duo) {
      const allUniqueIds = [
        ...new Set(match.other_group_participants.map((obj: any) => obj._id)),
      ];
      const otherIds = allUniqueIds.filter(
        (id) => id !== match.duo.partners[0]
      );
      participants = [match.duo.partners[0], ...otherIds];
      this.duoMatchList.set(match._id, participants);
    }
  }
  private parseGroupConversations(data: any, endpoint: string): void {
    const conversations = data as any;
    const conversationId = endpoint.split("/").pop()?.split("=").pop();
    const messagesStripped = this.parseMessageObjects(conversations);
    if (conversationId && messagesStripped.length > 0) {
      this.messagesList.set(conversationId, messagesStripped);
    }
  }
  private parseProfile(data: any): void {
    const userData = (data as any)?.results;
    if (userData) {
      const ProfileData: Profile = {
        id: userData._id,
        name: userData.name ?? "No name",
        age: userData.age ?? 0,
        bio: userData.bio ?? "No bio available",
        jobs: userData.jobs?.[0]?.title ?? "No job listed",
        user_interests:
          userData.user_interests?.selected_interests?.map(
            (i: any) => i.name
          ) ?? [],
        descriptors:
          userData.selected_descriptors?.map((desc: any) =>
            desc.choice_selections?.[0]
              ? `${desc.name}: ${desc.choice_selections[0].name}`
              : desc.name
          ) ?? [],
        schools: userData.schools?.[0]?.name ?? "No school listed",
      };
      this.profilesList.set(ProfileData.id, ProfileData);
      console.log("Parsed profile:", ProfileData);
    }
  }
  private parseMessageObjects(data: any): Array<Message> {
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
  private parseMatchMessages(data: any): void {
    const matchMessages = (data as any)?.data?.messages;
    if (matchMessages) {
      const threadId = matchMessages[0]?.match_id;
      const messagesStripped = this.parseMessageObjects(data);
      console.log("Parsed match messages:", messagesStripped, threadId);
      if (!threadId) return;
      if (this.messagesList.has(threadId)) {
        const existingMessages = this.messagesList.get(threadId) || [];
        const combinedMessages = this.mergeMessages(
          existingMessages,
          messagesStripped
        );
        this.messagesList.set(threadId, combinedMessages);
      } else {
        this.messagesList.set(threadId, messagesStripped);
      }
    }
  }
  private parseMostRecentMatchMessage(match: any): void {
    const strippedMessages: Array<Message> = this.parseMessageObjects(match);
    console.log(
      "Parsed most recent match message:",
      strippedMessages,
      match._id
    );
    if (this.messagesList.has(match._id)) {
      const existingMessages = this.messagesList.get(match._id) || [];
      const combinedMessages = this.mergeMessages(
        existingMessages,
        strippedMessages
      );
      this.messagesList.set(match._id, combinedMessages);
    } else {
      this.messagesList.set(match._id, strippedMessages);
    }
  }
  private mergeMessages(arr1: Message[], arr2: Message[]): Message[] {
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

  public getDuoMatch(key: string): Array<string> | undefined {
    return this.duoMatchList.get(key);
  }
  public getProfile(key: string): Profile | undefined {
    console.log(`--- DEBUG START ---`);
    console.log(`Szukam klucza: '${key}'`);
    console.log(`Czy mapa ma klucz?: ${this.profilesList.has(key)}`);
    console.log(`Co zwraca GET?:`, this.profilesList.get(key));
    console.log(`--- DEBUG END ---`);
    return this.profilesList.get(key);
  }
  public getMessages(key: string): Array<Message> | undefined {
    return this.messagesList.get(key);
  }
  public delete(key: string): boolean {
    return false;
  }
  public listAllData(): void {
    console.log("Duo Matches:", this.duoMatchList);
    console.log("Profiles:", this.profilesList);
    console.log("Messages:", this.messagesList);
  }
}
