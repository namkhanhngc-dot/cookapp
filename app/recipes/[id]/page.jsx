'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './recipe.module.css';

export default function RecipeDetailPage({ params }) {
    const { id } = params;
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [servings, setServings] = useState(4);

    useEffect(() => {
        fetchRecipe();
        fetchUser();
    }, [id]);

    const fetchRecipe = async () => {
        try {
            const res = await fetch(`/api/recipes/${id}`);
            const data = await res.json();
            if (res.ok) {
                setRecipe(data.recipe);
                setServings(data.recipe.servings || 4);
            }
        } catch (error) {
            console.error('Failed to fetch recipe:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (error) {
            // User not logged in
        }
    };

    const handleLike = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để thích công thức');
            return;
        }

        try {
            const res = await fetch(`/api/recipes/${id}/like`, { method: 'POST' });
            if (res.ok) {
                fetchRecipe(); // Refresh to get updated like status
            }
        } catch (error) {
            console.error('Failed to like:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('⚠️ Bạn có chắc chắn muốn xóa công thức này? Hành động này không thể hoàn tác!')) {
            return;
        }

        try {
            const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('✅ Đã xóa công thức thành công!');
                window.location.href = '/';
            } else {
                const data = await res.json();
                alert(`❌ ${data.error || 'Không thể xóa công thức'}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('❌ Có lỗi xảy ra khi xóa công thức');
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

    if (!recipe) {
        return (
            <>
                <Navbar />
                <div className="container py-2xl text-center">
                    <h1>Recipe not found</h1>
                    <Link href="/" className="btn btn-primary mt-lg">
                        Go Home
                    </Link>
                </div>
            </>
        );
    }

    const schema = {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": recipe.title,
        "description": recipe.description,
        "author": {
            "@type": "Person",
            "name": recipe.display_name || recipe.username
        },
        "prepTime": `PT${recipe.prep_time || 0}M`,
        "cookTime": `PT${recipe.cook_time || 0}M`,
        "totalTime": `PT${recipe.total_time || 0}M`,
        "recipeYield": `${recipe.servings} servings`
    };

    return (
        <>
            <Navbar />

            {/* Recipe Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />

            {/* Hero Section */}
            <div className={styles.recipeHero}>
                {recipe.image_url && (
                    <div
                        className={styles.heroImage}
                        style={{ backgroundImage: `url(${recipe.image_url})` }}
                    />
                )}
                <div className={styles.heroOverlay}>
                    <div className="container">
                        <div className={styles.heroContent}>
                            <h1 className={styles.recipeTitle}>{recipe.title}</h1>

                            <div className={styles.recipeMeta}>
                                <Link href={`/users/${recipe.user_id}`} className={styles.author}>
                                    <span className={styles.authorAvatar}>👤</span>
                                    <span>{recipe.display_name || recipe.username}</span>
                                </Link>

                                {recipe.avg_rating && (
                                    <span className={styles.rating}>
                                        ⭐ {recipe.avg_rating.toFixed(1)} ({recipe.rating_count} ratings)
                                    </span>
                                )}

                                <span>👁️ {recipe.views} views</span>
                                <span>❤️ {recipe.like_count} likes</span>
                            </div>

                            {/* Edit & Delete Buttons - Only for author or admin */}
                            {user && (user.id === recipe.user_id || user.role === 'admin') && (
                                <div className={styles.actionButtons}>
                                    <Link
                                        href={`/recipes/${recipe.id}/edit`}
                                        className="btn btn-secondary"
                                    >
                                        ✏️ Chỉnh Sửa
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        className="btn btn-danger"
                                        style={{ marginLeft: 'var(--space-sm)' }}
                                    >
                                        🗑️ Xóa
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container py-xl">
                <div className={styles.recipeGrid}>
                    {/* Sidebar */}
                    <aside className={styles.sidebar}>
                        <div className={styles.infoCard}>
                            <h3>Thông Tin Nhanh</h3>

                            {recipe.prep_time && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoIcon}>⏱️</span>
                                    <div>
                                        <div className={styles.infoLabel}>Thời Gian Chuẩn Bị</div>
                                        <div className={styles.infoValue}>{recipe.prep_time} phút</div>
                                    </div>
                                </div>
                            )}

                            {recipe.cook_time && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoIcon}>🔥</span>
                                    <div>
                                        <div className={styles.infoLabel}>Thời Gian Nấu</div>
                                        <div className={styles.infoValue}>{recipe.cook_time} phút</div>
                                    </div>
                                </div>
                            )}

                            {recipe.total_time && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoIcon}>⏰</span>
                                    <div>
                                        <div className={styles.infoLabel}>Tổng Thời Gian</div>
                                        <div className={styles.infoValue}>{recipe.total_time} phút</div>
                                    </div>
                                </div>
                            )}

                            <div className={styles.infoItem}>
                                <span className={styles.infoIcon}>🍽️</span>
                                <div>
                                    <div className={styles.infoLabel}>Khẩu Phần</div>
                                    <div className={styles.infoValue}>
                                        <div className={styles.servingsControl}>
                                            <button onClick={() => setServings(Math.max(1, servings - 1))}>-</button>
                                            <span>{servings}</span>
                                            <button onClick={() => setServings(servings + 1)}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {recipe.difficulty && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoIcon}>📊</span>
                                    <div>
                                        <div className={styles.infoLabel}>Độ Khó</div>
                                        <div className={styles.infoValue} style={{ textTransform: 'capitalize' }}>
                                            {recipe.difficulty}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {recipe.skill_level && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoIcon}>🎓</span>
                                    <div>
                                        <div className={styles.infoLabel}>Trình Độ Yêu Cầu</div>
                                        <div className={styles.infoValue} style={{ textTransform: 'capitalize' }}>
                                            {recipe.skill_level === 'beginner' ? 'Người Mới' :
                                                recipe.skill_level === 'intermediate' ? 'Trung Cấp' :
                                                    recipe.skill_level === 'advanced' ? 'Nâng Cao' : 'Chuyên Gia'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {recipe.cooking_method && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoIcon}>🍳</span>
                                    <div>
                                        <div className={styles.infoLabel}>Phương Pháp Nấu</div>
                                        <div className={styles.infoValue} style={{ textTransform: 'capitalize' }}>
                                            {recipe.cooking_method}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {recipe.cooking_temp && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoIcon}>🌡️</span>
                                    <div>
                                        <div className={styles.infoLabel}>Nhiệt Độ</div>
                                        <div className={styles.infoValue}>
                                            {recipe.cooking_temp}°C
                                        </div>
                                    </div>
                                </div>
                            )}

                            {recipe.estimated_cost && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoIcon}>💰</span>
                                    <div>
                                        <div className={styles.infoLabel}>Chi Phí Ước Tính</div>
                                        <div className={styles.infoValue}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(recipe.estimated_cost)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.actionButtons}>
                            <button onClick={handleLike} className={`btn ${recipe.isLiked ? 'btn-primary' : 'btn-secondary'}`}>
                                ❤️ {recipe.isLiked ? 'Đã Thích' : 'Thích'}
                            </button>
                            <button className="btn btn-secondary">
                                🔖 Lưu
                            </button>
                            <button className="btn btn-secondary">
                                📤 Chia Sẻ
                            </button>
                        </div>

                        {recipe.categories && recipe.categories.length > 0 && (
                            <div className={styles.categories}>
                                <h4>Danh Mục</h4>
                                <div className={styles.categoryTags}>
                                    {recipe.categories.map(cat => (
                                        <span key={cat.id} className="badge">
                                            {cat.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {recipe.meal_type && (
                            <div className={styles.categories}>
                                <h4>🍽️ Loại Bữa Ăn</h4>
                                <div className={styles.categoryTags}>
                                    {(Array.isArray(recipe.meal_type)
                                        ? recipe.meal_type
                                        : typeof recipe.meal_type === 'string'
                                            ? recipe.meal_type.split(',')
                                            : []
                                    ).map((type, idx) => {
                                        const mealLabels = {
                                            breakfast: '🌅 Sáng',
                                            lunch: '☀️ Trưa',
                                            dinner: '🌙 Tối',
                                            snack: '🍪 Ăn vặt',
                                            dessert: '🍰 Tráng miệng'
                                        };
                                        return (
                                            <span key={idx} className="badge">
                                                {mealLabels[type.trim()] || type}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* Main Content */}
                    <main className={styles.mainContent}>
                        {recipe.description && (
                            <section className={styles.section}>
                                <p className={styles.description}>{recipe.description}</p>
                            </section>
                        )}

                        {/* Ingredients */}
                        {recipe.ingredients && recipe.ingredients.length > 0 && (
                            <section className={styles.section}>
                                <h2>Nguyên Liệu</h2>
                                <ul className={styles.ingredientsList}>
                                    {recipe.ingredients.map((ing, idx) => {
                                        const scaledQty = ing.quantity ? (ing.quantity * servings / recipe.servings).toFixed(2) : '';
                                        return (
                                            <li key={idx}>
                                                <input type="checkbox" id={`ing-${idx}`} />
                                                <label htmlFor={`ing-${idx}`}>
                                                    {scaledQty && <strong>{scaledQty}</strong>}
                                                    {ing.unit && <span> {ing.unit}</span>}
                                                    <span> {ing.name}</span>
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        )}

                        {/* Instructions */}
                        {recipe.instructions && recipe.instructions.length > 0 && (
                            <section className={styles.section}>
                                <h2>Hướng Dẫn</h2>
                                <div className={styles.instructions}>
                                    {recipe.instructions.map((inst, idx) => (
                                        <div key={idx} className={styles.instructionStep}>
                                            <div className={styles.stepNumber}>{inst.step_number}</div>
                                            <div className={styles.stepContent}>
                                                <p>{inst.instruction}</p>
                                                {inst.duration && (
                                                    <span className="badge">⏱️ {inst.duration} phút</span>
                                                )}
                                                {inst.image_url && (
                                                    <img
                                                        src={inst.image_url}
                                                        alt={`Bước ${inst.step_number}`}
                                                        className={styles.stepImage}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Storage Information */}
                        {(recipe.storage_instructions || recipe.shelf_life || recipe.can_freeze) && (
                            <section className={styles.section}>
                                <h2>❄️ Bảo Quản</h2>
                                {recipe.storage_instructions && (
                                    <p style={{ marginBottom: 'var(--space-md)' }}>
                                        {recipe.storage_instructions}
                                    </p>
                                )}
                                <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                                    {recipe.shelf_life && (
                                        <span className="badge">
                                            📅 Hạn: {recipe.shelf_life}
                                        </span>
                                    )}
                                    {recipe.can_freeze && (
                                        <span className="badge">
                                            ❄️ Có thể đông lạnh
                                        </span>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Tips */}
                        {recipe.tips && (
                            <section className={styles.section}>
                                <h2>💡 Mẹo Hay</h2>
                                <p style={{ whiteSpace: 'pre-line' }}>{recipe.tips}</p>
                            </section>
                        )}

                        {/* Variations */}
                        {recipe.variations && (
                            <section className={styles.section}>
                                <h2>🔄 Biến Thể</h2>
                                <p style={{ whiteSpace: 'pre-line' }}>{recipe.variations}</p>
                            </section>
                        )}

                        {/* Pairing Suggestions */}
                        {recipe.pairing_suggestions && (
                            <section className={styles.section}>
                                <h2>🍛 Gợi Ý Kết Hợp</h2>
                                <p style={{ whiteSpace: 'pre-line' }}>{recipe.pairing_suggestions}</p>
                            </section>
                        )}

                        <div className={styles.cookModeButton}>
                            <Link href={`/recipes/${id}/cook`} className="btn btn-primary btn-lg">
                                🧑‍🍳 Bắt Đầu Nấu
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
