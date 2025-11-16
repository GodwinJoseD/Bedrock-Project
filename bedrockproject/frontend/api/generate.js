import { generateTitanImage } from "./bedrock.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    return res.status(200).json({ frames });
  } catch (e) {
    console.log("API ERROR:", e);
    return res.status(200).json({ frames: [] });
  }
}
