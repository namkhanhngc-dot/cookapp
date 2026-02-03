'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import styles from './QuickFilters.module.css';

const FILTERS = [
    { id: 'time-15', label: '⏱ <15 phút', param: 'maxTime', value: '15' },
    { id: 'time-30', label: '⏱ <30 phút', param: 'maxTime', value: '30' },
    { id: 'vegetarian', label: '🥬 Chay', param: 'dietary', value: 'vegetarian' },
    { id: 'easy', label: '⭐ Dễ làm', param: 'difficulty', value: 'easy' },
    { id: 'gluten-free', label: '🚫 Không gluten', param: 'dietary', value: 'gluten-free' }
];

export default function QuickFilters({ onFilterChange }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const isActive = (param, value) => {
        return searchParams.get(param) === value;
    };

    const handleFilterClick = (param, value) => {
        const params = new URLSearchParams(searchParams);

        // Toggle filter
        if (params.get(param) === value) {
            params.delete(param);
        } else {
            params.set(param, value);
        }

        // Update URL or call callback
        if (onFilterChange) {
            onFilterChange(Object.fromEntries(params));
        } else {
            router.push(`/search?${params.toString()}`);
        }
    };

    return (
        <div className={styles.quickFilters}>
            <div className="container">
                <div className={styles.filtersScroll}>
                    {FILTERS.map(filter => (
                        <button
                            key={filter.id}
                            className={`${styles.filterBtn} ${isActive(filter.param, filter.value) ? styles.active : ''
                                }`}
                            onClick={() => handleFilterClick(filter.param, filter.value)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
