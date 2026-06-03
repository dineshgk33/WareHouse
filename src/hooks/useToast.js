import { useState, useCallback, useEffect } from "react";

/**
 * useToast — Lightweight global toast notification hook
 *
 * Replaces the duplicated `toastMessage` useState + setTimeout pattern
 * used in OrdersPage.jsx. Promotes a consistent toast UX across all pages.
 *
 * Usage:
 *   const { toast, showToast } = useToast();
 *   // In JSX: {toast && <div role="alert" aria-live="polite" className="orders-toast">{toast}</div>}
 *   // To trigger: showToast("Order cancelled successfully");
 *
 * @param {number} [duration=3000] - Auto-dismiss delay in milliseconds
 */
export function useToast(duration = 3000) {
    const [toast, setToast] = useState("");

    // Auto-dismiss
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(""), duration);
        return () => clearTimeout(timer);
    }, [toast, duration]);

    const showToast = useCallback((message) => {
        setToast(message);
    }, []);

    const hideToast = useCallback(() => {
        setToast("");
    }, []);

    return { toast, showToast, hideToast };
}
