// Link các trang--------------------------------------------------------//
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
  document.getElementById('realtime').addEventListener("click", function () {
    window.location.href = "../Thong_ke/Thong_ke.html";
  });
});
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Ngay').addEventListener("click", function () {
    window.location.href = "../Thong_ke_ngay/Ngay.html";
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

//----------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
  const popup = document.getElementById('yearPopup');
  const submitBtn = document.getElementById('submitYear');
  const overlay = document.getElementById('overlay');
  const yearSelect = document.getElementById('yearSelect');
  const changeYearBtn = document.getElementById('changeYearBtn');

  // Hiện popup chọn năm khi nhấn "Thay đổi năm"
  changeYearBtn.addEventListener('click', () => {
    popup.classList.remove('hidden');
    overlay?.classList.remove('hidden');
  });

  // Nút đóng popup
  const closeYearPopup = document.getElementById('closeYearPopup');
  closeYearPopup.addEventListener('click', () => {
    popup.classList.add('hidden');
    overlay?.classList.add('hidden');
  });

  // Tạo danh sách năm
  const yearNow = new Date().getFullYear();
  for (let y = yearNow; y >= 2020; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.text = 'Năm ' + y;
    yearSelect.appendChild(opt);
  }

  // Hiện popup và overlay khi tải trang
  popup.classList.remove('hidden');
  overlay.classList.remove('hidden');

  // Xử lý nút xác nhận
  submitBtn.addEventListener('click', async () => {
    const year = yearSelect.value;

    try {
      const response = await axios.get('https://webiot-skdp.onrender.com/api/monthly-summary', {
        params: { year }
      });

      const data = response.data;
      const noDataMsg = document.getElementById('noDataMessage');

      if (!Array.isArray(data) || data.length === 0) {
        noDataMsg.textContent = `Không có dữ liệu trong năm ${year}. Vui lòng chọn lại!`;
        noDataMsg.classList.remove('hidden');
        return;
      } else {
        noDataMsg.classList.add('hidden');
      }

      // Hiển thị các nút sau khi có dữ liệu
      document.getElementById('ExportDataBtn').classList.remove('hidden');
      document.getElementById('changeYearBtn').classList.remove('hidden');
      document.getElementById('modeBtn').classList.remove('hidden');

      await fetchMonthlyAverages(year); // Gọi hiển thị dữ liệu

      // Thay đổi tiêu đề
      document.getElementById('dailyTitle').textContent = `Dữ liệu trung bình trong tháng của năm ${year}`;

      // Ẩn popup và overlay
      popup.classList.add('hidden');
      overlay.classList.add('hidden');

    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu theo năm:', error);
    }
  });
});


async function fetchMonthlyAverages(year) {
  try {
    const res = await axios.get(`https://webiot-skdp.onrender.com/api/monthly-summary?year=${year}`);
    const data = res.data;

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('Không có dữ liệu trung bình theo năm');
      return;
    }

    const monthLabels = data.map(entry => `${entry.month}`);
    const datasets = {
      temperatureChart: {
        label: 'Nhiệt độ (°C)',
        data: data.map(entry => entry.temp_avg),
        bg: 'rgba(255, 99, 132, 1)',
        border: 'rgba(255, 99, 132, 1)'
      },
      humChart: {
        label: 'Độ ẩm (%)',
        data: data.map(entry => entry.humid_avg),
        bg: 'rgba(54, 162, 235, 1)',
        border: 'rgba(54, 162, 235, 1)'
      },
      luxChart: {
        label: 'Ánh sáng (lux)',
        data: data.map(entry => entry.lux_avg),
        bg: 'rgba(255, 206, 86, 1)',
        border: 'rgba(255, 206, 86, 1)'
      },
      soil_1Chart: {
        label: 'Độ ẩm đất 1 (%)',
        data: data.map(entry => entry.soil_pct_avg),
        bg: 'rgba(75, 192, 192, 1)',
        border: 'rgba(75, 192, 192, 1)'
      },
      soil_2Chart: {
        label: 'Độ ẩm đất 2 (%)',
        data: data.map(entry => entry.soil_2_avg),
        bg: 'rgba(153, 102, 255, 1)',
        border: 'rgba(153, 102, 255, 1)'
      },
      soil_3Chart: {
        label: 'Độ ẩm đất 3 (%)',
        data: data.map(entry => entry.soil_3_avg),
        bg: 'rgba(255, 159, 64, 1)',
        border: 'rgba(255, 159, 64, 1)'
      },
      // soil_4Chart: {
      //   label: 'Độ ẩm đất 44(%)',
      //   data: data.map(entry => entry.soil_4_avg),
      //   bg: 'rgba(100, 255, 218, 1)',
      //   border: 'rgba(100, 255, 218, 1)'
      // },
      // soil_5Chart: {
      //   label: 'Độ ẩm đất 55(%)',
      //   data: data.map(entry => entry.soil_5_avg),
      //   bg: 'rgba(255, 105, 180, 1)',
      //   border: 'rgba(255, 105, 180, 1)'
      // },
      // soil_6Chart: {
      //   label: 'Độ ẩm đất 6 (%)',
      //   data: data.map(entry => entry.soil_6_avg),
      //   bg: 'rgba(0, 200, 83, 1)',
      //   border: 'rgba(0, 200, 83, 1)'
      // }
    };

    if (window.chartInstances) {
      for (let chart of Object.values(window.chartInstances)) {
        chart.destroy();
      }
    }

    window.chartInstances = {};

    for (const [chartId, cfg] of Object.entries(datasets)) {
      const ctx = document.getElementById(chartId)?.getContext('2d');
      if (ctx) {
        window.chartInstances[chartId] = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: monthLabels,
            datasets: [{
              label: cfg.label,
              data: cfg.data,
              backgroundColor: cfg.bg,
              borderColor: cfg.border,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            },
            plugins: {
              title: {
                display: true,
                text: cfg.label
              }
            }
          }
        });
      }
    }

  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu trung bình theo năm:', err);
  }
}

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

// Tải dữ liệu dưới dạng excel-==========================================================//
document.addEventListener('DOMContentLoaded', function () {
  let selectedYear = null;

  const submitBtn = document.getElementById('submitYear'); // 👈 Khai báo ở đây!
  const overlay = document.getElementById('overlay');

  submitBtn.addEventListener('click', async () => {
    selectedYear = document.getElementById('yearSelect').value;
  });

  const popup = document.getElementById('exportConfirmPopup');
  const closeExportPopup = document.getElementById('closeExportPopup');
  closeExportPopup.addEventListener('click', () => {
    popup.classList.add('hidden');
    overlay?.classList.add('hidden');
  });

  document.getElementById('ExportDataBtn').addEventListener('click', () => {
    document.getElementById('confirmExportText').textContent =
      `Bạn có muốn truy xuất dữ liệu năm ${selectedYear} không?`;

    document.getElementById('exportConfirmPopup').classList.remove('hidden');
    overlay.classList.remove('hidden');
  });

  document.getElementById('confirmExportBtn').addEventListener('click', async () => {
    try {
      const res = await axios.get('https://webiot-skdp.onrender.com/api/monthly-summary', {
        params: { year: selectedYear }
      });


      const data = res.data;

      if (!Array.isArray(data) || data.length === 0) {
        alert('Không có dữ liệu để xuất.');
        return;
      }

      // Định dạng dữ liệu để export
      const formattedData = data.map(item => ({
        Tháng: item.month,
        'Nhiệt độ (°C)': item.temp_avg ?? '',
        'Độ ẩm (%)': item.humid_avg ?? '',
        'Ánh sáng (lux)': item.lux_avg ?? '',
        'Độ ẩm đất 1 (%)': item.soil_1_avg ?? '',
        'Độ ẩm đất 2 (%)': item.soil_2_avg ?? '',
        'Độ ẩm đất 3 (%)': item.soil_3_avg ?? '',
        // 'Độ ẩm đất 4 (%)': item.soil_4_avg ?? '',
        // 'Độ ẩm đất 5 (%)': item.soil_5_avg ?? '',
        // 'Độ ẩm đất 6 (%)': item.soil_6_avg ?? ''
      }));

      // Tạo và ghi file
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'DuLieu');

      const fileName = `du_lieu_${selectedYear}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      // Ẩn popup và overlay
      document.getElementById('exportConfirmPopup').classList.add('hidden');
      document.getElementById('overlay').classList.add('hidden');

    } catch (error) {
      console.error('Lỗi khi truy xuất dữ liệu:', error);
      alert('Lỗi khi truy xuất dữ liệu!');
    }
  });
});

