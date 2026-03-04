const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Kết nối MongoDB Atlas
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

// ====== ROUTE MẶC ĐỊNH ======
app.get('/', (req, res) => {
  res.send('🚀 Backend IoT System is Running!');
});

// ====== API LẤY DỮ LIỆU THỐNG KÊ ======
app.get('/api/data', async (req, res) => {
  try {
    const rawData = await Sensor.find().sort({ createdAt: -1 }).limit(10);
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

// ======================================================
// 🔥 BỔ SUNG QUAN TRỌNG: API DỰ ĐOÁN (SỬA LỖI 404 CỦA CAYTRONG.JS)
// ======================================================
app.get('/pred/:sensorId', async (req, res) => {
    try {
        const { sensorId } = req.params;
        
        // Lấy dữ liệu cảm biến mới nhất để làm căn cứ dự đoán
        const latestData = await Sensor.findOne().sort({ createdAt: -1 });

        if (!latestData) {
            return res.json([{ recommendation: "Chưa có dữ liệu cảm biến.", status: "Chờ..." }]);
        }

        // Logic dự đoán mẫu (Bạn có thể thay bằng logic AI thật sau này)
        let recommendation = "Điều kiện bình thường.";
        let status = "Ổn định";

        if (sensorId == "1") { // Giả sử sensor 1 là Nhiệt độ
            if (latestData.temp > 30) {
                recommendation = "Nhiệt độ quá cao (>30°C). Hãy bật hệ thống phun sương!";
                status = "Cảnh báo";
            }
        } else if (sensorId == "2") { // Giả sử sensor 2 là Độ ẩm đất
            if (latestData.soil_1 < 40) {
                recommendation = "Đất đang khô. Hãy kích hoạt máy bơm nước.";
                status = "Cần tưới";
            }
        }

        // Trả về mảng dữ liệu giống định dạng frontend đang chờ
        res.json([{
            sensorId: sensorId,
            recommendation: recommendation,
            status: status,
            time: new Date().toLocaleTimeString('vi-VN')
        }]);

    } catch (error) {
        console.error("❌ Lỗi API /pred:", error);
        res.status(500).json({ error: "Lỗi server dự đoán" });
    }
});
// ======================================================

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server đang chạy tại cổng: ${PORT}`);
});