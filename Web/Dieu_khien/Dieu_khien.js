const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');

/***********************
 * NOTIFICATION (BELL) - BỔ SUNG LẠI (để không mất chuông)
 ***********************/
(function initNotificationSystem() {
  let bell, panel, dot, list, count;

  // map label dùng chung
  window.getDeviceLabel = window.getDeviceLabel || function (device) {
    switch (device) {
      case 'pump_1': return 'Bơm 1';
      case 'pump_2': return 'Bơm 2';
      case 'pump_3': return 'Bơm 3';
      case 'fan':    return 'Quạt';
      case 'light':  return 'Đèn';
      case 'ai_auto':return 'AI tưới tự động';
      default:       return device;
    }
  };

  // hàm addNotification dùng chung
  window.addNotification = window.addNotification || function (title, tag = 'Điều khiển') {
    if (!list || !count) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

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
    count.textContent = list.children.length;

    // hiện chấm đỏ nếu panel đang đóng
    if (panel && panel.style.display !== 'block' && dot) {
      dot.style.display = 'block';
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    bell  = document.getElementById('notif-bell');
    panel = document.getElementById('notification-panel');
    dot   = document.getElementById('notif-dot');
    list  = document.getElementById('notif-list');
    count = document.getElementById('notif-count');

    if (!bell || !panel) return;

    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = panel.style.display === 'block';
      panel.style.display = open ? 'none' : 'block';
      if (!open && dot) dot.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
      const isInside = bell.contains(e.target) || panel.contains(e.target);
      if (!isInside) panel.style.display = 'none';
    });
  });
})();


client.on('connect', () => {
  client.subscribe('/controller/', (err) => {
    if (err) console.error("Không thể subscribe topic:", err);
    else console.log("Đã subscribe topic /controller/");
  });

  // // (nếu bạn có dùng camera thì nên subscribe luôn)
  // client.subscribe('/camera/', (err) => {
  //   if (err) console.error("Không thể subscribe topic /camera/:", err);
  //   else console.log("Đã subscribe topic /camera/");
  // });
});

// ✅ SỬA Ở ĐÂY: dùng 1 hàm label chuẩn cho mọi nơi (fix lỗi pump_3 hiện pump_3)
function labelOf(device) {
  if (window.getDeviceLabel) return window.getDeviceLabel(device);
  switch (device) {
    case 'pump_1': return 'Bơm 1';
    case 'pump_2': return 'Bơm 2';
    case 'pump_3': return 'Bơm 3';
    case 'fan':    return 'Quạt';
    case 'light':  return 'Đèn';
    default:       return device;
  }
}

// Danh sách thiết bị đang chờ phản hồi
const pendingDevices = new Set();

// Gửi yêu cầu MQTT (BƠM)
function sendPumpRequest(device, flow) {
  const payload = { device: device, state: flow, type: "request" };
  pendingDevices.add(device);
  client.publish('/controller/', JSON.stringify(payload), { retain: true, qos: 1 });
}

// Hiển thị thông báo ra UI nhỏ ở thẻ
function showMessage(div, text, color = "green") {
  if (div) {
    div.textContent = text;
    div.style.color = color;
  }
}

// Áp dụng lưu lượng nước và gửi request (chưa bật công tắc)
function applyPump(button) {
  const pumpItem  = button.closest('.pump-item');
  const checkbox  = pumpItem.querySelector('input[type="checkbox"]');
  const input     = pumpItem.querySelector('input[type="number"]');
  const messageDiv= pumpItem.querySelector('.message');
  const flow      = parseInt(input.value);
  const overlay   = pumpItem.querySelector('.disabled-overlay');

  if (isNaN(flow) || flow < 10 || flow > 320) {
    alert("Vui lòng nhập giá trị hợp lệ (10 - 320ml)");
    return;
  }

  checkbox.dataset.flow = flow;
  showMessage(messageDiv, `✅ Đã áp dụng lưu lượng nước: ${flow} ml. Vui lòng bật bơm!`);
  if (overlay) overlay.style.display = 'none';
}

// Bật/tắt từng bơm
function togglePump(checkbox) {
  const flow     = parseInt(checkbox.dataset.flow || 0);
  const device   = checkbox.dataset.device;
  const pumpItem = checkbox.closest('.pump-item');
  const messageDiv = pumpItem.querySelector('.message');

  if (checkbox.checked) {
    if (flow > 0) {
      sendPumpRequest(device, flow);
      showMessage(messageDiv, `⏳ Đang bật bơm...`, "#eab308");
    } else {
      console.warn(`Chưa có lưu lượng cho ${device}`);
    }
  } else {
    const payload = { device: device, state: 0, type: "request" };
    pendingDevices.add(device);
    client.publish('/controller/', JSON.stringify(payload), { retain: true, qos: 1 });
    showMessage(messageDiv, `⏳ Đang tắt bơm...`, "#eab308");
  }
}

// ✅ Nhận phản hồi từ thiết bị cho BƠM
client.on('message', (topic, message) => {
  try {
    if (topic !== '/controller/') return;

    const payload = JSON.parse(message.toString());
    const device  = payload.device;
    const flow    = payload.state;

    if (payload.type === "response" && payload.device?.startsWith("pump_")) {
      const checkbox = document.querySelector(`.pump-item input[type="checkbox"][data-device="${device}"]`);
      if (!checkbox) return;

      const pumpItem   = checkbox.closest('.pump-item');
      const messageDiv = pumpItem.querySelector('.message');
      const overlay    = pumpItem.querySelector('.disabled-overlay');
      const icon       = pumpItem.querySelector('i.fa-faucet-drip');
      const input      = pumpItem.querySelector('input[type="number"]');

      if (pendingDevices.has(device)) pendingDevices.delete(device);

      if (Number(flow) === 0) {
        checkbox.checked = false;
        showMessage(messageDiv, `✅ ${labelOf(device)} đã tắt`, "red");
        if (icon) icon.style.color = '#aaa';

        if (window.addNotification) window.addNotification(`✅ Đã tắt ${labelOf(device)}`, "Điều khiển");
      } else {
        checkbox.checked = true;
        checkbox.dataset.flow = String(flow);
        if (input) input.value = flow;
        if (overlay) overlay.style.display = 'none';

        showMessage(messageDiv, `✅ ${labelOf(device)} đã bật (${flow} ml)`, "green");
        if (icon) icon.style.color = '#1E90FF';

        if (window.addNotification) window.addNotification(`✅ Đã bật ${labelOf(device)} (${flow} ml)`, "Điều khiển");
      }
    }
  } catch (e) {
    console.error("Lỗi khi xử lý message /controller/ (pump):", e);
  }
});
// ĐỔI XANH BUTTON, Gửi request lên server
let waitingForResponse = false;
let lastRequestedPosition = null;

document.addEventListener('DOMContentLoaded', () => {
  const areaButtons = document.querySelectorAll('.area-grid button');
  const manualSwitch = document.getElementById('manualSwitch');

  if (manualSwitch) {
    updateButtonState(manualSwitch.checked);
    manualSwitch.addEventListener('change', () => updateButtonState(manualSwitch.checked));
  } else {
    updateButtonState(false);
  }

  areaButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      if (manualSwitch && !manualSwitch.checked) return;

      areaButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const position = index + 1;
      const message = { mode: 1, position: position, type: "request" };

      client.publish('/camera/', JSON.stringify(message), { retain: true, qos: 1 });
      waitingForResponse = true;
      lastRequestedPosition = position;
    });
  });
});

// Ẩn .area-grid button
function updateButtonState(enabled) {
  const areaButtons = document.querySelectorAll('.area-grid button');
  areaButtons.forEach(button => {
    if (enabled) button.classList.remove('disabled');
    else {
      button.classList.remove('active');
      button.classList.add('disabled');
    }
  });
}
// nhận response vị trí camera
client.on("message", (topic, message) => {
  if (topic === "/camera/") {
    try {
      const data = JSON.parse(message.toString());
      if (data.type !== "response") return;

      if (!waitingForResponse) return;
      if (data.position !== lastRequestedPosition) return;

      waitingForResponse = false;
      lastRequestedPosition = null;

      const areaButtons = document.querySelectorAll('.area-grid button');
      areaButtons.forEach(button => button.classList.remove('active'));
    } catch (err) {
      console.error("Lỗi khi phân tích message /camera/ (position):", err);
    }
  }
});
// Led + Fan---------------------------------------------------------------
function toggleFan(checkbox) {
  sendToggleRequest(checkbox, 'fan');
}

function toggleLight(checkbox) {
  sendToggleRequest(checkbox, 'light');
}

function sendToggleRequest(checkbox, device) {
  const state = checkbox.checked ? 1 : 0;
  const box = checkbox.closest(`.${device}-box`);

  const payload = { device: device, state: state, type: "request" };
  client.publish('/controller/', JSON.stringify(payload), { retain: true, qos: 1 });

  if (box) {
    box.dataset.waiting = "true";
    box.dataset.expectedState = state.toString();
  }
}

// nếu chưa có thì thêm hàm này để không lỗi
function createMessageDiv(box) {
  const div = document.createElement('div');
  div.className = 'message';
  box.appendChild(div);
  return div;
}

// nhận phản hồi cho QUẠT / ĐÈN
client.on('message', function (topic, message) {
  if (topic === '/controller/') {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === "response" && (data.device === 'fan' || data.device === 'light')) {
        const device = data.device;
        const box = document.querySelector(`.${device}-box`);
        if (!box) return;

        const icon = box.querySelector(`.fa-${device === 'fan' ? 'fan' : 'lightbulb'}`);
        const messageDiv = box.querySelector('.message') || createMessageDiv(box);
        const checkbox = box.querySelector('input[type="checkbox"]');

        if (box.dataset.waiting === "true") box.dataset.waiting = "false";

        const isOn = Number(data.state) === 1;

        if (checkbox) checkbox.checked = isOn;

        const msg = isOn
          ? (device === 'fan' ? "Quạt đã bật" : "Đèn đã bật")
          : (device === 'fan' ? "Quạt đã tắt" : "Đèn đã tắt");

        showMessage(messageDiv, msg, isOn ? "green" : "red");

        if (icon) {
          if (isOn) icon.style.color = device === 'fan' ? "green" : "gold";
          else icon.style.color = "";
        }

        if (window.addNotification) {
          window.addNotification(` Đã ${isOn ? 'bật' : 'tắt'} ${labelOf(device)}`, "Điều khiển");
        }
      }
    } catch (e) {
      console.error("Lỗi khi xử lý message /controller/ (fan/light):", e);
    }
  }
});

/************************************************
 *  AI IRRIGATION – AUTO MODE (MQTT)
 *  - Chỉ chờ ON (không chờ OFF)
 *  - KHÔNG gửi OFF nếu bơm đang OFF (tránh spam lệnh làm miss K3)
 *  - Ưu tiên gửi ON trước, OFF sau
 ***********************************************/
const AI_TOPIC  = "/controller/";
const AI_DEVICE = "ai_auto";

// FastAPI đang chạy cổng 3000
const AI_HTTP_BASE = "http://192.168.250.4:3000";

// map label -> ml (bạn chỉnh tùy ý)
const LABEL_TO_ML = { 0: 0, 1: 140, 2: 200, 3: 280 };

// quy đổi theo Node2 (ML_TO_MS = 250ms)
const WEB_ML_TO_MS = 250;
const AI_PUMP_ON_TIMEOUT_MS = 4000;
const AI_LOOP_PERIOD_MS = 60 * 1000;

// chống spam: mỗi khu “bận” trong thời gian bơm chạy (ước tính)
const aiBusyUntil = { 1: 0, 2: 0, 3: 0 };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// theo dõi bơm đang ON/OFF để quyết định có cần gửi OFF hay không
const aiPumpOn = { 1: false, 2: false, 3: false };

// timer loop
let aiLoopTimer = null;
let aiLoopToken = 0;

// ===== HTTP lấy pred =====
async function fetchLatestPredHTTP(gardenId) {
  const url = `${AI_HTTP_BASE}/pred/${gardenId}?limit=1`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  const arr = await res.json();
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

// ===== UI helpers (giữ nguyên style bạn đang dùng) =====
const aiState = {
  waitingAck: false,
  desired: null,
  enabled: false
};

function ensureAiMessageEl() {
  let msg = document.getElementById("aiMessage") || document.querySelector(".ai-box .message");
  if (msg) return msg;

  const top = document.querySelector(".ai-box .ai-auto-top");
  if (!top) return null;

  msg = document.createElement("div");
  msg.id = "aiMessage";
  msg.className = "message";
  msg.style.marginLeft = "12px";
  msg.style.fontSize = "18px";
  msg.style.fontWeight = "600";

  const left = top.querySelector(".ai-auto-left") || top;
  left.appendChild(msg);
  return msg;
}

function getAiEls() {
  const toggle = document.getElementById("aiToggle");
  const grid   = document.getElementById("aiGrid");
  const areas  = document.querySelectorAll(".ai-area");
  const msg    = ensureAiMessageEl();
  return { toggle, grid, areas, msg };
}

function showAIMessage(text, color = "green") {
  const { msg } = getAiEls();
  if (msg) showMessage(msg, text, color);
}

function setAIModeUI(isOn) {
  const { toggle, grid, areas } = getAiEls();
  aiState.enabled = !!isOn;

  if (toggle) toggle.checked = !!isOn;

  if (grid) {
    if (isOn) grid.classList.remove("disabled");
    else      grid.classList.add("disabled");
  }

  if (!isOn && areas?.length) areas.forEach(a => a.classList.remove("active"));
}

function setActiveZones(zones) {
  const { areas } = getAiEls();
  if (!areas?.length) return;
  const s = new Set((zones || []).map(Number));
  areas.forEach(a => {
    const z = Number(a.dataset.zone);
    a.classList.toggle("active", s.has(z));
  });
}

function setActiveZone(zone) {
  const { areas } = getAiEls();
  if (!areas?.length) return;
  areas.forEach(a => {
    const z = Number(a.dataset.zone);
    if (zone === 0) a.classList.remove("active");
    else a.classList.toggle("active", z === zone);
  });
}

// ===== WAIT ON response (chỉ cần ON) =====
const aiPumpWaiters = {}; // device -> { on: [] }

function aiSignalPumpOn(device, flow) {
  const w = aiPumpWaiters[device];
  if (!w) return;
  if (Number(flow) > 0) {
    const list = w.on.splice(0);
    list.forEach(fn => fn(Number(flow)));
  }
}

function aiWaitPumpOn(device, timeoutMs) {
  return new Promise((resolve, reject) => {
    if (!aiPumpWaiters[device]) aiPumpWaiters[device] = { on: [] };
    const bucket = aiPumpWaiters[device].on;

    let done = false;
    const t = setTimeout(() => {
      if (done) return;
      done = true;
      const idx = bucket.indexOf(handler);
      if (idx >= 0) bucket.splice(idx, 1);
      reject(new Error("timeout"));
    }, timeoutMs);

    const handler = (val) => {
      if (done) return;
      done = true;
      clearTimeout(t);
      resolve(val);
    };

    bucket.push(handler);
  });
}

// ===== Lắng nghe response pump để cập nhật aiPumpOn + wake ON waiter =====
client.on("message", (topic, message) => {
  if (topic !== "/controller/") return;
  try {
    const data = JSON.parse(message.toString());
    if (data?.type !== "response") return;

    if (typeof data.device === "string" && data.device.startsWith("pump_")) {
      const g = Number(data.device.split("_")[1]);
      const flow = Number(data.state);

      if ([1,2,3].includes(g)) aiPumpOn[g] = flow > 0;

      if (flow > 0) aiSignalPumpOn(data.device, flow);
    }
  } catch (_) {}
});

// đọc trạng thái pump theo UI (phòng trường hợp chưa nhận response)
function isPumpOnByUI(g) {
  const device = `pump_${g}`;
  const checkbox = document.querySelector(`.pump-item input[type="checkbox"][data-device="${device}"]`);
  return checkbox ? !!checkbox.checked : false;
}

// ====== Tưới 1 khu: chỉ chờ ON ======
async function waterOneGardenOnOnly(g, ml, token) {
  if (token !== aiLoopToken) return;

  const device = `pump_${g}`;
  const now = Date.now();

  if (ml <= 0) {
    // chỉ gửi OFF nếu bơm đang ON (tránh spam OFF làm miss lệnh khác)
    const currentlyOn = aiPumpOn[g] || isPumpOnByUI(g);
    if (!currentlyOn) return;

    const payload = { device, state: 0, type: "request" };
    pendingDevices.add(device);
    client.publish('/controller/', JSON.stringify(payload), { retain: true, qos: 1 });
    await sleep(250);
    return;
  }

  // cooldown tránh tưới lại liên tục
  if (now < aiBusyUntil[g]) return;

  showAIMessage(`⏳ AI đang bật tưới Khu ${g} (${ml} ml)...`, "#eab308");
  setActiveZones([g]);

  // gửi ON
  sendPumpRequest(device, ml);

  // chờ ON (nếu timeout vẫn đi tiếp để tránh treo)
  await aiWaitPumpOn(device, AI_PUMP_ON_TIMEOUT_MS).catch(() => {});

  // set cooldown theo thời gian chạy dự kiến
  aiBusyUntil[g] = Date.now() + (ml * WEB_ML_TO_MS) + 1500;

  await sleep(250); // gap nhỏ để LoRa/GW không bị dồn
}

// ====== RUN AI 1 lần (ƯU TIÊN ON trước) ======
async function runAiOnceOnOnly(token) {
  const [p1, p2, p3] = await Promise.all([
    fetchLatestPredHTTP(1),
    fetchLatestPredHTTP(2),
    fetchLatestPredHTTP(3),
  ]);

  const preds = { 1: p1, 2: p2, 3: p3 };

  const needZones = [];
  const summary = [];

  const onActions = [];   // ml > 0
  const offActions = [];  // ml = 0 (chỉ khi đang ON)

  for (const g of [1,2,3]) {
    const p = preds[g];
    if (!p) {
      summary.push(`K${g}: --`);
      continue;
    }

    const label = Number(p.label);
    const ml = LABEL_TO_ML[label] ?? 0;

    if (ml > 0) needZones.push(g);
    summary.push(`K${g}: ${ml}ml`);

    const now = Date.now();

    if (ml === 0) {
      // chỉ OFF nếu đang ON
      const currentlyOn = aiPumpOn[g] || isPumpOnByUI(g);
      if (currentlyOn) offActions.push({ g, ml: 0 });
      continue;
    }

    // nếu đang cooldown thì bỏ qua
    if (now < aiBusyUntil[g]) continue;

    onActions.push({ g, ml });
  }

  setActiveZones(needZones);

  // Không có hành động nào
  if (onActions.length === 0 && offActions.length === 0) {
    showAIMessage(`AI: ${summary.join(" | ")} (không có lệnh mới)`, "#64748b");
    return;
  }

  // gửi ON trước (tránh trường hợp K1/K2 OFF làm miss K3 ON)
  for (const a of onActions) {
    if (token !== aiLoopToken) return;
    await waterOneGardenOnOnly(a.g, a.ml, token);
    setActiveZones(needZones);
  }

  // rồi mới OFF (nếu thật sự cần)
  for (const a of offActions) {
    if (token !== aiLoopToken) return;
    await waterOneGardenOnOnly(a.g, 0, token);
    await sleep(250);
  }

  showAIMessage(` AI hoàn tất chu trình: ${summary.join(" | ")}`, "#16a34a");
}

// ====== LOOP ======
function scheduleAiNext(delayMs, token) {
  if (aiLoopTimer) clearTimeout(aiLoopTimer);
  aiLoopTimer = setTimeout(async () => {
    if (token !== aiLoopToken) return;

    try {
      await runAiOnceOnOnly(token);
    } catch (err) {
      console.error("[AI] run error:", err);
      showAIMessage("❌ Không lấy được nhãn AI (check API /pred)", "red");
    }

    scheduleAiNext(AI_LOOP_PERIOD_MS, token);
  }, delayMs);
}

function startAiLoop() {
  aiLoopToken++;
  scheduleAiNext(0, aiLoopToken);
}

function stopAiLoop() {
  aiLoopToken++;
  if (aiLoopTimer) clearTimeout(aiLoopTimer);
  aiLoopTimer = null;
  setActiveZones([]);
}

// ====== Toggle AI (giữ nguyên kiểu bạn đang dùng onchange="toggleAI(this)") ======
function toggleAI(checkbox) {
  const wantOn = checkbox.checked ? 1 : 0;

  if (!client || !client.connected) {
    alert("MQTT chưa kết nối, không thể bật AI!");
    checkbox.checked = !checkbox.checked;
    return;
  }

  aiState.waitingAck = true;
  aiState.desired    = wantOn;

  const { grid } = getAiEls();
  if (grid) grid.classList.add("disabled");

  const payload = { device: AI_DEVICE, state: wantOn, type: "request" };
  client.publish(AI_TOPIC, JSON.stringify(payload), { retain: true, qos: 1 });

  showAIMessage(
    wantOn ? "⏳ Đang bật tưới tự động..." : "⏳ Đang tắt tưới tự động...",
    "#eab308"
  );
}

document.addEventListener("DOMContentLoaded", () => {
  setAIModeUI(false);
  ensureAiMessageEl();
});

// ACK ai_auto để start/stop loop
client.on("message", (topic, message) => {
  if (topic !== AI_TOPIC) return;

  let data;
  try { data = JSON.parse(message.toString()); }
  catch { return; }

  if (data.type === "response" && data.device === AI_DEVICE) {
    const isOn = Number(data.state) === 1;

    if (aiState.waitingAck && aiState.desired !== null) {
      if (Number(data.state) !== aiState.desired) return;
    }

    aiState.waitingAck = false;
    aiState.desired    = null;

    setAIModeUI(isOn);
    showAIMessage(`Tưới tự động đã ${isOn ? "Bật" : "Tắt"}`, isOn ? "green" : "red");

    if (window.addNotification) {
      window.addNotification(`Tưới tự động đã ${isOn ? "Bật" : "Tắt"}`, "AI");
    }

    if (isOn) startAiLoop();
    else stopAiLoop();

    return;
  }

  // status zone (nếu bạn có dùng)
  if (data.type === "status" && typeof data.zone !== "undefined") {
    if (!aiState.enabled) return;
    const zone = Number(data.zone);
    if ([0,1,2,3].includes(zone)) setActiveZone(zone);
  }
});
// Link đến các trang--------------------------------------------//
document.addEventListener('DOMContentLoaded', function () {
  const go = (id, url) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", () => (window.location.href = url));
  };

  go('Trang-chu', "../Dashboard(HTML)/dashboard.html");
  go('Thong-ke',  "../Thong_ke/Thong_ke.html");
  go('chatbot',   "../chatbot/AI.html");
  go('caytrong',  "../Caytrong/Caytrong.html");
});
