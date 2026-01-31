import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fs from  'fs/promises';
import { GoogleGenAI, Models } from '@google/genai';

const app = express();
const upload = multer();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Set your default Gemini model here:**
const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(express.json());
app.use(express.static('public'));

// sinkronisasi dengan endpoint di file public/script.js
app.post('/api/chat', async (req, res) => {

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message kosong" });
    }

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: message
        });

        res.json({
            reply: response.text()
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e.message });
    }
}); 
// ends here untuk chat endpoint

// opsi lainnya untuk app.post di sesi minggu kemarin
app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await ai.models.generateContent ({
            model: GEMINI_MODEL,
            contents: prompt
                });
    res.status(200).json({ result:response.text });
            } catch (e) {
            console.log(e);
            res.status(500).json({ message: e.message });
            }
});

app.post("/generate-image", upload.single("image"), async (req, res) => {
    const {prompt} = req.body;
    const base64Image = req.file.buffer.toString("base64");

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt, type: "text" },
                { inlineData: {data: base64Image, mimeType: req.file.mimetype}}
            ],
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

app.post("/generate-document", upload.single("document"), async (req, res) => {
    const { prompt } = req.body;
    const base64Document = req.file.buffer.toString("base64");

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt ?? "Tolong buat ringkasan dari dokumen berikut.", type: "text" },
                { inlineData: { data: base64Document, mimeType: req.file.mimetype } }
            ],
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

app.post("/generate-audio", upload.single("audio"), async (req, res) => {
    const { prompt } = req.body;
    const base64Audio = req.file.buffer.toString("base64");

    try {
        const response = await ai.models.generateContent({ 
            model: GEMINI_MODEL,
            contents: [
                { text: prompt ?? "Tolong buat transkripsi dari rekaman berikut.", type: "text" },
                { inlineData: { data: base64Audio, mimeType: req.file.mimetype } } 
            ],
        });
        res.status(200).json({ result: response.text });
    }
         catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }   
});

// Memulai server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));