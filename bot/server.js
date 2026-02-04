const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 🔑 Supabase config
const SUPABASE_URL = "https://xwupwqjpykqfsdhexayx.supabase.co";
const SUPABASE_KEY = "sb_publishable_622CcX82uuwjmpHunLfNEA_hMjrTPcq";

app.post("/whatsapp", async (req, res) => {
  const message = req.body.Body;
  console.log("Incoming raw message:\n", message);

  try {
    const lines = message.split("\n").map(l => l.trim()).filter(l => l);

    // Extract LAST URL (ignores WhatsApp preview junk)
    const urlMatch = message.match(/https?:\/\/\S+/g);
    if (!urlMatch) {
      return res.send(`<Response><Message>❗ Please send a valid link</Message></Response>`);
    }
    const url = urlMatch[urlMatch.length - 1];

    // Remove preview lines & url
    const cleanLines = lines.filter(l => !l.includes("http") && l.length < 100);

    let category = "General";
    let title = "WhatsApp Link";

    if (cleanLines.length >= 2) {
      category = cleanLines[cleanLines.length - 2];
      title = cleanLines[cleanLines.length - 1];
    } else if (cleanLines.length === 1) {
      title = cleanLines[0];
    }

    const payload = {
      category: category,
      title: title,
      url: url,
      created_at: new Date().toISOString()
    };

    console.log("Payload to Supabase:", payload);

    await axios.post(
      `${SUPABASE_URL}/rest/v1/links`,
      payload,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        }
      }
    );

    res.send(`<Response><Message>✅ Saved:\n${category}\n${title}</Message></Response>`);

  } catch (err) {
    console.error("FULL SUPABASE ERROR:", err.response?.data || err.message);
    res.send(`<Response><Message>❌ Error saving link</Message></Response>`);
  }
});

app.listen(3000, () => console.log("Twilio bot running on port 3000"));
