import { useState, useCallback } from "react";
import { useEffect } from "react";

/**
 * usePagination — Reusable pagination hook
 *
 * Replaces the 7 duplicated (page, setPage, paginated slice) patterns
 * across OrdersPage.jsx and InventoryPage.jsx.
 *
 * @param {Array} items - The full filtered array to paginate
 * @param {number} rowsPerPage - Number of items per page
 * @param {any} [resetTrigger] - When this value changes, page resets to 1
 * @returns {{ page, setPage, paginated, totalPages }}
 */
export function usePagination(items, rowsPerPage, resetTrigger) {
    const [page, setPage] = useState(1);

    // Reset to page 1 whenever the filter set or tab changes
    useEffect(() => {
        setPage(1);
    }, [resetTrigger]);

    const totalPages = Math.max(1, Math.ceil(items.length / rowsPerPage));

    // Clamp page if filtered results shrink
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages, page]);

    const start = (page - 1) * rowsPerPage;
    const paginated = items.slice(start, start + rowsPerPage);

    const goToPage = useCallback((n) => {
        setPage(Math.max(1, Math.min(n, totalPages)));
    }, [totalPages]);

    return { page, setPage, goToPage, paginated, totalPages };
}
