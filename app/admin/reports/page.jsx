'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from '../admin.module.css';

export default function ReportsManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        checkAdmin();
        fetchReports();
    }, [filter]);

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

    const fetchReports = async () => {
        try {
            const url = `/api/admin/reports?status=${filter}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setReports(data.reports);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            const res = await fetch(`/api/admin/reports/${reportId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                alert('✅ Đã cập nhật!');
                fetchReports();
            } else {
                alert('❌ Lỗi!');
            }
        } catch (error) {
            console.error('Update error:', error);
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
                        <h1 className={styles.title}>🚨 Reports Management</h1>
                        <p className={styles.subtitle}>Xử lý báo cáo vi phạm</p>
                    </div>

                    {/* Filters */}
                    <div className={styles.filterBar}>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('reviewed')}
                            className={`btn ${filter === 'reviewed' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Reviewed
                        </button>
                        <button
                            onClick={() => setFilter('resolved')}
                            className={`btn ${filter === 'resolved' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Resolved
                        </button>
                        <button
                            onClick={() => setFilter('dismissed')}
                            className={`btn ${filter === 'dismissed' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Dismissed
                        </button>
                    </div>

                    {/* Reports List */}
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Reporter</th>
                                    <th>Reason</th>
                                    <th>Recipe</th>
                                    <th>Created</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(report => (
                                    <tr key={report.id}>
                                        <td>{report.id}</td>
                                        <td>{report.reporter_username}</td>
                                        <td><strong>{report.reason}</strong><br /><small>{report.description}</small></td>
                                        <td>
                                            {report.recipe_id ? (
                                                <Link href={`/recipes/${report.recipe_id}`}>
                                                    {report.recipe_title}
                                                </Link>
                                            ) : '-'}
                                        </td>
                                        <td>{new Date(report.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span className={`${styles.badge} ${styles[report.status]}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                value={report.status}
                                                onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                                className={styles.roleSelect}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="reviewed">Reviewed</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="dismissed">Dismissed</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {reports.length === 0 && (
                        <div className="text-center py-2xl">
                            <p className="text-muted">Không có báo cáo nào</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
