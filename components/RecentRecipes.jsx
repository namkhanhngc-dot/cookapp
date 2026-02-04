'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './TrendingRecipes.module.css'; // Reuse same styles

export default function RecentRecipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecent();
    }, []);

    const fetchRecent = async () => {
        try {
            const res = await fetch('/api/recipes/recent?limit=12');
            const data = await res.json();
            setRecipes(data.recipes || []);
        } catch (error) {
            console.error('Failed to fetch recent recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className={styles.section}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>📅 Công Thức Gần Đây</h2>
                    <div className={styles.grid}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={styles.skeleton} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (recipes.length === 0) {
        return null; // Don't show section if no recipes
    }

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.sectionTitle}>📅 Công Thức Gần Đây</h2>
                    <Link href="/search" className={styles.viewAll}>
                        Xem tất cả →
                    </Link>
                </div>

                <div className={styles.grid}>
                    {recipes.map(recipe => (
                        <Link
                            key={recipe.id}
                            href={`/recipes/${recipe.id}`}
                            className={styles.card}
                        >
                            <div className={styles.cardImage}>
                                <img
                                    src={recipe.thumbnail || '/placeholder-recipe.jpg'}
                                    alt={recipe.title}
                                />
                            </div>

                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{recipe.title}</h3>

                                <div className={styles.cardMeta}>
                                    <span className={styles.metaItem}>
                                        ⏱ {recipe.total_time || recipe.cook_time || 0} phút
                                    </span>
                                    <span className={styles.metaItem}>
                                        {recipe.difficulty === 'easy' && '⭐ Dễ'}
                                        {recipe.difficulty === 'medium' && '⭐⭐ Trung bình'}
                                        {recipe.difficulty === 'hard' && '⭐⭐⭐ Khó'}
                                    </span>
                                </div>

                                {recipe.avg_rating > 0 && (
                                    <div className={styles.rating}>
                                        ⭐ {parseFloat(recipe.avg_rating).toFixed(1)}
                                        <span className={styles.ratingCount}>
                                            ({recipe.rating_count})
                                        </span>
                                    </div>
                                )}

                                <div className={styles.author}>
                                    👤 {recipe.author}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
