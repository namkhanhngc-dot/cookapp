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
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.card}>
                    <div className={styles.content}>
                        <h2 className={styles.title}>
                            📝 Chia sẻ công thức của bạn với cộng đồng
                        </h2>
                        <p className={styles.subtitle}>
                            Trở thành một phần của cộng đồng đam mê nấu ăn
                        </p>
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>
                                    {stats.total_recipes.toLocaleString()}
                                </span>
                                <span className={styles.statLabel}>Công thức</span>
                            </div>
                            <div className={styles.statDivider}></div>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>
                                    {stats.total_users.toLocaleString()}
                                </span>
                                <span className={styles.statLabel}>Người dùng</span>
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
