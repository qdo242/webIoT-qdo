// Thời tiết-------------------------------------------------------------------------------------
function fetchWeather() {
  const apiKey = '4c51cce4891ba9d206c96272abef72e4';
  const city = 'Hanoi';

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=vi`;

  axios.get(url)
    .then(response => {
      const data = response.data;
      const temp = Math.round(data.main.temp);
      const description = data.weather[0].description;
      const icon = data.weather[0].icon;


      const now = new Date();
      const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const weekday = weekdays[now.getDay()];
      const dateStr = `${weekday}, ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

      document.getElementById('weather-date').innerText = dateStr;
      document.getElementById('temp').innerText = temp;
      document.getElementById('description').innerText = description;
      document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    })
    .catch(error => {
      document.getElementById('weather-info').innerText = 'Không thể tải dữ liệu thời tiết.';
      console.error('Lỗi khi gọi API thời tiết:', error);
    });
  }

  // Gọi lần đầu
  fetchWeather();
  setInterval(fetchWeather, 60000);

// Điều khiển------------------------------------------------------------------------------- 
window.addEventListener('DOMContentLoaded', function () {
  lottie.loadAnimation({
    container: document.getElementById('lottie-animation-dk'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '../Picture/Dieu-khien.json'
  });
});
// Thống kê------------------------------------------------------------------------------- 
window.addEventListener('DOMContentLoaded', function () {
  lottie.loadAnimation({
    container: document.getElementById('lottie-animation-tk'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '../Picture/Animation - thong - ke.json'
  });
});
// Chat-bot------------------------------------------------------------------------------- 
window.addEventListener('DOMContentLoaded', function () {
  lottie.loadAnimation({
    container: document.getElementById('lottie-animation-chatbot'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '../Picture/Chat-bot.json'
  });
});
// Cây trồng------------------------------------------------------------------------------- 
window.addEventListener('DOMContentLoaded', function () {
  lottie.loadAnimation({
    container: document.getElementById('lottie-animation-cay'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '../Picture/Cay.json'
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

// Link các trang--------------------------------------------------------------------
//trang Dieu khien
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Chi-tiet-dk').addEventListener("click", function () {
    window.location.href = "../Dieu_khien/Dieu_khien.html";
  });
});

document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Thiet-bi').addEventListener("click", function () {
    window.location.href = "../Dieu_khien/Dieu_khien.html";
  });
});
//Trang thống kê
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
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('caytrong').addEventListener("click", function () {
    window.location.href = "../Caytrong/Caytrong.html";
  });
});

document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Chi-tiet-AI').addEventListener("click", function () {
    window.location.href = "../chatbot/AI.html";
  });
});
document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Chi-tiet-ct').addEventListener("click", function () {
    window.location.href = "../Caytrong/Caytrong.html";
  });
});

document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('Chi-tiet-tk').addEventListener("click", function () {
    window.location.href = "../Thong_ke/Thong_ke.html";
  });
});