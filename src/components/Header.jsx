import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, ChevronDown } from 'lucide-react';

const Header = () => {
  const { user, selectedWarehouse, selectedRole } = useAuth();
  const navigate = useNavigate();

  const handleSwitchWorkspace = () => {
    navigate('/workspace-selection');
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Current Workspace</span>
          <div className="flex items-center gap-2 text-slate-800 font-medium">
            <MapPin className="w-4 h-4 text-blue-600" />
            {selectedWarehouse?.warehouseName || 'None'}
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-600">{selectedRole?.roleName || 'None'}</span>
          </div>
        </div>
        
        <button 
          onClick={handleSwitchWorkspace}
          className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
        >
          Switch
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="font-medium text-slate-900">{user?.firstName} {user?.lastName}</div>
          <div className="text-xs text-slate-500">{selectedRole?.roleName}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
          <User className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
};

export default Header;
