'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './PantrySearch.module.css';

export default function PantrySearch() {
    const [ingredients, setIngredients] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Thêm nguyên liệu
    const addIngredient = () => {
        if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
            setIngredients([...ingredients, inputValue.trim()]);
            setInputValue('');
        }
    };

    // Xóa nguyên liệu
    const removeIngredient = (ingredientToRemove) => {
        setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
    };

    const searchRecipes = async () => {
        if (ingredients.length === 0) {
            setError('Vui lòng thêm ít nhất 1 nguyên liệu');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Sử dụng simple search để debug
            const res = await fetch('/api/ai/pantry-search-simple', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients, limit: 10 })
            });

            const data = await res.json();

            console.log('Search response:', data);

            if (!res.ok) {
                throw new Error(data.error || 'Lỗi tìm kiếm');
            }

            setResults(data.matches || []);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addIngredient();
        }
    };

    return (
        <div className={styles.pantrySearch}>
            <div className={styles.header}>
                <h1>🔍 Tìm Công Thức Từ Nguyên Liệu</h1>
                <p>Nhập nguyên liệu bạn có, AI sẽ tìm công thức phù hợp nhất</p>
            </div>

            {/* Input Section */}
            <div className={styles.inputSection}>
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập nguyên liệu (vd: thịt bò, cà chua...)"
                        className={styles.input}
                    />
                    <button onClick={addIngredient} className="btn btn-secondary">
                        Thêm
                    </button>
                </div>

                {/* Ingredients Tags */}
                {ingredients.length > 0 && (
                    <div className={styles.ingredientTags}>
                        {ingredients.map((ing, idx) => (
                            <span key={idx} className={styles.tag}>
                                {ing}
                                <button onClick={() => removeIngredient(ing)}>✕</button>
                            </span>
                        ))}
                    </div>
                )}

                <button
                    onClick={searchRecipes}
                    disabled={loading || ingredients.length === 0}
                    className="btn btn-primary btn-lg"
                >
                    {loading ? '🤖 Đang tìm kiếm...' : '🔍 Tìm công thức'}
                </button>

                {error && <div className={styles.error}>{error}</div>}
            </div>

            {/* Results Section */}
            {results.length > 0 && (
                <div className={styles.results}>
                    <h2>Tìm thấy {results.length} công thức phù hợp</h2>

                    <div className={styles.resultGrid}>
                        {results.map((recipe) => (
                            <Link
                                key={recipe.id}
                                href={`/recipes/${recipe.id}`}
                                className={styles.recipeCard}
                            >
                                {/* Match Badge */}
                                <div className={styles.matchBadge}>
                                    {recipe.match_percentage}% phù hợp
                                </div>

                                {/* Image */}
                                <div className={styles.recipeImage}>
                                    <img
                                        src={recipe.thumbnail || '/placeholder-recipe.jpg'}
                                        alt={recipe.title}
                                    />
                                </div>

                                {/* Content */}
                                <div className={styles.recipeContent}>
                                    <h3>{recipe.title}</h3>

                                    {/* Matched Ingredients */}
                                    <div className={styles.matched}>
                                        <strong>✅ Có sẵn:</strong>
                                        <p>{recipe.matched_ingredients?.join(', ')}</p>
                                    </div>

                                    {/* Missing Ingredients */}
                                    {recipe.missing_ingredients?.length > 0 && (
                                        <div className={styles.missing}>
                                            <strong>🛒 Cần mua:</strong>
                                            <p>{recipe.missing_ingredients.join(', ')}</p>
                                        </div>
                                    )}

                                    {/* AI Explanation */}
                                    <div className={styles.explanation}>
                                        <em>{recipe.explanation}</em>
                                    </div>

                                    {/* Meta */}
                                    <div className={styles.meta}>
                                        {recipe.total_time && <span>⏱️ {recipe.total_time} phút</span>}
                                        {recipe.difficulty && (
                                            <span>
                                                {recipe.difficulty === 'easy' && '⭐ Dễ'}
                                                {recipe.difficulty === 'medium' && '⭐⭐ Trung bình'}
                                                {recipe.difficulty === 'hard' && '⭐⭐⭐ Khó'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && results.length === 0 && ingredients.length > 0 && (
                <div className={styles.empty}>
                    <p>Chưa có kết quả. Nhấn "Tìm công thức" để bắt đầu!</p>
                </div>
            )}
        </div>
    );
}
