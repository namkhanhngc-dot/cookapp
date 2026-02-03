'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ImageUpload from '@/components/ImageUpload';
import styles from '../../create/create.module.css';

export default function EditRecipePage({ params }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [recipe, setRecipe] = useState(null);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch user to check authorization
            const userRes = await fetch('/api/auth/me');
            if (!userRes.ok) {
                router.push('/login');
                return;
            }
            const userData = await userRes.json();
            setUser(userData.user);

            // Fetch recipe
            const recipeRes = await fetch(`/api/recipes/${params.id}`);
            if (!recipeRes.ok) {
                alert('Recipe not found');
                router.push('/');
                return;
            }
            const recipeData = await recipeRes.json();
            const recipeDetail = recipeData.recipe;

            // Check authorization
            if (recipeDetail.user_id !== userData.user.id && userData.user.role !== 'admin') {
                alert('You do not have permission to edit this recipe');
                router.push(`/recipes/${params.id}`);
                return;
            }

            setRecipe(recipeDetail);

            // Map recipe to form data
            setFormData({
                title: recipeDetail.title || '',
                description: recipeDetail.description || '',
                imageUrl: recipeDetail.image_url || '',
                images: recipeDetail.media?.map(m => ({
                    url: m.media_url,
                    publicId: m.media_url.split('/').pop().split('.')[0],
                    isThumbnail: m.is_thumbnail
                })) || [],

                prepTime: recipeDetail.prep_time || 0,
                cookTime: recipeDetail.cook_time || 0,
                totalTime: recipeDetail.total_time || 0,
                servings: recipeDetail.servings || 4,
                difficulty: recipeDetail.difficulty || 'medium',

                ingredients: recipeDetail.ingredients?.map(ing => ({
                    name: ing.name,
                    quantity: ing.quantity || '',
                    unit: ing.unit || ''
                })) || [{ name: '', quantity: '', unit: '' }],

                instructions: recipeDetail.instructions?.map(inst => ({
                    instruction: inst.instruction,
                    duration: inst.duration || '',
                    image: inst.image_url ? { url: inst.image_url, publicId: inst.image_public_id } : null
                })) || [{ instruction: '', duration: '', image: null }],

                categoryIds: recipeDetail.categories?.map(c => c.id) || [],

                storageInstructions: recipeDetail.storage_instructions || '',
                shelfLife: recipeDetail.shelf_life || '',
                canFreeze: recipeDetail.can_freeze || false,
                cookingMethod: recipeDetail.cooking_method || '',
                cookingTemp: recipeDetail.cooking_temp || '',
                skillLevel: recipeDetail.skill_level || 'beginner',
                mealType: recipeDetail.meal_type || [],
                tips: recipeDetail.tips || '',
                variations: recipeDetail.variations || '',
                pairingSuggestions: recipeDetail.pairing_suggestions || ''
            });

            // Fetch categories
            const catRes = await fetch('/api/categories');
            const catData = await catRes.json();
            setCategories(catData.categories || []);

        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to load recipe');
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Sync imageUrl with first image if images exist
            const submitData = {
                ...formData,
                imageUrl: formData.images?.[0]?.url || formData.imageUrl || null
            };

            const res = await fetch(`/api/recipes/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });

            const data = await res.json();

            if (res.ok) {
                alert('✅ Recipe updated successfully!');
                router.push(`/recipes/${params.id}`);
            } else {
                alert(`❌ ${data.error || 'Failed to update recipe'}`);
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('❌ Failed to update recipe');
        } finally {
            setSubmitting(false);
        }
    };

    // Copy all helper functions from create page
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

    const toggleCategory = (categoryId) => {
        const currentIds = formData.categoryIds;
        const newIds = currentIds.includes(categoryId)
            ? currentIds.filter(id => id !== categoryId)
            : [...currentIds, categoryId];
        setFormData({ ...formData, categoryIds: newIds });
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex-center py-3xl">
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    if (!formData) {
        return null;
    }

    return (
        <>
            <Navbar />
            <div className={styles.createPage}>
                <div className="container">
                    <h1 className={styles.pageTitle}>✏️ Chỉnh Sửa Công Thức</h1>
                    <p className={styles.pageSubtitle}>Cập nhật thông tin công thức của bạn</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Basic Info */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>📋 Thông Tin Cơ Bản *</h2>

                            <div className={styles.formRow}>
                                <div className="form-group flex-1">
                                    <label className="form-label">Tên Món Ăn *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="vd: Phở Bò Hà Nội"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mô Tả</label>
                                <textarea
                                    className={styles.textarea}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="4"
                                    placeholder="Giới thiệu ngắn gọn về món ăn..."
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="form-group">
                                <label className="form-label">Hình Ảnh Món Ăn</label>
                                <ImageUpload
                                    key={`main-images-${formData.images.length}`}
                                    images={formData.images}
                                    onChange={(images) => setFormData({ ...formData, images })}
                                    maxFiles={5}
                                />
                            </div>
                        </section>

                        {/* Time & Servings */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>⏱️ Thời Gian & Khẩu Phần *</h2>

                            <div className={styles.formRow}>
                                <div className="form-group">
                                    <label className="form-label">Thời Gian Chuẩn Bị (phút)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.prepTime}
                                        onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) || 0 })}
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Thời Gian Nấu (phút)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.cookTime}
                                        onChange={(e) => setFormData({ ...formData, cookTime: parseInt(e.target.value) || 0 })}
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tổng Thời Gian (phút)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.totalTime}
                                        onChange={(e) => setFormData({ ...formData, totalTime: parseInt(e.target.value) || 0 })}
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Số Khẩu Phần</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.servings}
                                        onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                                        min="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Độ Khó</label>
                                    <select
                                        className="form-select"
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        <option value="easy">Dễ</option>
                                        <option value="medium">Trung Bình</option>
                                        <option value="hard">Khó</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Ingredients */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>🥘 Nguyên Liệu *</h2>
                            {formData.ingredients.map((ing, index) => (
                                <div key={index} className={styles.ingredientRow}>
                                    <input
                                        type="text"
                                        placeholder="Tên nguyên liệu"
                                        value={ing.name}
                                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                                        className={styles.inputLarge}
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
                                                key={`inst-${index}-${inst.image ? 'has' : 'no'}-image`}
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

                        {/* Categories */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>🏷️ Danh Mục</h2>
                            <div className={styles.categories}>
                                {categories.map((category) => (
                                    <label key={category.id} className={styles.categoryTag}>
                                        <input
                                            type="checkbox"
                                            checked={formData.categoryIds.includes(category.id)}
                                            onChange={() => toggleCategory(category.id)}
                                        />
                                        <span>{category.name}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* Submit */}
                        <div className={styles.submitSection}>
                            <button
                                type="button"
                                onClick={() => router.push(`/recipes/${params.id}`)}
                                className="btn btn-secondary"
                                disabled={submitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={submitting}
                            >
                                {submitting ? '⏳ Đang Cập Nhật...' : '💾 Lưu Thay Đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
