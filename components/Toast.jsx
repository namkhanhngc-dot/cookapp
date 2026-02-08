'use client';

import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

let toastTimeout;
let setToastGlobal;

export function showToast(message, type = 'success', duration = 3000) {
    if (setToastGlobal) {
        setToastGlobal({ message, type, visible: true });

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            setToastGlobal(prev => ({ ...prev, visible: false }));
        }, duration);
    }
}

export default function Toast() {
    const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

    useEffect(() => {
        setToastGlobal = setToast;
        return () => {
            setToastGlobal = null;
            clearTimeout(toastTimeout);
        };
    }, []);

    if (!toast.visible) return null;

    return (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
            <span>{toast.message}</span>
        </div>
    );
}
