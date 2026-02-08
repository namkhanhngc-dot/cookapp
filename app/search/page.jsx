'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RecipeCard from '@/components/RecipeCard';
import styles from './search.module.css';

function SearchContent() {
    const searchParams = useSearchParams();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState('');

    useEffect(() => {
        searchRecipes();
    }, [searchParams]);

    const searchRecipes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            // Read from URL params
            const q = searchParams.get('q');
            const categoryParam = searchParams.get('category');
            const difficultyParam = searchParams.get('difficulty');
            const maxTime = searchParams.get('maxTime');
            const dietary = searchParams.get('dietary');

            // Add all params to API request
            if (q) params.append('q', q);
            if (categoryParam) params.append('category', categoryParam);
            if (difficultyParam) params.append('difficulty', difficultyParam);
            if (maxTime) params.append('maxTime', maxTime);
            if (dietary) params.append('dietary', dietary);

            const res = await fetch(`/api/recipes?${params.toString()}`);
            const data = await res.json();
            setRecipes(data.recipes || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchRecipes();
    };

    return (
        <div className={styles.searchPage}>
            <div className="container py-2xl">
                {/* Search Header */}
                <div className={styles.searchHeader}>
                    <h1>🔍 Tìm Kiếm Công Thức</h1>
                    <p className="text-muted">Khám phá công thức yêu thích của bạn</p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <div className={styles.searchInput}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Tìm kiếm món ăn, nguyên liệu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">
                            🔍 Tìm Kiếm
                        </button>
                    </div>

                    <div className={styles.filters}>
                        <select
                            className="form-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Tất cả danh mục</option>
                            <option value="mon-chay">Món Chay</option>
                            <option value="mon-man">Món Mặn</option>
                            <option value="mon-nhanh">Món Nhanh</option>
                            <option value="mon-trang-mieng">Món Tráng Miệng</option>
                        </select>

                        <select
                            className="form-select"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option value="">Độ khó</option>
                            <option value="easy">Dễ</option>
                            <option value="medium">Trung bình</option>
                            <option value="hard">Khó</option>
                        </select>
                    </div>
                </form>

                {/* Results */}
                <div className={styles.results}>
                    {loading ? (
                        <div className="flex-center py-3xl">
                            <div className="spinner"></div>
                        </div>
                    ) : recipes.length === 0 ? (
                        <div className={styles.noResults}>
                            <p>😔 Không tìm thấy công thức nào</p>
                            <p className="text-muted">Thử tìm kiếm với từ khóa khác</p>
                        </div>
                    ) : (
                        <>
                            <p className={styles.resultCount}>
                                Tìm thấy <strong>{recipes.length}</strong> công thức
                            </p>
                            <div className="grid grid-3 gap-lg">
                                {recipes.map(recipe => (
                                    <RecipeCard key={recipe.id} recipe={recipe} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <>
            <Navbar />
            <Suspense fallback={
                <div className="flex-center py-3xl">
                    <div className="spinner"></div>
                </div>
            }>
                <SearchContent />
            </Suspense>
        </>
    );
}
