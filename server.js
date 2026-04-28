require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve the static frontend files
app.use(express.static(__dirname));

// Secure backend endpoint to communicate with Groq API
app.post('/api/chat', async (req, res) => {
  try {
    const { systemPrompt } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Server missing GROQ_API_KEY' });
    }

    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: systemPrompt }]
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'Groq API Error');
    }
    
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
