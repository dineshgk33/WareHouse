import React, { useState, useMemo } from "react";
import { 
  History, Search, Eye, ArrowRight, User, Calendar, RotateCcw, AlertTriangle, FileText, Download
} from "lucide-react";
import PageHeader from "../../../components/CatalogCommon/PageHeader";
import DataTable from "../../../components/CatalogCommon/DataTable";
import SearchFilterBar from "../../../components/CatalogCommon/SearchFilterBar";
import StatusBadge from "../../../components/CatalogCommon/StatusBadge";
import EmptyState from "../../../components/CatalogCommon/EmptyState";
import CatalogModal from "../../../components/CatalogCommon/CatalogModal";
import { MOCK_AUDITS } from "../../../data/catalogData";
import "./ProductAudit.css";

export default function ProductAuditPage() {
  const [audits, setAudits] = useState(MOCK_AUDITS);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [revertedId, setRevertedId] = useState(null);

  // Simulated export function
  const handleExportAudits = () => {
    alert("Exporting audit logs to spreadsheet. Your CSV file will download in a few seconds.");
  };

  // Revert Action simulation
  const handleRevertAction = (audit) => {
    if (window.confirm(`Are you sure you want to rollback change #${audit.id}? This will restore the product state back to "${audit.oldValue}".`)) {
      setRevertedId(audit.id);
      
      // Construct rollback log
      const rollbackLog = {
        id: `AUD-REV-${Date.now().toString().slice(-3)}`,
        action: `Reverted: ${audit.action}`,
        productName: audit.productName,
        oldValue: audit.newValue,
        newValue: audit.oldValue,
        updatedBy: "Dinesh G.K (Rollback)",
        timestamp: new Date().toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
      };

      setTimeout(() => {
        setAudits(prev => [rollbackLog, ...prev]);
        setSelectedAudit(null);
        setRevertedId(null);
        alert(`Successfully reverted state changes for ${audit.productName}!`);
      }, 1000);
    }
  };

  // Filters & search
  const filteredAudits = useMemo(() => {
    return audits.filter(log => {
      const matchesSearch = log.productName.toLowerCase().includes(search.toLowerCase()) ||
                            log.updatedBy.toLowerCase().includes(search.toLowerCase()) ||
                            log.id.toLowerCase().includes(search.toLowerCase());
      
      const matchesAction = actionFilter === "All" || log.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [audits, search, actionFilter]);

  // List unique action types for filter options
  const actionOptions = useMemo(() => {
    const unique = Array.from(new Set(MOCK_AUDITS.map(a => a.action)));
    return [
      { value: "All", label: "All Audit Actions" },
      ...unique.map(a => ({ value: a, label: a }))
    ];
  }, []);

  // Columns definition for DataTable
  const columns = [
    {
      header: "Audit ID",
      render: (row) => <span className="adt-id-txt">#{row.id}</span>,
      style: { width: "100px" }
    },
    {
      header: "Action Performed",
      render: (row) => (
        <span className={`adt-action-tag ${row.action.toLowerCase().replace(/\s+/g, "-")}`}>
          {row.action}
        </span>
      ),
      style: { width: "160px" }
    },
    {
      header: "Catalog Product",
      key: "productName"
    },
    {
      header: "Historical State Transitions",
      render: (row) => (
        <div className="adt-transition-cell">
          <span className="old-state">{row.oldValue}</span>
          <ArrowRight size={13} className="arrow-sep" />
          <span className="new-state">{row.newValue}</span>
        </div>
      )
    },
    {
      header: "Auditor Details",
      render: (row) => (
        <div className="adt-auditor-cell">
          <User size={13} className="auditor-icon" />
          <span>{row.updatedBy}</span>
        </div>
      )
    },
    {
      header: "Time Triggered",
      render: (row) => (
        <div className="adt-time-cell">
          <Calendar size={13} className="time-icon" />
          <span>{row.timestamp}</span>
        </div>
      )
    }
  ];

  return (
    <div className="adt-page fade-in">
      <PageHeader 
        title="Store Audit Logs"
        description="Verify system audit timelines, catalog state modifications, and perform security reviews of warehouse catalog events."
        primaryAction={{
          label: "Export Audit Ledger",
          icon: Download,
          onClick: handleExportAudits
        }}
      />

      {/* Main card logs workspace */}
      <div className="adt-card">
        <SearchFilterBar 
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          placeholder="Search logs by product, auditor name, or ID..."
          filters={[
            {
              value: actionFilter,
              onChange: (e) => setActionFilter(e.target.value),
              label: "Audit Action Filter",
              options: actionOptions
            }
          ]}
        />

        {filteredAudits.length === 0 ? (
          <EmptyState 
            icon={History}
            message="No system logs are found matching these audit parameters."
          />
        ) : (
          <DataTable 
            columns={columns}
            data={filteredAudits}
            onRowClick={(row) => setSelectedAudit(row)}
            rowIdKey="id"
          />
        )}
      </div>

      {/* Audit Detail Inspector Modal */}
      <CatalogModal
        isOpen={!!selectedAudit}
        onClose={() => setSelectedAudit(null)}
        title={`Audit State Inspector: ${selectedAudit?.id}`}
        description="Trace complete data revisions, timestamp offsets, and user authorization levels."
        icon={History}
        footer={
          <>
            <button className="cat-btn-secondary" onClick={() => setSelectedAudit(null)}>
              Close Inspector
            </button>
            {selectedAudit && !selectedAudit.action.startsWith("Reverted") && (
              <button 
                className="cat-btn-primary adt-revert-btn" 
                onClick={() => handleRevertAction(selectedAudit)}
                disabled={revertedId === selectedAudit.id}
              >
                {revertedId === selectedAudit.id ? (
                  <>
                    <RotateCcw className="adt-spin" size={13} />
                    <span>Rolling back...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={13} />
                    <span>Rollback Catalog Changes</span>
                  </>
                )}
              </button>
            )}
          </>
        }
      >
        {selectedAudit && (
          <div className="adt-inspector-details">
            
            {/* Split layout block: timeline header and auditor box */}
            <div className="adt-inspector-header-meta">
              <div className="meta-box">
                <span className="lbl">Catalog Action Event</span>
                <span className="val">{selectedAudit.action}</span>
              </div>
              <div className="meta-box">
                <span className="lbl">Event Auditor Profile</span>
                <span className="val">{selectedAudit.updatedBy}</span>
              </div>
              <div className="meta-box">
                <span className="lbl">Timestamp UTC+5:30</span>
                <span className="val">{selectedAudit.timestamp}</span>
              </div>
            </div>

            {/* In-Depth Historical Diff Grid */}
            <div className="adt-diff-diagram">
              <h4 className="diagram-hdr">Unified Parameters Comparison</h4>
              
              <div className="diagram-flex-row">
                {/* BEFORE STATE CARD */}
                <div className="state-node before">
                  <span className="state-hdr">BEFORE REVISION</span>
                  <div className="state-body">
                    <span className="state-pill danger">OLD STATE</span>
                    <p className="state-value-block">{selectedAudit.oldValue}</p>
                  </div>
                </div>

                {/* FLOW ARROW */}
                <div className="diagram-flow-arrow">
                  <ArrowRight size={24} className="flow-icon" />
                  <span className="flow-sub">Catalog Event Update</span>
                </div>

                {/* AFTER STATE CARD */}
                <div className="state-node after">
                  <span className="state-hdr">AFTER REVISION</span>
                  <div className="state-body">
                    <span className="state-pill success">NEW STATE</span>
                    <p className="state-value-block">{selectedAudit.newValue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hazard Alert on rollback */}
            {!selectedAudit.action.startsWith("Reverted") && (
              <div className="adt-hazard-banner">
                <AlertTriangle size={16} />
                <span>
                  <strong>Data Integrity Disclaimer:</strong> Initiating a rollback restores parameter values but will generate a corresponding System Rollback log to maintain audit traceability.
                </span>
              </div>
            )}

          </div>
        )}
      </CatalogModal>
    </div>
  );
}
