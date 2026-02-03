'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './CreatorCTA.module.css';

export default function CreatorCTA() {
    const [stats, setStats] = useState({ total_recipes: 0, total_users: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats');
            const data = await res.json();
            // Map old keys to new keys if necessary, or ensure API returns new keys
            setStats({
                totalRecipes: data.total_recipes || 0, // Provide default 0 if undefined
                totalUsers: data.total_users || 0,     // Provide default 0 if undefined
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            // Optionally set stats to default values on error as well
            setStats({ totalRecipes: 0, totalUsers: 0 });
        }
    };

    const formatNumber = (num) => {
        if (num === undefined || num === null) return '0'; // Handle undefined/null explicitly
        return num.toLocaleString('vi-VN');
    };

    return (
        <section className={styles.creatorCTA}> {/* Changed section to div and class name */}
            <div className="container">
                <div className={styles.content}>
                    <div className={styles.text}>
                        <h2 className={styles.title}>
                            🎨 Bạn cũng có công thức tuyệt vời?
                        </h2>
                        <p className={styles.subtitle}>
                            Chia sẻ công thức của bạn với hàng ngàn người yêu thích nấu ăn
                        </p>
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <span className={styles.number}>{formatNumber(stats?.totalRecipes)}</span>
                                <span className={styles.label}>Công thức</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.number}>{formatNumber(stats?.totalUsers)}</span>
                                <span className={styles.label}>Thành viên</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.number}>{formatNumber(stats?.recipesToday)}</span>
                                <span className={styles.label}>Hôm nay</span>
                            </div>
                        </div>
                        <Link href="/recipes/create" className={styles.btn}>
                            ➕ Đăng công thức ngay
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
