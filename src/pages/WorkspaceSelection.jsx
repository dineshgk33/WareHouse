import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, ShieldCheck, ChevronRight } from 'lucide-react';

const WorkspaceSelection = () => {
  const { user, selectWorkspace } = useAuth();
  const navigate = useNavigate();
  
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const selectedWarehouse = user.warehouseRoles.find(w => w.warehouseId === selectedWarehouseId);
  const availableRoles = selectedWarehouse ? selectedWarehouse.roles : [];

  const handleWarehouseChange = (e) => {
    setSelectedWarehouseId(e.target.value);
    setSelectedRoleId(''); // Reset role when warehouse changes
  };

  const handleContinue = async () => {
    if (!selectedWarehouseId || !selectedRoleId) return;
    
    setIsSubmitting(true);
    const role = availableRoles.find(r => r.roleId === selectedRoleId);
    
    await selectWorkspace(selectedWarehouse, role);
    navigate('/inventory'); // default landing page, will redirect to 403 if no access
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Select Workspace</h2>
          <p className="text-slate-400 text-sm">Welcome {user.firstName}, please choose your active warehouse and role.</p>
        </div>
        
        <div className="p-8 space-y-6">
          {/* Warehouse Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin className="w-4 h-4 text-blue-500" />
              Select Warehouse
            </label>
            <div className="grid gap-3">
              {user.warehouseRoles.map(warehouse => (
                <div 
                  key={warehouse.warehouseId}
                  onClick={() => setSelectedWarehouseId(warehouse.warehouseId)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    selectedWarehouseId === warehouse.warehouseId 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-medium text-slate-800">{warehouse.warehouseName}</div>
                  <div className="text-xs text-slate-500 mt-1">ID: {warehouse.warehouseId}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Selection */}
          {selectedWarehouseId && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Select Role
              </label>
              <div className="grid gap-3">
                {availableRoles.map(role => (
                  <div 
                    key={role.roleId}
                    onClick={() => setSelectedRoleId(role.roleId)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                      selectedRoleId === role.roleId 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-medium text-slate-800">{role.roleName}</div>
                    <div className="text-xs text-slate-500 mt-1">ID: {role.roleId}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={!selectedWarehouseId || !selectedRoleId || isSubmitting}
            className="w-full mt-6 flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Loading Permissions...' : 'Continue To Dashboard'}
            {!isSubmitting && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSelection;
