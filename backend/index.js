import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { generateTitanImage } from "./bedrock.js";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(bodyParser.json());

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, count = 3 } = req.body;

    const frames = [];
    for (let i = 0; i < count; i++) {
      const { url } = await generateTitanImage(prompt);
      frames.push({
        image: url,
        caption: `${prompt} — frame ${i + 1}`,
      });
    }

    res.json({ frames });
  } catch (err) {
    console.error("Generate error:", err);
    res.json({ frames: [] });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server running on", PORT));
