# 🚀 Production Readiness Checklist - Nấu Ăn Ngon

Checklist chi tiết để đưa ứng dụng lên production một cách an toàn và hiệu quả.

---

## 📊 Tổng Quan Tiến Độ

- [ ] **Phase 1: Critical (BẮT BUỘC)** - ~1-2 tuần
- [ ] **Phase 2: Security & Performance** - ~1 tuần  
- [ ] **Phase 3: Quality & Monitoring** - ~3-5 ngày
- [ ] **Phase 4: Optimization & Scale** - ~1 tuần

**Tổng thời gian ước tính: 3-4 tuần**

---

## 🔴 PHASE 1: CRITICAL (BẮT BUỘC)

Những việc này PHẢI làm trước khi deploy production.

### 1.1 Database Migration ⭐⭐⭐

**Hiện trạng**: In-memory database (mất data khi restart)  
**Cần**: Database thật, persistent

#### Option A: Supabase (Khuyến nghị cho MVP)
- [ ] Tạo tài khoản Supabase: https://supabase.com
- [ ] Tạo project mới (free tier: 500MB)
- [ ] Copy connection string
- [ ] Cài driver: `npm install @supabase/supabase-js`
- [ ] Migrate schema từ `database/schema.sql`
- [ ] Update `lib/db.js` để connect Supabase
- [ ] Test CRUD operations
- [ ] Migrate data (nếu có)

**Thời gian**: 1-2 ngày

#### Option B: PostgreSQL trên Railway/Render
- [ ] Tạo tài khoản Railway.app
- [ ] Provision PostgreSQL database
- [ ] Copy connection URL
- [ ] Cài driver: `npm install pg`
- [ ] Update connection trong `lib/db.js`
- [ ] Run migrations
- [ ] Test connections

**Thời gian**: 1-2 ngày

#### Option C: MongoDB Atlas (NoSQL alternative)
- [ ] Tạo tài khoản MongoDB Atlas
- [ ] Tạo cluster (M0 free tier)
- [ ] Whitelist IP (0.0.0.0/0 cho development)
- [ ] Copy connection string
- [ ] Cài driver: `npm install mongodb mongoose`
- [ ] Redesign schema cho NoSQL
- [ ] Rewrite models
- [ ] Test thoroughly

**Thời gian**: 2-3 ngày (cần redesign schema)

**📝 Resources:**
- Supabase Docs: https://supabase.com/docs
- Railway PostgreSQL: https://docs.railway.app/databases/postgresql
- MongoDB Atlas Setup: https://www.mongodb.com/docs/atlas/

---

### 1.2 File Storage Migration ⭐⭐⭐

**Hiện trạng**: Local filesystem (mất files khi deploy)  
**Cần**: Cloud storage

#### Option A: Cloudinary (Khuyến nghị - Dễ nhất)
- [ ] Tạo tài khoản: https://cloudinary.com
- [ ] Copy cloud name, API key, API secret
- [ ] Cài SDK: `npm install cloudinary`
- [ ] Update `lib/utils/upload.js`:
  ```javascript
  const cloudinary = require('cloudinary').v2;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  async function saveUpload(file, type = 'recipes') {
    const buffer = Buffer.from(await file.arrayBuffer());
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `cookapp/${type}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      ).end(buffer);
    });
  }
  ```
- [ ] Update `.env.local` với credentials
- [ ] Test upload flow
- [ ] Update delete function

**Free tier**: 25 credits/month (~25GB bandwidth)  
**Thời gian**: 4-6 giờ

#### Option B: AWS S3 (Scalable nhưng phức tạp hơn)
- [ ] Tạo AWS account
- [ ] Tạo S3 bucket
- [ ] Setup IAM user với S3 permissions
- [ ] Cài SDK: `npm install @aws-sdk/client-s3`
- [ ] Update upload utility
- [ ] Test upload/delete
- [ ] Setup CloudFront CDN (optional)

**Thời gian**: 1 ngày

**📝 Resources:**
- Cloudinary Next.js: https://cloudinary.com/documentation/nextjs_integration
- AWS S3 Tutorial: https://docs.aws.amazon.com/AmazonS3/latest/userguide/

---

### 1.3 Environment Variables ⭐⭐⭐

**Hiện trạng**: Hardcoded values, committed .env  
**Cần**: Secure environment management

- [ ] Tạo `.env.example` template:
  ```bash
  # Database
  DATABASE_URL=postgresql://user:pass@host:5432/db
  
  # Authentication
  JWT_SECRET=your-super-secret-key-min-32-chars
  JWT_EXPIRY=7d
  
  # File Storage
  CLOUDINARY_CLOUD_NAME=
  CLOUDINARY_API_KEY=
  CLOUDINARY_API_SECRET=
  
  # App
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  NODE_ENV=development
  
  # Rate Limiting
  RATE_LIMIT_MAX=100
  RATE_LIMIT_WINDOW=15
  ```

- [ ] Generate strong JWT secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

- [ ] Update `.gitignore`:
  ```
  .env.local
  .env.production.local
  .env
  ```

- [ ] Document env vars trong README
- [ ] Setup env vars trên hosting platform

**Thời gian**: 1-2 giờ

---

### 1.4 Deployment Setup ⭐⭐⭐

**Cần**: Deploy lên platform hosting

#### Option A: Vercel (Khuyến nghị cho Next.js)
- [ ] Tạo tài khoản: https://vercel.com
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Deploy: `vercel --prod`
- [ ] Setup custom domain (optional)
- [ ] Test production build

**Free tier**: Unlimited personal projects  
**Thời gian**: 2-3 giờ

#### Option B: Railway.app
- [ ] Tạo tài khoản Railway
- [ ] Connect GitHub repo
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Deploy

**Thời gian**: 2-3 giờ

#### Option C: Render.com
- [ ] Tạo tài khoản Render
- [ ] Create Web Service
- [ ] Connect repository
- [ ] Configure environment
- [ ] Deploy

**Thời gian**: 2-3 giờ

**📝 Resources:**
- Vercel Next.js: https://vercel.com/docs/frameworks/nextjs
- Railway Deploy: https://docs.railway.app/deploy/deployments

---

## 🟠 PHASE 2: SECURITY & PERFORMANCE

Bảo mật và tối ưu hóa cơ bản.

### 2.1 Security Headers ⭐⭐

- [ ] Cài Helmet: `npm install helmet`
- [ ] Tạo `middleware.js` ở root:
  ```javascript
  import { NextResponse } from 'next/server';
  
  export function middleware(request) {
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    return response;
  }
  ```

- [ ] Update `next.config.js`:
  ```javascript
  module.exports = {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on'
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload'
            }
          ]
        }
      ];
    }
  };
  ```

**Thời gian**: 2-3 giờ

---

### 2.2 Rate Limiting ⭐⭐⭐

**Ngăn chặn spam và abuse**

- [ ] Tạo `lib/middleware/rateLimit.js`:
  ```javascript
  const rateLimit = new Map();
  
  export function rateLimiter(options = {}) {
    const {
      interval = 60 * 1000, // 1 minute
      maxRequests = 100
    } = options;
    
    return async (req, res, next) => {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const now = Date.now();
      const record = rateLimit.get(ip) || { count: 0, resetTime: now + interval };
      
      if (now > record.resetTime) {
        record.count = 0;
        record.resetTime = now + interval;
      }
      
      record.count++;
      
      if (record.count > maxRequests) {
        return res.status(429).json({
          error: 'Too many requests. Please try again later.'
        });
      }
      
      rateLimit.set(ip, record);
      next();
    };
  }
  ```

- [ ] Apply to API routes
- [ ] Stricter limits cho:
  - Login: 5 requests/15 minutes
  - Register: 3 requests/hour
  - Upload: 10 requests/hour

**Thời gian**: 4-6 giờ

---

### 2.3 Input Validation ⭐⭐⭐

- [ ] Cài Zod: `npm install zod`
- [ ] Tạo validation schemas trong `lib/schemas/`:
  ```javascript
  // lib/schemas/recipe.js
  import { z } from 'zod';
  
  export const recipeSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(2000),
    prepTime: z.number().positive().max(1440),
    cookTime: z.number().positive().max(1440),
    servings: z.number().positive().max(100),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    ingredients: z.array(z.object({
      name: z.string().min(1).max(200),
      quantity: z.number().positive().optional(),
      unit: z.string().max(50).optional()
    })).min(1),
    instructions: z.array(z.object({
      stepNumber: z.number().positive(),
      instruction: z.string().min(5).max(1000),
      duration: z.number().positive().optional()
    })).min(1)
  });
  ```

- [ ] Validate tất cả API inputs
- [ ] Sanitize HTML inputs
- [ ] Check file types/sizes

**Thời gian**: 1 ngày

---

### 2.4 CORS Configuration ⭐⭐

- [ ] Update `next.config.js`:
  ```javascript
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ]
      }
    ];
  }
  ```

- [ ] Whitelist allowed origins
- [ ] Test cross-origin requests

**Thời gian**: 2-3 giờ

---

### 2.5 Database Optimization ⭐⭐

- [ ] Add indexes to frequently queried columns:
  ```sql
  CREATE INDEX idx_recipes_user_id ON recipes(user_id);
  CREATE INDEX idx_recipes_status ON recipes(status);
  CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
  CREATE INDEX idx_recipe_categories_recipe_id ON recipe_categories(recipe_id);
  CREATE INDEX idx_recipe_categories_category_id ON recipe_categories(category_id);
  CREATE INDEX idx_likes_user_recipe ON likes(user_id, recipe_id);
  CREATE INDEX idx_ratings_recipe_id ON ratings(recipe_id);
  CREATE INDEX idx_comments_recipe_id ON comments(recipe_id);
  ```

- [ ] Add full-text search index:
  ```sql
  CREATE INDEX idx_recipes_title_search ON recipes USING gin(to_tsvector('english', title));
  CREATE INDEX idx_recipes_description_search ON recipes USING gin(to_tsvector('english', description));
  ```

- [ ] Setup connection pooling
- [ ] Add query timeouts
- [ ] Monitor slow queries

**Thời gian**: 4-6 giờ

---

### 2.6 Caching Layer ⭐⭐

**Option A: Redis (Khuyến nghị)**
- [ ] Setup Redis (Upstash free tier)
- [ ] Cài driver: `npm install ioredis`
- [ ] Cache:
  - Recipe listings (5 minutes)
  - User profiles (10 minutes)
  - Categories (1 hour)
  - Trending recipes (15 minutes)
- [ ] Implement cache invalidation

**Option B: In-memory caching**
- [ ] Use Node's built-in Map
- [ ] Implement LRU cache
- [ ] Set TTLs

**Thời gian**: 1 ngày

---

## 🟡 PHASE 3: QUALITY & MONITORING

Testing và monitoring để đảm bảo quality.

### 3.1 Error Logging ⭐⭐⭐

- [ ] Setup Sentry:
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```

- [ ] Configure error tracking
- [ ] Add custom error boundaries
- [ ] Setup alerts for critical errors
- [ ] Track API errors
- [ ] Monitor performance

**Free tier**: 5K errors/month  
**Thời gian**: 3-4 giờ

**📝 Resource**: https://docs.sentry.io/platforms/javascript/guides/nextjs/

---

### 3.2 Testing ⭐⭐

- [ ] Unit tests cho utilities:
  ```bash
  npm install --save-dev jest @testing-library/react @testing-library/jest-dom
  ```

- [ ] Test API endpoints
- [ ] Test authentication flow
- [ ] Test database operations
- [ ] Integration tests
- [ ] E2E tests (Playwright/Cypress)

**Target coverage**: >70%  
**Thời gian**: 3-5 ngày

---

### 3.3 Analytics ⭐

- [ ] Google Analytics 4:
  ```javascript
  // app/layout.jsx
  <Script src="https://www.googletagmanager.com/gtag/js?id=GA_ID" />
  <Script id="google-analytics">
    {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
    `}
  </Script>
  ```

- [ ] Track key events:
  - Recipe views
  - Recipe creates
  - User registrations
  - Searches
  - Cook mode usage

**Thời gian**: 2-3 giờ

---

### 3.4 Uptime Monitoring ⭐

- [ ] Setup UptimeRobot: https://uptimerobot.com
- [ ] Monitor critical endpoints:
  - Homepage
  - API health check
  - Database connectivity
- [ ] Setup alerts (email/SMS)
- [ ] Create status page

**Free tier**: 50 monitors  
**Thời gian**: 1-2 giờ

---

### 3.5 Database Backups ⭐⭐⭐

- [ ] Automated daily backups
- [ ] Test restore procedure
- [ ] Secure backup storage
- [ ] Retention policy (30 days)
- [ ] Document restore process

**Thời gian**: 1 ngày

---

## 🟢 PHASE 4: OPTIMIZATION & SCALE

Tối ưu hóa cho performance và scale.

### 4.1 Image Optimization ⭐⭐

- [ ] Use Next.js Image component
- [ ] Setup image CDN (Cloudinary auto)
- [ ] Lazy loading
- [ ] WebP format
- [ ] Responsive images
- [ ] Placeholder blur

**Thời gian**: 1 ngày

---

### 4.2 SEO Enhancement ⭐⭐

- [ ] sitemap.xml generation
- [ ] robots.txt
- [ ] Meta tags cho mỗi page
- [ ] Open Graph images
- [ ] Structured data (Recipe schema)
- [ ] Canonical URLs
- [ ] Google Search Console

**Thời gian**: 1-2 ngày

---

### 4.3 Performance Optimization ⭐⭐

- [ ] Code splitting
- [ ] Dynamic imports
- [ ] Bundle analysis: `npm run analyze`
- [ ] Remove unused dependencies
- [ ] Minify CSS/JS
- [ ] Lighthouse score >90

**Target metrics:**
- First Contentful Paint: <1.8s
- Time to Interactive: <3.8s
- Cumulative Layout Shift: <0.1

**Thời gian**: 2-3 ngày

---

### 4.4 API Pagination ⭐⭐

- [ ] Implement cursor-based pagination
- [ ] Default limit: 20 items
- [ ] Max limit: 100 items
- [ ] Add pagination metadata

```javascript
{
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8,
    hasNext: true,
    hasPrev: false
  }
}
```

**Thời gian**: 4-6 giờ

---

### 4.5 Load Testing ⭐

- [ ] Setup k6 or Artillery
- [ ] Test scenarios:
  - Homepage load
  - Recipe search
  - Recipe creation
  - File uploads
  - Concurrent users
- [ ] Identify bottlenecks
- [ ] Optimize accordingly

**Target**: 100 concurrent users  
**Thời gian**: 1-2 ngày

---

## 📋 Pre-Launch Checklist

Kiểm tra cuối cùng trước khi launch:

### Technical
- [ ] All environment variables configured
- [ ] Database migrated and seeded
- [ ] File storage working
- [ ] HTTPS enabled
- [ ] Custom domain configured (nếu có)
- [ ] Email sending works (nếu có)
- [ ] All API endpoints tested
- [ ] Mobile responsive tested
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)

### Security
- [ ] Security headers enabled
- [ ] Rate limiting active
- [ ] Input validation complete
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Authentication working
- [ ] Authorization working

### Monitoring
- [ ] Error tracking active (Sentry)
- [ ] Analytics configured (GA4)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Database monitoring
- [ ] Alert notifications setup

### Performance
- [ ] Lighthouse score >85
- [ ] Images optimized
- [ ] Caching implemented
- [ ] Database indexed
- [ ] Load tested

### Legal & Compliance
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie consent
- [ ] GDPR compliance (nếu có EU users)
- [ ] Contact information

### Documentation
- [ ] README updated
- [ ] API documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] Changelog

---

## 🎯 Quick Wins (Làm Trước Nếu Vội)

Nếu cần deploy gấp, ưu tiên 5 việc này:

1. **Database migration** → Supabase (2 ngày)
2. **File storage** → Cloudinary (4 giờ)
3. **Deploy** → Vercel (2 giờ)
4. **Error tracking** → Sentry (3 giờ)
5. **Rate limiting** API quan trọng (6 giờ)

**Tổng: ~3 ngày** để có MVP production-ready cơ bản.

---

## 📚 Resources Tổng Hợp

### Hosting & Infrastructure
- Vercel: https://vercel.com
- Railway: https://railway.app
- Render: https://render.com
- Supabase: https://supabase.com

### Monitoring & Analytics
- Sentry: https://sentry.io
- Google Analytics: https://analytics.google.com
- UptimeRobot: https://uptimerobot.com

### File Storage
- Cloudinary: https://cloudinary.com
- AWS S3: https://aws.amazon.com/s3/

### Performance
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- WebPageTest: https://www.webpagetest.org

### Security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Security Headers: https://securityheaders.com

---

## 💡 Tips

1. **Làm từng bước**, đừng vội
2. **Test kỹ** mỗi thay đổi
3. **Commit thường xuyên** với Git
4. **Document mọi thứ** bạn làm
5. **Backup trước khi thay đổi lớn**
6. **Monitor metrics** sau mỗi deploy
7. **Xin feedback** từ users thật

---

## ✅ Hoàn Thành

Khi đã tick hết checklist này, bạn sẽ có một production app:
- ✅ An toàn
- ✅ Nhanh
- ✅ Scalable
- ✅ Monitored
- ✅ Maintainable

**Chúc bạn thành công! 🚀**
