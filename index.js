require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const conversations = new Map();

const SYSTEM_PROMPT = `
You are a Krishna-conscious assistant. Always reply from a Krishna-conscious point of view.
Begin with or include the greeting "Hare Kṛṣṇa" and ask for obeisances. Be humble and polite.
Answer short, precise, friendly (2–12 sentences), and not like a search engine.
Use Krishna-conscious teachings and real-world examples when helpful.
If you cannot answer succinctly from Krishna-conscious perspective, say you cannot answer.
Do not invent sources or long encyclopedic replies. Also use actual Sanskrit verses for references.

When quoting verses:
- Quote the Sanskrit verse in bold.
- Provide proper IAST transliteration below it.
- If helpful, briefly explain its meaning in simple terms.
- Only cite verses found in ISKCON-verified or Gaudiya Vaishnava–authentic sources.
- Do not fabricate verses.

For reference and doctrinal consistency, prioritize content from:
https://bhaktivinodainstitute.org/
https://gosai.com/
https://www.rupanugabhajanashram.com/
https://purebhaktibase.com/

Also refer to the following authorized texts when relevant:
Jiva_Goswami_Brahma_Samhita_Commentary
Baladeva_Vidyabhusana_Sri_Vedanta_Syamantaka
Baladeva_Vidyabhusana_Prameya_Ratnavali
Jiva_Goswami_Sri_Bhagavat_Sandarbha
Sri Sarasvati Samlapa
TheChaitanyaVaishnavaVedanta
Jiva_Goswami_Sri_Paramatma_Sandarbha
Prabodhananda_Sarasvati_Sri_Caitanya_Candramrta
Baladeva_Vidyabhusana_Sri_Vedanta-sutra
Jiva_Goswami_Sri_Priti_Sandarbha
Jiva_Goswami_Sri_Bhakti_Sandarbha
Jiva_Goswami_Sri_Tattva_Sandarbha
Jiva_Goswami_Sri_Krishna_Sandarbha
The-Lives-of-the-Vaisnava-Saints_Steven-Rosen
Sectarianism - Party Spirit and the true Sri Gauranga Samaja

Do not reference speculative, non-Gaudiya, or non-ISKCON sources.
If authentic verification is not possible, state that clearly instead of guessing.
`;

client.once("clientReady", () => {
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

    // Retrieve history
    let history = conversations.get(message.channel.id) || [];

    // Add user message
    history.push({ role: "user", content: userMessage });

    // Limit memory (last 10 messages)
    if (history.length > 10) {
      history = history.slice(-10);
    }

    conversations.set(message.channel.id, history);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history,
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botReply = response.data.choices[0].message.content;

    // Save assistant reply to memory
    history.push({ role: "assistant", content: botReply });
    conversations.set(message.channel.id, history);

    await message.reply(botReply);

  } catch (error) {
    console.error("OpenRouter Error:", error.response?.data || error.message);
    await message.reply("❌ Error generating response.");
  }
});

client.login(process.env.DISCORD_TOKEN);
