'use client';

import Link from 'next/link';
import styles from './CategoryBrowser.module.css';

const CATEGORIES = [
    {
        id: 'quick-15',
        name: 'Ăn nhanh 15 phút',
        icon: '⚡',
        link: '/search?maxTime=15',
        color: '#FF6B6B'
    },
    {
        id: 'vegetarian',
        name: 'Món chay',
        icon: '🥬',
        link: '/search?dietary=vegetarian',
        color: '#4ECB71'
    },
    {
        id: 'party',
        name: 'Tiệc cuối tuần',
        icon: '🎉',
        link: '/search?category=party',
        color: '#FFD93D'
    },
    {
        id: 'family',
        name: 'Món gia đình',
        icon: '👨‍👩‍👧‍👦',
        link: '/search?category=family',
        color: '#6BCF7F'
    },
    {
        id: 'healthy',
        name: 'Ăn kiêng / Healthy',
        icon: '🥗',
        link: '/search?category=healthy',
        color: '#95E1D3'
    },
    {
        id: 'traditional',
        name: 'Món truyền thống',
        icon: '🍜',
        link: '/search?category=traditional',
        color: '#F38181'
    }
];

export default function CategoryBrowser() {
    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.sectionTitle}>🍽️ Duyệt Theo Danh Mục</h2>
                <div className={styles.grid}>
                    {CATEGORIES.map(category => (
                        <Link
                            key={category.id}
                            href={category.link}
                            className={styles.card}
                            style={{ '--category-color': category.color }}
                        >
                            <span className={styles.icon}>{category.icon}</span>
                            <span className={styles.name}>{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
