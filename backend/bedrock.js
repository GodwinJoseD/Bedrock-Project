import fs from "fs";
import path from "path";
import https from "https";
import dotenv from "dotenv";
import AWS from "aws-sdk";
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

const s3 = new AWS.S3();

export async function generateTitanImage(promptText) {
  const seed = Math.floor(Math.random() * 2147483647);

  const payload = {
    taskType: "TEXT_IMAGE",
    textToImageParams: { text: promptText },
    imageGenerationConfig: {
      numberOfImages: 1,
      quality: "standard",
      cfgScale: 8.0,
      height: 512,
      width: 512,
      seed,
    },
  };

  const body = JSON.stringify(payload);

  const options = {
    hostname: "bedrock-runtime.ap-south-1.amazonaws.com",
    port: 443,
    path: "/model/amazon.titan-image-generator-v1/invoke",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.BEDROCK_BEARER_TOKEN}`,
      "Content-Length": body.length,
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));

      res.on("end", async () => {
        let json = null;

        try {
          json = JSON.parse(data);
        } catch (err) {
          console.error("❌ JSON Parse Error:", data);

          return resolve({
            url: `https://picsum.photos/800/600?fallback=${Date.now()}`,
          });
        }

        // ❌ Titan returned error body → fallback
        if (!json.images || !json.images[0]) {
          console.error("❌ Titan Error Returned:", json);

          return resolve({
            url: `https://picsum.photos/800/600?error=${Date.now()}`,
          });
        }

        try {
          const base64Image = json.images[0];
          const buffer = Buffer.from(base64Image, "base64");
          const fileName = `titan-${Date.now()}.png`;

          await s3
            .putObject({
              Bucket: process.env.S3_BUCKET,
              Key: fileName,
              Body: buffer,
              ContentType: "image/png",
            })
            .promise();

          const signedUrl = s3.getSignedUrl("getObject", {
            Bucket: process.env.S3_BUCKET,
            Key: fileName,
            Expires: 3600,
          });

          resolve({ url: signedUrl });
        } catch (err) {
          console.error("❌ S3 Upload Error:", err);

          return resolve({
            url: `https://picsum.photos/800/600?uploadError=${Date.now()}`,
          });
        }
      });
    });

    req.on("error", (err) => {
      console.error("❌ Network Error:", err);

      resolve({
        url: `https://picsum.photos/800/600?networkError=${Date.now()}`,
      });
    });

    req.write(body);
    req.end();
  });
}
