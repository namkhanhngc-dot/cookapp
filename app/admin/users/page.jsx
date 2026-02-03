'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from '../admin.module.css';

export default function UserManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        checkAdmin();
        fetchUsers();
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

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!confirm(`Bạn có chắc muốn đổi role thành ${newRole}?`)) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                alert('✅ Role đã được cập nhật!');
                fetchUsers();
            } else {
                alert('❌ Lỗi cập nhật role!');
            }
        } catch (error) {
            console.error('Role change error:', error);
            alert('❌ Lỗi kết nối!');
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <h1 className={styles.title}>👥 User Management</h1>
                        <p className={styles.subtitle}>Quản lý người dùng hệ thống</p>
                    </div>

                    {/* Search */}
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="🔍 Tìm kiếm user (username hoặc email)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    {/* Users Table */}
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Display Name</th>
                                    <th>Role</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td><strong>{user.username}</strong></td>
                                        <td>{user.email}</td>
                                        <td>{user.display_name || '-'}</td>
                                        <td>
                                            <span className={`${styles.badge} ${styles[user.role]}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className={styles.roleSelect}
                                            >
                                                <option value="user">User</option>
                                                <option value="moderator">Moderator</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-2xl">
                            <p className="text-muted">Không tìm thấy user nào</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
