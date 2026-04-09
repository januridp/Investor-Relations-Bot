import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;
  try {
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: 'Invalid conversation format' });
    }
    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.9,
        systemInstruction: "Jawab hanya menggunakan Bahasa Indonesia. gaya bahasa santai, domain pengetahuan: keuangan, kesehatan, edukasi, hobi, fitur tambahan seperti memory dan rekomendasi.",
      },
    });
    res.status(200).json({ result: response.text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});