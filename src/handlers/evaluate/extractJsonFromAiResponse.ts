export function extractJsonString(aiResponse: string): string {
  const fencedBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/m;
  const blockMatch = aiResponse.match(fencedBlockRegex);

  if (blockMatch && blockMatch[1]) {
    const jsonString = blockMatch[1].trim();
    try {
      JSON.parse(jsonString);
      return jsonString;
    } catch (e) {}
  }

  const trimmedResponse = aiResponse.trim();
  let startIndex = -1;
  let type: "object" | "array" | null = null;

  const firstBrace = trimmedResponse.indexOf("{");
  const firstBracket = trimmedResponse.indexOf("[");

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
    type = "object";
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    type = "array";
  }

  if (startIndex === -1 || type === null) {
    return "";
  }

  const closingChar = type === "object" ? "}" : "]";
  const endIndex = trimmedResponse.lastIndexOf(closingChar);

  if (endIndex > startIndex) {
    const potentialJson = trimmedResponse
      .substring(startIndex, endIndex + 1)
      .trim();

    try {
      JSON.parse(potentialJson);
      return potentialJson;
    } catch (e) {
      return "";
    }
  }

  return "";
}
