# 📸 Hướng Dẫn Setup Cloudinary File Storage

## Tại Sao Dùng Cloudinary?

- ✅ **Free tier hào phóng**: 25GB storage, 25GB bandwidth/month
- ✅ **Auto image optimization**: Tự động resize, compress
- ✅ **CDN toàn cầu**: Load ảnh nhanh từ mọi nơi
- ✅ **Dễ dùng**: SDK đơn giản, documentation tốt

---

## Bước 1: Tạo Tài Khoản Cloudinary

1. Truy cập: **https://cloudinary.com**
2. Click **"Sign Up Free"**
3. Điền thông tin:
   - Email
   - Password
   - Cloud name (vd: `nauanngon` - **lưu lại tên này**)
4. Verify email
5. Login vào dashboard

## Bước 2: Lấy API Credentials

1. Sau khi login, bạn sẽ thấy **Dashboard**
2. Phần **"Account Details"** hiển thị:
   ```
   Cloud name: your-cloud-name
   API Key: 123456789012345
   API Secret: xxxxxxxxxxxxxxxxxxxxx
   ```
3. **Copy cả 3 giá trị** này!

## Bước 3: Update .env.local

Mở file `.env.local` và thêm:

```bash
# File Storage - Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

**Lưu file!**

## Bước 4: Cài Cloudinary SDK

Chạy lệnh:

```bash
npm install cloudinary
```

## Bước 5: Tạo Upload Folders

1. Trong Cloudinary Dashboard, click **"Media Library"**
2. Click **"Create Folder"**
3. Tạo 3 folders:
   - `cookapp/recipes`
   - `cookapp/avatars`
   - `cookapp/cooksnaps`

(Hoặc folders sẽ tự động tạo khi upload file đầu tiên)

## Bước 6: Test Upload

Chạy test script (mình sẽ tạo):

```bash
node scripts/test-cloudinary.js
```

Nếu thành công, bạn sẽ thấy link ảnh uploaded!

---

## 🔒 Bảo Mật

**QUAN TRỌNG:**

1. **KHÔNG bao giờ** commit `CLOUDINARY_API_SECRET` lên Git
2. **KHÔNG** share API credentials công khai
3. Thêm vào `.gitignore`:
   ```
   .env.local
   .env*.local
   ```

---

## 📊 Free Tier Limits

- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **Admin API calls**: 500/hour

→ Đủ cho 1000+ users/month!

---

## 🎨 Cloudinary Features Hay

### Auto Optimization
```javascript
// Tự động optimize khi upload
cloudinary.uploader.upload(file, {
  folder: 'cookapp/recipes',
  transformation: [
    { width: 1200, height: 1200, crop: 'limit' },
    { quality: 'auto', fetch_format: 'auto' }
  ]
});
```

### Responsive Images
```javascript
// Tạo nhiều sizes cho responsive
const url = cloudinary.url('cookapp/recipes/pho-bo.jpg', {
  width: 800,
  height: 600,
  crop: 'fill',
  gravity: 'auto'
});
```

### Video Support
- Upload videos lên đến 100MB (free tier)
- Auto generate thumbnails
- Streaming optimization

---

## 🔧 Troubleshooting

### Lỗi: "Invalid API key"
→ Kiểm tra lại API Key và Secret trong .env.local

### Lỗi: "Unauthorized"
→ Đảm bảo Cloud name đúng

### Upload chậm
→ File quá lớn, nén trước khi upload

### Ảnh không hiển thị
→ Kiểm tra URL, đảm bảo có `https://`

---

## ✅ Checklist

- [ ] Tạo tài khoản Cloudinary
- [ ] Copy Cloud name, API Key, API Secret
- [ ] Update .env.local
- [ ] Cài cloudinary package: `npm install cloudinary`
- [ ] Tạo folders trong Media Library
- [ ] Test upload thành công

**Sau khi xong → Báo lại cho mình!** 📸
