import React, { useState, useMemo, useRef } from "react";
import { 
  UploadCloud, Download, FileText, CheckCircle2, XCircle, RefreshCw, AlertTriangle, Play, HelpCircle, FileSpreadsheet
} from "lucide-react";
import PageHeader from "../../../components/CatalogCommon/PageHeader";
import DataTable from "../../../components/CatalogCommon/DataTable";
import SearchFilterBar from "../../../components/CatalogCommon/SearchFilterBar";
import StatusBadge from "../../../components/CatalogCommon/StatusBadge";
import EmptyState from "../../../components/CatalogCommon/EmptyState";
import CatalogModal from "../../../components/CatalogCommon/CatalogModal";
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
  const [processingLog, setProcessingLog] = useState(null);
  
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
      setProcessingLog(null);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setProcessingLog(null);
    }
  };

  const handleTriggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // Simulating the validation and ingestion workflow
  const handleProcessFile = () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadProgress(10);
    setProcessingLog(null);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 250);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      // Determine simulated results based on file name or simple math
      const hasErrors = selectedFile.name.toLowerCase().includes("err") || selectedFile.size % 2 === 0;
      const totalRecs = Math.floor(Math.random() * 150) + 20;
      const errCount = hasErrors ? Math.floor(Math.random() * 8) + 2 : 0;
      const succCount = totalRecs - errCount;
      const uploadStatus = errCount > 0 ? "Failed" : "Success";

      const newLog = {
        id: `BLK-${Date.now().toString().slice(-3)}`,
        filename: selectedFile.name,
        type: uploadType,
        status: uploadStatus,
        totalRecords: totalRecs,
        successCount: succCount,
        errorCount: errCount,
        uploadedBy: "Dinesh G.K",
        timestamp: new Date().toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        }),
        errors: errCount > 0 ? Array.from({ length: errCount }, (_, i) => ({
          row: Math.floor(Math.random() * totalRecs) + 2,
          field: ["SKU", "MRP", "Barcode", "Selling Price"][Math.floor(Math.random() * 4)],
          message: ["Value is missing", "Invalid numeric format", "Barcode format mismatch", "Selling price exceeds MRP"][Math.floor(Math.random() * 4)]
        })) : []
      };

      setHistory(prev => [newLog, ...prev]);
      setProcessingLog(newLog);
      setIsProcessing(false);
      setSelectedFile(null);
    }, 1800);
  };

  // Template download simulated download helper
  const handleDownloadTemplate = (type) => {
    alert(`Downloading template for ${type}. Make sure to fill all mandatory headers marked with asterisk (*)!`);
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

  // History Detail view
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
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />
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
    {
      header: "Uploaded By",
      key: "uploadedBy"
    },
    {
      header: "Date Uploaded",
      key: "timestamp"
    }
  ];

  return (
    <div className="blk-page fade-in">
      <PageHeader 
        title="Bulk Data Ingestion"
        description="Ingest entire sections of catalog inventory, categories, barcodes, and complex bulk pricing plans instantly via Excel/CSV spreadsheet matrices."
      />

      <div className="blk-layout-grid">
        {/* Left Control Panel: Upload Form & Templates */}
        <div className="blk-control-panel">
          
          {/* Section 1: Template Download Center */}
          <div className="blk-panel-card">
            <h3 className="blk-card-title">1. Download Blank Schema Templates</h3>
            <p className="blk-card-desc">Ensure optimal validation rates by populating our pre-formatted structural templates.</p>
            
            <div className="blk-template-grid">
              <button className="blk-temp-btn" onClick={() => handleDownloadTemplate("Products")}>
                <FileSpreadsheet size={16} />
                <span>Products Model</span>
              </button>
              <button className="blk-temp-btn" onClick={() => handleDownloadTemplate("Pricing")}>
                <FileSpreadsheet size={16} />
                <span>Pricing Rules</span>
              </button>
              <button className="blk-temp-btn" onClick={() => handleDownloadTemplate("Inventory Mappings")}>
                <FileSpreadsheet size={16} />
                <span>Warehouse Mapping</span>
              </button>
            </div>
          </div>

          {/* Section 2: File Upload Zone */}
          <div className="blk-panel-card">
            <h3 className="blk-card-title">2. Select Upload Context & File</h3>
            
            <div className="blk-form-group">
              <label htmlFor="contextSelect">Choose Catalog Schema Profile</label>
              <select 
                id="contextSelect" 
                value={uploadType} 
                onChange={(e) => setUploadType(e.target.value)}
                disabled={isProcessing}
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
              onClick={handleTriggerFileSelect}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".csv, .xls, .xlsx"
                style={{ display: "none" }}
              />
              
              <UploadCloud size={32} className="blk-upload-cloud-icon" />
              
              {selectedFile ? (
                <div className="blk-selected-feedback">
                  <p className="filename">{selectedFile.name}</p>
                  <p className="filesize">{(selectedFile.size / 1024).toFixed(1)} KB · Ready to Ingest</p>
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
                <span>Process & Validate Batch</span>
              </button>
            )}

            {isProcessing && (
              <div className="blk-processing-overlay">
                <RefreshCw className="blk-spinner" size={24} />
                <p>Analyzing spreadsheet structures...</p>
                <div className="blk-prog-bar-wrap">
                  <div className="blk-prog-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <span className="blk-prog-text">{uploadProgress}% Complete</span>
              </div>
            )}

            {processingLog && (
              <div className={`blk-feedback-card ${processingLog.status.toLowerCase()}`}>
                <div className="feedback-hdr">
                  {processingLog.status === "Success" ? (
                    <CheckCircle2 size={16} className="success-color" />
                  ) : (
                    <AlertTriangle size={16} className="danger-color" />
                  )}
                  <h4>Upload {processingLog.status === "Success" ? "Ingested Successfully!" : "Ingestion Failed Validation"}</h4>
                </div>
                <p className="feedback-body">
                  Catalog Ingestion <strong>#{processingLog.id}</strong> finished processing <strong>{processingLog.totalRecords}</strong> total rows. 
                  {processingLog.status === "Success" ? (
                    " All products are successfully mapped."
                  ) : (
                    ` Found ${processingLog.errorCount} data rows containing schema anomalies.`
                  )}
                </p>
                {processingLog.errors && processingLog.errors.length > 0 && (
                  <button className="blk-err-view-btn" onClick={() => handleViewDetails(processingLog)}>
                    Click here to review errors
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Recent Activity History List */}
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

      {/* Upload Details / Error Validation Modal */}
      <CatalogModal
        isOpen={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
        title={`Batch Log Summary: ${selectedHistory?.id}`}
        description={`Analyzing records ingested from file: ${selectedHistory?.filename}`}
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
                <span className="lbl">Spreadsheet Ingestion Profile</span>
                <span className="val">{selectedHistory.type}</span>
              </div>
              <div className="blk-stat-box">
                <span className="lbl">Status</span>
                <span className="val"><StatusBadge status={selectedHistory.status} /></span>
              </div>
              <div className="blk-stat-box">
                <span className="lbl">Total Records Mapped</span>
                <span className="val">{selectedHistory.totalRecords}</span>
              </div>
              <div className="blk-stat-box">
                <span className="lbl">User Submitting Batch</span>
                <span className="val">{selectedHistory.uploadedBy}</span>
              </div>
            </div>

            {selectedHistory.status === "Failed" && selectedHistory.errors && selectedHistory.errors.length > 0 ? (
              <div className="blk-anomaly-section">
                <h4 className="anomaly-title">
                  <AlertTriangle size={15} />
                  <span>Validation Anomalies Detected ({selectedHistory.errors.length})</span>
                </h4>
                <p className="anomaly-subtitle">The backend parser skipped these rows. Rectify these errors in your spreadsheet and upload a delta batch.</p>
                
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
                <p>100% of data structures matched the target catalog schema correctly. All inventory parameters have been refreshed automatically in-line with the latest spreadsheet metadata.</p>
              </div>
            )}
          </div>
        )}
      </CatalogModal>
    </div>
  );
}
