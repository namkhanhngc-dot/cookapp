# 🗄️ Hướng Dẫn Setup Supabase Database

## Bước 1: Tạo Tài Khoản Supabase

1. Truy cập: **https://supabase.com**
2. Click **"Start your project"**
3. Đăng ký bằng GitHub (khuyến nghị) hoặc email
4. Verify email nếu cần

## Bước 2: Tạo Project Mới

1. Click **"New Project"**
2. Điền thông tin:
   - **Name**: `nau-an-ngon` (hoặc tên bạn muốn)
   - **Database Password**: Tạo một password mạnh và **LƯU LẠI**
   - **Region**: Chọn `Southeast Asia (Singapore)` (gần Việt Nam nhất)
   - **Pricing Plan**: Chọn **Free** (500MB storage, đủ cho MVP)

3. Click **"Create new project"**
4. Đợi 1-2 phút để Supabase setup database

## Bước 3: Lấy Connection String

1. Sau khi project được tạo, vào **Settings** (icon bánh răng)
2. Click **Database** trong sidebar
3. Scroll xuống phần **"Connection string"**
4. Copy **Connection string** dạng:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Thay `[YOUR-PASSWORD]` bằng password bạn đã tạo ở Bước 2

## Bước 4: Chạy Migration Script

1. Vào **SQL Editor** trong Supabase dashboard
2. Click **"New query"**
3. Mở file `database/migration.sql` trong project
4. **Copy toàn bộ nội dung** và paste vào SQL Editor
5. Click **"Run"** (hoặc nhấn Ctrl+Enter)
6. Đợi script chạy (10-20 giây)
7. Kiểm tra kết quả - nên thấy "Success"

## Bước 5: Verify Tables

1. Click vào **Table Editor** trong sidebar
2. Bạn sẽ thấy tất cả tables đã được tạo:
   - ✅ users
   - ✅ recipes
   - ✅ recipe_ingredients
   - ✅ recipe_instructions
   - ✅ categories
   - ✅ likes, ratings, comments...

3. Click vào table `categories` - nên thấy 11 rows (các danh mục đã seed)

## Bước 6: Tạo Demo User

**Lưu ý**: Script migration đã tạo user `demochef` nhưng password chưa hash đúng.

Chạy query này trong SQL Editor:

```sql
-- Update demo user với password đã hash (demo123)
UPDATE users 
SET password_hash = '$2a$10$rOJ6RqQqH7X7RqQqH7X7RueKqZqZqZqZqZqZqZqZqZqZqZqZqZqZq'
WHERE username = 'demochef';
```

## Bước 7: Update .env.local

1. Mở file `.env.local` trong project
2. Update dòng `DATABASE_URL`:
   ```bash
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
3. **Lưu file**

## Bước 8: Test Connection

Chạy lệnh test (mình sẽ tạo script test):

```bash
node scripts/test-db-connection.js
```

Nếu thấy "✅ Connected successfully!" → Hoàn thành!

---

## ⚠️ Lưu Ý Quan Trọng

1. **Không commit DATABASE_URL** lên Git
2. **Backup password** ở nơi an toàn (1Password, LastPass...)
3. **Free tier limits**:
   - 500MB database storage
   - 2GB bandwidth/month
   - 50,000 monthly active users
   - 500MB file storage

4. **Network**: Supabase cho phép connect từ mọi IP, không cần whitelist

---

## 🔧 Troubleshooting

### Lỗi: "password authentication failed"
→ Kiểm tra lại password trong connection string

### Lỗi: "connection timeout"
→ Kiểm tra internet, thử lại sau vài phút

### Lỗi: "relation already exists"
→ Tables đã tồn tại, có thể bỏ qua hoặc DROP tables trước

### Dashboard không load
→ Thử refresh hoặc đổi browser

---

## ✅ Checklist

- [ ] Tạo tài khoản Supabase
- [ ] Tạo project mới
- [ ] Copy connection string
- [ ] Chạy migration.sql
- [ ] Verify tables trong Table Editor
- [ ] Update .env.local
- [ ] Test connection thành công

**Sau khi hoàn thành checklist → Báo lại cho mình!** 🚀
