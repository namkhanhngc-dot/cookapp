'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from '../admin.module.css';

export default function RecipeManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        checkAdmin();
        fetchRecipes();
    }, [filter]);

    const checkAdmin = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok || (await res.json()).user.role !== 'admin') {
                router.push('/');
            }
        } catch (error) {
            router.push('/login');
        }
    };

    const fetchRecipes = async () => {
        try {
            const url = filter === 'all'
                ? '/api/admin/recipes'
                : `/api/admin/recipes?status=${filter}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setRecipes(data.recipes);
            }
        } catch (error) {
            console.error('Failed to fetch recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (recipeId, title) => {
        if (!confirm(`Bạn có chắc muốn xóa "${title}"?`)) return;

        try {
            const res = await fetch(`/api/admin/recipes/${recipeId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('✅ Đã xóa recipe!');
                fetchRecipes();
            } else {
                alert('❌ Lỗi xóa recipe!');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('❌ Lỗi kết nối!');
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex-center py-3xl">
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container py-2xl">
                <div className={styles.adminDashboard}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>🍳 Recipe Management</h1>
                        <p className={styles.subtitle}>Quản lý và kiểm duyệt recipes</p>
                    </div>

                    {/* Filters */}
                    <div className={styles.filterBar}>
                        <button
                            onClick={() => setFilter('all')}
                            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Tất Cả ({recipes.length})
                        </button>
                        <button
                            onClick={() => setFilter('published')}
                            className={`btn ${filter === 'published' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Published
                        </button>
                        <button
                            onClick={() => setFilter('draft')}
                            className={`btn ${filter === 'draft' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Draft
                        </button>
                    </div>

                    {/* Recipes Grid */}
                    <div className="grid grid-3">
                        {recipes.map(recipe => (
                            <div key={recipe.id} className={styles.recipeCard}>
                                <div className={styles.recipeHeader}>
                                    <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                                    <span className={`${styles.badge} ${styles[recipe.status]}`}>
                                        {recipe.status}
                                    </span>
                                </div>
                                <div className={styles.recipeMeta}>
                                    <span>👤 {recipe.username}</span>
                                    <span>👁️ {recipe.views} views</span>
                                    <span>❤️ {recipe.likes_count} likes</span>
                                </div>
                                <div className={styles.recipeActions}>
                                    <Link href={`/recipes/${recipe.id}`} className="btn btn-secondary btn-sm">
                                        View
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(recipe.id, recipe.title)}
                                        className="btn btn-error btn-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {recipes.length === 0 && (
                        <div className="text-center py-2xl">
                            <p className="text-muted">Không có recipe nào</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
