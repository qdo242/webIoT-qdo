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
  document.getElementById('go-back').addEventListener("click", function () {
    window.location.href = "../Caytrong/Caytrong.html";
  });
});



document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const khu = urlParams.get('khu');

  // Kiểm tra khu hợp lệ (1–6)
  if (!khu || isNaN(khu) || khu < 1 || khu > 6) {
    document.getElementById('image-container').innerHTML = '<p>Khu vực không hợp lệ!</p>';
    return;
  }

  try {
    const response = await axios.get(`https://webiot-skdp.onrender.com/api/image-diagnosis`, {
      params: { khu }
    });

    const data = response.data;

    if (data.image_base64) {
      document.getElementById('plant-image').src = `data:image/jpeg;base64,${data.image_base64}`;
      document.getElementById('capture-time').textContent = `Thời gian: ${data.date} ${data.time}`;
      
    const resultArray = data.result || [];
    const resultText = resultArray.join(', ');
    document.getElementById('ai-result').textContent = `Kết quả phân tích AI: ${resultText}`;

    // 👉 Kết luận tổng quát chính xác hơn với định dạng có số
    let concludeText = '';

    if (resultArray.length === 0) {
      concludeText = `Khu vực ${khu} không có dữ liệu phân tích`;
    } else {
      const isAllHealthy = resultArray.every(item =>
        item.trim().startsWith('la_khoe_manh')
      );

      concludeText = isAllHealthy
        ? `Khu vực ${khu} khỏe mạnh`
        : `Khu vực ${khu} có cây bất thường`;
    }

    document.getElementById('conclude').textContent = concludeText;

    } else {
      document.getElementById('image-container').innerHTML = '<p>Không tìm thấy ảnh cho khu vực này.</p>';
    }

  } catch (error) {
    console.error(' Lỗi khi gọi API bằng axios:', error);
    document.getElementById('image-container').innerHTML = '<p>Lỗi khi truy xuất dữ liệu từ server.</p>';
  }
});