import React, { useState, useMemo } from "react";
import { 
  Grid, List, Plus, Search, Eye, Trash2, Edit2, Copy, Check, Info, Image as ImageIcon, ExternalLink
} from "lucide-react";
import PageHeader from "../../../components/CatalogCommon/PageHeader";
import DataTable from "../../../components/CatalogCommon/DataTable";
import SearchFilterBar from "../../../components/CatalogCommon/SearchFilterBar";
import StatusBadge from "../../../components/CatalogCommon/StatusBadge";
import EmptyState from "../../../components/CatalogCommon/EmptyState";
import CatalogModal from "../../../components/CatalogCommon/CatalogModal";
import { MOCK_MEDIA, MOCK_PRODUCTS } from "../../../data/catalogData";
import "./MediaLibrary.css";

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState(MOCK_MEDIA);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  
  // Modals state
  const [zoomMedia, setZoomMedia] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  
  // Feedback copy indicator
  const [copiedId, setCopiedId] = useState(null);

  // Form states
  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: "Front",
    product: "",
    url: "📦",
    size: "120 KB"
  });

  const [editForm, setEditForm] = useState({
    name: "",
    type: "Front",
    product: ""
  });

  const [errors, setErrors] = useState({});

  const handleCopyAsset = (media) => {
    navigator.clipboard.writeText(media.url);
    setCopiedId(media.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleOpenUpload = () => {
    setUploadForm({
      name: "",
      type: "Front",
      product: "",
      url: ["🥭", "🥛", "🍿", "🥤", "🍟", "🧴", "🍎", "🧀"][Math.floor(Math.random() * 8)],
      size: `${Math.floor(Math.random() * 200) + 50} KB`
    });
    setErrors({});
    setIsUploadOpen(true);
  };

  const handleOpenEdit = (media) => {
    setEditingMedia(media);
    setEditForm({
      name: media.name,
      type: media.type,
      product: media.product
    });
    setErrors({});
    setIsEditOpen(true);
  };

  const handleDeleteMedia = (id) => {
    if (window.confirm("Are you sure you want to delete this media asset?")) {
      setMediaList(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.name.trim()) {
      setErrors({ name: "Asset file name is required" });
      return;
    }

    const newMedia = {
      id: `MED-${Date.now().toString().slice(-3)}`,
      name: uploadForm.name.endsWith(".png") || uploadForm.name.endsWith(".jpg") 
        ? uploadForm.name 
        : `${uploadForm.name}.png`,
      type: uploadForm.type,
      product: uploadForm.product || "Unassociated Asset",
      url: uploadForm.url,
      size: uploadForm.size
    };

    setMediaList(prev => [newMedia, ...prev]);
    setIsUploadOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setErrors({ name: "Asset name is required" });
      return;
    }

    setMediaList(prev => prev.map(m => m.id === editingMedia.id ? {
      ...m,
      name: editForm.name,
      type: editForm.type,
      product: editForm.product || "Unassociated Asset"
    } : m));

    setIsEditOpen(false);
  };

  // Filter Logic
  const filteredMedia = useMemo(() => {
    return mediaList.filter(media => {
      const matchesSearch = media.name.toLowerCase().includes(search.toLowerCase()) ||
                            media.product.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || media.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [mediaList, search, typeFilter]);

  // Table Columns Definition
  const columns = [
    {
      header: "Asset Preview",
      render: (row) => (
        <div className="med-table-preview-cell" onClick={() => setZoomMedia(row)}>
          <span className="med-emoji-avatar">{row.url}</span>
          <span className="med-zoom-hover"><Eye size={12} /></span>
        </div>
      )
    },
    {
      header: "File Metadata",
      render: (row) => (
        <div>
          <div className="med-file-name-txt">{row.name}</div>
          <div className="med-file-size-txt">{row.size}</div>
        </div>
      )
    },
    {
      header: "Asset Category",
      render: (row) => (
        <span className={`med-type-pill ${row.type.toLowerCase()}`}>
          {row.type}
        </span>
      )
    },
    {
      header: "Linked Catalog Product",
      render: (row) => (
        <div className="med-product-link">
          <ImageIcon size={14} className="med-prod-icon" />
          <span>{row.product}</span>
        </div>
      )
    }
  ];

  const tableActions = (row, closeDropdown) => (
    <>
      <button 
        className="global-dropdown-item"
        onClick={() => {
          setZoomMedia(row);
          closeDropdown();
        }}
      >
        <Eye size={13} />
        <span>Lightbox Zoom</span>
      </button>
      <button 
        className="global-dropdown-item"
        onClick={() => {
          handleCopyAsset(row);
          closeDropdown();
        }}
      >
        {copiedId === row.id ? <Check size={13} className="success-color" /> : <Copy size={13} />}
        <span>{copiedId === row.id ? "Copied Icon!" : "Copy Asset Glyph"}</span>
      </button>
      <button 
        className="global-dropdown-item"
        onClick={() => {
          handleOpenEdit(row);
          closeDropdown();
        }}
      >
        <Edit2 size={13} />
        <span>Edit Metadata</span>
      </button>
      <div className="global-dropdown-divider"></div>
      <button 
        className="global-dropdown-item global-dropdown-item-danger"
        onClick={() => {
          handleDeleteMedia(row.id);
          closeDropdown();
        }}
      >
        <Trash2 size={13} />
        <span>Delete Asset</span>
      </button>
    </>
  );

  return (
    <div className="med-page fade-in">
      <PageHeader 
        title="Asset Media Library"
        description="Consolidate product image assets, sizing charts, packaging designs, and unified iconography matrices for the quick-commerce storefront."
        primaryAction={{
          label: "Upload Asset",
          icon: Plus,
          onClick: handleOpenUpload
        }}
      />

      {/* Control Bar with Search, Type Filter and View Toggler */}
      <div className="med-controls-card">
        <div className="med-controls-left">
          <div className="med-search-wrap">
            <Search size={15} className="med-search-icon" />
            <input 
              type="text" 
              placeholder="Search assets by file name or product association..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="med-search-input"
            />
          </div>

          <div className="med-select-wrap">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All">All Media Placement Categories</option>
              <option value="Front">Front Pack Shots</option>
              <option value="Side">Side Sizing / Nutritional Panels</option>
              <option value="Gallery">Lifestyle / Marketing Gallery</option>
            </select>
          </div>
        </div>

        <div className="med-view-toggle">
          <button 
            className={`med-view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-label="Switch to grid view"
          >
            <Grid size={16} />
          </button>
          <button 
            className={`med-view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-label="Switch to list view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Render Workspace Content */}
      {filteredMedia.length === 0 ? (
        <div className="med-card-empty-wrapper">
          <EmptyState 
            icon={ImageIcon}
            message="No active media assets matches your library search parameters."
          />
        </div>
      ) : viewMode === "grid" ? (
        /* Immersive Grid View Mode */
        <div className="med-assets-grid">
          {filteredMedia.map(media => (
            <div className="med-asset-card" key={media.id}>
              
              {/* Asset Render Window */}
              <div className="med-card-render-frame">
                <span className="med-card-emoji-visual">{media.url}</span>
                
                {/* Float Actions */}
                <div className="med-card-hover-actions">
                  <button className="med-float-act-btn" title="Lightbox zoom preview" onClick={() => setZoomMedia(media)}>
                    <Eye size={13} />
                  </button>
                  <button className="med-float-act-btn" title="Copy Emoji Glyph" onClick={() => handleCopyAsset(media)}>
                    {copiedId === media.id ? <Check size={13} className="success-color" /> : <Copy size={13} />}
                  </button>
                  <button className="med-float-act-btn" title="Edit Metadata" onClick={() => handleOpenEdit(media)}>
                    <Edit2 size={13} />
                  </button>
                  <button className="med-float-act-btn delete" title="Delete Asset" onClick={() => handleDeleteMedia(media.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
                
                <span className={`med-card-badge ${media.type.toLowerCase()}`}>
                  {media.type}
                </span>
              </div>

              {/* Asset Descriptor Footer */}
              <div className="med-card-details">
                <p className="med-card-title-text" title={media.name}>{media.name}</p>
                <div className="med-card-metadata-row">
                  <span className="size">{media.size}</span>
                  <span className="prod-assoc" title={media.product}>关联: {media.product}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Standard List View Mode */
        <div className="med-table-card">
          <DataTable 
            columns={columns}
            data={filteredMedia}
            actions={tableActions}
            rowIdKey="id"
          />
        </div>
      )}

      {/* Zoom / Lightbox Preview Modal */}
      <CatalogModal
        isOpen={!!zoomMedia}
        onClose={() => setZoomMedia(null)}
        title="Asset Lightbox Inspector"
        description="Verify high-definition sizing, transparency thresholds, and channel parameters."
        icon={ImageIcon}
        footer={
          <>
            <button className="cat-btn-secondary" onClick={() => setZoomMedia(null)}>
              Dismiss Preview
            </button>
            <button className="cat-btn-primary" onClick={() => {
              if(zoomMedia) handleCopyAsset(zoomMedia);
            }}>
              Copy Glyph Icon
            </button>
          </>
        }
      >
        {zoomMedia && (
          <div className="med-zoom-lightbox-wrapper">
            <div className="med-zoom-render-window">
              <span className="med-zoom-visual">{zoomMedia.url}</span>
            </div>
            
            <div className="med-zoom-specs-sheet">
              <div className="med-specs-group">
                <span className="lbl">Asset Tag Identification</span>
                <span className="val">#{zoomMedia.id}</span>
              </div>
              <div className="med-specs-group">
                <span className="lbl">File Descriptor Handle</span>
                <span className="val">{zoomMedia.name}</span>
              </div>
              <div className="med-specs-group">
                <span className="lbl">Asset Category</span>
                <span className="val"><span className={`med-type-pill ${zoomMedia.type.toLowerCase()}`}>{zoomMedia.type}</span></span>
              </div>
              <div className="med-specs-group">
                <span className="lbl">Stored File Footprint</span>
                <span className="val">{zoomMedia.size}</span>
              </div>
              <div className="med-specs-group full-row">
                <span className="lbl">Linked Store Product Profile</span>
                <span className="val"><ImageIcon size={14} className="med-prod-icon" /> {zoomMedia.product}</span>
              </div>
            </div>
          </div>
        )}
      </CatalogModal>

      {/* Upload Media Modal */}
      <CatalogModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Storefront Image Asset"
        description="Select files and link to active product catalogs to synchronize visuals automatically."
        icon={Plus}
        footer={
          <>
            <button className="cat-btn-secondary" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </button>
            <button className="cat-btn-primary" onClick={handleUploadSubmit}>
              Upload Asset
            </button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} className="cat-form-grid">
          <div className="cat-form-group cat-full-width">
            <label htmlFor="uploadName">Asset File Name (with extension)</label>
            <input 
              type="text" 
              id="uploadName" 
              value={uploadForm.name} 
              onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
              placeholder="e.g. apple_front_ripened.png"
              className={errors.name ? "cat-input-error" : ""}
            />
            {errors.name && <span className="cat-error-text">{errors.name}</span>}
          </div>

          <div className="cat-form-group">
            <label htmlFor="uploadType">Placement Classification</label>
            <select 
              id="uploadType" 
              value={uploadForm.type}
              onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
            >
              <option value="Front">Front Pack Shot</option>
              <option value="Side">Side / Nutritional Sizing</option>
              <option value="Gallery">Gallery Pack Shot</option>
            </select>
          </div>

          <div className="cat-form-group">
            <label htmlFor="uploadProduct">Associate with Catalog Product</label>
            <select 
              id="uploadProduct" 
              value={uploadForm.product}
              onChange={(e) => setUploadForm({...uploadForm, product: e.target.value})}
            >
              <option value="">-- Unassociated Asset --</option>
              {MOCK_PRODUCTS.map(p => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="cat-form-group cat-full-width med-simulated-upload-feedback">
            <Info size={15} />
            <span>
              Simulated File Selected: <strong>Glyph icon &apos;{uploadForm.url}&apos;</strong> ({uploadForm.size} generated file footprint).
            </span>
          </div>
        </form>
      </CatalogModal>

      {/* Edit Metadata Modal */}
      <CatalogModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Image Metadata"
        description="Update placements classification, file names, or link this asset to other product pages."
        icon={Edit2}
        footer={
          <>
            <button className="cat-btn-secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </button>
            <button className="cat-btn-primary" onClick={handleEditSubmit}>
              Update Asset
            </button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="cat-form-grid">
          <div className="cat-form-group cat-full-width">
            <label htmlFor="editName">Asset File Name</label>
            <input 
              type="text" 
              id="editName" 
              value={editForm.name} 
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              className={errors.name ? "cat-input-error" : ""}
            />
            {errors.name && <span className="cat-error-text">{errors.name}</span>}
          </div>

          <div className="cat-form-group">
            <label htmlFor="editType">Placement Classification</label>
            <select 
              id="editType" 
              value={editForm.type}
              onChange={(e) => setEditForm({...editForm, type: e.target.value})}
            >
              <option value="Front">Front Pack Shot</option>
              <option value="Side">Side / Nutritional Sizing</option>
              <option value="Gallery">Gallery Pack Shot</option>
            </select>
          </div>

          <div className="cat-form-group">
            <label htmlFor="editProduct">Associate Product Association</label>
            <select 
              id="editProduct" 
              value={editForm.product}
              onChange={(e) => setEditForm({...editForm, product: e.target.value})}
            >
              <option value="">-- Unassociated Asset --</option>
              {MOCK_PRODUCTS.map(p => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </CatalogModal>
    </div>
  );
}
