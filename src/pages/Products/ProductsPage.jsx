import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Grid,
  List,
  ChevronDown,
  MoreVertical,
  AlertTriangle,
  Package,
  Trash2,
} from "lucide-react";
import "./Products.css";

/* ─── Mock Data ────────────────────────────────────────────────────────────── */
const MOCK_PRODUCTS = [
  {
    id: "PRD-001",
    sku: "PHN-SAM-S24",
    name: "Samsung Galaxy S24 Ultra",
    category: "Electronics",
    price: 1199.99,
    stock: 47,
    status: "Active",
    thumbColor: "#dbeafe",
    thumbIcon: "📱",
  },
  {
    id: "PRD-002",
    sku: "LAP-APP-M3P",
    name: 'MacBook Pro 14" M3',
    category: "Electronics",
    price: 1999.0,
    stock: 12,
    status: "Active",
    thumbColor: "#e0e7ff",
    thumbIcon: "💻",
  },
  {
    id: "PRD-003",
    sku: "TSH-UNI-WHT",
    name: "Classic Comfort T-Shirt",
    category: "Fashion",
    price: 24.99,
    stock: 134,
    status: "Active",
    thumbColor: "#fce7f3",
    thumbIcon: "👕",
  },
  {
    id: "PRD-004",
    sku: "AUD-SNY-WH1",
    name: "Sony WH-1000XM5 Headphones",
    category: "Electronics",
    price: 349.95,
    stock: 8,
    status: "Active",
    thumbColor: "#fef9c3",
    thumbIcon: "🎧",
  },
  {
    id: "PRD-005",
    sku: "WCH-CSS-CHR",
    name: "Casio G-Shock Classic Watch",
    category: "Fashion",
    price: 89.99,
    stock: 3,
    status: "Active",
    thumbColor: "#fce7f3",
    thumbIcon: "⌚",
  },
  {
    id: "PRD-006",
    sku: "KBD-LGT-MX3",
    name: "Logitech MX Keys Keyboard",
    category: "Electronics",
    price: 109.99,
    stock: 0,
    status: "Out of Stock",
    thumbColor: "#d1fae5",
    thumbIcon: "⌨️",
  },
  {
    id: "PRD-007",
    sku: "SHO-NIK-AIR",
    name: "Nike Air Zoom Running Shoes",
    category: "Sports",
    price: 129.99,
    stock: 56,
    status: "Active",
    thumbColor: "#ffedd5",
    thumbIcon: "👟",
  },
  {
    id: "PRD-008",
    sku: "KIT-DLG-CFM",
    name: "DeLonghi Espresso Maker",
    category: "Home",
    price: 279.0,
    stock: 17,
    status: "Draft",
    thumbColor: "#fef3c7",
    thumbIcon: "☕",
  },
];

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Groceries", "Sports"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price Low–High" },
  { value: "price-desc", label: "Price High–Low" },
  { value: "stock", label: "Stock" },
];
const ROWS_PER_PAGE = 6;

/* ─── Status Badge ─────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    Active: "badge-active",
    Draft: "badge-draft",
    "Out of Stock": "badge-oos",
  };
  return <span className={`products-status-badge ${map[status] ?? ""}`}>{status}</span>;
}

/* ─── Stock Cell ────────────────────────────────────────────────────────────── */
function StockCell({ stock }) {
  const isLow = stock > 0 && stock < 20;
  const isOut = stock === 0;
  return (
    <span className={`stock-cell ${isLow ? "stock-low" : ""} ${isOut ? "stock-out" : ""}`}>
      {isLow && <AlertTriangle size={13} className="stock-warning-icon" />}
      {stock}
    </span>
  );
}

/* ─── Product Thumbnail ─────────────────────────────────────────────────────── */
function ProductThumb({ color, icon }) {
  return (
    <span className="product-thumb" style={{ "--thumb-bg": color }}>
      {icon}
    </span>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */
export default function ProductsPage() {
  const [productsList, setProductsList] = useState(MOCK_PRODUCTS);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
  const [page, setPage] = useState(1);

  const toggleDropdown = (id) => {
    setActiveDropdownId((prev) => (prev === id ? null : id));
  };

  const handleRemoveProduct = (id) => {
    setProductsList((prev) => prev.filter((p) => p.id !== id));
    setActiveDropdownId(null);
  };

  const handleToggleProductStatus = (id) => {
    setProductsList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus =
            p.status === "Active"
              ? "Draft"
              : p.status === "Draft"
              ? "Out of Stock"
              : "Active";
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
    setActiveDropdownId(null);
  };

  /* ─── Filtering + Sorting ──────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let result = [...productsList];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "stock") result.sort((a, b) => a.stock - b.stock);
    // "newest" → keep original insertion order

    return result;
  }, [search, category, sortBy]);

  /* ─── Pagination ───────────────────────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  /* ─── Render ────────────────────────────────────────────────────────── */
  return (
    <div className="products-page fade-in">
      {/* ── Page Header ── */}
      <div className="products-header">
        <div className="products-header-left">
          <h1 className="products-title">Products</h1>
          <p className="products-subtitle">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} in catalog
          </p>
        </div>
        <button className="btn-add-product">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="products-toolbar">
        <div className="toolbar-left">
          {/* Search */}
          <div className="search-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search products, SKU…"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Category filter */}
          <div className="select-wrapper">
            <select
              className="toolbar-select"
              value={category}
              onChange={handleCategoryChange}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="select-arrow" />
          </div>

          {/* Sort by */}
          <div className="select-wrapper">
            <select className="toolbar-select" value={sortBy} onChange={handleSortChange}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="select-arrow" />
          </div>
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === "list" ? "view-btn-active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <List size={16} />
          </button>
          <button
            className={`view-btn ${viewMode === "grid" ? "view-btn-active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {viewMode === "list" ? (
        <div className="products-card">
          {filtered.length === 0 ? (
            <div className="products-empty">
              <Package size={48} className="empty-icon" />
              <p className="empty-title">No products found</p>
              <p className="empty-sub">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((product) => (
                    <tr key={product.id}>
                      {/* Product cell */}
                      <td>
                        <div className="product-cell">
                          <ProductThumb color={product.thumbColor} icon={product.thumbIcon} />
                          <div className="product-cell-info">
                            <span className="product-cell-name">{product.name}</span>
                            <span className="product-cell-sku">{product.sku}</span>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td>
                        <span className="category-tag">{product.category}</span>
                      </td>
                      {/* Price */}
                      <td>
                        <span className="price-cell">
                          ₹{product.price.toFixed(2)}
                        </span>
                      </td>
                      {/* Stock */}
                      <td>
                        <StockCell stock={product.stock} />
                      </td>
                      {/* Status */}
                      <td>
                        <StatusBadge status={product.status} />
                      </td>
                      {/* Actions */}
                      <td style={{ position: "relative" }}>
                        <button 
                          className="product-action-btn" 
                          aria-label="More options"
                          onClick={() => toggleDropdown(product.id)}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeDropdownId === product.id && (
                          <>
                            <div className="global-dropdown-overlay" onClick={() => setActiveDropdownId(null)} />
                            <div className="global-action-dropdown">
                              <button 
                                className="global-dropdown-item"
                                onClick={() => handleToggleProductStatus(product.id)}
                              >
                                <ChevronDown size={13} />
                                <span>Cycle Status</span>
                              </button>
                              <div className="global-dropdown-divider"></div>
                              <button 
                                className="global-dropdown-item global-dropdown-item-danger"
                                onClick={() => handleRemoveProduct(product.id)}
                              >
                                <Trash2 size={13} />
                                <span>Delete Product</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ── Grid View ── */
        <div className={`products-grid ${filtered.length === 0 ? "products-grid-empty" : ""}`}>
          {filtered.length === 0 ? (
            <div className="products-empty">
              <Package size={48} className="empty-icon" />
              <p className="empty-title">No products found</p>
              <p className="empty-sub">Try adjusting your search or filters.</p>
            </div>
          ) : (
            paginated.map((product) => (
              <div className="product-grid-card" key={product.id}>
                <div className="pgc-header" style={{ position: "relative" }}>
                  <ProductThumb color={product.thumbColor} icon={product.thumbIcon} />
                  <button 
                    className="product-action-btn" 
                    aria-label="More options"
                    onClick={() => toggleDropdown(product.id)}
                  >
                    <MoreVertical size={15} />
                  </button>

                  {activeDropdownId === product.id && (
                    <>
                      <div className="global-dropdown-overlay" onClick={() => setActiveDropdownId(null)} />
                      <div className="global-action-dropdown" style={{ right: "8px", top: "36px" }}>
                        <button 
                          className="global-dropdown-item"
                          onClick={() => handleToggleProductStatus(product.id)}
                        >
                          <ChevronDown size={13} />
                          <span>Cycle Status</span>
                        </button>
                        <div className="global-dropdown-divider"></div>
                        <button 
                          className="global-dropdown-item global-dropdown-item-danger"
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          <Trash2 size={13} />
                          <span>Delete Product</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <p className="pgc-name">{product.name}</p>
                <p className="pgc-sku">{product.sku}</p>
                <div className="pgc-row">
                  <span className="pgc-price">₹{product.price.toFixed(2)}</span>
                  <StatusBadge status={product.status} />
                </div>
                <div className="pgc-row pgc-footer">
                  <span className="category-tag">{product.category}</span>
                  <StockCell stock={product.stock} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Pagination ── */}
      {filtered.length > ROWS_PER_PAGE && (
        <div className="products-pagination">
          <span className="pagination-info">
            Showing {(safePage - 1) * ROWS_PER_PAGE + 1}–
            {Math.min(safePage * ROWS_PER_PAGE, filtered.length)} of {filtered.length} products
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={safePage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                className={`page-btn ${pg === safePage ? "page-btn-active" : ""}`}
                onClick={() => setPage(pg)}
              >
                {pg}
              </button>
            ))}
            <button
              className="page-btn"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
