-- Banner Management System Migration
-- Add site_banners table for admin-managed homepage banners

CREATE TABLE IF NOT EXISTS site_banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  cta_text VARCHAR(100),
  cta_link VARCHAR(500),
  image_url VARCHAR(1000) NOT NULL,
  image_public_id VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries on active banners
CREATE INDEX idx_banners_active ON site_banners(is_active, display_order);

-- Insert default banner
INSERT INTO site_banners (title, subtitle, cta_text, cta_link, image_url, display_order, is_active)
VALUES (
  'Nấu Ăn Ngon Mỗi Ngày',
  'Khám phá hàng nghìn công thức nấu ăn Việt Nam 🇻🇳 - Chia sẻ niềm đam mê ẩm thực của bạn',
  '🔍 Khám Phá Công Thức',
  '/search',
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&h=600&fit=crop',
  0,
  true
);
