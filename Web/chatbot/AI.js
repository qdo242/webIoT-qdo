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
  document.getElementById('caytrong').addEventListener("click", function () {
    window.location.href = "../Caytrong/Caytrong.html";
  });
});

window.addEventListener('DOMContentLoaded', () => {
  // Lottie animation
  lottie.loadAnimation({
    container: document.getElementById('lottie-animation-chatbot'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '../Picture/Chat-bot.json'
  });
});

// Hàm định dạng nội dung trả lời
function formatText(text) {
  text = text.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

  const lines = text.split('\n');
  let formatted = '';
  let inList = false;

  lines.forEach(line => {
    if (line.trim().startsWith('* ')) {
      if (!inList) {
        formatted += '<ul style="padding-left: 20px; margin: 4px 0;">';
        inList = true;
      }
      const item = line.replace('* ', '').trim();
      formatted += `<li style="margin: 2px 0;">${item}</li>`;
    } else {
      if (inList) {
        formatted += '</ul>';
        inList = false;
      }
      if (line.trim() !== '') {
        formatted += `<p style="margin: 4px 0; line-height: 1.5;">${line.trim()}</p>`;
      }
    }
  });

  if (inList) {
    formatted += '</ul>';
  }

  return formatted;
}

window.addEventListener('DOMContentLoaded', () => {
  // Các phần tử DOM
  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");
  const chatDisplay = document.getElementById("chatDisplay");
  const chatContainer = document.querySelector(".chat-container");
  const loading = document.getElementById("loading");

  // Hàm gọi API Gemini
  async function askGemini(promptText) {
    try {
      loading.classList.remove("hidden"); // ⏳ Hiện loading

      const response = await axios.post('http://localhost:3001/ask', {
        prompt: promptText
      });

      return response.data.reply;
    } catch (error) {
      console.error("Lỗi khi gọi server:", error);
      return "Đã xảy ra lỗi khi gửi yêu cầu đến máy chủ.";
    } finally {
      loading.classList.add("hidden"); // Ẩn loading khi xong
    }
  }

  // Hàm reset input (dọn gọn và thu nhỏ lại khung nhập)
  function resetInput() {
    userInput.value = "";
    userInput.style.height = "auto";
  }

  // Gửi bằng nút Enter (trừ Shift+Enter để xuống dòng)
  userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendBtn.click();
    }
  });

  // Tự động co giãn khung nhập theo nội dung
  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = userInput.scrollHeight + "px";
  });

  // Gửi tin nhắn
  sendBtn.addEventListener("click", async () => {
    const prompt = userInput.value.trim();
    if (!prompt) return;

    chatContainer.classList.add("chat-started");
    chatDisplay.classList.remove("hidden");

    // Hiển thị tin nhắn người dùng
    const userMsg = document.createElement("div");
    userMsg.classList.add("chat-message", "user");
    userMsg.innerHTML = formatText(prompt);
    chatDisplay.appendChild(userMsg);

    // ✅ Thêm dòng này để lưu tin nhắn người dùng
    if (!currentChat) startNewChat();
    currentChat.messages.push({ from: 'user', text: prompt });

    // Gọi AI
    const reply = await askGemini(prompt);

    // ✅ Thêm dòng này để lưu tin nhắn AI
    currentChat.messages.push({ from: 'ai', text: reply });

    // Hiển thị phản hồi AI
    const aiMsg = document.createElement("div");
    aiMsg.classList.add("chat-message", "ai");
    aiMsg.innerHTML = formatText(reply);
    chatDisplay.appendChild(aiMsg);

    saveChatHistory();
    renderChatHistory();

    resetInput();
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
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

// Xử lý lịch sử đoạn chat và đoạn chat mới=============================================//
    let chatHistory = [];
    let currentChat = null;

    // ✅ Lưu lịch sử vào localStorage
    function saveChatHistory() {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      console.log('[DEBUG] Đã lưu vào localStorage:', chatHistory);
    }

    // ✅ Hiển thị danh sách lịch sử
    function renderChatHistory() {
      const panel = document.getElementById('chatHistoryPanel');
      if (!panel) return;

      panel.innerHTML = '';
      chatHistory.forEach((chat) => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.textContent = chat.title || 'Chưa có tiêu đề';

        li.addEventListener('click', () => {
          currentChat = chat;  // Gán lại đoạn chat đang chọn

          // Xóa nội dung cũ
          const chatDisplay = document.getElementById("chatDisplay");
          chatDisplay.innerHTML = "";

          // Ẩn phần greeting và animation
          document.querySelector(".greeting")?.classList.add("hidden");
          document.getElementById("lottie-animation-chatbot")?.classList.add("hidden");

          // Hiện lại đoạn chat cũ
          chat.messages.forEach(msg => {
            const div = document.createElement("div");
            div.classList.add("chat-message", msg.from === 'user' ? 'user' : 'ai');
            div.innerHTML = formatText(msg.text);
            chatDisplay.appendChild(div);
          });

          chatDisplay.classList.remove("hidden");
          document.querySelector(".chat-container")?.classList.add("chat-started");

          // Cuộn xuống cuối cùng
          chatDisplay.scrollTop = chatDisplay.scrollHeight;
        });

        panel.appendChild(li);
      });
    }

    // ✅ Tạo đoạn chat mới
    function startNewChat() {
      currentChat = {
        id: Date.now(),
        title: "Chưa có tiêu đề",
        messages: [],
      };
      chatHistory.unshift(currentChat);
      saveChatHistory();
      renderChatHistory();
    }

    // ✅ Gửi tin nhắn
    function handleUserInput(text) {
      if (!text.trim()) return;
      if (!currentChat) startNewChat();

      currentChat.messages.push({ from: 'user', text });

      // Nếu chưa có tiêu đề thì cập nhật bằng nội dung đầu tiên
      if (currentChat.title === "Chưa có tiêu đề") {
        currentChat.title = text.length > 30 ? text.slice(0, 30) + "..." : text;
      }

      saveChatHistory();
      renderChatHistory();

      // Hiển thị tin nhắn trong khung chat
      const chatDisplay = document.getElementById("chatDisplay");
      if (chatDisplay) {
        const msg = document.createElement("div");
        msg.textContent = text;
        msg.className = "user-message";
        chatDisplay.appendChild(msg);
        chatDisplay.classList.remove("hidden");
      }

      // Ẩn phần greeting và animation
      document.querySelector(".greeting")?.classList.add("hidden");
      document.getElementById("lottie-animation-chatbot")?.classList.add("hidden");

      document.querySelector(".chat-container")?.classList.add("chat-started");

      const userInput = document.getElementById("userInput");
      if (userInput) {
        userInput.value = "";
        userInput.style.height = "auto";
      }
    }

    // ✅ Khi DOM đã sẵn sàng
    window.addEventListener('DOMContentLoaded', () => {
      console.log('[DEBUG] DOMContentLoaded...');

      // Tải lịch sử từ localStorage
      const stored = localStorage.getItem('chatHistory');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            chatHistory = parsed;
            // currentChat = chatHistory[0] || null;   bỏ dòng này
          }
        } catch (e) {
          console.error('[ERROR] Lỗi parse JSON:', e);
        }
      }

      // Luôn tạo đoạn chat mới sau khi load lại
      //startNewChat();
      renderChatHistory();

      // Gửi tin nhắn khi bấm nút send
      const sendBtn = document.getElementById("sendBtn");
      sendBtn?.addEventListener("click", () => {
        const userInput = document.getElementById("userInput");
        if (userInput) {
          const text = userInput.value.trim();
          handleUserInput(text);
        }
      });

      // Cũng gửi bằng phím Enter nếu cần
      const userInput = document.getElementById("userInput");
      userInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          const text = userInput.value.trim();
          handleUserInput(text);
        }
      });
    });

document.addEventListener('DOMContentLoaded', () => {
  const newChatBtn = document.getElementById("Newchat");

  newChatBtn?.addEventListener("click", () => {
    // 1. Tạo đoạn chat mới
    startNewChat();

    // 2. Xóa nội dung cũ trên giao diện
    const chatDisplay = document.getElementById("chatDisplay");
    chatDisplay.innerHTML = "";

    // 3. Hiện phần greeting và animation nếu có
    document.querySelector(".greeting")?.classList.remove("hidden");
    document.getElementById("lottie-animation-chatbot")?.classList.remove("hidden");

    // 4. Reset trạng thái
    chatDisplay.classList.add("hidden");
    document.querySelector(".chat-container")?.classList.remove("chat-started");

    // 5. Reset input
    const userInput = document.getElementById("userInput");
    if (userInput) {
      userInput.value = "";
      userInput.style.height = "auto";
    }
  });
});


