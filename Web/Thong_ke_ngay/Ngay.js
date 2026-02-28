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
  document.getElementById('realtime').addEventListener("click", function () {
    window.location.href = "../Thong_ke/Thong_ke.html";
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

// Đóng menu khi click
window.addEventListener("click", function(event) {
  const menu = document.getElementById("modeMenu");
  const button = document.querySelector(".mode-button");
  if (!button.contains(event.target) && !menu.contains(event.target)) {
    menu.style.display = "none";
  }
});


// truy xuất dữ liệu các ngày trong tháng
document.addEventListener('DOMContentLoaded', function () {

  const popup = document.getElementById('datePopup');
  const submitBtn = document.getElementById('submitDate');
  const overlay = document.getElementById('overlay');
  const yearSelect = document.getElementById('yearSelect');
  const changeDateBtn = document.getElementById('changeDateBtn');
  // Khi nhấn nút "Thay đổi tháng" sẽ hiện popup
  changeDateBtn.addEventListener('click', () => {
    datePopup.classList.remove('hidden');
    if (overlay) overlay.classList.remove('hidden');  // Nếu có overlay đè nền thì bật luôn
  });
  const closePopup = document.getElementById('closePopup');
  closePopup.addEventListener('click', () => {
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

  //  Hiện popup và overlay khi load trang
  popup.classList.remove('hidden');
  overlay.classList.remove('hidden');

  // Xác nhận chọn ngày tháng
  submitBtn.addEventListener('click', async () => {
    const month = document.getElementById('monthSelect').value;
    const year = document.getElementById('yearSelect').value;


    try {
      const response = await axios.get('http://localhost:3000/api/daily-summary', { 
        params: { year, month }
      });

      // 👉 DOM đến thẻ thông báo
      const data_note_xist = response.data;
      const noDataMsg = document.getElementById('noDataMessage');

      if (!Array.isArray(data_note_xist) || data_note_xist.length === 0) {
        noDataMsg.textContent = `Dữ liệu trong tháng ${Number(month)} năm ${year} không tồn tại. Vui lòng chọn lại!`;
        noDataMsg.classList.remove('hidden');
        return; //  Dừng luôn, không tiếp tục hiển thị biểu đồ
      } else {
        noDataMsg.classList.add('hidden'); // Ẩn thông báo nếu có dữ liệu
      }

      // Hiển thị nút ExportData khi có dữ liệu
      document.getElementById('ExportDataBtn').classList.remove('hidden');
      document.getElementById('changeDateBtn').classList.remove('hidden');
      document.getElementById('modeBtn').classList.remove('hidden');
      const data = response.data;
      console.log(' Dữ liệu ngày trung bình:', data);

      // Hiển thị biểu đồ
      await fetchDailyAverages(year, month);

      // Gọi để lặp lại--------------------------------------------------------------------------
      setInterval(() => {
        fetchDailyAverages(year, month);
      }, 500000);

      //Thay đổi title H2
      document.getElementById('dailyTitle').textContent = `Dữ liệu theo ngày của tháng ${Number(month)} năm ${year}`;

      //  Ẩn popup và overlay sau khi xác nhận
      popup.classList.add('hidden');
      overlay.classList.add('hidden');
    } catch (error) {
      console.error(' Lỗi khi lấy dữ liệu:', error);
    }
  });
});


async function fetchDailyAverages(year, month) {
  if (!year || !month) {
    console.warn('Cần có cả năm (year) và tháng (month) để lấy dữ liệu');
    return;
  }

  try {
    const res = await axios.get(`http://localhost:3000/api/daily-summary?year=${year}&month=${month}`);
    const data = res.data;

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('Không có dữ liệu trung bình hàng ngày');
      return;
    }
    
    const labels = data.map(entry => entry.date);

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
        data: data.map(entry => entry.soil_1_avg),
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
      //   label: 'Độ ẩm đất 4(%)',
      //   data: data.map(entry => entry.soil_4_avg),
      //   bg: 'rgba(100, 255, 218, 1)',
      //   border: 'rgba(100, 255, 218, 1)'
      // },
      // soil_5Chart: {
      //   label: 'Độ ẩm đất 5(%)',
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

    // Xóa biểu đồ cũ nếu có
    if (window.chartInstances) {
      for (let chart of Object.values(window.chartInstances)) {
        chart.destroy();
      }
    }

    window.chartInstances = {}; // Lưu để sau còn destroy

    // Duyệt và vẽ từng biểu đồ
    for (const [chartId, cfg] of Object.entries(datasets)) {
      const ctx = document.getElementById(chartId)?.getContext('2d');
      if (ctx) {
        window.chartInstances[chartId] = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
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
    console.error('Lỗi khi lấy dữ liệu trung bình:', err);
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
  let selectedMonth = null;

  const submitBtn = document.getElementById('submitDate'); // 👈 Khai báo ở đây!
  const overlay = document.getElementById('overlay');

  submitBtn.addEventListener('click', async () => {
    selectedMonth = document.getElementById('monthSelect').value;
    selectedYear = document.getElementById('yearSelect').value;
  });
  // Đóng cửa sổ hỏi======================================================================//
  const popup = document.getElementById('exportConfirmPopup');
  const closePopup = document.getElementById('closeExportPopup');
  closePopup.addEventListener('click', () => {
    popup.classList.add('hidden');
    overlay?.classList.add('hidden');
  });

  document.getElementById('ExportDataBtn').addEventListener('click', () => {
    document.getElementById('confirmExportText').textContent =
      `Bạn có muốn truy xuất dữ liệu tháng ${selectedMonth} năm ${selectedYear} không?`;

    document.getElementById('exportConfirmPopup').classList.remove('hidden');
    overlay.classList.remove('hidden');
  });

  document.getElementById('confirmExportBtn').addEventListener('click', async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/daily-summary', {
        params: { year: selectedYear, month: selectedMonth }
      });

      const data = res.data;

      if (!Array.isArray(data) || data.length === 0) {
        alert('Không có dữ liệu để xuất.');
        return;
      }

      // Định dạng dữ liệu để export
      const formattedData = data.map(item => ({
        Ngày: item.date,
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

      const fileName = `du_lieu_${selectedMonth}_${selectedYear}.xlsx`;
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



