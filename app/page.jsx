import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import QuickFilters from '@/components/QuickFilters';
import TrendingRecipes from '@/components/TrendingRecipes';
import CategoryBrowser from '@/components/CategoryBrowser';
import CreatorCTA from '@/components/CreatorCTA';
import { Suspense } from 'react';
import styles from './page.module.css';

export const metadata = {
    title: 'CookApp - Hôm nay ăn gì? Tìm công thức từ nguyên liệu',
    description: 'Tìm công thức nấu ăn Việt Nam từ nguyên liệu có sẵn. Khám phá hàng nghìn món ăn ngon, dễ làm. Chia sẻ công thức của bạn với cộng đồng.',
    openGraph: {
        title: 'CookApp - Recipe Discovery Platform',
        description: 'Tìm công thức từ nguyên liệu có sẵn',
        type: 'website',
    },
};

export default function HomePage() {
    return (
        <>
            <Navbar />
            <main className={styles.homepage}>
                <Hero />
                <Suspense fallback={<div style={{ height: '80px' }} />}>
                    <QuickFilters />
                </Suspense>
                <TrendingRecipes />
                <CategoryBrowser />
                <CreatorCTA />

                {/* Footer */}
                <footer className={styles.footer}>
                    <div className="container">
                        <div className={styles.footerContent}>
                            <div className={styles.footerBrand}>
                                <h3>🍳 CookApp</h3>
                                <p>Nền tảng chia sẻ công thức nấu ăn Việt Nam</p>
                            </div>
                            <div className={styles.footerLinks}>
                                <h4>Về Chúng Tôi</h4>
                                <a href="/about">Giới Thiệu</a>
                                <a href="/contact">Liên Hệ</a>
                                <a href="/terms">Điều Khoản</a>
                            </div>
                            <div className={styles.footerLinks}>
                                <h4>Cộng Đồng</h4>
                                <a href="/search">Công Thức</a>
                                <a href="/recipes/create">Đăng Công Thức</a>
                                <a href="/blog">Blog</a>
                            </div>
                        </div>
                        <div className={styles.footerBottom}>
                            <p>© 2026 CookApp. Made with ❤️ in Vietnam</p>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
}
