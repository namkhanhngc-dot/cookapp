'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RecipeCard from '@/components/RecipeCard';
import styles from './profile.module.css';

export default function UserProfilePage({ params }) {
    const { id } = params;
    const [user, setUser] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchUserProfile();
        fetchCurrentUser();
    }, [id]);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch(`/api/users/${id}`);
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                setRecipes(data.recipes || []);
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data.user);
            }
        } catch (error) {
            // Not logged in
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex-center py-2xl">
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <Navbar />
                <div className="container py-2xl text-center">
                    <h1>User not found</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className={styles.profilePage}>
                {/* Profile Header */}
                <div className={styles.profileHeader}>
                    <div className="container">
                        <div className={styles.profileInfo}>
                            <div className={styles.avatar}>
                                {(user.avatarUrl || user.avatar_url) ? (
                                    <img src={user.avatarUrl || user.avatar_url} alt={(user.displayName || user.display_name) || user.username} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        {((user.displayName || user.display_name) || user.username).charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className={styles.userInfo}>
                                <h1>{user.display_name || user.username}</h1>
                                <p className={styles.username}>@{user.username}</p>
                                {user.bio && <p className={styles.bio}>{user.bio}</p>}

                                <div className={styles.stats}>
                                    <div className={styles.stat}>
                                        <strong>{recipes.length}</strong>
                                        <span>Công thức</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <strong>{user.follower_count || 0}</strong>
                                        <span>Người theo dõi</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <strong>{user.following_count || 0}</strong>
                                        <span>Đang theo dõi</span>
                                    </div>
                                </div>

                                {currentUser && currentUser.id === parseInt(id) && (
                                    <button
                                        className="btn btn-secondary mt-md"
                                        onClick={() => router.push('/profile/edit')}
                                    >
                                        ✏️ Chỉnh sửa hồ sơ
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User's Recipes */}
                <div className="container py-xl">
                    <h2 className={styles.sectionTitle}>Công Thức Của {(user.displayName || user.display_name) || user.username}</h2>

                    {recipes.length === 0 ? (
                        <div className="text-center py-xl">
                            <p className="text-muted">Chưa có công thức nào</p>
                        </div>
                    ) : (
                        <div className="grid grid-3 gap-lg">
                            {recipes.map(recipe => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
