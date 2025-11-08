import { Message } from "@/types";
export async function fetchMessagesFromAPI(
  threadId: string,
  xauthToken: string
): Promise<Array<Message>> {
  let response;
  if (threadId.includes("-")) {
    response = await fetch(
      `https://api.gotinder.com/v1/conversations/messages?limit=30&sort_order=desc&conversation_id=${threadId}`,
      {
        headers: {
          "X-Auth-Token": xauthToken,
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        },
      }
    );
  } else {
    response = await fetch(
      `https://api.gotinder.com/v2/matches/${threadId}/messages?locale=en-GB&count=30&order=desc`,
      {
        headers: {
          "X-Auth-Token": xauthToken,
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        },
      }
    );
  }

  const data = await response.json();
  let index = 0;
  const ObjectMessages = data.data?.messages || data.messages;
  const messagesStripped: Array<Message> = ObjectMessages.map(
    (msg: any): Message => {
      return {
        from: msg.from ?? msg.user_id,
        content: msg.message ?? msg.text,
        index: index++,
      };
    }
  );
  messagesStripped.reverse();
  return messagesStripped;
}
