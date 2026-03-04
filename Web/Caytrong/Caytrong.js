document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Trang-chu').addEventListener("click", function () {
    window.location.href = "../Dashboard_HTML/dashboard.html";
  });
});
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Thiet-bi').addEventListener("click", function () {
    window.location.href = "../Dieu_khien/Dieu_khien.html";
  });
});
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Thong-ke').addEventListener("click", function () {
    window.location.href = "../Thong_ke/Thong_ke.html";
  });
});
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('chatbot').addEventListener("click", function () {
    window.location.href = "../chatbot/AI.html";
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.detail-btn');

  buttons.forEach(button => {
    button.addEventListener('click', function () {
      const khuId = this.getAttribute('data-khu') || "1";

      // ✅ SỬA Ở ĐÂY: chuyển sang trang Điều khiển (giữ param khu)
      window.location.href = `../Dieu_khien/Dieu_khien.html?khu=${khuId}`;
    });
  });
});

// hiển thị thông báo trong chuông ------------------------------------//
document.addEventListener('DOMContentLoaded', function () {
  const bell  = document.getElementById('notif-bell');
  const panel = document.getElementById('notification-panel');
  const dot   = document.getElementById('notif-dot');
  const list  = document.getElementById('notif-list');
  const count = document.getElementById('notif-count');

  function getDeviceLabel(device) {
    switch (device) {
      case 'pump_1': return 'Bơm 1';
      case 'pump_2': return 'Bơm 2';
      case 'fan':    return 'Quạt';
      case 'light':  return 'Đèn';
      default:       return device;
    }
  }

  function addNotification(title, tag = 'Điều khiển') {
    if (!list) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const item = document.createElement('div');
    item.className = 'notif-item';
    item.innerHTML = `
      <div class="notif-title">${title}</div>
      <div class="notif-meta">
        <span>${timeStr}</span>
        <span class="notif-tag">${tag}</span>
      </div>
    `;
    list.prepend(item);

    if (count) count.textContent = list.children.length;

    if (panel && panel.style.display !== 'block' && dot) {
      dot.style.display = 'block';
    }
  }

  window.addNotification = addNotification;
  window.getDeviceLabel = getDeviceLabel;

  if (!bell) return;

  bell.addEventListener('click', () => {
    const open = panel.style.display === 'block';
    panel.style.display = open ? 'none' : 'block';
    if (!open && dot) dot.style.display = 'none';
  });

  document.addEventListener('click', (e) => {
    const isClickInside = bell.contains(e.target) || panel.contains(e.target);
    if (!isClickInside && panel.style.display === 'block') {
      panel.style.display = 'none';
    }
  });
});

function updateSensorData() {
  fetch("https://webiot-skdp.onrender.com/api/data")
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) return;

      const latest = data[data.length - 1];

      // Cập nhật ánh sáng và nhiệt độ cho tất cả khu vực
      for (let i = 1; i <= 6; i++) {
        const luxElement = document.getElementById(`as-${i}`);
        const tempElement = document.getElementById(`nd-${i}`);
        const soilElement = document.getElementById(`dad-${i}`);
        const humidElement = document.getElementById(`hmd-${i}`);
        

        if (luxElement) {
          luxElement.textContent = latest.lux + " lux";
          luxElement.style.display = "block";
        }

        if (tempElement) {
          tempElement.textContent = latest.temp + " °C";
          tempElement.style.display = "block";
        }

        if (humidElement) {
          humidElement.textContent = latest.humid + " %";
          humidElement.style.display = "block";
        }

        // if(soilElement){
        //   soilElement.textContent = latest.soil_pct + " %";
        //   soilElement.style.display = "block";
        // }

        
 // --- độ ẩm đất: thử vài tên khác nhau ---
        if (soilElement) {
          // ưu tiên kiểu soil_1, soil_2, ...
          let key = `soil_${i}`;

          // nếu server gửi kiểu soil1 / soil2
          if (latest[key] === undefined && latest[`soil${i}`] !== undefined) {
            key = `soil${i}`;
          }

          // nếu chỉ có 1 cảm biến cũ tên soil_pct thì cho khu 1 dùng tạm
          if (latest[key] === undefined && i === 1 && latest.soil_pct !== undefined) {
            key = 'soil_pct';
          }

          if (latest[key] !== undefined) {
            soilElement.textContent = latest[key] + " %";
            soilElement.style.display = "block";
          }
        }
      }

      // console.log("✅ Dữ liệu cập nhật:", latest);
    })
    .catch(err => {
      console.error("❌ Lỗi khi lấy dữ liệu từ API:", err);
    });
}

// ======================
// HIỂN THỊ AI label_text cho 3 khu (1,2,3)
// ======================
const AI_BASE = "https://webiot-skdp.onrender.com";

async function fetchLatestPred(gardenId) {
  const url = `${AI_BASE}/pred/${gardenId}?limit=1`; // ✅ dùng AI_BASE
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  const arr = await res.json();
  return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
}


function setAIText(gardenId, text) {
  const el = document.getElementById(`ai-${gardenId}`);
  if (!el) return;

  el.textContent = text || "Chưa có gợi ý tưới";
  el.style.display = "inline";

  // Nếu muốn tô màu theo nhãn (tùy thích)
  // Xanh: không tưới, Vàng: tưới ít, Cam: tưới vừa, Đỏ: tưới nhiều
  el.classList.remove("ai-0", "ai-1", "ai-2", "ai-3");
}

async function updateAIRecommendations() {
  try {
    const [p1, p2, p3] = await Promise.all([
      fetchLatestPred(1),
      fetchLatestPred(2),
      fetchLatestPred(3),
    ]);

    setAIText(1, p1?.label_text);
    setAIText(2, p2?.label_text);
    setAIText(3, p3?.label_text);

    // (Tuỳ chọn) bắn thông báo chuông khi cần tưới
    // if (window.addNotification) {
    //   [p1, p2, p3].forEach((p, idx) => {
    //     const khu = idx + 1;
    //     if (!p?.label_text) return;
    //     if (p.label !== 0) window.addNotification(`AI Khu ${khu}: ${p.label_text}`, "Gợi ý tưới");
    //   });
    // }
  } catch (err) {
    console.error("❌ Lỗi lấy AI pred:", err);
    // nếu lỗi thì vẫn để text "Đang tải..." hoặc báo lỗi nhẹ
    [1, 2, 3].forEach(i => setAIText(i, "Không lấy được gợi ý (check API)"));
  }
}

// Gọi khi load
document.addEventListener("DOMContentLoaded", () => {
  updateAIRecommendations();
  setInterval(updateAIRecommendations, 60 * 1000); // test: 60s/lần
});

// Gọi ngay khi load
updateSensorData();

// Gọi lại mỗi 5 phút
setInterval(updateSensorData, 5 * 60 * 1000); // 300000 ms
