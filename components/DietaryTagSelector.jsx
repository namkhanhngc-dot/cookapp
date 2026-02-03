'use client';

import { useState, useEffect } from 'react';
import styles from './DietaryTagSelector.module.css';

export default function DietaryTagSelector({ selectedTags = [], onChange }) {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await fetch('/api/dietary-tags');
            if (res.ok) {
                const data = await res.json();
                setTags(data.tags);
            }
        } catch (error) {
            console.error('Failed to fetch dietary tags:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTag = (tagId) => {
        if (selectedTags.includes(tagId)) {
            onChange(selectedTags.filter(id => id !== tagId));
        } else {
            onChange([...selectedTags, tagId]);
        }
    };

    const groupedTags = tags.reduce((acc, tag) => {
        if (!acc[tag.type]) acc[tag.type] = [];
        acc[tag.type].push(tag);
        return acc;
    }, {});

    const typeLabels = {
        'diet': '🥗 Chế Độ Ăn',
        'allergen': '⚠️ Dị Ứng',
        'restriction': '🚫 Hạn Chế'
    };

    if (loading) {
        return <div className="spinner"></div>;
    }

    return (
        <div className={styles.dietaryTagSelector}>
            {Object.entries(groupedTags).map(([type, typeTags]) => (
                <div key={type} className={styles.tagGroup}>
                    <h4 className={styles.groupTitle}>{typeLabels[type] || type}</h4>
                    <div className={styles.tagList}>
                        {typeTags.map(tag => (
                            <label
                                key={tag.id}
                                className={`${styles.tagItem} ${selectedTags.includes(tag.id) ? styles.selected : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag.id)}
                                    onChange={() => toggleTag(tag.id)}
                                    className={styles.checkbox}
                                />
                                <span className={styles.tagIcon}>{tag.icon}</span>
                                <span className={styles.tagName}>{tag.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
