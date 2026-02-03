'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './cook.module.css';

export default function CookModePage({ params }) {
    const { id } = params;
    const router = useRouter();
    const [recipe, setRecipe] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [checkedIngredients, setCheckedIngredients] = useState(new Set());
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [wakeLock, setWakeLock] = useState(null);

    useEffect(() => {
        fetchRecipe();
        requestWakeLock();

        return () => {
            if (wakeLock) {
                wakeLock.release();
            }
        };
    }, [id]);

    useEffect(() => {
        let interval;
        if (timerRunning && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds(prev => {
                    if (prev <= 1) {
                        setTimerRunning(false);
                        alert('⏰ Timer finished!');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning, timerSeconds]);

    const fetchRecipe = async () => {
        try {
            const res = await fetch(`/api/recipes/${id}`);
            const data = await res.json();
            if (res.ok) {
                setRecipe(data.recipe);
            }
        } catch (error) {
            console.error('Failed to fetch recipe:', error);
        }
    };

    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                const lock = await navigator.wakeLock.request('screen');
                setWakeLock(lock);
                console.log('Screen Wake Lock activated');
            }
        } catch (err) {
            console.log('Wake Lock not supported or failed:', err);
        }
    };

    const toggleIngredient = (idx) => {
        const newChecked = new Set(checkedIngredients);
        if (newChecked.has(idx)) {
            newChecked.delete(idx);
        } else {
            newChecked.add(idx);
        }
        setCheckedIngredients(newChecked);
    };

    const startTimer = (minutes) => {
        setTimerSeconds(minutes * 60);
        setTimerRunning(true);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!recipe) {
        return (
            <div className={styles.loading}>
                <div className="spinner"></div>
            </div>
        );
    }

    const instructions = recipe.instructions || [];
    const currentInstruction = instructions[currentStep];
    const progress = instructions.length > 0 ? ((currentStep + 1) / instructions.length) * 100 : 0;

    return (
        <div className={styles.cookMode}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    ← Exit Cook Mode
                </button>
                <h2>{recipe.title}</h2>
                <div className={styles.progress}>
                    <div className={styles.progressBar} style={{ width: `${progress}%` }} />
                </div>
            </header>

            <div className={styles.content}>
                {/* Ingredients Panel */}
                <aside className={styles.sidebar}>
                    <h3>Ingredients</h3>
                    <div className={styles.ingredientsList}>
                        {recipe.ingredients?.map((ing, idx) => (
                            <label
                                key={idx}
                                className={`${styles.ingredient} ${checkedIngredients.has(idx) ? styles.checked : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={checkedIngredients.has(idx)}
                                    onChange={() => toggleIngredient(idx)}
                                />
                                <span>
                                    {ing.quantity} {ing.unit} {ing.name}
                                </span>
                            </label>
                        ))}
                    </div>

                    {/* Timer */}
                    <div className={styles.timerSection}>
                        <h4>Timer</h4>
                        {timerRunning ? (
                            <div className={styles.timerActive}>
                                <div className={styles.timerDisplay}>{formatTime(timerSeconds)}</div>
                                <button
                                    onClick={() => setTimerRunning(false)}
                                    className="btn btn-secondary btn-sm"
                                >
                                    Pause
                                </button>
                            </div>
                        ) : (
                            <div className={styles.timerButtons}>
                                <button onClick={() => startTimer(5)} className="btn btn-sm">5m</button>
                                <button onClick={() => startTimer(10)} className="btn btn-sm">10m</button>
                                <button onClick={() => startTimer(15)} className="btn btn-sm">15m</button>
                                <button onClick={() => startTimer(30)} className="btn btn-sm">30m</button>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Step Display */}
                <main className={styles.mainPanel}>
                    {currentInstruction ? (
                        <>
                            <div className={styles.stepNumber}>
                                Step {currentStep + 1} of {instructions.length}
                            </div>

                            <div className={styles.stepInstruction}>
                                {currentInstruction.instruction}
                            </div>

                            {currentInstruction.duration && (
                                <button
                                    onClick={() => startTimer(currentInstruction.duration)}
                                    className={`btn btn-primary ${styles.quickTimer}`}
                                >
                                    ⏱️ Start {currentInstruction.duration} min timer
                                </button>
                            )}

                            <div className={styles.navigation}>
                                <button
                                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                    disabled={currentStep === 0}
                                    className="btn btn-secondary btn-lg"
                                >
                                    ← Previous
                                </button>

                                <button
                                    onClick={() => setCurrentStep(Math.min(instructions.length - 1, currentStep + 1))}
                                    disabled={currentStep === instructions.length - 1}
                                    className="btn btn-primary btn-lg"
                                >
                                    Next →
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className={styles.noSteps}>
                            <p>No instructions available</p>
                            <button onClick={() => router.back()} className="btn btn-primary">
                                Go Back
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
