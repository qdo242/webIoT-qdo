require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors()); // Cho phép frontend gọi từ domain khác
app.use(express.json()); // Đọc JSON body

const API_KEY = 'AIzaSyAmxd7Wd73nErDOcAmsfS51mMvc9BDYwJg';

app.post('/ask', async (req, res) => {
  const userInput = req.body.prompt;
  if (!userInput) {
    return res.status(400).json({ error: 'Thiếu nội dung câu hỏi.' });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: userInput }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ Gemini.';
    res.json({ reply: result });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Lỗi khi gọi API Gemini.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
