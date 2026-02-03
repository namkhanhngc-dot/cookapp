'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../login/auth.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        displayName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                setError(data.error || 'Đăng ký thất bại');
            }
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h1>✨ Chào Mừng Bạn!</h1>
                    <p>Tham gia cộng đồng nấu ăn Việt Nam</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className="form-group">
                        <label className="form-label">👤 Tên Đăng Nhập</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            autoFocus
                            placeholder="vd: nguoidaunghiep"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">📧 Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="vd: email@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">💝 Tên Hiển Thị</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            placeholder="vd: Nguyễn Văn A (không bắt buộc)"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">🔐 Mật Khẩu</label>
                        <input
                            type="password"
                            className="form-input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder="Ít nhất 6 ký tự"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? '⏳ Đang tạo tài khoản...' : '🎉 Đăng Ký Ngay'}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    <p>
                        Đã có tài khoản?{' '}
                        <Link href="/login">Đăng nhập 🔐</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
