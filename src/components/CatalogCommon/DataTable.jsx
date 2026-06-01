import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import "./CatalogCommon.css";

function DataTable({ 
    columns, 
    data, 
    onRowClick, 
    actions, 
    rowIdKey = "id",
    emptyMessage = "No items found matching the search criteria" 
}) {
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    const toggleDropdown = (id, e) => {
        e.stopPropagation();
        setActiveDropdownId(prev => prev === id ? null : id);
    };

    const handleRowClick = (row, e) => {
        // If clicking on actions, don't trigger row click
        if (e.target.closest(".table-actions-cell") || e.target.closest(".global-action-dropdown")) {
            return;
        }
        if (onRowClick) onRowClick(row, e);
    };

    return (
        <div className="cat-table-responsive">
            <table className="cat-table">
                <thead>
                    <tr>
                        {columns.map((col, idx) => (
                            <th 
                                key={idx} 
                                style={col.style || {}}
                                className={col.className || ""}
                            >
                                {col.header}
                            </th>
                        ))}
                        {actions && <th style={{ width: "60px" }}></th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td 
                                colSpan={columns.length + (actions ? 1 : 0)} 
                                className="cat-table-empty"
                            >
                                <div className="empty-message-wrap">
                                    <span>{emptyMessage}</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => {
                            const rowId = row[rowIdKey];
                            return (
                                <tr 
                                    key={rowId}
                                    className={`cat-table-row ${onRowClick ? "clickable" : ""}`}
                                    onClick={(e) => handleRowClick(row, e)}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td 
                                            key={colIdx} 
                                            style={col.style || {}}
                                            className={col.className || ""}
                                        >
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                    
                                    {actions && (
                                        <td className="table-actions-cell" style={{ position: "relative" }}>
                                            <button
                                                className="cat-row-action-btn"
                                                aria-label="Toggle actions"
                                                onClick={(e) => toggleDropdown(rowId, e)}
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {activeDropdownId === rowId && (
                                                <>
                                                    <div 
                                                        className="global-dropdown-overlay" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDropdownId(null);
                                                        }} 
                                                    />
                                                    <div 
                                                        className="global-action-dropdown" 
                                                        style={{ right: "12px", top: "32px" }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {actions(row, () => setActiveDropdownId(null))}
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
