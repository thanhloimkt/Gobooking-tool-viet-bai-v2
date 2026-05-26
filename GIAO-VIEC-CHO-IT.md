# GIAO VIỆC: Deploy tool "Viết bài Sale Go Booking" lên web

Chào bạn, đây là một tool nội bộ đã code xong, cần deploy lên Vercel để nhân viên dùng. Toàn bộ code nằm trong thư mục `gobooking-web` (giải nén từ file zip kèm theo). Việc này khoảng 10-15 phút.

## Tóm tắt kiến trúc
- Frontend tĩnh (`public/index.html`) + một serverless function (`api/generate.js`).
- Backend gọi **Google Gemini API** (model `gemini-2.0-flash`), giữ API key trong biến môi trường `GEMINI_API_KEY`.
- Đã có sẵn `vercel.json`. CORS đã mở sẵn để có thể nhúng iframe/HTML qua LadiPage sau này.

## Việc cần làm

1. **Lấy/nhận GEMINI_API_KEY**: key Gemini đã được sếp tạo sẵn tại aistudio.google.com (dạng `AIzaSy...`). Xin key này từ sếp qua kênh bảo mật, KHÔNG hard-code vào source.

2. **Deploy lên Vercel** (CLI là nhanh nhất):
   ```
   npm i -g vercel
   cd gobooking-web
   vercel            # khởi tạo project, chọn mặc định
   vercel env add GEMINI_API_KEY     # dán key vào, chọn Production
   vercel --prod     # deploy chính thức, nhận link .vercel.app
   ```
   (Hoặc đẩy thư mục lên một Git repo rồi Import vào Vercel cũng được — tùy bạn quen cách nào. Nhớ set env var `GEMINI_API_KEY` trong Project Settings > Environment Variables.)

3. **Kiểm tra**: mở link `.vercel.app`, nhập tên 1 resort, bấm "Tạo nội dung bài đăng". Nếu ra 3 bài đăng là OK.

4. **Lưu ý bảo mật key Gemini**: trong AI Studio, bấm "Restrict to Gemini API" cho key (Google sẽ chặn key unrestricted từ 19/6/2026). Có thể giới hạn thêm theo HTTP referrer / IP nếu muốn.

5. **Gửi lại link `.vercel.app`** cho sếp để dùng hoặc để nhúng vào LadiPage.

## Tùy chọn: nhúng vào LadiPage
File `ladipage-embed.html` là đoạn HTML để dán vào phần tử "Mã HTML" trên LadiPage. Trước khi dán, sửa dòng `BACKEND_URL` thành `https://<link-vercel>/api/generate`. Chi tiết trong `README.md` mục "NHÚNG TOOL VÀO LADIPAGE".

Cảm ơn bạn!
