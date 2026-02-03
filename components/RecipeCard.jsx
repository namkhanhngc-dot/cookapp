import Link from 'next/link';
import styles from './RecipeCard.module.css';

export default function RecipeCard({ recipe }) {
    return (
        <Link href={`/recipes/${recipe.id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                {recipe.image_url ? (
                    <img src={recipe.image_url} alt={recipe.title} className={styles.image} />
                ) : (
                    <div className={styles.placeholderImage}>
                        <span className={styles.placeholderEmoji}>🍳</span>
                    </div>
                )}
                <div className={styles.imageBadges}>
                    {recipe.difficulty && (
                        <span className={`${styles.badge} ${styles[recipe.difficulty]}`}>
                            {recipe.difficulty === 'easy' && '😊 Dễ'}
                            {recipe.difficulty === 'medium' && '👌 Trung Bình'}
                            {recipe.difficulty === 'hard' && '💪 Khó'}
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{recipe.title}</h3>
                <p className={styles.description}>{recipe.description}</p>

                <div className={styles.meta}>
                    <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>⏱️</span>
                        <span>{recipe.total_time || recipe.cook_time || 30} phút</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>🍽️</span>
                        <span>{recipe.servings || 4} người</span>
                    </div>
                </div>

                <div className={styles.stats}>
                    {recipe.avg_rating && (
                        <span className={styles.stat}>
                            ⭐ {recipe.avg_rating.toFixed(1)}
                        </span>
                    )}
                    <span className={styles.stat}>
                        ❤️ {recipe.like_count || 0}
                    </span>
                    <span className={styles.stat}>
                        👁️ {recipe.views || 0}
                    </span>
                </div>

                <div className={styles.author}>
                    <span className={styles.authorAvatar}>👨‍🍳</span>
                    <span className={styles.authorName}>
                        {recipe.display_name || recipe.username}
                    </span>
                </div>
            </div>
        </Link>
    );
}
