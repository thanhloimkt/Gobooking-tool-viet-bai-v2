// api/generate.js
// Backend trung gian: GIỮ BÍ MẬT API KEY và gọi sang Google Gemini thay cho web.
// Web phía nhân viên KHÔNG bao giờ nhìn thấy API key.
// Cần đặt biến môi trường: GEMINI_API_KEY (lấy từ aistudio.google.com)

module.exports = async function handler(req, res) {
  // Cho phép gọi từ tên miền khác (vd: trang LadiPage)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server chưa cấu hình GEMINI_API_KEY" });
    return;
  }

  const MODEL = "gemini-2.0-flash";

  try {
    // req.body có thể là object hoặc chuỗi tuỳ môi trường — xử lý cả hai
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    const prompt = body && body.prompt;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Thiếu nội dung yêu cầu (prompt)" });
      return;
    }

    const safePrompt = prompt.slice(0, 4000);

    const url = "https://generativelanguage.googleapis.com/v1beta/models/"
      + MODEL + ":generateContent?key=" + apiKey;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: safePrompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 1600 }
      })
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error("Gemini error:", JSON.stringify(data));
      res.status(502).json({ error: "Lỗi khi gọi AI", detail: (data && data.error && data.error.message) || "" });
      return;
    }

    const parts = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    const text = parts.map(function(p){ return p.text || ""; }).join("\n").trim();

    res.status(200).json({ text: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};
