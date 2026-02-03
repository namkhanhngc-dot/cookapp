'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from '../admin.module.css';

export default function CategoryManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'dish_type',
        icon: '🍳'
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        checkAdmin();
        fetchCategories();
    }, []);

    const checkAdmin = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok || (await res.json()).user.role !== 'admin') {
                router.push('/');
            }
        } catch (error) {
            router.push('/login');
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = editingId
                ? `/api/admin/categories/${editingId}`
                : '/api/admin/categories';

            const res = await fetch(url, {
                method: editingId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert(editingId ? '✅ Đã cập nhật!' : '✅ Đã tạo category!');
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: '', type: 'dish_type', icon: '🍳' });
                fetchCategories();
            } else {
                alert('❌ Lỗi!');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('❌ Lỗi kết nối!');
        }
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            type: category.type,
            icon: category.icon
        });
        setEditingId(category.id);
        setShowForm(true);
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Bạn có chắc muốn xóa "${name}"?`)) return;

        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('✅ Đã xóa!');
                fetchCategories();
            } else {
                alert('❌ Lỗi xóa!');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('❌ Lỗi kết nối!');
        }
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

    return (
        <>
            <Navbar />
            <div className="container py-2xl">
                <div className={styles.adminDashboard}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>🏷️ Category Management</h1>
                        <p className={styles.subtitle}>Quản lý danh mục món ăn</p>
                    </div>

                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingId(null);
                            setFormData({ name: '', type: 'dish_type', icon: '🍳' });
                        }}
                        className="btn btn-primary mb-lg"
                    >
                        {showForm ? '❌ Hủy' : '➕ Thêm Category'}
                    </button>

                    {/* Form */}
                    {showForm && (
                        <div className={styles.formCard}>
                            <h3>{editingId ? 'Sửa Category' : 'Tạo Category Mới'}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label>Tên Category *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className={styles.input}
                                    >
                                        <option value="dish_type">Dish Type</option>
                                        <option value="cuisine">Cuisine</option>
                                        <option value="diet">Diet</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Icon (emoji) *</label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Cập Nhật' : 'Tạo Category'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Categories List */}
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Icon</th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.id}>
                                        <td style={{ fontSize: '2rem' }}>{cat.icon}</td>
                                        <td><strong>{cat.name}</strong></td>
                                        <td>{cat.type}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEdit(cat)}
                                                    className="btn btn-secondary btn-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id, cat.name)}
                                                    className="btn btn-error btn-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
