import express from "express";
import OpenAI from "openai";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World..!!");
});

app.get("/ask", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "what is nodemon nodejs function?" }],
      model: "gpt-3.5-turbo",
    });
    console.log(completion.choices[0]);
    res.json(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error processing request" });
  }
});

app.post("/openai_ask", async (req, res) => {
  const prompt = req.body.prompt;
  try {
    if (prompt == null) {
      throw new Error("no prompt was provided");
    }

    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt,
      max_tokens: 1000
    });

    const completion = response.choices[0].text;

    return res.status(200).json({
      success: true,
      message: completion,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error processing request" });
  }
});

app.get("/chatcompletion", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant" },
        { role: "user", content: "what is nodemon nodejs function?" },
      ],
      model: "gpt-4-turbo",
    });
    console.log(completion.choices[0]);
    res.json(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error processing request" });
  }
});

app.get("/completion", async (req, res) => {
  try {
    const completion = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: 'what is nodemon nodejs function?'
    });
    console.log(completion['choices'][0]);
    res.json(completion['choices'][0]['text']);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error processing request" });
  }
});

app.post("/chatwithfile", async (req, res) => {
  const question = "Please summarize this file";
  const imagePath = "uploads/superseru.png";

  try {
    const contents = fs.readFileSync(imagePath);
    const base64_image = `data:image/jpeg;base64,${contents.toString("base64")}`;

    const payload = {
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: question },
            { type: "image_url", image_url: { url: base64_image } },
          ],
        },
      ],
      max_tokens: 1000,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    };

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      { headers }
    );

    // Filter response data to include only desired information
    const filteredData = {
      prompt: question,
      model: response.data.model,
      summary: response.data.choices[0].message.content,
    };

    return res.status(200).json(filteredData);
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Error processing request" });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});