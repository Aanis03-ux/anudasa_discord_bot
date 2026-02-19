require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Your KC AI system prompt
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

// When bot is ready
client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// When message is sent
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;


  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini", // Change if using another model
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message.content }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    if (reply) {
      await message.reply(reply);
    } else {
      await message.reply("⚠️ No response from model.");
    }

  } catch (error) {
    console.error("OpenRouter Error:", error.response?.data || error.message);
    await message.reply("❌ Error generating response.");
  }
});

// Login bot
client.login(process.env.BOT_TOKEN);

