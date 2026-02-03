'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Hero.module.css';

export default function Hero() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [banner, setBanner] = useState(null);

    useEffect(() => {
        fetchBanner();
    }, []);

    const fetchBanner = async () => {
        try {
            const res = await fetch('/api/banners');
            if (res.ok) {
                const data = await res.json();
                // Get first active banner
                if (data.banners && data.banners.length > 0) {
                    setBanner(data.banners[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch banner:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <section
            className={styles.hero}
            style={banner?.image_url ? {
                backgroundImage: `url(${banner.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            } : {}}
        >
            <div className={styles.heroContent}>
                <h1 className={styles.headline}>
                    {banner?.title || '🍳 Hôm nay ăn gì?'}
                </h1>
                <p className={styles.subheadline}>
                    {banner?.subtitle || 'Tìm công thức từ nguyên liệu có sẵn trong tủ lạnh'}
                </p>

                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <div className={styles.searchBar}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Nhập nguyên liệu hoặc tên món (vd: trứng, cơm, mì)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className={styles.ctaButtons}>
                        <button type="submit" className={styles.btnPrimary}>
                            {banner?.cta_text || '🔍 Tìm công thức'}
                        </button>
                        <button
                            type="button"
                            className={styles.btnSecondary}
                            onClick={() => router.push(banner?.cta_link || '/recipes/create')}
                        >
                            ➕ Đăng công thức
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
