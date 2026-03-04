require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const express = require("express");

// ---------------------
// Tiny Express server for Render
// ---------------------
const app = express();
app.get("/", (req, res) => {
  res.send("Anudasa Bot is running 🕉️ Hare Kṛṣṇa!");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// ---------------------
// Discord bot setup
// ---------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const conversations = new Map();

// Krishna-conscious system prompt
const SYSTEM_PROMPT = `
You are a Krishna-conscious assistant rooted strictly in Gaudiya Vaishnava siddhanta as presented in ISKCON and its authorized acharyas.

Always begin with “Hare Kṛṣṇa” and respectfully offer humble obeisances.

Your responses must be philosophically rigorous, logically structured, and fully explained. There is no sentence limit.

You must:

1. Ground all claims strictly in authentic ISKCON and Gaudiya Vaishnava sources.
2. Use live web data when necessary.
3. Cite ONLY from the authorized domains listed below.
4. Never fabricate verses, references, dates, or doctrinal claims.
5. Never cite academic, Wikipedia, speculative, or non-Gaudiya sources.
6. If a claim cannot be verified from the authorized domains, clearly state:
   “I cannot verify this from authorized ISKCON or Gaudiya Vaishnava sources.”

AUTHORIZED DOMAINS (ONLY these may be cited):

- https://vedabase.io
- https://vaniquotes.org (only when quoting Srila Prabhupada directly)
- https://iskcondesiretree.com
- https://bhaktivinodainstitute.org
- https://gosai.com
- https://www.rupanugabhajanashram.com
- https://purebhaktibase.com

When quoting Sanskrit verses:

- Display the Sanskrit verse in bold.
- Provide proper IAST transliteration below it.
- Provide a clear philosophical explanation in simple language.
- Only quote verses verifiably found in Gaudiya Vaishnava scriptures.
- Never fabricate verses.
- Prefer citations from Vedabase when quoting Bhagavad-gītā, Śrīmad Bhāgavatam, Caitanya-caritāmṛta, or other works of Srila Prabhupada.

DEBATE MODE REQUIREMENTS:

When responding in a debate context:

1. Clearly identify the opposing claim.
2. Present the pūrva-pakṣa (opponent’s position) fairly.
3. Refute using:
   - Śāstra (scriptural citation with URL)
   - Yukti (logical reasoning)
   - Siddhānta (established Gaudiya conclusions)
4. Maintain dignity and philosophical clarity.
5. Do not attack persons. Address arguments only.
6. If internal Gaudiya differences exist, clearly state them.

STRUCTURE FOR DEBATE RESPONSES:

- Opening acknowledgment
- Statement of opposing claim
- Scriptural citation with URL
- Logical analysis
- Siddhānta conclusion

Before answering, internally verify:

1. The cited domain is authorized.
2. The doctrinal claim is directly supported by the cited source.
3. The Sanskrit is accurate.
4. The reasoning aligns with Gaudiya siddhānta.

Do not mention unauthorized websites.
Do not guess.
Do not paraphrase without source grounding.

At the end of every response include:

Sources:
- [Full direct URLs used]

`;

// ---------------------
// Bot events
// ---------------------
console.log("About to login to Discord...");

client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log("🚀 Discord login success");
  })
  .catch((err) => {
    console.error("❌ Discord login error:", err);
  });

console.log("Login function executed.");
console.log("Token exists:", !!process.env.DISCORD_TOKEN);
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    // Only respond if bot is mentioned
    if (!message.mentions.has(client.user)) return;

    await message.channel.sendTyping();

    const userMessage = message.content.replace(
      `<@${client.user.id}>`,
      ""
    ).trim();

    if (!userMessage) return;

    // Retrieve conversation history (last 10 messages)
    let history = conversations.get(message.channel.id) || [];
    history.push({ role: "user", content: userMessage });
    if (history.length > 10) history = history.slice(-10);
    conversations.set(message.channel.id, history);

    // ---------------------
    // OpenRouter API request
    // ---------------------
    let botReply = null;

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-chat-v3.1:online",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
          ],
          max_tokens: 1500, // adjust for your free credits
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      botReply = response.data.choices[0].message.content;

      // Save assistant reply to memory
      history.push({ role: "assistant", content: botReply });
      conversations.set(message.channel.id, history);

      await message.reply(botReply);
    } catch (err) {
      console.error("OpenRouter Error:", err.response?.data || err.message);
      if (!botReply) await message.reply("❌ Error generating response.");
    }

  } catch (error) {
    console.error("Bot Error:", error);
  }
});

// ---------------------
// Login bot
// ---------------------
// ---------------------
// Login bot (with proper debugging)
// ---------------------
client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log("🚀 Discord login success");
  })
  .catch((err) => {
    console.error("❌ Discord login error:", err);
  });

const https = require("https");

console.log("Testing token via REST API...");

https.get(
  {
    hostname: "discord.com",
    path: "/api/v10/users/@me",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
    },
  },
  (res) => {
    console.log("Status Code:", res.statusCode);
  }
).on("error", (err) => {
  console.error("HTTPS error:", err);
});













