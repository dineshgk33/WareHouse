import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
      <ShieldAlert size={64} color="var(--color-danger)" style={{ marginBottom: '24px' }} />
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '16px' }}>403 - Access Denied</h1>
      <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '32px', textAlign: 'center', maxWidth: '400px' }}>
        You do not have permission to access this module. Please contact your administrator if you believe this is a mistake.
      </p>
      <button 
        onClick={() => navigate('/')}
        style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default AccessDenied;
