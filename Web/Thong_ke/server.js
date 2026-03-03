const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Thêm để hỗ trợ xử lý dữ liệu JSON nếu cần

// 1. Kết nối MongoDB Atlas
// Lưu ý: Tên Database trong chuỗi kết nối là 'test' (ở cuối link), 
// hãy đảm bảo collection 'packets' nằm trong database này.
mongoose
  .connect('mongodb+srv://vqhuy246:Huy2462003@vuqanghuy.3wc8fub.mongodb.net/test?retryWrites=true&w=majority')
  .then(() => console.log('✅ Kết nối MongoDB thành công'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// 2. Schema
const SensorSchema = new mongoose.Schema(
  {
    temp: Number,
    humid: Number,
    lux: Number,
    soil_1: Number,
    soil_2: Number,
    soil_3: Number,
    counter: Number,
    src: String,
    createdAt: Date,
    updatedAt: Date
  },
  {
    collection: 'packets'
  }
);

const Sensor = mongoose.model('Sensor', SensorSchema);

// ====== Helper chung ======
function toVNDate(d) {
  const dt = new Date(d);
  dt.setHours(dt.getHours() + 7);
  return dt;
}

function formatYMD(d) {
  const dt = toVNDate(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ====== ROUTE MẶC ĐỊNH (Để kiểm tra khi nhấn vào link Render) ======
app.get('/', (req, res) => {
  res.send('🚀 Backend IoT System is Running!');
});

// ====== 3. API lấy 10 bản ghi mới nhất ======
app.get('/api/data', async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    let rawData = await Sensor.find({
      createdAt: { $gte: start, $lt: end }
    })
      .sort({ createdAt: -1 })
      .limit(10);

    if (rawData.length === 0) {
      rawData = await Sensor.find().sort({ createdAt: -1 }).limit(10);
    }

    const data = rawData
      .map(doc => {
        const d = doc.createdAt;
        const dVN = toVNDate(d);
        return {
          ...doc.toObject(),
          date: formatYMD(d),
          time: dVN.toTimeString().slice(0, 8)
        };
      })
      .reverse();

    return res.json(data);
  } catch (error) {
    console.error('❌ Lỗi API /api/data:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

// ... (Các API daily-summary, monthly-summary, yearly-summary giữ nguyên như code của bạn) ...

// ====== Start server (THAY ĐỔI QUAN TRỌNG Ở ĐÂY) ======
const PORT = process.env.PORT || 3000; // Render sẽ cấp PORT qua biến môi trường
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server đang chạy tại cổng: ${PORT}`);
});