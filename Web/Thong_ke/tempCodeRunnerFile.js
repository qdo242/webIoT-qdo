const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

// 1. Kết nối MongoDB Atlas
mongoose
  .connect('mongodb+srv://vqhuy246:Huy2462003@vuqanghuy.3wc8fub.mongodb.net/test?retryWrites=true&w=majority')
  .then(() => console.log('✅ Kết nối MongoDB thành công'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// 2. Schema đúng với dữ liệu thực tế trong collection `packets`
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
const TZ = 'Asia/Ho_Chi_Minh';

// chuyển 1 Date UTC sang Date đã cộng +7h
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

// ====== 3. API lấy 10 bản ghi mới nhất của hôm nay ======
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
    console.error('❌ Lỗi khi truy xuất dữ liệu /api/data:', error);
    return res.status(500).json({ error: 'Lỗi server khi truy xuất dữ liệu' });
  }
});

// ====== 4. Thống kê theo ngày trong 1 tháng ======
app.get('/api/daily-summary', async (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) {
    return res.status(400).json({ error: 'Thiếu tham số year hoặc month' });
  }

  try {
    const y = Number(year);
    const m = Number(month) - 1;

    const start = new Date(Date.UTC(y, m, 1));
    const end = new Date(Date.UTC(y, m + 1, 1));

    const records = await Sensor.find({
      createdAt: { $gte: start, $lt: end }
    }).sort({ createdAt: 1 });

    const dailyMap = {};
    records.forEach(r => {
      const dayStr = formatYMD(r.createdAt);
      if (!dailyMap[dayStr]) dailyMap[dayStr] = [];
      dailyMap[dayStr].push(r);
    });

    const summary = Object.entries(dailyMap).map(([date, list]) => {
      const avg = field => {
        const vals = list
          .map(i => Number(i[field]))
          .filter(v => !isNaN(v));
        if (vals.length === 0) return 0;
        const total = vals.reduce((s, v) => s + v, 0);
        return +(total / vals.length).toFixed(2);
      };

      return {
        date,
        temp_avg: avg('temp'),
        humid_avg: avg('humid'),
        lux_avg: avg('lux'),
        soil_1_avg: avg('soil_1'),
        soil_2_avg: avg('soil_2'),
        soil_3_avg: avg('soil_3'),
      };
    });

    summary.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(summary);
  } catch (err) {
    console.error('❌ Lỗi khi truy xuất dữ liệu theo tháng:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ====== 5. Thống kê theo tháng trong 1 năm ======
app.get('/api/monthly-summary', async (req, res) => {
  const { year } = req.query;
  if (!year) return res.status(400).json({ error: 'Thiếu tham số year' });

  try {
    const y = Number(year);
    const start = new Date(Date.UTC(y, 0, 1));
    const end = new Date(Date.UTC(y + 1, 0, 1));

    const records = await Sensor.find({
      createdAt: { $gte: start, $lt: end }
    });

    const monthlyMap = {};
    records.forEach(r => {
      const dt = toVNDate(r.createdAt);
      const mKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[mKey]) monthlyMap[mKey] = [];
      monthlyMap[mKey].push(r);
    });

    const summary = Object.entries(monthlyMap).map(([month, list]) => {
      const avg = field => {
        const vals = list.map(i => Number(i[field])).filter(v => !isNaN(v));
        if (vals.length === 0) return 0;
        const total = vals.reduce((s, v) => s + v, 0);
        return +(total / vals.length).toFixed(2);
      };

      return {
        month,
        temp_avg: avg('temp'),
        humid_avg: avg('humid'),
        lux_avg: avg('lux'),
        soil_1_avg: avg('soil_1'),
        soil_2_avg: avg('soil_2'),
        soil_3_avg: avg('soil_3'),
      };
    });

    summary.sort((a, b) => new Date(a.month + '-01') - new Date(b.month + '-01'));

    res.json(summary);
  } catch (err) {
    console.error('❌ Lỗi khi truy xuất dữ liệu theo năm:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ====== 5.5. Thống kê theo năm ======
app.get('/api/yearly-summary', async (req, res) => {
  try {
    const records = await Sensor.find();

    const yearlyMap = {};
    records.forEach(r => {
      const dt = toVNDate(r.createdAt);
      const yKey = dt.getFullYear();
      if (!yearlyMap[yKey]) yearlyMap[yKey] = [];
      yearlyMap[yKey].push(r);
    });

    const summary = Object.entries(yearlyMap).map(([year, list]) => {
      const avg = field => {
        const vals = list.map(i => Number(i[field])).filter(v => !isNaN(v));
        if (vals.length === 0) return 0;
        const total = vals.reduce((s, v) => s + v, 0);
        return +(total / vals.length).toFixed(2);
      };

      return {
        year: Number(year),
        temp_avg: avg('temp'),
        humid_avg: avg('humid'),
        lux_avg: avg('lux'),
        soil_1_avg: avg('soil_1'),
        soil_2_avg: avg('soil_2'),
        soil_3_avg: avg('soil_3'),
      };
    });

    summary.sort((a, b) => a.year - b.year);

    res.json(summary);
  } catch (err) {
    console.error('❌ Lỗi khi truy xuất dữ liệu theo năm:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ====== 6. Lấy dữ liệu theo 1 ngày cụ thể ======
app.get('/api/data-by-date', async (req, res) => {
  try {
    const { day, month, year } = req.query;
    if (!day || !month || !year) {
      return res.status(400).json({ message: 'Thiếu tham số ngày, tháng hoặc năm' });
    }

    const y = Number(year);
    const m = Number(month) - 1;
    const d = Number(day);

    const start = new Date(Date.UTC(y, m, d));
    const end = new Date(Date.UTC(y, m, d + 1));

    const docs = await Sensor.find({
      createdAt: { $gte: start, $lt: end }
    }).sort({ createdAt: 1 });

    const data = docs.map(doc => {
      const dt = doc.createdAt;
      const dVN = toVNDate(dt);
      return {
        ...doc.toObject(),
        date: formatYMD(dt),
        time: dVN.toTimeString().slice(0, 8)
      };
    });

    return res.json(data);
  } catch (error) {
    console.error('❌ Lỗi khi truy xuất theo ngày:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

// ====== Start server ======
app.listen(3000, () => console.log('🚀 Server đang chạy port 3000'));
