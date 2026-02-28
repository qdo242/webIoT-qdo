// Link các trang--------------------------------------------------------//
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Trang-chu').addEventListener("click", function () {
    window.location.href = "../Dashboard(HTML)/dashboard.html";
  });
});
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Thiet-bi').addEventListener("click", function () {
    window.location.href = "../Dieu_khien/Dieu_khien.html";
  });
});
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Ngay').addEventListener("click", function () {
    window.location.href = "../Thong_ke_ngay/Ngay.html";
  });
});
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Thang').addEventListener("click", function () {
    window.location.href = "../Thong_ke_thang/Thang.html";
  });
});
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Nam').addEventListener("click", function () {
    window.location.href = "../Thong_ke_nam/Nam.html";
  });
});

document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('chatbot').addEventListener("click", function () {
    window.location.href = "../chatbot/AI.html";
  });
});
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('caytrong').addEventListener("click", function () {
    window.location.href = "../Caytrong/Caytrong.html";
  });
});

// Tương tác nút mode------------------------------------
function toggleMenu() {
  const menu = document.getElementById("modeMenu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

// Đóng menu khi click ra ngoài
window.addEventListener("click", function(event) {
  const menu = document.getElementById("modeMenu");
  const button = document.querySelector(".mode-button");
  if (!button.contains(event.target) && !menu.contains(event.target)) {
    menu.style.display = "none";
  }
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

// Vẽ biểu đồ---------------------------------------------------------------
let charts = {};
let lastTimestamps = {};

// Danh sách các biểu đồ với key là id của canvas và key dữ liệu tương ứng trong JSON
const chartConfigs = [
  { id: 'temperatureChart', key: 'temp', label: 'Nhiệt độ (°C)', color: 'red' },
  { id: 'humChart',         key: 'humid',  label: 'Độ ẩm (%)',     color: 'blue' },
  { id: 'luxChart',         key: 'lux',  label: 'Ánh sáng (lux)', color: 'orange' },
  { id: 'soil_1Chart',      key: 'soil_1', label: 'Độ ẩm đất 1 (%)', color: 'green' },
  { id: 'soil_2Chart',      key: 'soil_2', label: 'Độ ẩm đất 2 (%)', color: 'brown' },
  { id: 'soil_3Chart',      key: 'soil_3', label: 'Độ ẩm đất 3 (%)', color: 'purple' },
  // { id: 'soil_5Chart',      key: 'soil_5', label: 'Độ ẩm đất 5 (%)', color: 'cyan' },
  // { id: 'soil_6Chart',      key: 'soil_6', label: 'Độ ẩm đất 6 (%)', color: 'black' },
];

    async function fetchData() {
      try {
        const res = await axios.get('http://localhost:3000/api/data');
        const data = res.data;
        console.log('Dữ liệu nhận được:', data);

        if (data.length === 0) {
          console.log('Không có dữ liệu');
          return;
        }

        const latestTime = data[data.length - 1].time;
        const latestDate = data[data.length - 1].date;
        const newTimestamp = `${latestDate} ${latestTime}`;

        // console.log('Lần trước:', lastTimestamps.global, '| Lần mới:', newTimestamp);

        if (lastTimestamps.global === newTimestamp) {
          console.log('Dữ liệu không thay đổi');
          return;
        }

        lastTimestamps.global = newTimestamp;

        chartConfigs.forEach(({ id, key, label, color }) => {
          const ctx = document.getElementById(id)?.getContext('2d');
          if (!ctx) {
            console.warn(`Không tìm thấy canvas với id: ${id}`);
            return;
          }

          const labels = data.map(d => d.time);
          const values = data.map(d => d[key]);

          if (charts[id]) charts[id].destroy();

          charts[id] = new Chart(ctx, {
            type: 'line',
            data: {
              labels: [],
              datasets: [{
                 label,
                data: [],
                borderColor: color,
                backgroundColor: `${color}33`,
                tension: 0.3,
                pointBackgroundColor: color
              }]
            },
            options: {
              responsive: true,
              animation: false,
              scales: {
                y: { beginAtZero: true }
              }
            }
          });

          // Hiệu ứng thêm từng điểm
          let i = 0;
          const interval = setInterval(() => {
            if (i >= labels.length) {
              clearInterval(interval);
              return;
            }
            charts[id].data.labels.push(labels[i]);
            charts[id].data.datasets[0].data.push(values[i]);
            charts[id].update();
            i++;
          }, 300);
        });

        console.log('đã kiểm tra lại dữ liệu');
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ API:', error);
      }
    }

//Gọi khi DOM sẵn sàng
window.addEventListener('DOMContentLoaded', () => {
  fetchData();                    // Gọi lần đầu khi trang tải
  setInterval(fetchData, 500000); // Gọi lại mỗi 500 giây
});

// window.addEventListener('DOMContentLoaded', () => {
//   fetchData();                    // Gọi lần đầu khi trang tải
//   setInterval(fetchData, 10000); // Gọi lại mỗi 500 giây
// });


// Truy xuất dữ liệu theo ngày tháng năm
  window.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('ExportDataBtn');
    const popup = document.getElementById('ExportPopup');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('closePopup');

    // Mở popup khi bấm nút
    exportBtn.addEventListener('click', () => {
      popup.classList.remove('hidden');
      overlay.classList.remove('hidden');
    });

    // Đóng popup khi bấm nút ×
    closeBtn.addEventListener('click', () => {
      popup.classList.add('hidden');
      overlay.classList.add('hidden');
    });

    // Đóng popup khi click ra ngoài overlay
    overlay.addEventListener('click', () => {
      popup.classList.add('hidden');
      overlay.classList.add('hidden');
    });

    // Truy xuất dữ liệu khi bấm "Xác nhận"
      document.getElementById('submitDate').addEventListener('click', async () => {
      const day = document.getElementById('day').value.padStart(2, '0');
      const month = document.getElementById('month').value.padStart(2, '0');
      const year = document.getElementById('year').value;
      const message = document.getElementById('noDataMessage');

      if (!day || !month || !year) {
        message.textContent = 'Vui lòng nhập đủ ngày, tháng, năm.';
        message.classList.remove('hidden');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/data-by-date?day=${day}&month=${month}&year=${year}`);
        const data = response.data;

        // ⚠️ Kiểm tra nếu không có dữ liệu
        if (!Array.isArray(data) || data.length === 0) {
          message.textContent = `Không có dữ liệu ngày ${parseInt(day)} tháng ${parseInt(month)} năm ${year}.`;
          message.classList.remove('hidden');
          return;
        }

        console.log('📥 Dữ liệu nhận được:', data);

        const fileName = `du_lieu_${year}-${month}-${day}`;
        exportToExcel(data, fileName);

        // Đóng popup
        document.getElementById('ExportPopup').classList.add('hidden');
        document.getElementById('overlay').classList.add('hidden');
        message.classList.add('hidden');

      } catch (err) {
        console.error('Lỗi khi gọi API:', err);
        message.textContent = 'Lỗi server hoặc không kết nối được.';
        message.classList.remove('hidden');
      }
    });
  });

  // 📁 Hàm export Excel
  function exportToExcel(data, fileName = 'du_lieu_truy_xuat') {
    if (!Array.isArray(data) || data.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dữ liệu");

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

