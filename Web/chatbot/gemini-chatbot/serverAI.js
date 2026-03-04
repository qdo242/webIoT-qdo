require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
// Cấu hình Port động cho Render
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Nên dùng biến môi trường để bảo mật
const API_KEY = process.env.API_KEY || 'AIzaSyDLsEX6exBYseaHtKEszw-qz8okpoam6Ms';

app.post('/ask', async (req, res) => {
  const userInput = req.body.prompt;
  if (!userInput) {
    return res.status(400).json({ error: 'Thiếu nội dung câu hỏi.' });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: userInput }] }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ Gemini.';
    res.json({ reply: result });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Lỗi khi gọi API Gemini.' });
  }
});

// Thêm route này để kiểm tra server có sống không
app.get('/', (req, res) => {
  res.send('🤖 AI Server is Live!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server đang chạy tại cổng: ${PORT}`);
});