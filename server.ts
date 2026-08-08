import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization helper for Gemini
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// ==================== API ROUTES ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Dar Business Development Database' });
});

// Gemini AI CV Enhancer & Translator endpoint
app.post('/api/gemini/enhance-cv', async (req, res) => {
  try {
    const { rawText, action, targetLang } = req.body;
    
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'rawText is required' });
    }

    const ai = getGeminiAI();

    let systemInstruction = 'You are an expert construction consultancy HR consultant and Chief Structural Engineer at Dar Al-Handasah / Dar Business Development. Your goal is to rewrite and polish engineering CV bullet points, project descriptions, and executive summaries to international engineering consultancy standards (FIDIC contracts, quality control, high-rise buildings, highway bridges, sub-station supervision).';

    let prompt = '';

    if (action === 'translate') {
      const langName = targetLang === 'am' ? 'Amharic (አማርኛ)' : targetLang === 'ar' ? 'Arabic (العربية)' : 'English';
      prompt = `Translate the following CV text accurately into ${langName}. Preserve technical engineering terminology (e.g., FIDIC, BOQ, IPC, QA/QC, concrete mix, structural analysis). Return ONLY the translated text:\n\n${rawText}`;
    } else {
      prompt = `Enhance, professionalize, and format the following raw CV project experience / duties into impressive bullet points suitable for a senior construction supervision consultancy candidate. Highlight leadership, compliance, quality assurance, safety, and budget control:\n\n${rawText}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3
      }
    });

    const resultText = response.text || 'Unable to generate response.';
    res.json({ success: true, result: resultText });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error?.message || 'Failed to enhance CV via Gemini AI engine.' 
    });
  }
});

// Google Drive Sync simulation endpoint
app.post('/api/drive/sync', (req, res) => {
  const { fileName, action, payload } = req.body;
  
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const masterDriveId = '10idSQEP8yefEYlT5qqF0LcsyCfjXEvMH';
  
  let driveUrl = `https://drive.google.com/drive/folders/${masterDriveId}`;
  if (payload && typeof payload === 'object' && payload.fullName) {
    const cleanName = payload.fullName.trim();
    driveUrl = `https://drive.google.com/drive/search?q=${encodeURIComponent(`"${cleanName}"`)}`;
  }

  res.json({
    success: true,
    syncLog: {
      id: `log-${Date.now()}`,
      timestamp,
      fileName: fileName || `Dar_Database_Backup_${Date.now()}.xlsx`,
      status: 'synced',
      action: action || 'backup',
      fileSize: '1.8 MB',
      driveUrl
    },
    message: 'Successfully synchronized to Google Drive master folder 10idSQEP8yefEYlT5qqF0LcsyCfjXEvMH'
  });
});

// ==================== VITE & STATIC SERVING ====================

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dar Business Development Database Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
