import { useState, useCallback } from "react";

/**
 * usePagination — Reusable pagination hook
 *
 * Replaces the 7 duplicated (page, setPage, paginated slice) patterns
 * across OrdersPage.jsx and InventoryPage.jsx.
 *
 * @param {Array} items - The full filtered array to paginate
 * @param {number} rowsPerPage - Number of items per page
 * @param {any} [resetTrigger] - When this value changes, page resets to 1
 * @returns {{ page, setPage, goToPage, paginated, totalPages }}
 */
export function usePagination(items, rowsPerPage, resetTrigger) {
    const [page, setPage] = useState(1);
    const [prevResetTrigger, setPrevResetTrigger] = useState(resetTrigger);

    let currentPage = page;

    // Reset to page 1 during render whenever the filter set or tab changes
    if (resetTrigger !== prevResetTrigger) {
        setPrevResetTrigger(resetTrigger);
        setPage(1);
        currentPage = 1;
    }

    const totalPages = Math.max(1, Math.ceil(items.length / rowsPerPage));

    // Clamp page during render if filtered results shrink
    if (currentPage > totalPages) {
        setPage(totalPages);
        currentPage = totalPages;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const paginated = items.slice(start, start + rowsPerPage);

    const goToPage = useCallback((n) => {
        setPage(Math.max(1, Math.min(n, totalPages)));
    }, [totalPages]);

    return { page: currentPage, setPage, goToPage, paginated, totalPages };
}
