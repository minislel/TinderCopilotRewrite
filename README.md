# TINDER COPILOT

Imagine if you had Github Copilot, but for rizz...

...you don't have to imagine anymore, I made it as a Chrome extension.

Now, armed with more knowledge, I'm totally scrapping the previous version and rewriting it with Typescript
because js is giving me too much of a headache and to be honest, the previous version is totally sloppy and the way I approached it makes me want to throw up

## Usage

Tinder Copilot utilizes Gemini-2.5-Flash from AI Studio

Tinder Copilot will automatically add so-called Rizz buttons to your Tinder conversation

"Evaluate Messages" will evaluate your messages chess.com-style, e.g. Blunder, Book Move etc.

"Rizz me" will take the whole conversation and suggest a next message for your Tinder Match

In order to use it, install the extension and just go to any Tinder conversation with any match

DOUBLE DATE CHAT SUPPORT ADDED!

## Installation

Prerequisites:

- Node.js
- Chrome browser
- Tinder Account
- Gemini API key

1. Either clone the repository or download it as .ZIP and unpack it

2. Run `npm install`

3. In background.ts paste your API key

4. Run `npm run dev`

5. Go to chrome://extensions/, check "Developer mode" and 'load unpacked', select the `dist` folder
