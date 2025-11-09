import { Message } from "@/types";
export async function fetchMessagesFromAPI(
  threadId: string,
  xauthToken: string
): Promise<Array<Message>> {
  let response;
  try {
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
  } catch (error) {
    console.error("Network error fetching messages:", error);
    const err = {
      name: "Network error fetching messages",
      message: error instanceof Error ? error.message : String(error),
      status: 503,
      function: "fetchMessagesFromAPI",
    };
    throw err;
  }
  if (!response.ok) {
    const err = {
      name: "Error fetching messages",
      message: "Failed to fetch messages from API",
      status: response.status,
      function: "fetchMessagesFromAPI",
    };
    throw err;
  }
  const data = await response.json();
  console.log("Fetched messages data:", data);
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
  messagesStripped.reverse();
  return messagesStripped;
}
