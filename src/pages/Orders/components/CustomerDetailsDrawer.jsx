import React from "react";
import { User, Mail, Phone, Calendar, ShieldCheck, MapPin, Tag } from "lucide-react";

function CustomerDetailsDrawer({ selectedCustomer }) {
    return (
        <div className="drawer-details-wrapper">
            {/* Customer Summary Card */}
            <div className="drawer-section">
                <h4 className="drawer-section-title">Customer Profile Info</h4>
                <div className="drawer-info-card">
                    <div className="drawer-info-row">
                        <span className="drawer-info-label">Customer Name</span>
                        <span className="drawer-info-value font-bold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={14} className="text-primary" /> {selectedCustomer.name}
                        </span>
                    </div>
                    <div className="drawer-info-row">
                        <span className="drawer-info-label">Email Address</span>
                        <span className="drawer-info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={14} style={{ color: 'var(--text-muted)' }} /> {selectedCustomer.email}
                        </span>
                    </div>
                    <div className="drawer-info-row">
                        <span className="drawer-info-label">Phone Contact</span>
                        <span className="drawer-info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={14} style={{ color: 'var(--text-muted)' }} /> {selectedCustomer.phone}
                        </span>
                    </div>
                    <div className="drawer-info-row">
                        <span className="drawer-info-label">Customer Segment</span>
                        <span className="priority-badge priority-normal" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content', backgroundColor: 'rgba(30, 96, 255, 0.1)', color: 'var(--primary)' }}>
                            <Tag size={10} /> {selectedCustomer.segment}
                        </span>
                    </div>
                    <div className="drawer-info-row">
                        <span className="drawer-info-label">Account Joined</span>
                        <span className="drawer-info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} style={{ color: 'var(--text-muted)' }} /> {selectedCustomer.joinDate}
                        </span>
                    </div>
                    <div className="drawer-info-row">
                        <span className="drawer-info-label">Account Status</span>
                        <span className="orders-status-badge status-delivered" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                            <ShieldCheck size={11} /> {selectedCustomer.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Account Valuation & Spend */}
            <div className="drawer-section" style={{ marginTop: '20px' }}>
                <h4 className="drawer-section-title">Lifetime Account Valuation</h4>
                <div className="drawer-info-card" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '14px' }}>
                    <div className="drawer-info-row">
                        <span className="drawer-info-label">Total Completed Orders</span>
                        <span className="drawer-info-value font-bold" style={{ fontSize: '18px' }}>{selectedCustomer.totalOrders}</span>
                    </div>
                    <div className="drawer-info-row">
                        <span className="drawer-info-label">Total Amount Spent</span>
                        <span className="drawer-info-value font-bold text-primary" style={{ fontSize: '18px' }}>{selectedCustomer.totalSpend}</span>
                    </div>
                </div>
            </div>

            {/* Shipping Address */}
            <div className="drawer-section" style={{ marginTop: '20px' }}>
                <h4 className="drawer-section-title">Default Shipping Location</h4>
                <div className="drawer-info-card" style={{ gridTemplateColumns: '1fr', padding: '14px' }}>
                    <div className="drawer-info-row">
                        <span className="drawer-info-label">Street / Area</span>
                        <span className="drawer-info-value" style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: '1.4' }}>
                            <MapPin size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                            {selectedCustomer.address}
                        </span>
                    </div>
                </div>
            </div>

            {/* CRM Notes */}
            <div className="drawer-section" style={{ marginTop: '20px' }}>
                <h4 className="drawer-section-title">Customer Relationship Notes</h4>
                <div className="drawer-info-card" style={{ gridTemplateColumns: '1fr', padding: '14px', backgroundColor: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.15)' }}>
                    <div className="drawer-info-row">
                        <span className="drawer-info-label" style={{ color: '#d97706' }}>Fulfillment Preferences</span>
                        <p className="drawer-info-value" style={{ fontSize: '13px', fontStyle: 'italic', color: '#1f2937', marginTop: '4px', lineHeight: '1.4' }}>
                            "{selectedCustomer.notes}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default React.memo(CustomerDetailsDrawer);
