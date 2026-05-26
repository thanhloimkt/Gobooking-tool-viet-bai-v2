// server.js
// Dùng để chạy thử trên máy local hoặc deploy trên server Node.js tự quản.
// KHÔNG cần thiết nếu deploy bằng Vercel (Vercel tự đọc thư mục /api).
//
// Cách chạy:
//   1. Đặt API key:  export GEMINI_API_KEY="..."   (Windows: set GEMINI_API_KEY=...)
//   2. node server.js
//   3. Mở trình duyệt: http://localhost:3000

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml"
};

async function callAI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Chua cau hinh GEMINI_API_KEY");

  const MODEL = "gemini-2.0-flash";
  const url = "https://generativelanguage.googleapis.com/v1beta/models/"
    + MODEL + ":generateContent?key=" + apiKey;

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt.slice(0, 4000) }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 1600 }
    })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || "Loi goi AI");
  const parts = (data.candidates && data.candidates[0] && data.candidates[0].content
    && data.candidates[0].content.parts) || [];
  return parts.map(p => p.text || "").join("\n").trim();
}

const server = http.createServer((req, res) => {
  // Cho phép gọi từ tên miền khác (vd: trang LadiPage)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  // API endpoint
  if (req.method === "POST" && req.url === "/api/generate") {
    let body = "";
    req.on("data", c => (body += c));
    req.on("end", async () => {
      try {
        const { prompt } = JSON.parse(body || "{}");
        if (!prompt) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Thieu prompt" }));
          return;
        }
        const text = await callAI(prompt);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ text }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Static files
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(PUBLIC_DIR, decodeURIComponent(filePath.split("?")[0]));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Go Booking content tool dang chay tai http://localhost:${PORT}`);
});
