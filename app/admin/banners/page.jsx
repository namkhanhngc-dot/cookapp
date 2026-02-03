'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ImageUpload from '@/components/ImageUpload';
import styles from '../admin.module.css';

export default function BannerManagement() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [banners, setBanners] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        cta_text: '',
        cta_link: '',
        images: [],
        display_order: 0
    });

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        await checkAdmin();
        await fetchBanners();
    };

    const checkAdmin = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            if (data.user.role !== 'admin') {
                router.push('/');
                return;
            }
            setUser(data.user);
        } catch (error) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchBanners = async () => {
        try {
            console.log('Fetching banners...');
            const res = await fetch('/api/admin/banners');
            console.log('Fetch response:', res.status, res.ok);
            if (res.ok) {
                const data = await res.json();
                console.log('Banners data:', data);
                setBanners(data.banners || []);
            } else {
                const errorData = await res.json();
                console.error('Fetch banners failed:', errorData);
            }
        } catch (error) {
            console.error('Failed to fetch banners:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || formData.images.length === 0) {
            alert('⚠️ Vui lòng nhập tiêu đề và upload ảnh!');
            return;
        }

        const image = formData.images[0]; // Use first image
        const payload = {
            title: formData.title,
            subtitle: formData.subtitle,
            cta_text: formData.cta_text,
            cta_link: formData.cta_link,
            image_url: image.url,
            image_public_id: image.publicId,
            display_order: parseInt(formData.display_order) || 0
        };

        try {
            const url = editingBanner
                ? `/api/banners/${editingBanner.id}`
                : '/api/banners';
            const method = editingBanner ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(editingBanner ? '✅ Cập nhật banner thành công!' : '✅ Tạo banner thành công!');
                resetForm();
                fetchBanners();
            } else {
                const data = await res.json();
                alert(`❌ Lỗi: ${data.error}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('❌ Lỗi khi lưu banner!');
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || '',
            cta_text: banner.cta_text || '',
            cta_link: banner.cta_link || '',
            images: banner.image_url ? [{ url: banner.image_url, publicId: banner.image_public_id }] : [],
            display_order: banner.display_order || 0
        });
        setShowForm(true);
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            const res = await fetch(`/api/banners/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentStatus })
            });

            if (res.ok) {
                alert(currentStatus ? '⏸️ Đã ẩn banner' : '✅ Đã kích hoạt banner');
                fetchBanners();
            }
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('⚠️ Bạn chắc chắn muốn xóa banner này?')) return;

        try {
            const res = await fetch(`/api/banners/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('✅ Đã xóa banner!');
                fetchBanners();
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            subtitle: '',
            cta_text: '',
            cta_link: '',
            images: [],
            display_order: 0
        });
        setEditingBanner(null);
        setShowForm(false);
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
                    {/* Header */}
                    <div className={styles.header}>
                        <h1 className={styles.title}>🎨 Quản Lý Banner Trang Chủ</h1>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? '❌ Đóng' : '➕ Thêm Banner Mới'}
                        </button>
                    </div>

                    {/* Form */}
                    {showForm && (
                        <div className="card p-lg mb-xl">
                            <h3>{editingBanner ? '✏️ Chỉnh Sửa Banner' : '➕ Tạo Banner Mới'}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Tiêu Đề *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="vd: Nấu Ăn Ngon Mỗi Ngày"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Mô Tả Ngắn</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        placeholder="vd: Khám phá hàng nghìn công thức..."
                                        rows="2"
                                    />
                                </div>

                                <div className="grid grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Text Nút CTA</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.cta_text}
                                            onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                                            placeholder="vd: Khám Phá Ngay"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Link CTA</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.cta_link}
                                            onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                                            placeholder="vd: /search"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Thứ Tự Hiển Thị</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                        min="0"
                                    />
                                    <small className="text-muted">Số nhỏ hiển thị trước</small>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Ảnh Banner * (1920x600px recommended)</label>
                                    <ImageUpload
                                        images={formData.images}
                                        onChange={(images) => setFormData({ ...formData, images })}
                                        maxFiles={1}
                                        maxSize={10485760}
                                    />
                                    <small className="text-muted">Tối đa 10MB</small>
                                </div>

                                <div className="flex gap-md">
                                    <button type="submit" className="btn btn-primary">
                                        {editingBanner ? '💾 Cập Nhật' : '✅ Tạo Banner'}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                        ❌ Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Banners List */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>📋 Danh Sách Banner ({banners.length})</h2>

                        {banners.length === 0 ? (
                            <div className="text-center py-2xl text-muted">
                                Chưa có banner nào. Tạo banner đầu tiên! 🎨
                            </div>
                        ) : (
                            <div className="grid gap-lg">
                                {banners.map(banner => (
                                    <div key={banner.id} className="card">
                                        <div style={{
                                            backgroundImage: `url(${banner.image_url})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            height: '200px',
                                            position: 'relative',
                                            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: 'var(--space-md)',
                                                right: 'var(--space-md)',
                                                display: 'flex',
                                                gap: 'var(--space-sm)'
                                            }}>
                                                {banner.is_active && (
                                                    <span className="badge badge-success">✅ Active</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-lg">
                                            <h3 style={{ marginBottom: 'var(--space-sm)' }}>{banner.title}</h3>
                                            {banner.subtitle && (
                                                <p className="text-muted text-sm">{banner.subtitle}</p>
                                            )}

                                            {banner.cta_text && (
                                                <div style={{ marginTop: 'var(--space-md)' }}>
                                                    <strong>CTA:</strong> {banner.cta_text} → {banner.cta_link}
                                                </div>
                                            )}

                                            <div style={{
                                                marginTop: 'var(--space-lg)',
                                                display: 'flex',
                                                gap: 'var(--space-sm)',
                                                flexWrap: 'wrap'
                                            }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleEdit(banner)}
                                                >
                                                    ✏️ Sửa
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleToggleActive(banner.id, banner.is_active)}
                                                >
                                                    {banner.is_active ? '⏸️ Ẩn' : '▶️ Hiện'}
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--color-error)' }}
                                                    onClick={() => handleDelete(banner.id)}
                                                >
                                                    🗑️ Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
