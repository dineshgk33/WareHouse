import React, { useState, useMemo } from "react";
import { 
  Tag, Plus, Trash2, Edit2, Info, AlertCircle, Percent, DollarSign, Calendar
} from "lucide-react";
import PageHeader from "../../../components/CatalogCommon/PageHeader";
import DataTable from "../../../components/CatalogCommon/DataTable";
import SearchFilterBar from "../../../components/CatalogCommon/SearchFilterBar";
import StatusBadge from "../../../components/CatalogCommon/StatusBadge";
import EmptyState from "../../../components/CatalogCommon/EmptyState";
import CatalogModal from "../../../components/CatalogCommon/CatalogModal";
import { MOCK_PRICING, MOCK_PRODUCTS } from "../../../data/catalogData";
import "./Pricing.css";

export default function PricingPage() {
  const [rules, setRules] = useState(MOCK_PRICING);
  const [search, setSearch] = useState("");
  const [validityFilter, setValidityFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    productId: "",
    mrp: "",
    sellingPrice: "",
    darkhousePrice: "",
    validityType: "Permanent",
    validityStart: "",
    validityEnd: ""
  });
  
  const [formErrors, setFormErrors] = useState({});

  // Reset form helper
  const resetForm = () => {
    setFormData({
      productId: "",
      mrp: "",
      sellingPrice: "",
      darkhousePrice: "",
      validityType: "Permanent",
      validityStart: "",
      validityEnd: ""
    });
    setFormErrors({});
    setEditingRule(null);
  };

  // Open modal for adding
  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (rule) => {
    setEditingRule(rule);
    
    const isPromo = rule.validity !== "Permanent";
    let start = "";
    let end = "";
    
    if (isPromo && rule.validity.includes(" to ")) {
      const parts = rule.validity.split(" to ");
      start = parts[0];
      end = parts[1];
    }
    
    setFormData({
      productId: rule.productId,
      mrp: rule.mrp.toString(),
      sellingPrice: rule.sellingPrice.toString(),
      darkhousePrice: rule.darkhousePrice.toString(),
      validityType: isPromo ? "Promo" : "Permanent",
      validityStart: start,
      validityEnd: end
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Delete handler
  const handleDeleteRule = (id) => {
    if (window.confirm("Are you sure you want to delete this pricing rule?")) {
      setRules(prev => prev.filter(r => r.id !== id));
    }
  };

  // Handle product selection to auto-fill MRP
  const handleProductChange = (e) => {
    const prodId = e.target.value;
    const product = MOCK_PRODUCTS.find(p => p.id === prodId);
    
    setFormData(prev => ({
      ...prev,
      productId: prodId,
      mrp: product ? product.mrp.toString() : "",
      sellingPrice: product ? product.sellingPrice.toString() : "",
      darkhousePrice: product ? (product.sellingPrice * 0.9).toFixed(0) : ""
    }));
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.productId) errors.productId = "Please select a product";
    
    const mrpNum = parseFloat(formData.mrp);
    const sellNum = parseFloat(formData.sellingPrice);
    const dhNum = parseFloat(formData.darkhousePrice);

    if (isNaN(mrpNum) || mrpNum <= 0) {
      errors.mrp = "MRP must be a positive number";
    }
    
    if (isNaN(sellNum) || sellNum <= 0) {
      errors.sellingPrice = "Selling price must be a positive number";
    } else if (sellNum > mrpNum) {
      errors.sellingPrice = "Selling price cannot exceed MRP";
    }

    if (isNaN(dhNum) || dhNum <= 0) {
      errors.darkhousePrice = "Darkhouse price must be a positive number";
    } else if (dhNum > sellNum) {
      errors.darkhousePrice = "Darkhouse price cannot exceed selling price";
    }

    if (formData.validityType === "Promo") {
      if (!formData.validityStart) errors.validityStart = "Start date required";
      if (!formData.validityEnd) errors.validityEnd = "End date required";
      if (formData.validityStart && formData.validityEnd) {
        if (new Date(formData.validityStart) > new Date(formData.validityEnd)) {
          errors.validityEnd = "End date must be after start date";
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submission
  const handleSaveRule = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const product = MOCK_PRODUCTS.find(p => p.id === formData.productId);
    const mrpNum = parseFloat(formData.mrp);
    const sellNum = parseFloat(formData.sellingPrice);
    const dhNum = parseFloat(formData.darkhousePrice);
    
    const validityStr = formData.validityType === "Permanent" 
      ? "Permanent" 
      : `${formData.validityStart} to ${formData.validityEnd}`;

    if (editingRule) {
      // Edit
      setRules(prev => prev.map(r => r.id === editingRule.id ? {
        ...r,
        productId: formData.productId,
        productName: product ? product.name : editingRule.productName,
        mrp: mrpNum,
        sellingPrice: sellNum,
        darkhousePrice: dhNum,
        discount: mrpNum - sellNum,
        validity: validityStr
      } : r));
    } else {
      // Create new
      const newRule = {
        id: `PRC-${Date.now().toString().slice(-3)}`,
        productId: formData.productId,
        productName: product ? product.name : "Unknown Product",
        mrp: mrpNum,
        sellingPrice: sellNum,
        darkhousePrice: dhNum,
        discount: mrpNum - sellNum,
        validity: validityStr
      };
      setRules(prev => [newRule, ...prev]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Filters & Search
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = rule.productName.toLowerCase().includes(search.toLowerCase()) || 
                            rule.productId.toLowerCase().includes(search.toLowerCase());
      
      const isPermanent = rule.validity === "Permanent";
      const matchesValidity = validityFilter === "All" ||
        (validityFilter === "Permanent" && isPermanent) ||
        (validityFilter === "Promo" && !isPermanent);
      
      return matchesSearch && matchesValidity;
    });
  }, [rules, search, validityFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalCount = rules.length;
    const promoCount = rules.filter(r => r.validity !== "Permanent").length;
    
    let totalDiscount = 0;
    let marginViolations = 0; // Margin below 5% of selling price
    
    rules.forEach(r => {
      totalDiscount += r.discount;
      const margin = ((r.sellingPrice - r.darkhousePrice) / r.sellingPrice) * 100;
      if (margin < 5) marginViolations++;
    });

    const avgDiscount = totalCount > 0 ? (totalDiscount / totalCount).toFixed(1) : "0";

    return { totalCount, promoCount, avgDiscount, marginViolations };
  }, [rules]);

  // Columns definition for DataTable
  const columns = [
    {
      header: "Product Info",
      render: (row) => (
        <div className="prc-product-cell">
          <div className="prc-prod-icon">🏷️</div>
          <div>
            <div className="prc-prod-name">{row.productName}</div>
            <div className="prc-prod-sub">ID: {row.productId}</div>
          </div>
        </div>
      )
    },
    {
      header: "MRP (Max)",
      render: (row) => <span className="prc-price-mrp">₹{row.mrp}</span>
    },
    {
      header: "Selling Price",
      render: (row) => (
        <span className="prc-price-sell">
          ₹{row.sellingPrice}
        </span>
      )
    },
    {
      header: "Darkhouse Price",
      render: (row) => (
        <span className="prc-price-dh">
          ₹{row.darkhousePrice}
        </span>
      )
    },
    {
      header: "Discount Value",
      render: (row) => {
        const pct = ((row.discount / row.mrp) * 100).toFixed(0);
        return (
          <div>
            <div className="prc-discount-val">₹{row.discount}</div>
            <div className="prc-discount-pct">{pct}% Off</div>
          </div>
        );
      }
    },
    {
      header: "Validity Status",
      render: (row) => {
        const isPermanent = row.validity === "Permanent";
        return (
          <span className={`prc-validity-badge ${isPermanent ? "permanent" : "promo"}`}>
            {isPermanent ? "Permanent" : "Promo Period"}
            <span className="prc-validity-tooltip">{row.validity}</span>
          </span>
        );
      }
    }
  ];

  // Actions renderer for DataTable
  const tableActions = (row, closeDropdown) => (
    <>
      <button 
        className="global-dropdown-item"
        onClick={() => {
          handleOpenEditModal(row);
          closeDropdown();
        }}
      >
        <Edit2 size={13} />
        <span>Edit Rule</span>
      </button>
      <div className="global-dropdown-divider"></div>
      <button 
        className="global-dropdown-item global-dropdown-item-danger"
        onClick={() => {
          handleDeleteRule(row.id);
          closeDropdown();
        }}
      >
        <Trash2 size={13} />
        <span>Delete Rule</span>
      </button>
    </>
  );

  return (
    <div className="prc-page fade-in">
      <PageHeader 
        title="Pricing Engine" 
        description="Set, adjust, and deploy catalog-wide base pricing, darkhouse pricing, and promotional discount strategies."
        primaryAction={{
          label: "Add Pricing Rule",
          icon: Plus,
          onClick: handleOpenAddModal
        }}
      />

      {/* Stats Summary Panel */}
      <div className="prc-stats-grid">
        <div className="prc-stat-card">
          <div className="prc-stat-icon-wrap primary">
            <Tag size={20} />
          </div>
          <div>
            <p className="prc-stat-label">Total Rules</p>
            <h3 className="prc-stat-val">{stats.totalCount}</h3>
          </div>
        </div>

        <div className="prc-stat-card">
          <div className="prc-stat-icon-wrap warning">
            <Percent size={20} />
          </div>
          <div>
            <p className="prc-stat-label">Average Discount</p>
            <h3 className="prc-stat-val">₹{stats.avgDiscount}</h3>
          </div>
        </div>

        <div className="prc-stat-card">
          <div className="prc-stat-icon-wrap info">
            <Calendar size={20} />
          </div>
          <div>
            <p className="prc-stat-label">Active Promos</p>
            <h3 className="prc-stat-val">{stats.promoCount}</h3>
          </div>
        </div>

        <div className={`prc-stat-card ${stats.marginViolations > 0 ? "hazard" : ""}`}>
          <div className="prc-stat-icon-wrap danger">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="prc-stat-label">Margin Alert (&lt;5%)</p>
            <h3 className="prc-stat-val">{stats.marginViolations}</h3>
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="prc-card">
        <SearchFilterBar 
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name or ID..."
          filters={[
            {
              value: validityFilter,
              onChange: (e) => setValidityFilter(e.target.value),
              label: "Validity Filter",
              options: [
                { value: "All", label: "All Pricing Validity" },
                { value: "Permanent", label: "Permanent Rules" },
                { value: "Promo", label: "Promo / Promo Ranges" }
              ]
            }
          ]}
        />

        {filteredRules.length === 0 ? (
          <EmptyState 
            icon={Tag}
            message="No pricing rules match your current filter settings."
          />
        ) : (
          <DataTable 
            columns={columns}
            data={filteredRules}
            actions={tableActions}
            rowIdKey="id"
          />
        )}
      </div>

      {/* Add / Edit Pricing Modal */}
      <CatalogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRule ? "Edit Pricing Rule" : "Create Pricing Rule"}
        description={editingRule ? "Update parameters for this product pricing profile." : "Define custom MRP, selling price, and darkhouse transfers for catalog products."}
        icon={Tag}
        footer={
          <>
            <button className="cat-btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="cat-btn-primary" onClick={handleSaveRule}>
              Save Changes
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveRule} className="cat-form-grid">
          <div className="cat-form-group cat-full-width">
            <label htmlFor="productId">Target Catalog Product</label>
            <select 
              id="productId"
              value={formData.productId}
              onChange={handleProductChange}
              disabled={!!editingRule}
              className={formErrors.productId ? "cat-input-error" : ""}
            >
              <option value="">-- Choose Catalog Product --</option>
              {MOCK_PRODUCTS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku})
                </option>
              ))}
            </select>
            {formErrors.productId && <span className="cat-error-text">{formErrors.productId}</span>}
          </div>

          <div className="cat-form-group">
            <label htmlFor="mrp">Maximum Retail Price (MRP)</label>
            <div className="prc-input-addon">
              <span className="addon-symbol">₹</span>
              <input 
                type="number" 
                id="mrp"
                value={formData.mrp}
                onChange={(e) => setFormData({...formData, mrp: e.target.value})}
                className={formErrors.mrp ? "cat-input-error" : ""}
                placeholder="0.00"
              />
            </div>
            {formErrors.mrp && <span className="cat-error-text">{formErrors.mrp}</span>}
          </div>

          <div className="cat-form-group">
            <label htmlFor="sellingPrice">Store Selling Price</label>
            <div className="prc-input-addon">
              <span className="addon-symbol">₹</span>
              <input 
                type="number" 
                id="sellingPrice"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                className={formErrors.sellingPrice ? "cat-input-error" : ""}
                placeholder="0.00"
              />
            </div>
            {formErrors.sellingPrice && <span className="cat-error-text">{formErrors.sellingPrice}</span>}
          </div>

          <div className="cat-form-group">
            <label htmlFor="darkhousePrice">Darkhouse Cost Price</label>
            <div className="prc-input-addon">
              <span className="addon-symbol">₹</span>
              <input 
                type="number" 
                id="darkhousePrice"
                value={formData.darkhousePrice}
                onChange={(e) => setFormData({...formData, darkhousePrice: e.target.value})}
                className={formErrors.darkhousePrice ? "cat-input-error" : ""}
                placeholder="0.00"
              />
            </div>
            {formErrors.darkhousePrice && <span className="cat-error-text">{formErrors.darkhousePrice}</span>}
          </div>

          <div className="cat-form-group">
            <label htmlFor="validityType">Pricing Model Type</label>
            <select 
              id="validityType"
              value={formData.validityType}
              onChange={(e) => setFormData({...formData, validityType: e.target.value})}
            >
              <option value="Permanent">Permanent Pricing</option>
              <option value="Promo">Promo / Limited Validity</option>
            </select>
          </div>

          {formData.validityType === "Promo" && (
            <>
              <div className="cat-form-group">
                <label htmlFor="validityStart">Promo Start Date</label>
                <input 
                  type="date" 
                  id="validityStart"
                  value={formData.validityStart}
                  onChange={(e) => setFormData({...formData, validityStart: e.target.value})}
                  className={formErrors.validityStart ? "cat-input-error" : ""}
                />
                {formErrors.validityStart && <span className="cat-error-text">{formErrors.validityStart}</span>}
              </div>

              <div className="cat-form-group">
                <label htmlFor="validityEnd">Promo End Date</label>
                <input 
                  type="date" 
                  id="validityEnd"
                  value={formData.validityEnd}
                  onChange={(e) => setFormData({...formData, validityEnd: e.target.value})}
                  className={formErrors.validityEnd ? "cat-input-error" : ""}
                />
                {formErrors.validityEnd && <span className="cat-error-text">{formErrors.validityEnd}</span>}
              </div>
            </>
          )}

          {formData.mrp && formData.sellingPrice && (
            <div className="cat-form-group cat-full-width prc-preview-banner">
              <Info size={16} />
              <span>
                Calculated Promo Discount: <strong>₹{(parseFloat(formData.mrp) - parseFloat(formData.sellingPrice)).toFixed(2)}</strong> ({((parseFloat(formData.mrp) - parseFloat(formData.sellingPrice)) / parseFloat(formData.mrp) * 100).toFixed(0)}% Off MRP).
              </span>
            </div>
          )}
        </form>
      </CatalogModal>
    </div>
  );
}
