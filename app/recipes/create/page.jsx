'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ImageUpload from '@/components/ImageUpload';
import ServingScaler from '@/components/ServingScaler';
import styles from './create.module.css';

export default function CreateRecipePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        // Basic info
        title: '',
        description: '',

        // Time
        prepTime: '',
        cookTime: '',

        // Servings (with scaler)
        servingsBase: 4,
        servings: 4,

        // Difficulty & method
        difficulty: 'medium',
        skillLevel: 'beginner',
        cookingMethod: '',
        cookingTemp: '',

        // Categories
        categoryIds: [],

        // Images
        images: [],

        // Ingredients & Instructions
        ingredients: [{ name: '', quantity: '', unit: '' }],
        instructions: [{ instruction: '', duration: '', image: null }],

        // Storage & preservation
        storageInstructions: '',
        shelfLife: '',
        canFreeze: false,

        // Additional info
        mealType: [],
        estimatedCost: '',
        tips: '',
        variations: '',
        pairingSuggestions: '',

        // SEO
        metaTitle: '',
        metaDescription: '',
        keywords: []
    });

    useEffect(() => {
        checkAuth();
        fetchCategories();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            setUser(data.user);
        } catch (error) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    // Ingredient handlers
    const addIngredient = () => {
        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, { name: '', quantity: '', unit: '' }]
        });
    };

    const removeIngredient = (index) => {
        setFormData({
            ...formData,
            ingredients: formData.ingredients.filter((_, i) => i !== index)
        });
    };

    const updateIngredient = (index, field, value) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index][field] = value;
        setFormData({ ...formData, ingredients: newIngredients });
    };

    // Instruction handlers
    const addInstruction = () => {
        setFormData({
            ...formData,
            instructions: [...formData.instructions, { instruction: '', duration: '', image: null }]
        });
    };

    const removeInstruction = (index) => {
        setFormData({
            ...formData,
            instructions: formData.instructions.filter((_, i) => i !== index)
        });
    };

    const updateInstruction = (index, field, value) => {
        const newInstructions = [...formData.instructions];
        newInstructions[index][field] = value;
        setFormData({ ...formData, instructions: newInstructions });
    };

    // Category toggle
    const toggleCategory = (categoryId) => {
        const currentIds = formData.categoryIds;
        const newIds = currentIds.includes(categoryId)
            ? currentIds.filter(id => id !== categoryId)
            : [...currentIds, categoryId];
        setFormData({ ...formData, categoryIds: newIds });
    };

    // Meal type toggle
    const toggleMealType = (type) => {
        const current = formData.mealType;
        const updated = current.includes(type)
            ? current.filter(t => t !== type)
            : [...current, type];
        setFormData({ ...formData, mealType: updated });
    };

    // Serving scaler handler
    const handleServingChange = (newServings, multiplier) => {
        setFormData({ ...formData, servings: newServings });
    };

    // Auto-generate meta title from recipe title
    useEffect(() => {
        if (formData.title && !formData.metaTitle) {
            setFormData(prev => ({
                ...prev,
                metaTitle: formData.title + ' - CookApp Recipe'
            }));
        }
    }, [formData.title]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title || formData.title.length < 3) {
            alert('❌ Tên món ăn phải có ít nhất 3 ký tự');
            return;
        }

        if (formData.images.length === 0) {
            alert('❌ Vui lòng upload ít nhất 1 ảnh');
            return;
        }

        if (!formData.images.some(img => img.isThumbnail)) {
            alert('❌ Vui lòng chọn thumbnail cho recipe');
            return;
        }

        const totalTime = parseInt(formData.prepTime || 0) + parseInt(formData.cookTime || 0);

        setSubmitting(true);

        try {
            const res = await fetch('/api/recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Basic
                    title: formData.title,
                    description: formData.description,

                    // Time
                    prepTime: parseInt(formData.prepTime) || 0,
                    cookTime: parseInt(formData.cookTime) || 0,
                    totalTime: totalTime,

                    // Servings
                    servings: parseInt(formData.servings) || 4,
                    servingsBase: parseInt(formData.servingsBase) || 4,

                    // Method & difficulty
                    difficulty: formData.difficulty,
                    skillLevel: formData.skillLevel,
                    cookingMethod: formData.cookingMethod,
                    cookingTemp: formData.cookingTemp ? parseInt(formData.cookingTemp) : null,

                    // Categories
                    categoryIds: formData.categoryIds,

                    // Images
                    images: formData.images,

                    // Content
                    ingredients: formData.ingredients.filter(ing => ing.name.trim()),
                    instructions: formData.instructions.filter(inst => inst.instruction.trim()),

                    // Storage
                    storageInstructions: formData.storageInstructions,
                    shelfLife: formData.shelfLife,
                    canFreeze: formData.canFreeze,

                    // Additional
                    mealType: formData.mealType,
                    estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
                    tips: formData.tips,
                    variations: formData.variations,
                    pairingSuggestions: formData.pairingSuggestions,

                    // SEO
                    metaTitle: formData.metaTitle,
                    metaDescription: formData.metaDescription,
                    keywords: formData.keywords
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert('✅ Công thức đã được tạo thành công!');
                router.push(`/recipes/${data.recipe.id}`);
            } else {
                alert('❌ Lỗi: ' + (data.error || 'Không thể tạo công thức'));
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('❌ Lỗi kết nối. Vui lòng thử lại!');
        } finally {
            setSubmitting(false);
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

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
    const mealTypeLabels = {
        breakfast: '🌅 Sáng',
        lunch: '☀️ Trưa',
        dinner: '🌙 Tối',
        snack: '🍿 Ăn vặt',
        dessert: '🍰 Tráng miệng'
    };

    return (
        <>
            <Navbar />
            <div className="container py-2xl">
                <div className={styles.createPage}>
                    <h1 className={styles.pageTitle}>✏️ Tạo Công Thức Mới</h1>
                    <p className={styles.pageSubtitle}>
                        Chia sẻ món ăn yêu thích của bạn với cộng đồng!
                    </p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* IMAGES - Priority first! */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>📸 Hình Ảnh Món Ăn *</h2>
                            <p className={styles.sectionHint}>
                                Upload ảnh món ăn của bạn (tối đa 5 ảnh). Chọn 1 ảnh làm thumbnail.
                            </p>
                            <ImageUpload
                                images={formData.images}
                                onChange={(images) => setFormData({ ...formData, images })}
                                maxFiles={5}
                            />
                        </section>

                        {/* Basic Info */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>📋 Thông Tin Cơ Bản</h2>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tên Món Ăn *</label>
                                <input
                                    type="text"
                                    placeholder="vd: Phở Bò Hà Nội, Bánh Mì Sài Gòn..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Mô Tả</label>
                                <textarea
                                    placeholder="Mô tả ngắn về món ăn của bạn..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={styles.textarea}
                                    rows="4"
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>⏱️ Thời Gian Chuẩn Bị (phút)</label>
                                    <input
                                        type="number"
                                        placeholder="vd: 30"
                                        value={formData.prepTime}
                                        onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                                        className={styles.input}
                                        min="0"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>🔥 Thời Gian Nấu (phút)</label>
                                    <input
                                        type="number"
                                        placeholder="vd: 60"
                                        value={formData.cookTime}
                                        onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                                        className={styles.input}
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Serving Scaler */}
                            <ServingScaler
                                baseServings={formData.servingsBase}
                                currentServings={formData.servings}
                                onChange={handleServingChange}
                            />

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>📊 Độ Khó</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className={styles.select}
                                    >
                                        <option value="easy">Dễ 😊</option>
                                        <option value="medium">Trung Bình 👌</option>
                                        <option value="hard">Khó 💪</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>🎓 Trình Độ Yêu Cầu</label>
                                    <select
                                        value={formData.skillLevel}
                                        onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                                        className={styles.select}
                                    >
                                        <option value="beginner">Người Mới Bắt Đầu</option>
                                        <option value="intermediate">Trung Cấp</option>
                                        <option value="advanced">Nâng Cao</option>
                                        <option value="expert">Chuyên Gia</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>🍳 Phương Pháp Nấu</label>
                                    <select
                                        value={formData.cookingMethod}
                                        onChange={(e) => setFormData({ ...formData, cookingMethod: e.target.value })}
                                        className={styles.select}
                                    >
                                        <option value="">-- Chọn phương pháp --</option>
                                        <option value="hấp">Hấp</option>
                                        <option value="rán">Rán</option>
                                        <option value="nướng">Nướng</option>
                                        <option value="rim">Rim</option>
                                        <option value="xào">Xào</option>
                                        <option value="luộc">Luộc</option>
                                        <option value="chiên">Chiên</option>
                                        <option value="kho">Kho</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>🌡️ Nhiệt Độ Lò (°C)</label>
                                    <input
                                        type="number"
                                        placeholder="vd: 180"
                                        value={formData.cookingTemp}
                                        onChange={(e) => setFormData({ ...formData, cookingTemp: e.target.value })}
                                        className={styles.input}
                                        min="0"
                                        max="300"
                                    />
                                </div>
                            </div>

                            {/* Meal Type */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>🍽️ Phù Hợp Cho</label>
                                <div className={styles.mealTypes}>
                                    {mealTypes.map(type => (
                                        <label key={type} className={styles.checkbox}>
                                            <input
                                                type="checkbox"
                                                checked={formData.mealType.includes(type)}
                                                onChange={() => toggleMealType(type)}
                                            />
                                            <span>{mealTypeLabels[type]}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Estimated Cost */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>💰 Chi Phí Ước Tính (VND)</label>
                                <input
                                    type="number"
                                    placeholder="vd: 50000 (VND)"
                                    value={formData.estimatedCost}
                                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                                    className={styles.input}
                                    min="0"
                                />
                            </div>
                        </section>

                        {/* Categories */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>🏷️ Danh Mục</h2>
                            <div className={styles.categories}>
                                {categories.map(cat => (
                                    <label key={cat.id} className={styles.categoryTag}>
                                        <input
                                            type="checkbox"
                                            checked={formData.categoryIds.includes(cat.id)}
                                            onChange={() => toggleCategory(cat.id)}
                                        />
                                        <span>{cat.icon} {cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* Ingredients */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>🥕 Nguyên Liệu *</h2>
                            {formData.ingredients.map((ing, index) => (
                                <div key={index} className={styles.ingredientRow}>
                                    <input
                                        type="text"
                                        placeholder="Tên nguyên liệu"
                                        value={ing.name}
                                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                                        className={styles.input}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Số lượng"
                                        value={ing.quantity}
                                        onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                                        className={styles.inputSmall}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Đơn vị"
                                        value={ing.unit}
                                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                                        className={styles.inputSmall}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeIngredient(index)}
                                        className={styles.removeBtn}
                                        disabled={formData.ingredients.length === 1}
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addIngredient} className={styles.addBtn}>
                                ➕ Thêm Nguyên Liệu
                            </button>
                        </section>

                        {/* Instructions */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>📝 Các Bước Thực Hiện *</h2>
                            {formData.instructions.map((inst, index) => (
                                <div key={index} className={styles.instructionRow}>
                                    <span className={styles.stepNumber}>{index + 1}</span>
                                    <div className={styles.instructionContent}>
                                        <textarea
                                            placeholder="Mô tả bước thực hiện..."
                                            value={inst.instruction}
                                            onChange={(e) => updateInstruction(index, 'instruction', e.target.value)}
                                            className={styles.textarea}
                                            rows="3"
                                        />
                                        <div className={styles.instructionMeta}>
                                            <input
                                                type="number"
                                                placeholder="vd: 10 phút"
                                                value={inst.duration}
                                                onChange={(e) => updateInstruction(index, 'duration', e.target.value)}
                                                className={styles.inputSmall}
                                                min="0"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeInstruction(index)}
                                                className={styles.removeBtn}
                                                disabled={formData.instructions.length === 1}
                                            >
                                                ❌
                                            </button>
                                        </div>
                                        <div className={styles.stepImageUpload}>
                                            <label className={styles.stepImageLabel}>📸 Ảnh minh họa (tùy chọn)</label>
                                            <ImageUpload
                                                images={inst.image ? [inst.image] : []}
                                                onChange={(images) => updateInstruction(index, 'image', images[0] || null)}
                                                maxFiles={1}
                                                maxSize={5242880}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addInstruction} className={styles.addBtn}>
                                ➕ Thêm Bước
                            </button>
                        </section>

                        {/* Storage & Preservation */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>❄️ Bảo Quản & Hạn Dùng</h2>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Cách Bảo Quản</label>
                                <textarea
                                    placeholder="vd: Bảo quản trong hộp kín, để ngăn mát tủ lạnh"
                                    value={formData.storageInstructions}
                                    onChange={(e) => setFormData({ ...formData, storageInstructions: e.target.value })}
                                    className={styles.textarea}
                                    rows="2"
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Hạn Sử Dụng</label>
                                    <input
                                        type="text"
                                        placeholder="vd: 3 ngày trong tủ lạnh"
                                        value={formData.shelfLife}
                                        onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.checkbox}>
                                        <input
                                            type="checkbox"
                                            checked={formData.canFreeze}
                                            onChange={(e) => setFormData({ ...formData, canFreeze: e.target.checked })}
                                        />
                                        <span>✅ Có thể đông lạnh</span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Tips & Variations */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>💡 Mẹo & Biến Thể</h2>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Mẹo Nấu Ăn</label>
                                <textarea
                                    placeholder="Chia sẻ các mẹo hay để món ăn ngon hơn..."
                                    value={formData.tips}
                                    onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                                    className={styles.textarea}
                                    rows="3"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Biến Thể</label>
                                <textarea
                                    placeholder="vd: Phiên bản chay, Phiên bản cay..."
                                    value={formData.variations}
                                    onChange={(e) => setFormData({ ...formData, variations: e.target.value })}
                                    className={styles.textarea}
                                    rows="3"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Gợi Ý Kết Hợp</label>
                                <textarea
                                    placeholder="vd: Ăn kèm với cơm trắng, canh chua..."
                                    value={formData.pairingSuggestions}
                                    onChange={(e) => setFormData({ ...formData, pairingSuggestions: e.target.value })}
                                    className={styles.textarea}
                                    rows="2"
                                />
                            </div>
                        </section>

                        {/* SEO - Advanced */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>🔍 SEO & Tối Ưu (Tùy chọn)</h2>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Meta Title</label>
                                <input
                                    type="text"
                                    placeholder="Tự động từ tên món ăn..."
                                    value={formData.metaTitle}
                                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                    className={styles.input}
                                    maxLength="200"
                                />
                                <small className={styles.hint}>{formData.metaTitle.length}/200</small>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Meta Description</label>
                                <textarea
                                    placeholder="Mô tả ngắn cho Google search results..."
                                    value={formData.metaDescription}
                                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                    className={styles.textarea}
                                    rows="2"
                                />
                            </div>
                        </section>

                        {/* Submit */}
                        <div className={styles.submitSection}>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={submitting}
                            >
                                {submitting ? '⏳ Đang Tạo...' : '🎉 Tạo Công Thức'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="btn btn-secondary btn-lg"
                            >
                                ❌ Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
