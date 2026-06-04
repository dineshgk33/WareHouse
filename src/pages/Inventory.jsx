import React from 'react';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const { canCreate, canEdit, canDelete, canApprove } = useAuth();

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Inventory Management</h1>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {canApprove('INVENTORY') && (
            <button style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Approve Selected
            </button>
          )}
          {canCreate('INVENTORY') && (
            <button style={{ padding: '8px 16px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              + Add Inventory
            </button>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
          This page content is protected. Action buttons are dynamically rendered based on permissions.
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Item ID</th>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Stock</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(item => (
              <tr key={item} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px' }}>ITM-00{item}</td>
                <td style={{ padding: '12px' }}>Sample Product {item}</td>
                <td style={{ padding: '12px' }}>{item * 10}</td>
                <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                  {canEdit('INVENTORY') && (
                    <button style={{ padding: '6px 12px', backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      Edit
                    </button>
                  )}
                  {canDelete('INVENTORY') && (
                    <button style={{ padding: '6px 12px', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      Delete
                    </button>
                  )}
                  {!canEdit('INVENTORY') && !canDelete('INVENTORY') && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
