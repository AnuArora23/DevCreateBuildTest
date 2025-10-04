/* ================================ 
 script.js - Plant Doctor 
 ================================ */

/* --------------------
 Small DOM Helpers
 -------------------- */
const API_BASE = "http://127.0.0.1:5000/api/v1";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const root = document.documentElement;

/* --------------------
 Initial state & persistence
 -------------------- */
let currentLang = localStorage.getItem('pd_lang') || 'en';
let currentTheme = localStorage.getItem('pd_theme') || 'light';
root.setAttribute('data-theme', currentTheme);

document.addEventListener('DOMContentLoaded', () => {
    applyLanguage();

    const langToggle = $('#langToggle');
    if (langToggle) langToggle.textContent = currentLang === 'en' ? 'हिन्दी' : 'EN';

    const modeToggle = $('#modeToggle');
    if (modeToggle) modeToggle.textContent = currentTheme === 'dark' ? 'लाइट' : 'डार्क';

    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const preloaderEl = $('#preloader');
    if (preloaderEl) preloaderEl.remove();

    console.log("🌱 Plant Doctor initialized!");
});

/* --------------------
 Language Toggle
 -------------------- */
function applyLanguage() {
    $$('[data-en]').forEach(el => {
        const key = `data-${currentLang}`;
        if (el.hasAttribute(key)) el.textContent = el.getAttribute(key);
    });
}
$('#langToggle')?.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    localStorage.setItem('pd_lang', currentLang);
    applyLanguage();
    $('#langToggle').textContent = currentLang === 'en' ? 'हिन्दी' : 'EN';
});

/* --------------------
 Theme Toggle
 -------------------- */
$('#modeToggle')?.addEventListener('click', () => {
    currentTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', currentTheme);
    localStorage.setItem('pd_theme', currentTheme);
    $('#modeToggle').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
});

/* --------------------
 🌤 Weather (Backend Integrated)
 -------------------- */
async function fetchWeather(city = "Delhi") {
    try {
        const res = await fetch(`${API_BASE}/weather?city=${city}`);
        const data = await res.json();
        console.log("Weather:", data);

        if (!data.ok) {
            document.getElementById("wxNow").innerHTML = `<p>Error: ${data.error}</p>`;
            return;
        }

        document.getElementById("wxNow").innerHTML = `
            <h3>${city}</h3>
            <p>🌡️ ${data.current_temp}°C</p>
            <p>Rain Chance: ${data.rain_probability}%</p>
        `;
        // ✅ Navbar temperature update (already added above)
        const navTemp = document.getElementById("navTemp");
        if (navTemp && data.current_temp) {
            navTemp.textContent = `🌡️ ${data.current_temp}°C`;
        }

        // ✅ Left box (Time & Alerts)
        const wxTime = document.getElementById("wxTime");
        if (wxTime) {
            const now = new Date();
            wxTime.innerHTML = `
        <p>${now.toDateString()}</p>
        <p>${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    `;
        }

        // ✅ Right box (Weekly rain chances)
        const wxWeekly = document.getElementById("wxWeekly");
        if (wxWeekly && data?.alerts) {
            wxWeekly.innerHTML = "<h4>Weekly Rain Chances</h4>";
            if (data.alerts.length > 0) {
                data.alerts.forEach(a => {
                    wxWeekly.innerHTML += `<p>${a.icon} ${a.suggestion_en}</p>`;
                });
            } else {
                wxWeekly.innerHTML += "<p>No major rain alerts this week.</p>";
            }
        }



        const alertsDiv = document.getElementById("wxAlerts");
        if (alertsDiv) {
            alertsDiv.innerHTML = "";
            data.alerts.forEach(a => {
                alertsDiv.innerHTML += `<p>${a.icon} ${a.suggestion_en}</p>`;
            });
        }
    } catch (err) {
        console.error("Weather fetch error:", err);
    }
}

$('#wxSearchBtn')?.addEventListener('click', () => {
    const city = $('#wxCityInput').value || "Delhi";
    fetchWeather(city);
});

/* --------------------
 🌱 Chatbot with Backend + Voice Controls
 -------------------- */
(function chatbot() {
    const chatToggle = document.getElementById('chatToggle'),
        chatBox = document.getElementById('chatBox'),
        chatClose = document.getElementById('chatClose'),
        chatMessages = document.getElementById('chatMessages'),
        chatInput = document.getElementById('chatInput'),
        chatSend = document.getElementById('chatSend'),
        micBtn = document.getElementById('micBtn'),
        langSelect = document.getElementById('langSelect'),
        speakBtn = document.getElementById('speakAgain'),     // ✅ correct id
        stopBtn = document.getElementById('stopSpeak'),       // ✅ correct id
        toggleSpeakBtn = document.getElementById('autoSpeak');// ✅ correct id

    let currentLang = "en";   // default language
    let lastBotReply = "";    // store last reply
    let autoSpeak = true;     // auto speak enabled
    let currentUtterance = null;

    if (!chatToggle || !chatBox) return;

    // Open/Close Chat
    const openChat = () => {
        chatBox.style.display = 'flex';
        chatBox.classList.add('open');
        chatInput.focus();
    };
    const closeChat = () => {
        chatBox.classList.remove('open');
        setTimeout(() => chatBox.style.display = 'none', 260);
    };

    chatToggle.addEventListener('click', openChat);
    chatClose?.addEventListener('click', closeChat);

    // Language Switch
    langSelect?.addEventListener('change', () => {
        currentLang = langSelect.value;
    });

    // Append Messages
    const appendMessage = (sender, text) => {
        const d = document.createElement('div');
        d.className = sender === 'you' ? 'user' : 'bot';
        d.textContent = text;
        chatMessages.appendChild(d);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Backend Call
    async function askBackend(query) {
        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: query, lang: currentLang })
            });
            const data = await res.json();
            return data.text || "No response from backend.";
        } catch (err) {
            console.error("Chatbot error:", err);
            return "Error: Could not reach backend.";
        }
    }

    // 🎤 Speak function
    const speak = (text) => {
        if (!('speechSynthesis' in window)) return;  // अगर browser support नहीं करता
        if (!text) return;

        stopSpeech(); // पहले पुराना speech cancel कर दो

        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.lang = currentLang === 'en' ? 'en-US' : 'hi-IN';
        currentUtterance.onend = () => {
            console.log("✅ Speech finished");
        };

        window.speechSynthesis.speak(currentUtterance);
    };

    // ⏹ Stop function
    const stopSpeech = () => {
        if ('speechSynthesis' in window && speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        currentUtterance = null;
    };

    // Handle Send
    const sendMessage = async (text) => {
        if (!text) return;
        appendMessage('you', text);
        appendMessage('bot', '...');
        setTimeout(async () => {
            if (chatMessages.lastElementChild) chatMessages.lastElementChild.remove();
            const reply = await askBackend(text);
            appendMessage('bot', reply);
            lastBotReply = reply;
            if (autoSpeak) speak(reply);
        }, 400);
    };

    const handleSend = () => {
        const v = chatInput.value.trim();
        if (v) { sendMessage(v); chatInput.value = ''; }
    };

    chatSend?.addEventListener('click', handleSend);
    chatInput?.addEventListener('keydown', e => e.key === 'Enter' && handleSend());

    // 🎙️ Voice Input
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && micBtn) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        micBtn.addEventListener('click', () => {
            recognition.lang = currentLang === 'en' ? 'en-US' : 'hi-IN';
            micBtn.style.background = 'red';
            recognition.start();
        });
        recognition.onresult = e => {
            chatInput.value = e.results[0][0].transcript;
            handleSend();
        };
        recognition.onend = () => micBtn.style.background = 'rgba(255,255,255,0.1)';
    } else if (micBtn) {
        micBtn.style.display = 'none';
    }

    // 🔊 Replay Last Bot Reply
    speakBtn?.addEventListener('click', () => {
        if (lastBotReply) speak(lastBotReply);
    });

    // ⏹ Stop Speaking
    stopBtn?.addEventListener('click', stopSpeech);

    // 🎙️ Toggle Auto-Speak
    toggleSpeakBtn?.addEventListener('click', () => {
        autoSpeak = !autoSpeak;
        toggleSpeakBtn.textContent = autoSpeak ? "🎙️ Auto Speak: ON" : "🔇 Auto Speak: OFF";
    });
})();

/* --------------------
 Accessibility & Time
 -------------------- */
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        $('#chatBox')?.classList.remove('open');
        $$('.modal.show').forEach(m => m.classList.remove('show'));
        document.body.style.overflow = '';
    }
});

function updateNavTime() {
    const el = $('#navTime');
    if (el) el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateNavTime, 60000);
updateNavTime();
/* --------------------
/* 🌱 Scan + Predict  -------------------- */
(function scanPredict() {
    const dz = $('#dropZone'),
        fi = $('#fileInput'),
        preview = $('#preview'),
        statusEl = $('#status'),
        predictBtn = $('#predictBtn');

    if (!dz || !fi || !preview || !predictBtn) return;

    function handleFile(file) {
        const url = URL.createObjectURL(file);
        preview.src = url;
        preview.parentElement.style.display = 'block';
        statusEl.textContent = "📸 Image ready. Click Analyze.";
    }

    dz.addEventListener('click', () => fi.click());
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
    dz.addEventListener('drop', e => {
        e.preventDefault(); dz.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });
    fi.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    predictBtn.addEventListener('click', async () => {
        const file = fi.files[0];
        if (!file) { statusEl.textContent = "⚠️ Please upload an image."; return; }
        const litres = $('#litres').value || 15;
        statusEl.textContent = "🔍 Analyzing...";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("litres", litres);

        try {
            const res = await fetch(`${API_BASE}/predict`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            console.log("Predict:", data);

            // ✅ Save prediction globally for PDF report
            window.lastPrediction = data;

            // Show nice UI feedback
            statusEl.innerHTML = data.label
                ? `✅ Detected: <b>${data.label}</b><br>💊 ${data.treatments.treatment}`
                : "🌱 No disease detected (Healthy Plant).";

        } catch (err) {
            console.error("Predict error:", err);
            statusEl.textContent = "❌ Error: Could not analyze.";
        }
    });
})();

/* ====== 📑 Smart PDF Report Download ====== */
async function downloadReport(predictionData) {
    try {
        const response = await fetch("/api/v1/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(predictionData),
        });

        if (!response.ok) {
            alert("❌ Failed to generate report.");
            return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Plant_Report.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        alert("✅ Report downloaded successfully!");
    } catch (err) {
        console.error("Report Error:", err);
        alert("⚠️ Error while downloading report.");
    }
}

// Report button action
document.getElementById("downloadReportBtn")?.addEventListener("click", () => {
    if (window.lastPrediction) {
        downloadReport(window.lastPrediction);
    } else {
        alert("⚠️ Please upload an image and analyze first!");
    }
});
async function fetchWeather(city = "Delhi") {
    try {
        const res = await fetch(`/api/v1/weather?city=${city}`);
        const data = await res.json();

        if (data.error) {
            document.getElementById("wxNow").textContent = "⚠️ " + data.error;
            return;
        }

        document.getElementById("wxNow").textContent =
            `${data.city}: ${data.temp}°C (Feels like ${data.feels_like}°C, ${data.condition})`;
        document.getElementById("wxAlerts").textContent =
            `Humidity: ${data.humidity}%`;
    } catch (err) {
        console.error("Weather Error:", err);
        document.getElementById("wxNow").textContent = "⚠️ Weather fetch failed";
    }
}

// 🌍 Punjab + Nearby Mapping with Fallback 
function mapCityName(lat, lon, defaultCity) {
    const mappings = [
        { name: "Jalandhar", lat: 31.3, lon: 75.6 },
        { name: "Ludhiana", lat: 30.9, lon: 75.85 },
        { name: "Amritsar", lat: 31.64, lon: 74.87 },
        { name: "Chandigarh", lat: 30.74, lon: 76.79 },
        { name: "Patiala", lat: 30.34, lon: 76.38 },
        { name: "Hoshiarpur", lat: 31.53, lon: 75.92 },
        { name: "Kapurthala", lat: 31.38, lon: 75.38 },
        { name: "Bathinda", lat: 30.21, lon: 74.95 },
        { name: "Firozpur", lat: 30.93, lon: 74.62 },
        { name: "Mohali", lat: 30.70, lon: 76.72 }
    ];

    for (const city of mappings) {
        if (Math.abs(lat - city.lat) < 0.3 && Math.abs(lon - city.lon) < 0.3) {
            return city.name;
        }
    }

    let nearest = null, minDist = Infinity;
    for (const city of mappings) {
        const d = Math.sqrt((lat - city.lat) ** 2 + (lon - city.lon) ** 2);
        if (d < minDist) {
            minDist = d;
            nearest = city.name;
        }
    }
    return nearest || defaultCity || "Punjab";
}

let currentWeather = null; // 🌍 global state

function updateNavbarWeather() {
    const navTemp = document.getElementById("navTemp");
    if (navTemp && currentWeather) {
        navTemp.textContent = `🌡️ ${currentWeather.temp}°C (${currentWeather.city})`;
    }
}

// 🌦 Fetch Weather
async function fetchWeather(city = "Delhi") {
    try {
        const res = await fetch(`/api/v1/weather?city=${city}`);
        const data = await res.json();

        if (data.error) {
            document.getElementById("wxNow").textContent = "⚠️ " + data.error;
            return;
        }

        currentWeather = data;
        updateNavbarWeather();

        const wxNow = document.getElementById("wxNow");
        if (wxNow) {
            wxNow.innerHTML = `
                <h3>${data.city}</h3>
                <p>🌡️ ${data.temp}°C (Feels like ${data.feels_like}°C)</p>
                <p>💧 Humidity: ${data.humidity}%</p>
                <p>🌤 ${data.condition}</p>
            `;
        }

        fetchForecast(data.city);

    } catch (err) {
        console.error("Weather Error:", err);
        document.getElementById("wxNow").textContent = "⚠️ Weather fetch failed";
    }
}

// 📊 Forecast
async function fetchForecast(city = "Delhi") {
    try {
        const res = await fetch(`/api/v1/forecast?city=${city}`);
        const data = await res.json();

        if (!data.ok) {
            document.getElementById("forecastTable").innerHTML = `<tr><td colspan="5">⚠️ ${data.error}</td></tr>`;
            return;
        }

        let rows = "";
        data.forecast.forEach(f => {
            rows += `
              <tr>
                <td>${f.day}</td>
                <td>${f.temp}°C</td>
                <td>${f.rain}%</td>
                <td>${f.humidity}%</td>
                <td>${f.wind} km/h</td>
              </tr>
            `;
        });

        document.getElementById("forecastTable").innerHTML = rows;
    } catch (err) {
        console.error("Forecast Error:", err);
    }
}

// 🔍 Search
document.getElementById("wxSearchBtn")?.addEventListener("click", () => {
    const city = document.getElementById("wxCityInput").value.trim();
    if (city) fetchWeather(city);
});

// 📍 Location
document.getElementById("wxUseLocation")?.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                console.log("📍 Location:", lat, lon);

                const nearestCity = mapCityName(lat, lon, "Delhi");
                console.log("✅ Nearest city mapped:", nearestCity);

                fetchWeather(nearestCity);
            },
            (err) => {
                alert("⚠️ Location permission denied.");
                console.error("Geolocation error:", err);
            }
        );
    } else {
        alert("⚠️ Geolocation not supported by your browser.");
    }
});

// Auto load
fetchWeather("Delhi");
// 🌱 Load Crop Calendar
async function loadCropCalendar() {
    try {
        const res = await fetch("crop_calendar.json"); // JSON must be in frontend
        const data = await res.json();

        const tbody = document.querySelector("#cropTable tbody");
        tbody.innerHTML = "";

        const lang = localStorage.getItem("pd_lang") || "en";

        Object.keys(data).forEach(month => {
            data[month].forEach(entry => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${month}</td>
                    <td>${entry.crop}</td>
                    <td>${lang === "en" ? entry.action_en : entry.action_hi}</td>
                `;
                tbody.appendChild(tr);
            });
        });
    } catch (err) {
        console.error("Crop Calendar Error:", err);
    }
}

// Reload on language toggle
document.getElementById("langToggle")?.addEventListener("click", () => {
    setTimeout(loadCropCalendar, 300);
});

// Auto load when crop calendar page is open
if (document.body.dataset.page === "crop") {
    loadCropCalendar();
}
/* =========================
 🌱 Soil Guide Loader
 ========================= */
async function loadSoilGuide() {
    try {
        const res = await fetch("soil_data.json");
        const data = await res.json();

        const container = document.getElementById("soilGrid");
        if (!container) return;

        container.innerHTML = "";
        const lang = localStorage.getItem("pd_lang") || "en";

        Object.keys(data).forEach(type => {
            const soil = data[type];

            // ✅ language safe switch
            const desc = lang === "en" ? soil.desc_en : soil.desc_hi;
            const crops = lang === "en" ? soil.crops_en.join(", ") : soil.crops_hi.join(", ");
            const ferts = lang === "en" ? soil.fertilizers_en.join(", ") : soil.fertilizers_hi.join(", ");
            const advice = lang === "en" ? soil.advice_en : soil.advice_hi;

            // ✅ create card
            const card = document.createElement("article");
            card.className = "card tilt premium";
            card.innerHTML = `
                <div class="icon">🌍</div>
                <h3>${type} Soil</h3>
                <p><b>${lang === "en" ? "Description" : "विवरण"}:</b> ${desc}</p>
                <p><b>${lang === "en" ? "Best Crops" : "फसलें"}:</b> ${crops}</p>
                <p><b>${lang === "en" ? "Fertilizers" : "उर्वरक"}:</b> ${ferts}</p>
                <p><b>${lang === "en" ? "Advice" : "सलाह"}:</b> ${advice}</p>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.error("Soil Guide Error:", err);
    }
}

// 🌍 Auto-load on soil-guide page
if (document.body.dataset.page === "soil") {
    loadSoilGuide();
}

// 🔄 Reload when language changes
document.getElementById("langToggle")?.addEventListener("click", () => {
    if (document.body.dataset.page === "soil") {
        setTimeout(loadSoilGuide, 300);
    }
});
// ⏰ Time update (Left Box)
function updateNavTime() {
    const el = document.getElementById("wxTime");
    if (el) {
        const now = new Date();
        el.innerHTML = `
      <p>${now.toDateString()}</p>
      <p>${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    `;
    }
}
setInterval(updateNavTime, 60000);
updateNavTime();

// 🌧 Weekly rain chances (Right Box)
async function fetchForecast(city = "Delhi") {
    try {
        const res = await fetch(`/api/v1/forecast?city=${city}`);
        const data = await res.json();

        const weeklyBox = document.getElementById("wxWeekly");
        if (!weeklyBox) return;

        if (!data.ok) {
            weeklyBox.innerHTML = `<p>⚠️ ${data.error}</p>`;
            return;
        }

        weeklyBox.innerHTML = "";
        data.forecast.forEach(f => {
            weeklyBox.innerHTML += `
        <p>📅 ${f.day}: 💧 ${f.rain}% rain chance</p>
      `;
        });
    } catch (err) {
        console.error("Forecast Error:", err);
    }
}
/* ================================
 📈 Market Price Tracking
================================ */
async function fetchMarket({ commodity = "", city = "" } = {}) {
    try {
        let url = `/api/v1/market`;
        const qs = [];
        if (commodity) qs.push(`commodity=${encodeURIComponent(commodity)}`);
        if (city) qs.push(`city=${encodeURIComponent(city)}`);
        if (qs.length) url += "?" + qs.join("&");

        const res = await fetch(url);
        const data = await res.json();
        const tbody = document.getElementById("mpBody");
        if (!tbody) return;

        if (!data.ok) {
            tbody.innerHTML = `<tr><td colspan="5">⚠️ ${data.error || "Failed"}</td></tr>`;
            return;
        }

        if (!data.items || data.items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">No data</td></tr>`;
            return;
        }

        const lang = localStorage.getItem("pd_lang") || "en";
        const rows = data.items.map(it => {
            const cname = lang === "hi" ? (it.commodity_hi || it.commodity_en) : it.commodity_en;
            const price = `${it.price} ${it.unit || ""}`;
            const change = (it.change > 0 ? `+${it.change}` : `${it.change}`);
            const chBadge = `<span class="chip" style="background:${it.change > 0 ? '#1db95433' : '#ff003333'};border:1px solid ${it.change > 0 ? '#1db954' : '#ff0033'}">${change}</span>`;
            return `
        <tr>
          <td>${cname}</td>
          <td>${(it.city || "")}${it.mandi ? ` / ${it.mandi}` : ""}</td>
          <td><b>${price}</b></td>
          <td>${chBadge}</td>
          <td>${(it.updated_at || "—").replace("T", " ").slice(0, 16)}</td>
        </tr>`;
        }).join("");

        tbody.innerHTML = rows;
    } catch (e) {
        console.error("Market fetch error:", e);
        const tbody = document.getElementById("mpBody");
        if (tbody) tbody.innerHTML = `<tr><td colspan="5">⚠️ Error</td></tr>`;
    }
}

// Bind market page controls
if (document.body.dataset.page === "market") {
    const reload = () => {
        const q = document.getElementById("mpSearch")?.value.trim() || "";
        const c = document.getElementById("mpCity")?.value.trim() || "";
        fetchMarket({ commodity: q, city: c });
    };
    document.getElementById("mpReload")?.addEventListener("click", reload);
    document.getElementById("mpSearch")?.addEventListener("keydown", e => e.key === "Enter" && reload());
    document.getElementById("mpCity")?.addEventListener("keydown", e => e.key === "Enter" && reload());
    fetchMarket({});
}

// ================================
// 📩 Subscribe to Price Alerts
// ================================
document.getElementById("subBtn")?.addEventListener("click", async () => {
    const phone = document.getElementById("subPhone")?.value.trim();
    const commodity = document.getElementById("subCommodity")?.value.trim();
    const threshold = parseFloat(document.getElementById("subThreshold")?.value);
    const direction = document.getElementById("subDirection")?.value || "below";
    const status = document.getElementById("subStatus");

    if (!phone || !commodity || isNaN(threshold)) {
        status.textContent = "⚠️ Please fill phone, commodity and threshold.";
        status.style.color = "orange";
        return;
    }

    status.textContent = "⏳ Subscribing...";
    status.style.color = "blue";

    try {
        const res = await fetch(`/api/v1/price-alert/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, commodity, threshold, direction })
        });

        const data = await res.json();

        if (data.ok) {
            status.textContent = "✅ Subscribed successfully! You’ll get SMS alerts.";
            status.style.color = "green";

            // Clear fields after success
            document.getElementById("subPhone").value = "";
            document.getElementById("subCommodity").value = "";
            document.getElementById("subThreshold").value = "";
        } else {
            status.textContent = "❌ " + (data.error || "Failed to subscribe.");
            status.style.color = "red";
        }
    } catch (err) {
        console.error("Subscription error:", err);
        status.textContent = "⚠️ Network error, try again.";
        status.style.color = "red";
    }
});
// 🌦️ Send Weather SMS Alert
document.getElementById("alertBtn")?.addEventListener("click", async () => {
    const phone = document.getElementById("alertPhone")?.value.trim();
    const city = document.getElementById("alertCity")?.value.trim() || "Delhi";
    const status = document.getElementById("alertStatus");

    if (!phone) {
        status.textContent = "⚠️ Please enter phone number";
        return;
    }

    try {
        const res = await fetch("/api/v1/send-alert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, city })
        });

        const data = await res.json();
        if (data.ok) {
            status.textContent = "✅ SMS Sent! Message: " + data.message;
        } else {
            status.textContent = "⚠️ Error: " + (data.error || "Failed");
        }
    } catch (e) {
        console.error("SMS Error:", e);
        status.textContent = "⚠️ Network error!";
    }
});
async function downloadReport(predictionData) {
    try {
        const response = await fetch("/api/v1/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(predictionData),
        });

        if (!response.ok) {
            alert("❌ Failed to generate report.");
            return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Plant_Report.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        alert("✅ Report downloaded successfully!");
    } catch (err) {
        console.error("Report Error:", err);
        alert("⚠️ Error while downloading report.");
    }
}
// 🌦️ Load 3-Day Forecast
async function loadForecast(city = "Delhi") {
    const tableBody = document.getElementById("forecastTable");
    tableBody.innerHTML = `<tr><td colspan="5">🔄 Loading...</td></tr>`;

    try {
        const res = await fetch(`/api/v1/forecast?city=${encodeURIComponent(city)}`);
        const data = await res.json();

        if (!data.ok) {
            tableBody.innerHTML = `<tr><td colspan="5">⚠️ ${data.error || "No forecast found"}</td></tr>`;
            return;
        }

        // Clear old rows
        tableBody.innerHTML = "";

        // Fill rows
        data.forecast.forEach(day => {
            const row = `
              <tr>
                <td>${day.day}</td>
                <td>${day.temp} °C</td>
                <td>${day.rain}%</td>
                <td>${day.humidity}%</td>
                <td>${day.wind} km/h</td>
              </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (err) {
        console.error("Forecast Error:", err);
        tableBody.innerHTML = `<tr><td colspan="5">⚠️ Failed to load forecast</td></tr>`;
    }
}

// 🌍 Load forecast on page load
if (document.body.dataset.page === "weather") {
    loadForecast("Delhi");

    // City search button
    document.getElementById("wxSearchBtn")?.addEventListener("click", () => {
        const city = document.getElementById("wxCityInput").value.trim();
        if (city) loadForecast(city);
    });

    // Use my location
    document.getElementById("wxUseLocation")?.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async pos => {
                const { latitude, longitude } = pos.coords;
                const res = await fetch(`/api/v1/weather?lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                if (data.city) loadForecast(data.city);
            });
        }
    });
}
