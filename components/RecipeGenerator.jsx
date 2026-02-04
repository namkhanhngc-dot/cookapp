'use client';

import { useState } from 'react';
import styles from './RecipeGenerator.module.css';

export default function RecipeGenerator({ onRecipeGenerated, onClose }) {
    const [prompt, setPrompt] = useState('');
    const [servings, setServings] = useState(2);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateRecipe = async () => {
        if (!prompt.trim()) {
            setError('Vui lòng nhập mô tả món ăn');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/ai/generate-recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt.trim(), servings })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Lỗi tạo công thức');
            }

            // Callback với recipe data
            if (onRecipeGenerated) {
                onRecipeGenerated(data.recipe);
            }

        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateRecipe();
        }
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.header}>
                    <h2>🤖 AI Tạo Công Thức</h2>
                    <button onClick={onClose} className={styles.closeBtn}>✕</button>
                </div>

                <div className={styles.body}>
                    <div className={styles.description}>
                        Mô tả món ăn bạn muốn tạo, AI sẽ tự động tạo công thức chi tiết!
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Mô tả món ăn</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ví dụ: Món gà xào sả ớt cay, món canh chua cá, bánh flan mềm mịn..."
                            className={styles.textarea}
                            rows={4}
                            maxLength={500}
                        />
                        <small>{prompt.length}/500 ký tự</small>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Số người ăn</label>
                        <input
                            type="number"
                            value={servings}
                            onChange={(e) => setServings(parseInt(e.target.value))}
                            min={1}
                            max={20}
                            className={styles.input}
                        />
                    </div>

                    {error && (
                        <div className={styles.error}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div className={styles.footer}>
                        <button
                            onClick={generateRecipe}
                            disabled={loading || !prompt.trim()}
                            className="btn btn-primary btn-lg"
                        >
                            {loading ? '🤖 Đang tạo công thức...' : '✨ Tạo công thức'}
                        </button>
                    </div>

                    <div className={styles.note}>
                        💡 <strong>Lưu ý:</strong> Công thức do AI tạo sẽ được đánh dấu và bạn có thể chỉnh sửa trước khi lưu.
                    </div>
                </div>
            </div>
        </div>
    );
}
