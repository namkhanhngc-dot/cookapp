'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (error) {
            // User not logged in
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className="container">
                <div className={styles.navContent}>
                    {/* Logo */}
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoEmoji}>🍳</span>
                        <span className={styles.logoText}>Nấu Ăn Ngon</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className={styles.navLinks}>
                        <Link href="/" className={styles.navLink}>
                            🏠 Trang Chủ
                        </Link>
                        <Link href="/search" className={styles.navLink}>
                            🔍 Tìm Kiếm
                        </Link>
                        <Link href="/pantry" className={styles.navLink}>
                            🤖 AI Tìm Công Thức
                        </Link>
                        {user && (
                            <Link href="/recipes/create" className={styles.navLink}>
                                ➕ Tạo Công Thức
                            </Link>
                        )}
                        {user && user.role === 'admin' && (
                            <Link href="/admin" className={styles.navLink} style={{ color: 'var(--color-warning)' }}>
                                ⚙️ Admin
                            </Link>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className={styles.navAuth}>
                        {user ? (
                            <>
                                <Link href={`/users/${user.id}`} className={styles.userButton}>
                                    👤 {user.display_name || user.username}
                                </Link>
                                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                                    👋 Đăng Xuất
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn btn-secondary btn-sm">
                                    🔐 Đăng Nhập
                                </Link>
                                <Link href="/register" className="btn btn-primary btn-sm">
                                    ✨ Đăng Ký
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={styles.menuButton}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu"
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className={styles.mobileMenu}>
                        <Link href="/" className={styles.mobileLink}>
                            🏠 Trang Chủ
                        </Link>
                        <Link href="/search" className={styles.mobileLink}>
                            🔍 Tìm Kiếm
                        </Link>
                        <Link href="/pantry" className={styles.mobileLink}>
                            🤖 AI Tìm Công Thức
                        </Link>
                        {user ? (
                            <>
                                <Link href={`/users/${user.id}`} className={styles.mobileLink}>
                                    👤 Trang Cá Nhân
                                </Link>
                                <Link href="/recipes/create" className={styles.mobileLink}>
                                    ➕ Tạo Công Thức
                                </Link>
                                <button onClick={handleLogout} className={styles.mobileLink}>
                                    👋 Đăng Xuất
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className={styles.mobileLink}>
                                    🔐 Đăng Nhập
                                </Link>
                                <Link href="/register" className={styles.mobileLink}>
                                    ✨ Đăng Ký
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
