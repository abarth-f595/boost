const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { analyzeSite } = require('./scrapers/analyzeSite');
const { extractGenreAndKeywords } = require('./ai/analyzePrompt');
const { searchSimilarSites } = require('./search/searchSimilar');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/search', async (req, res) => {
  const { baseUrl } = req.body;

  if (!baseUrl || !baseUrl.startsWith('http')) {
    return res.status(400).json({ error: 'URLが無効です' });
  }

  try {
    const summary = await analyzeSite(baseUrl);
    const { genre, keywords } = await extractGenreAndKeywords(summary);
    const results = await searchSimilarSites(keywords, summary);

    res.json({ genre, keywords, results });
  } catch (err) {
    res.status(500).json({ error: '内部エラーが発生しました' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});