import React, { useState, useMemo, useRef } from "react";
import { 
  UploadCloud, Download, FileText, CheckCircle2, XCircle, RefreshCw, AlertTriangle, Play, HelpCircle, FileSpreadsheet, RotateCcw, ArrowRight
} from "lucide-react";
import PageHeader from "../../../components/CatalogCommon/PageHeader";
import DataTable from "../../../components/CatalogCommon/DataTable";
import SearchFilterBar from "../../../components/CatalogCommon/SearchFilterBar";
import StatusBadge from "../../../components/CatalogCommon/StatusBadge";
import EmptyState from "../../../components/CatalogCommon/EmptyState";
import CatalogModal from "../../../components/CatalogCommon/CatalogModal";
import { MOCK_PRODUCTS } from "../../../data/catalogData";
import "./BulkUpload.css";

const INITIAL_HISTORY = [
  { id: "BLK-001", filename: "june_base_products.csv", type: "Products", status: "Success", totalRecords: 250, successCount: 250, errorCount: 0, uploadedBy: "Dinesh G.K", timestamp: "01 Jun 2026, 09:30 AM" },
  { id: "BLK-002", filename: "mumbai_promo_pricing.xlsx", type: "Pricing", status: "Failed", totalRecords: 80, successCount: 68, errorCount: 12, uploadedBy: "Amit Sharma", timestamp: "31 May 2026, 02:40 PM" },
  { id: "BLK-003", filename: "delhi_depot_mappings.csv", type: "Inventory Mappings", status: "Success", totalRecords: 115, successCount: 115, errorCount: 0, uploadedBy: "Priya Rao", timestamp: "29 May 2026, 11:15 AM" }
];

export default function BulkUploadPage() {
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  
  // Upload States
  const [uploadType, setUploadType] = useState("Products");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewRows, setPreviewRows] = useState([]);
  const [activeBatchId, setActiveBatchId] = useState(null);

  // Modal State for details
  const [selectedHistory, setSelectedHistory] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewRows([]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPreviewRows([]);
    }
  };

  const handleTriggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // ─── Parsing & Validation Engine Simulation ──────────────────────────────
  const handleProcessFile = () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsProcessing(false);

      // Populate Validation Preview Grid
      const batchId = `BLK-${Date.now().toString().slice(-4)}`;
      setActiveBatchId(batchId);

      const parsedData = [
        { row: 2, name: "Fresh Zespri Kiwis", sku: "FRT-KIW-ORG-0008", barcode: "8902010203011", category: "Fruits & Vegetables", mrp: 250, sellingPrice: 220, status: "Valid", notes: "Approved for upload." },
        { row: 3, name: "Greek Blueberry Yogurt", sku: "DRY-YOG-AMU-0009", barcode: "8901262010199", category: "Dairy & Bread", mrp: 60, sellingPrice: 55, status: "Valid", notes: "Approved for upload." },
        { row: 4, name: "Lay's Tomato Twist", sku: "SNK-LYS-BRI-0010", barcode: "8902080302099", category: "Munchies & Snacks", mrp: 20, sellingPrice: 25, status: "Invalid", notes: "Boundary constraint failed: Selling price cannot exceed MRP (25 > 20)." },
        { row: 5, name: "Amul Taaza Toned Milk", sku: "DRY-MLK-AMU-0002", barcode: "8901262010014", category: "Dairy & Bread", mrp: 56, sellingPrice: 54, status: "Warning", notes: "Duplicate Alarm: SKU already exists in active pool." },
        { row: 6, name: "Apple 20W USB-C Charger", sku: "ELC-CHG-APP-0011", barcode: "8901532109899", category: "Electronics", mrp: 1900, sellingPrice: 1699, status: "Valid", notes: "Approved for upload." }
      ];
      setPreviewRows(parsedData);
    }, 1000);
  };

  // ─── Partial Import (Ingest valid records only) ──────────────────────────
  const handleCommitPartial = () => {
    const validRows = previewRows.filter(r => r.status === "Valid");
    
    const newLog = {
      id: activeBatchId,
      filename: selectedFile ? selectedFile.name : "spreadsheet_import.csv",
      type: uploadType,
      status: "Success",
      totalRecords: previewRows.length,
      successCount: validRows.length,
      errorCount: previewRows.length - validRows.length,
      uploadedBy: "Dinesh G.K",
      timestamp: new Date().toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }),
      errors: previewRows.filter(r => r.status !== "Valid").map(r => ({
        row: r.row,
        field: r.status === "Warning" ? "SKU" : "Selling Price",
        message: r.notes
      }))
    };

    setHistory(prev => [newLog, ...prev]);
    alert(`Partial Import Successful: Mapped ${validRows.length} valid product entries to catalog pool. Rollback checkpoint registered.`);
    setPreviewRows([]);
    setSelectedFile(null);
  };

  // ─── Batch Rollback ───────────────────────────────────────────────────────
  const handleRollbackBatch = () => {
    const newLog = {
      id: activeBatchId,
      filename: selectedFile ? selectedFile.name : "spreadsheet_import.csv",
      type: uploadType,
      status: "Failed",
      totalRecords: previewRows.length,
      successCount: 0,
      errorCount: previewRows.length,
      uploadedBy: "Dinesh G.K",
      timestamp: new Date().toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }),
      errors: [{ row: "All", field: "Batch Ingestion", message: "Transaction aborted. Entire batch rolled back by operator." }]
    };

    setHistory(prev => [newLog, ...prev]);
    alert("Transaction Aborted: Batch rollback successfully completed. 0 records committed.");
    setPreviewRows([]);
    setSelectedFile(null);
  };

  const handleDownloadTemplate = (type) => {
    alert(`Downloading template for ${type}. Follow the structure and include the mandatory asterisk (*) fields!`);
  };

  // Filters & Search
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = item.filename.toLowerCase().includes(search.toLowerCase()) ||
                            item.uploadedBy.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [history, search, typeFilter]);

  const handleViewDetails = (item) => {
    setSelectedHistory(item);
  };

  const columns = [
    {
      header: "File Details",
      render: (row) => (
        <div className="blk-file-cell">
          <FileText size={18} className="blk-file-icon" />
          <div>
            <div className="blk-file-name">{row.filename}</div>
            <div className="blk-file-sub">{row.type}</div>
          </div>
        </div>
      )
    },
    {
      header: "Ingestion Status",
      render: (row) => <StatusBadge status={row.status === "Success" ? "Published" : "Rejected"} />
    },
    {
      header: "Records Processed",
      render: (row) => (
        <div>
          <span className="blk-rec-total">{row.totalRecords} total</span>
          <div className="blk-rec-breakdown">
            <span className="success">{row.successCount} passed</span>
            {row.errorCount > 0 && <span className="danger"> · {row.errorCount} failed</span>}
          </div>
        </div>
      )
    },
    { header: "Uploaded By", key: "uploadedBy" },
    { header: "Date Uploaded", key: "timestamp" }
  ];

  return (
    <div className="blk-page fade-in">
      <PageHeader 
        title="Enterprise Ingestion Center"
        description="Ingest catalogs, pricing profiles, and warehouse inventories via bulk CSV/Excel sheets"
      />

      <div className="blk-layout-grid">
        {/* Left Side Upload controls */}
        <div className="blk-control-panel">
          
          {/* Templates */}
          <div className="blk-panel-card">
            <h3 className="blk-card-title">1. Catalog Metadata Schema Templates</h3>
            <p className="blk-card-desc">Download required columns template formatted for dynamic PIM validation.</p>
            
            <div className="blk-template-grid">
              <button className="blk-temp-btn" onClick={() => handleDownloadTemplate("Products Template")}>
                <FileSpreadsheet size={16} />
                <span>Products Ingestion</span>
              </button>
              <button className="blk-temp-btn" onClick={() => handleDownloadTemplate("Pricing Template")}>
                <FileSpreadsheet size={16} />
                <span>Base Pricing Rules</span>
              </button>
              <button className="blk-temp-btn" onClick={() => handleDownloadTemplate("Warehouse Mapping Template")}>
                <FileSpreadsheet size={16} />
                <span>Warehouse Mappings</span>
              </button>
            </div>
          </div>

          {/* Upload Selector */}
          <div className="blk-panel-card">
            <h3 className="blk-card-title">2. Select Schema Context & File</h3>
            
            <div className="blk-form-group">
              <label htmlFor="contextSelect">Ingestion Target Profile</label>
              <select 
                id="contextSelect" 
                value={uploadType} 
                onChange={(e) => setUploadType(e.target.value)}
                disabled={isProcessing || previewRows.length > 0}
              >
                <option value="Products">Products Profile (Add/Update SKU)</option>
                <option value="Pricing">Base Pricing Plan (MRP/Darkhouse Selling)</option>
                <option value="Inventory Mappings">Darkhouse Hub Inventory Mappings</option>
              </select>
            </div>

            <div 
              className={`blk-upload-zone ${selectedFile ? "active" : ""}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => { if (previewRows.length === 0) handleTriggerFileSelect(); }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".csv, .xls, .xlsx"
                style={{ display: "none" }}
                disabled={previewRows.length > 0}
              />
              
              <UploadCloud size={32} className="blk-upload-cloud-icon" />
              
              {selectedFile ? (
                <div className="blk-selected-feedback">
                  <p className="filename">{selectedFile.name}</p>
                  <p className="filesize">{(selectedFile.size / 1024).toFixed(1)} KB · Ready to Validate</p>
                </div>
              ) : previewRows.length > 0 ? (
                <div className="blk-selected-feedback">
                  <p className="filename">Batch {activeBatchId} Loaded</p>
                  <p className="filesize">Validation Preview active. Commit changes below.</p>
                </div>
              ) : (
                <div className="blk-placeholder-text">
                  <p className="main-prompt">Drag & Drop CSV / Excel sheet here</p>
                  <p className="sub-prompt">or click to browse local filesystem</p>
                </div>
              )}
            </div>

            {selectedFile && !isProcessing && (
              <button className="cat-btn-primary blk-process-btn" onClick={handleProcessFile}>
                <Play size={14} />
                <span>Process & Parse Batch</span>
              </button>
            )}

            {isProcessing && (
              <div className="blk-processing-overlay">
                <RefreshCw className="blk-spinner" size={24} />
                <p>Analyzing fields & checking duplicate SKUs...</p>
                <div className="blk-prog-bar-wrap">
                  <div className="blk-prog-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <span className="blk-prog-text">{uploadProgress}% Validation Complete</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Activity Logs */}
        <div className="blk-history-panel">
          <div className="blk-panel-card history-card">
            <h3 className="blk-card-title">Catalog Upload Activity History</h3>
            
            <SearchFilterBar 
              search={search}
              onSearchChange={(e) => setSearch(e.target.value)}
              placeholder="Search history by file name..."
              filters={[
                {
                  value: typeFilter,
                  onChange: (e) => setTypeFilter(e.target.value),
                  label: "Upload Type Filter",
                  options: [
                    { value: "All", label: "All Ingestion Schema Profiles" },
                    { value: "Products", label: "Products" },
                    { value: "Pricing", label: "Pricing Rules" },
                    { value: "Inventory Mappings", label: "Warehouse Mapping" }
                  ]
                }
              ]}
            />

            {filteredHistory.length === 0 ? (
              <EmptyState 
                icon={FileText}
                message="No matching upload transactions found in the logs."
              />
            ) : (
              <DataTable 
                columns={columns}
                data={filteredHistory}
                onRowClick={(row) => handleViewDetails(row)}
                rowIdKey="id"
              />
            )}
          </div>
        </div>
      </div>

      {/* ─── VALIDATION PREVIEW GRID ────────────────────────────────────────── */}
      {previewRows.length > 0 && (
        <div className="blk-preview-grid-card">
          <div className="preview-grid-header">
            <div>
              <h3 className="preview-grid-title">Batch Ingestion Verification Grid ({activeBatchId})</h3>
              <p className="preview-grid-subtitle">
                The spreadsheet rows were parsed against store schemas. Resolve warning rows before committing.
              </p>
            </div>
            
            <div className="preview-actions">
              <button className="btn-rollback" onClick={handleRollbackBatch}>
                <RotateCcw size={14} />
                <span>Rollback Entire Batch</span>
              </button>
              <button className="btn-commit-partial" onClick={handleCommitPartial}>
                <span>Ingest Valid (Partial Import)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="preview-table-wrapper">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>MRP</th>
                  <th>Selling Price</th>
                  <th>Verification Status</th>
                  <th>Validation Result Details</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx} className={`preview-row-${row.status.toLowerCase()}`}>
                    <td><strong>{row.row}</strong></td>
                    <td className="font-mono">{row.sku}</td>
                    <td>{row.name}</td>
                    <td>{row.category}</td>
                    <td>₹{row.mrp}</td>
                    <td>₹{row.sellingPrice}</td>
                    <td>
                      <span className={`preview-badge ${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="preview-notes">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Details / Error Validation Modal */}
      <CatalogModal
        isOpen={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
        title={`Batch Log Summary: ${selectedHistory?.id}`}
        description={`Ingestion analytics for: ${selectedHistory?.filename}`}
        icon={FileText}
        footer={
          <button className="cat-btn-primary" onClick={() => setSelectedHistory(null)}>
            Acknowledge & Close
          </button>
        }
      >
        {selectedHistory && (
          <div className="blk-modal-details">
            <div className="blk-stats-row">
              <div className="blk-stat-box">
                <span className="lbl">Ingestion Context</span>
                <span className="val">{selectedHistory.type}</span>
              </div>
              <div className="blk-stat-box">
                <span className="lbl">Status</span>
                <span className="val"><StatusBadge status={selectedHistory.status === "Success" ? "Published" : "Rejected"} /></span>
              </div>
              <div className="blk-stat-box">
                <span className="lbl">Total Rows Mapped</span>
                <span className="val">{selectedHistory.totalRecords}</span>
              </div>
              <div className="blk-stat-box">
                <span className="lbl">Processor</span>
                <span className="val">{selectedHistory.uploadedBy}</span>
              </div>
            </div>

            {selectedHistory.status === "Failed" && selectedHistory.errors && selectedHistory.errors.length > 0 ? (
              <div className="blk-anomaly-section">
                <h4 className="anomaly-title">
                  <AlertTriangle size={15} />
                  <span>Validation Anomalies Detected ({selectedHistory.errors.length})</span>
                </h4>
                <p className="anomaly-subtitle">The backend rolled back this upload due to structural issues listed below.</p>
                
                <div className="blk-anomaly-table-wrap">
                  <table className="blk-anomaly-table">
                    <thead>
                      <tr>
                        <th>Spreadsheet Row</th>
                        <th>Column Field</th>
                        <th>System Failure Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHistory.errors.map((err, idx) => (
                        <tr key={idx}>
                          <td><strong>Row {err.row}</strong></td>
                          <td><span className="column-code">{err.field}</span></td>
                          <td><span className="error-reason">{err.message}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="blk-ingestion-success-message">
                <CheckCircle2 size={36} className="success-icon" />
                <h4>Perfect Ingestion Run</h4>
                <p>100% of rows matched target schemas. All product entries and inventories have been updated successfully.</p>
              </div>
            )}
          </div>
        )}
      </CatalogModal>
    </div>
  );
}
