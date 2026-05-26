# Go Booking — Tool Viết Bài Sale (Bản Web)

Tool sinh nội dung bài đăng Facebook cho nhân viên Sale, dùng AI để viết nhiều phiên bản bài đăng tìm khách hàng tiềm năng cho khu nghỉ dưỡng.

Bộ này gồm web cho nhân viên dùng + một backend nhỏ giữ API key bí mật (không lộ ra ngoài).

---

## ⚠️ NGUYÊN TẮC AN TOÀN QUAN TRỌNG

- Tool dùng **Google Gemini API** để sinh nội dung.
- **TUYỆT ĐỐI KHÔNG** ghi API key thẳng vào code hay vào file web.
- API key chỉ được đặt trong **biến môi trường** trên máy chủ (`GEMINI_API_KEY`).
- Lấy key miễn phí tại https://aistudio.google.com (đăng nhập bằng tài khoản Google, không cần thẻ tín dụng cho gói free).
- **Quan trọng:** sau khi tạo key, bấm "Restrict to Gemini API" để giới hạn key. Từ 19/6/2026 Google sẽ chặn các key không giới hạn.
- Nếu nghi ngờ key bị lộ, vào AI Studio xoá key cũ và tạo key mới ngay.

---

## Cấu trúc thư mục

```
gobooking-web/
├── api/
│   └── generate.js      # Backend trung gian (giữ API key, gọi sang Anthropic)
├── public/
│   └── index.html       # Web nhân viên dùng (giao diện viết bài)
├── server.js            # Dùng khi chạy local / server Node tự quản
├── vercel.json          # Cấu hình deploy Vercel
├── package.json
└── README.md
```

---

## CÁCH 1 — Deploy bằng Vercel (khuyến nghị, nhanh nhất)

1. Tạo tài khoản tại https://vercel.com (miễn phí).
2. Cài Vercel CLI: `npm i -g vercel`
3. Mở terminal tại thư mục `gobooking-web`, chạy: `vercel`
   (Lần đầu sẽ hỏi vài câu để khởi tạo project, cứ chọn mặc định.)
4. **Đặt API key bí mật** (chỉ làm 1 lần):
   ```
   vercel env add GEMINI_API_KEY
   ```
   Dán API key của công ty vào khi được hỏi, chọn áp dụng cho môi trường Production.
5. Deploy chính thức: `vercel --prod`
6. Vercel trả về một đường link (vd: `https://gobooking-xxx.vercel.app`). Gửi link này cho nhân viên Sale là dùng được.

> Gợi ý bảo mật: nên bật "Password Protection" hoặc giới hạn truy cập trong phần Settings của project trên Vercel để chỉ nhân viên công ty mới vào được.

---

## CÁCH 2 — Chạy local / trên server Node.js tự quản

1. Cần Node.js phiên bản 18 trở lên.
2. Đặt API key vào biến môi trường:
   - Mac/Linux: `export GEMINI_API_KEY="dán-key-vào-đây"`
   - Windows (CMD): `set GEMINI_API_KEY=dán-key-vào-đây`
3. Chạy: `node server.js`
4. Mở trình duyệt: `http://localhost:3000`

Để chạy lâu dài trên server công ty, nên dùng trình quản lý tiến trình như `pm2`:
```
npm i -g pm2
pm2 start server.js --name gobooking-tool
```

---

## Chi phí

Gemini có gói miễn phí với hạn mức hằng ngày, thường đủ cho nhu cầu viết bài của đội sale mà chưa tốn phí. Nếu vượt hạn mức free và muốn dùng nhiều hơn, có thể bật thanh toán trong Google Cloud. Theo dõi mức dùng tại aistudio.google.com.

## Lưu ý nội dung

Nội dung do AI tạo ra. Tool đã được nhắc không bịa thông tin sai sự thật, nhưng nhân viên vẫn nên đọc lại và kiểm tra giá/ưu đãi trước khi đăng công khai.

---

## NHÚNG TOOL VÀO LADIPAGE (tuỳ chọn)

Nếu anh muốn hiển thị tool ngay trên một trang LadiPage thay vì dùng link Vercel, làm như sau:

**Bước 1 — Vẫn phải deploy backend lên Vercel trước** (theo Cách 1 ở trên).
LadiPage chỉ là trang tĩnh, KHÔNG giữ được API key, nên bắt buộc cần backend Vercel đứng sau. Không thể bỏ bước này.

**Bước 2 — Mở file `ladipage-embed.html`**, tìm dòng:
```
var BACKEND_URL = "https://TEN-DU-AN-CUA-ANH.vercel.app/api/generate";
```
Thay phần `TEN-DU-AN-CUA-ANH.vercel.app` bằng đúng link Vercel anh nhận được sau khi deploy (giữ nguyên `/api/generate` ở cuối).

**Bước 3 — Trên LadiPage**, vào *Thêm mới > Phần tử > Mã HTML*, dán TOÀN BỘ nội dung file `ladipage-embed.html` vào, rồi Lưu và Xuất bản.

**Lưu ý về CORS:** backend đã được mở sẵn để LadiPage gọi được (Access-Control-Allow-Origin). Nếu muốn chặt chẽ hơn, anh có thể sửa dấu `*` trong `api/generate.js` thành đúng tên miền landing page của công ty.

> Cách này: LadiPage lo phần giao diện, Vercel lo phần giữ key bí mật và gọi AI. API key vẫn không bao giờ lộ ra trang LadiPage.

