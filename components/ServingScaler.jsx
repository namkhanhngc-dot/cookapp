'use client';

import { useState } from 'react';
import styles from './ServingScaler.module.css';

export default function ServingScaler({ baseServings = 4, currentServings, onChange }) {
    const [servings, setServings] = useState(currentServings || baseServings);

    const handleChange = (newServings) => {
        if (newServings < 1 || newServings > 20) return;

        setServings(newServings);
        const multiplier = newServings / baseServings;
        onChange(newServings, multiplier);
    };

    const increment = () => handleChange(servings + 1);
    const decrement = () => handleChange(servings - 1);

    return (
        <div className={styles.servingScaler}>
            <label className={styles.label}>
                🍽️ Khẩu Phần
            </label>
            <div className={styles.controls}>
                <button
                    type="button"
                    onClick={decrement}
                    disabled={servings <= 1}
                    className={styles.btn}
                >
                    −
                </button>
                <input
                    type="number"
                    value={servings}
                    onChange={(e) => handleChange(parseInt(e.target.value) || 1)}
                    className={styles.input}
                    min="1"
                    max="20"
                />
                <button
                    type="button"
                    onClick={increment}
                    disabled={servings >= 20}
                    className={styles.btn}
                >
                    +
                </button>
            </div>
            {servings !== baseServings && (
                <p className={styles.multiplierInfo}>
                    x{(servings / baseServings).toFixed(2)} (base: {baseServings} khẩu phần)
                </p>
            )}
        </div>
    );
}
