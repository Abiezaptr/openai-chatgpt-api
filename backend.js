import express from "express"
import OpenAI from "openai"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express()
app.use(bodyParser.json())

// Function to upload a file to OpenAI
async function uploadFile(filePath) {
    try {
      // Read the file from the file system
      const fileStream = fs.createReadStream(filePath);
  
      // Upload the file to OpenAI
      const response = await openai.files.create({
        file: fileStream,
        purpose: 'fine-tune', // or 'search', 'answers', etc., depending on your use case
      });
  
      console.log('File uploaded successfully:', response.data);
      return response.data.id; // Return the file ID
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
}

// Example usage
const filePath = './superseru.png'; // Replace with the path to your file
const fileID = await uploadFile(filePath);

app.get("/", (req, res) => {
    res.send("Hello World..!!")
})

app.get("/ask", (req, res) => {

    async function main() {
        const completion = await openai.chat.completions.create({
          messages: [{ role: "system", content: "what is nodemon nodejs function?" }],
          model: "gpt-3.5-turbo",
        });
        console.log(completion.choices[0]);
        res.json(completion.choices[0].message.content)
      }
    
    main()
})

app.post("/openai_ask", async (req, res) => {
    const prompt = req.body.prompt
    try {
        if (prompt == null) {
          throw new Error("no prompt was provided");
        }

        const response = await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt,
            max_tokens:1000
        });
    
        const completion = response.choices[0].text;
    
        return res.status(200).json({
          success: true,
          message: completion,
        });
      } catch (error) {
        console.log(error.message);
      }

})

app.get("/chatcompletion", (req, res) => {
    async function main() {
        const completion = await openai.chat.completions.create({
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant",
              },
              { role: "user", 
                content: "what is nodemon nodejs function?" 
              },
            ],
            model: "gpt-4-turbo",
            // response_format: { type: "json_object" },
          });
          console.log(completion.choices[0]);
          res.json(completion.choices[0].message.content)
      }

    main()
})

app.get("/chatwithfile", (req, res) => {
    async function main() {
        const completion = await openai.chat.completions.create({
            messages: [
              {
                role: "system",
                content: `file=${fileID}`,
              },
              { role: "user", 
                content: "please summarize this file" 
              },
            ],
            model: "gpt-4-turbo",
            // response_format: { type: "json_object" },
          });
          console.log(completion.choices[0]);
          res.json(completion.choices[0].message.content)
      }

    main()
})

app.get("/completion", (req, res) => {
    async function main() {
        const completion = await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: 'what is nodemon nodejs function?'
        });
        console.log(completion['choices'][0]);
        res.json(completion['choices'][0]['text'])
      }

    main()
})

const PORT = 3000 || process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})