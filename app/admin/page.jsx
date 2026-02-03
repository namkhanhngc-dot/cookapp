'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './admin.module.css';

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        checkAdmin();
        fetchStats();
    }, []);

    const checkAdmin = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            if (data.user.role !== 'admin') {
                alert('⛔ Access Denied - Admin only');
                router.push('/');
                return;
            }
            setUser(data.user);
        } catch (error) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
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
                    {/* Header */}
                    <div className={styles.header}>
                        <h1 className={styles.title}>⚙️ Admin Dashboard</h1>
                        <p className={styles.subtitle}>
                            Chào mừng <strong>{user?.username}</strong> đến với trang quản trị
                        </p>
                    </div>

                    {/* Stats Grid */}
                    {stats && (
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}>👥</div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statValue}>{stats.totalUsers || 0}</div>
                                    <div className={styles.statLabel}>Users</div>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}>🍳</div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statValue}>{stats.totalRecipes || 0}</div>
                                    <div className={styles.statLabel}>Recipes</div>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}>🏷️</div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statValue}>{stats.totalCategories || 0}</div>
                                    <div className={styles.statLabel}>Categories</div>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}>🚨</div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statValue}>{stats.pendingReports || 0}</div>
                                    <div className={styles.statLabel}>Pending Reports</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>🚀 Quick Actions</h2>
                        <div className={styles.actionGrid}>
                            <Link href="/admin/users" className={styles.actionCard}>
                                <div className={styles.actionIcon}>👥</div>
                                <div className={styles.actionTitle}>User Management</div>
                                <div className={styles.actionDesc}>View and manage users</div>
                            </Link>
                            <Link href="/admin/recipes" className={styles.actionCard}>
                                <div className={styles.actionIcon}>🍳</div>
                                <div className={styles.actionTitle}>Recipe Management</div>
                                <div className={styles.actionDesc}>Moderate recipes</div>
                            </Link>
                            <Link href="/admin/reports" className={styles.actionCard}>
                                <div className={styles.actionIcon}>🚨</div>
                                <div className={styles.actionTitle}>Reports</div>
                                <div className={styles.actionDesc}>Handle user reports</div>
                            </Link>
                            <Link href="/admin/categories" className={styles.actionCard}>
                                <div className={styles.actionIcon}>🏷️</div>
                                <div className={styles.actionTitle}>Categories</div>
                                <div className={styles.actionDesc}>Manage categories</div>
                            </Link>
                            <Link href="/admin/banners" className={styles.actionCard}>
                                <div className={styles.actionIcon}>🎨</div>
                                <div className={styles.actionTitle}>Banner Management</div>
                                <div className={styles.actionDesc}>Customize homepage banners</div>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>📊 Recent Activity</h2>
                        <div className={styles.activityList}>
                            {stats?.recentRecipes?.map(recipe => (
                                <div key={recipe.id} className={styles.activityItem}>
                                    <div className={styles.activityIcon}>🍳</div>
                                    <div className={styles.activityContent}>
                                        <div className={styles.activityTitle}>{recipe.title}</div>
                                        <div className={styles.activityMeta}>
                                            By {recipe.username} • {new Date(recipe.created_at).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                    <Link href={`/recipes/${recipe.id}`} className="btn btn-secondary btn-sm">
                                        View
                                    </Link>
                                </div>
                            )) || (
                                    <div className="text-center py-lg text-muted">
                                        No recent activity
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
