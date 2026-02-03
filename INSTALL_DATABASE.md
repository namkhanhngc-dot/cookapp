# Hướng Dẫn Cài Đặt SQLite Database Cho CookApp

## 📋 Bước 1: Cài Đặt Python

### Tải Python

1. **Mở trình duyệt** và vào: https://www.python.org/downloads/
2. Click nút **"Download Python 3.12.x"** (hoặc 3.11.x)
3. File tải về sẽ có tên dạng: `python-3.12.x-amd64.exe`

### Cài Đặt Python

1. **Chạy file installer** vừa tải
2. ⚠️ **QUAN TRỌNG**: Tích vào ô **"Add python.exe to PATH"** ở màn hình đầu tiên
3. Click **"Install Now"**
4. Đợi cài đặt hoàn tất (2-3 phút)
5. Click **"Close"** khi xong

### Kiểm Tra Python Đã Cài

Mở PowerShell mới và chạy:
```powershell
python --version
```

Nếu hiển thị `Python 3.12.x` hoặc `Python 3.11.x` → Thành công! ✅

---

## 📋 Bước 2: Cài Visual Studio Build Tools (Tùy Chọn Nhưng Khuyến Nghị)

### Cách 1: Cài qua Visual Studio (Đơn giản)

1. Vào: https://visualstudio.microsoft.com/downloads/
2. Kéo xuống phần **"Tools for Visual Studio"**
3. Tải **"Build Tools for Visual Studio 2022"**
4. Chạy installer
5. Chọn **"Desktop development with C++"**
6. Click **Install** (sẽ tải ~6GB, mất 10-20 phút)

### Cách 2: Bỏ qua (Nếu Cách 1 quá lâu)

Sau khi cài Python, thử cài better-sqlite3 trước. Nếu có lỗi, quay lại làm Cách 1.

---

## 📋 Bước 3: Cài better-sqlite3 và sharp

### Dừng Server Hiện Tại

Trong terminal đang chạy `npm run dev`:
- Nhấn **Ctrl + C**
- Confirm "Y" nếu hỏi

### Cài Packages

```bash
cd c:\Users\Nkah\OneDrive\Desktop\cookapp
npm install better-sqlite3@9.3.0 sharp@0.33.2
```

Quá trình này có thể mất **2-5 phút** vì phải build native modules.

**Nếu thành công**, bạn sẽ thấy:
```
✓ built better-sqlite3@9.3.0
✓ built sharp@0.33.2
added 2 packages
```

**Nếu có lỗi về Python**, quay lại Bước 1 và đảm bảo Python đã được thêm vào PATH.

**Nếu có lỗi về build tools**, cần làm Bước 2.

---

## 📋 Bước 4: Restore Database Files

Sau khi cài xong better-sqlite3, cần khôi phục các file database gốc:

### File cần khôi phục:

1. **lib/db.js** - Database connection
2. **lib/models/user.js** - User model
3. **lib/models/recipe.js** - Recipe model
4. **lib/models/interaction.js** - Interaction model

Mình sẽ tạo lại các file này cho bạn sau khi cài xong better-sqlite3.

---

## 📋 Bước 5: Tạo Database

Sau khi có better-sqlite3, chạy:

```bash
npm run init-db
```

Lệnh này sẽ:
- Tạo file `database/recipes.db`
- Tạo tất cả tables
- Insert demo categories
- Tạo user `demochef` với password `demo123`

**Thành công khi thấy**:
```
✓ Database initialized successfully
✓ Created demo user: demochef
```

---

## 📋 Bước 6: Chạy Server

```bash
npm run dev
```

Server sẽ khởi động tại: http://localhost:3000

---

## ✅ Kiểm Tra Database Hoạt Động

1. Mở http://localhost:3000
2. Click **"Login"**
3. Nhập:
   - Username: `demochef`
   - Password: `demo123`
4. Nếu đăng nhập thành công → Database đã hoạt động! 🎉

---

## ⚠️ Xử Lý Lỗi Thường Gặp

### Lỗi: "Python not found"
- Kiểm tra Python đã cài chưa: `python --version`
- Đảm bảo đã tích "Add to PATH" khi cài
- Khởi động lại PowerShell

### Lỗi: "MSBuild not found" hoặc "gyp ERR!"
- Cần cài Visual Studio Build Tools (Bước 2)

### Lỗi: "Cannot find module 'better-sqlite3'"
- Chạy lại: `npm install better-sqlite3`

### Database file không tạo được
- Kiểm tra quyền ghi vào thư mục `database/`
- Thử chạy PowerShell as Administrator

---

## 📞 Tiếp Theo

Sau khi làm xong **Bước 1**, hãy cho tôi biết kết quả của lệnh:
```bash
python --version
```

Tôi sẽ hướng dẫn bạn các bước tiếp theo! 🚀
