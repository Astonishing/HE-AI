import express from "express";
import pkg from "@slack/bolt";
const { App, ExpressReceiver } = pkg;
import axios from "axios";

// replace these:
const MY_CHANNEL = "C09UCJY9UJV"; 
const MY_USER = "U08H2BFAB1Q"; 

const PERSONALITY =
  "You are HE AI (raqeeb's assistant) — respect raqeeb, call him King, Gen Z coded, short replies, funny, helpful, and chill.";

const HF_MODEL = "Qwen/Qwen2.5-0.5B-Instruct";

async function aiReply(text) {
  const r = await axios.post(
    `https://api-inference.huggingface.co/models/${HF_MODEL}`,
    {
      inputs: PERSONALITY + "\nUser: " + text,
      parameters: { max_new_tokens: 120 }
    }
  );
  return r.data[0].generated_text;
}

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// ⭐ REQUIRED FOR SLACK EVENT VERIFICATION
receiver.router.post("/slack/events", (req, res) => {
  if (req.body?.challenge) {
    return res.status(200).send(req.body.challenge);
  }
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
});

app.message(async ({ message, say }) => {
  if (message.bot_id) return;
  if (message.channel !== MY_CHANNEL) return;
  if (message.user !== MY_USER) return;

  const reply = await aiReply(message.text);
  await say(reply);
});

receiver.router.get("/", (req, res) => {
  res.send("RaqeebAI running.");
});

(async () => {
  await app.start(process.env.PORT || 10000);
  console.log("HE AI is live on Render!");
})();
