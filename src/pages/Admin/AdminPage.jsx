import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
    Users, 
    Briefcase,
    Warehouse,
    MoreVertical,
    Plus,
    CheckCircle,
    Search,
    Download,
    Upload,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Check
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import avatarImg from "../../assets/dinesh.png";
import { useToast } from "../../hooks/useToast";
import UserRolesSection from "../../components/Roles/UserRolesSection";
import Modal from "../../components/Roles/Modal";
import { authService } from "../../services/authService";
import "../Settings/Settings.css";

function AdminPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, selectedRole, selectedRoleName, warehouseRoles } = useAuth();
    
    // Determine active tab from URL path
    const pathParts = location.pathname.split('/');
    const initialTab = pathParts[pathParts.length - 1] === "roles" ? "roles" : "members";

    const [activeTab, setActiveTab] = useState(initialTab);
    const { toast, showToast } = useToast(3000);
    
    // Table states
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'joinedDate', direction: 'desc' });
    const [activeDropdown, setActiveDropdown] = useState(null);
    const itemsPerPage = 10;

    // Sync activeTab state when URL changes
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const currentTab = pathParts[pathParts.length - 1] === "roles" ? "roles" : "members";
        setActiveTab(currentTab);
    }, [location.pathname]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleTabChange = (tabId) => {
        navigate(`/admin/${tabId}`);
    };

    const tabs = [
        { id: "members", label: "Members", icon: Users },
        { id: "roles", label: "User roles", icon: Briefcase }
    ];

    const name = user ? `${user.firstName} ${user.lastName}` : "";
    const email = user?.email || "";

    const [members, setMembers] = useState(() => [
        { id: '1', name: name, email: email, employeeId: user?.employeeId || "EMP001", role: selectedRoleName || "Owner", warehouse: "Central Hub Alpha", status: "Active", joinedDate: "2026-06-01", avatar: user?.ProfileImage || avatarImg, initials: "", bg: "" },
        { id: '2', name: "Sarah Connor", email: "s.connor@haatza.com", employeeId: "EMP002", role: "Administrator", warehouse: "Central Hub Alpha", status: "Active", joinedDate: "2026-04-15", avatar: "", initials: "SC", bg: "text-bg-pink" },
        { id: '3', name: "Alex Jackson", email: "alex.j@haatza.com", employeeId: "EMP003", role: "Developer", warehouse: "Tech Center", status: "Active", joinedDate: "2026-05-10", avatar: "", initials: "AJ", bg: "text-bg-blue" },
        { id: '4', name: "Michael Chen", email: "m.chen@haatza.com", employeeId: "EMP004", role: "Viewer", warehouse: "Westside Storage", status: "Inactive", joinedDate: "2025-11-20", avatar: "", initials: "MC", bg: "text-bg-yellow" },
        { id: '5', name: "Emma Watson", email: "emma.w@haatza.com", employeeId: "EMP005", role: "Manager", warehouse: "Central Hub Alpha", status: "Active", joinedDate: "2026-01-05", avatar: "", initials: "EW", bg: "text-bg-green" },
        { id: '6', name: "David Kim", email: "d.kim@haatza.com", employeeId: "EMP006", role: "Developer", warehouse: "Tech Center", status: "Pending", joinedDate: "2026-06-03", avatar: "", initials: "DK", bg: "text-bg-purple" },
        { id: '7', name: "Sophia Martinez", email: "s.martinez@haatza.com", employeeId: "EMP007", role: "Administrator", warehouse: "Eastside Storage", status: "Suspended", joinedDate: "2025-08-14", avatar: "", initials: "SM", bg: "text-bg-orange" },
        { id: '8', name: "James Wilson", email: "j.wilson@haatza.com", employeeId: "EMP008", role: "Viewer", warehouse: "Westside Storage", status: "Active", joinedDate: "2026-02-28", avatar: "", initials: "JW", bg: "text-bg-blue" },
        { id: '9', name: "Olivia Taylor", email: "o.taylor@haatza.com", employeeId: "EMP009", role: "Manager", warehouse: "North Facility", status: "Active", joinedDate: "2025-12-10", avatar: "", initials: "OT", bg: "text-bg-pink" },
        { id: '10', name: "Liam Brown", email: "l.brown@haatza.com", employeeId: "EMP010", role: "Developer", warehouse: "Tech Center", status: "Active", joinedDate: "2026-03-22", avatar: "", initials: "LB", bg: "text-bg-yellow" },
        { id: '11', name: "Ava Davis", email: "a.davis@haatza.com", employeeId: "EMP011", role: "Viewer", warehouse: "Central Hub Alpha", status: "Inactive", joinedDate: "2025-09-05", avatar: "", initials: "AD", bg: "text-bg-green" },
        { id: '12', name: "Noah Garcia", email: "n.garcia@haatza.com", employeeId: "EMP012", role: "Administrator", warehouse: "South Facility", status: "Pending", joinedDate: "2026-05-25", avatar: "", initials: "NG", bg: "text-bg-purple" }
    ]);

    // Modal & Form States
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [newMemberName, setNewMemberName] = useState("");
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newMemberPhone, setNewMemberPhone] = useState("");
    const [newMemberEmpId, setNewMemberEmpId] = useState("");
    const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [accountStatus, setAccountStatus] = useState("ACTIVE");
    const [newMemberDept, setNewMemberDept] = useState("");
    const [newMemberAccessLevel, setNewMemberAccessLevel] = useState("Standard");
    const [newMemberManager, setNewMemberManager] = useState("");
    
    const [fetchedRoles, setFetchedRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [roleErrorText, setRoleErrorText] = useState("");
    
    const [permissionsList, setPermissionsList] = useState([]);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [isCreatingMember, setIsCreatingMember] = useState(false);
    const [isEditingPermissions, setIsEditingPermissions] = useState(false);
    const [customAccessiblePages, setCustomAccessiblePages] = useState([]);

    // Extract unique warehouses dynamically from current user's warehouseRoles context (from login response)
    const uniqueWarehouses = useMemo(() => {
        if (!warehouseRoles) return [];
        const seen = new Set();
        const list = [];
        for (const item of warehouseRoles) {
            if (item.warehouseId && !seen.has(item.warehouseId)) {
                seen.add(item.warehouseId);
                list.push({
                    warehouseId: item.warehouseId,
                    warehouseName: item.warehouseName
                });
            }
        }
        return list;
    }, [warehouseRoles]);

    // Fetch roles dynamically when a warehouse is selected
    useEffect(() => {
        if (!selectedWarehouseId) {
            setFetchedRoles([]);
            setSelectedRoleId(null);
            setRoleErrorText("");
            return;
        }
        
        setRolesLoading(true);
        setSelectedRoleId(null);
        setFetchedRoles([]);
        setRoleErrorText("");
        
        authService.getWarehouseRoles(selectedWarehouseId)
            .then(res => {
                if (res.status === "success" && res.message && Array.isArray(res.message.roles) && res.message.roles.length > 0) {
                    setFetchedRoles(res.message.roles);
                } else {
                    const fallback = warehouseRoles.filter(r => r.warehouseId === selectedWarehouseId);
                    if (fallback.length > 0) {
                        setFetchedRoles(fallback);
                    } else {
                        setFetchedRoles([]);
                        setSelectedRoleId(null);
                        setRoleErrorText("No roles available for selected warehouse");
                    }
                }
            })
            .catch(err => {
                console.error("Failed to load roles:", err);
                const fallback = warehouseRoles.filter(r => r.warehouseId === selectedWarehouseId);
                if (fallback.length > 0) {
                    setFetchedRoles(fallback);
                } else {
                    setFetchedRoles([]);
                    setSelectedRoleId(null);
                    setRoleErrorText("No roles available for selected warehouse");
                }
            })
            .finally(() => {
                setRolesLoading(false);
            });
    }, [selectedWarehouseId, warehouseRoles]);

    // Fetch permissions dynamically when a role is selected
    useEffect(() => {
        if (!selectedWarehouseId || !selectedRoleId || fetchedRoles.length === 0) {
            setPermissionsList([]);
            setCustomAccessiblePages([]);
            return;
        }
        
        setPermissionsLoading(true);
        setPermissionsList([]);
        setCustomAccessiblePages([]);
        
        authService.getRolePermissions(selectedWarehouseId, selectedRoleId)
            .then(res => {
                if (res.status === "success" && res.message && Array.isArray(res.message.accessiblePages)) {
                    // Get only pages/modules the user can view
                    const activeModules = res.message.accessiblePages
                        .filter(page => page.canView)
                        .map(page => page.pageName || page.pageId);
                    setPermissionsList(activeModules);
                    setCustomAccessiblePages(res.message.accessiblePages);
                } else {
                    setPermissionsList([]);
                    setCustomAccessiblePages([]);
                }
            })
            .catch(err => {
                console.error("Failed to load permissions:", err);
                setPermissionsList([]);
                setCustomAccessiblePages([]);
            })
            .finally(() => {
                setPermissionsLoading(false);
            });
    }, [selectedWarehouseId, selectedRoleId, fetchedRoles]);

    const closeAndResetModal = () => {
        setIsAddMemberModalOpen(false);
        setNewMemberName("");
        setNewMemberEmail("");
        setNewMemberPhone("");
        setNewMemberEmpId("");
        setSelectedWarehouseId("");
        setSelectedRoleId(null);
        setAccountStatus("ACTIVE");
        setNewMemberDept("");
        setNewMemberAccessLevel("Standard");
        setNewMemberManager("");
        setFetchedRoles([]);
        setPermissionsList([]);
        setRoleErrorText("");
        setIsEditingPermissions(false);
        setCustomAccessiblePages([]);
    };

    const handleAddMemberToLocalList = (payload) => {
        const selectedWh = uniqueWarehouses.find(wh => wh.warehouseId === payload.warehouseId);
        const selectedRl = fetchedRoles.find(role => role.roleId === payload.roleId);
        
        const newMember = {
            id: `EMP-${Date.now()}`,
            name: payload.fullName,
            email: payload.email,
            employeeId: newMemberEmpId.trim() || `EMP-${Math.floor(100000 + Math.random() * 900000)}`,
            role: selectedRl ? selectedRl.roleName : "Member",
            warehouse: selectedWh ? selectedWh.warehouseName : "Warehouse",
            status: payload.status === "ACTIVE" ? "Active" : "Pending",
            joinedDate: new Date().toISOString().split('T')[0],
            avatar: "",
            initials: payload.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            bg: ["text-bg-pink", "text-bg-blue", "text-bg-yellow", "text-bg-green", "text-bg-purple", "text-bg-orange"][Math.floor(Math.random() * 6)],
            accessiblePages: payload.accessiblePages
        };
        
        setMembers(prev => [newMember, ...prev]);
    };

    const handleCreateMember = async (e) => {
        e.preventDefault();
        if (!newMemberName.trim() || !newMemberEmail.trim() || !selectedWarehouseId || !selectedRoleId) {
            return;
        }
        
        setIsCreatingMember(true);
        
        const payload = {
            fullName: newMemberName.trim(),
            email: newMemberEmail.trim(),
            phoneNumber: newMemberPhone.trim(),
            warehouseId: selectedWarehouseId,
            roleId: selectedRoleId,
            status: accountStatus === "ACTIVE" ? "ACTIVE" : "PENDING",
            department: newMemberDept,
            accessLevel: newMemberAccessLevel,
            reportingManager: newMemberManager,
            accessiblePages: customAccessiblePages
        };
        
        try {
            const res = await authService.createMember(payload);
            if (res.status === "success") {
                showToast?.("Team member created successfully.");
                handleAddMemberToLocalList(payload);
                closeAndResetModal();
            } else {
                showToast?.(res.message || "Failed to create team member.");
            }
        } catch (error) {
            console.error("Failed to create member:", error);
            if (!error.response || error.response.status === 404) {
                // Fallback local simulation for prototype (handles 404 or CORS/Network errors)
                showToast?.("Member created successfully (Local Simulation).");
                handleAddMemberToLocalList(payload);
                closeAndResetModal();
            } else {
                showToast?.(error.response?.data?.message || "Failed to create member. Please try again.");
            }
        } finally {
            setIsCreatingMember(false);
        }
    };

    // Filter logic
    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const searchLower = searchTerm.toLowerCase();
            return member.name.toLowerCase().includes(searchLower) ||
                   member.email.toLowerCase().includes(searchLower) ||
                   member.employeeId.toLowerCase().includes(searchLower) ||
                   member.role.toLowerCase().includes(searchLower) ||
                   member.warehouse.toLowerCase().includes(searchLower);
        });
    }, [searchTerm, members]);

    // Sort logic
    const sortedMembers = useMemo(() => {
        let sortableItems = [...filteredMembers];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredMembers, sortConfig]);

    // Pagination logic
    const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);
    const paginatedMembers = sortedMembers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const toggleDropdown = (e, id) => {
        e.stopPropagation();
        setActiveDropdown(activeDropdown === id ? null : id);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Active': return 'status-active';
            case 'Inactive': return 'status-inactive';
            case 'Pending': return 'status-pending';
            case 'Suspended': return 'status-suspended';
            default: return 'status-inactive';
        }
    };

    const renderActiveContent = () => {
        if (activeTab === "members") {
            return (
                <div className="tab-panel-content fade-in" style={{ marginTop: '0', padding: 0 }}>
                    {/* Compact Action Bar */}
                    <div className="table-action-bar">
                        <div className="search-input-wrapper table-search">
                            <Search size={16} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search by name, email, employee ID..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset to page 1 on search
                                }}
                                className="member-search-input"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="search-clear-btn" aria-label="Clear search">✕</button>
                            )}
                        </div>
                        <div className="table-action-buttons">
                            <button className="btn-secondary-action">
                                <Upload size={14} />
                                <span>Import</span>
                            </button>
                            <button className="btn-secondary-action">
                                <Download size={14} />
                                <span>Export</span>
                            </button>
                            <button className="btn-primary-action" onClick={() => setIsAddMemberModalOpen(true)}>
                                <Plus size={14} />
                                <span>Add Member</span>
                            </button>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="enterprise-table-container">
                        {paginatedMembers.length > 0 ? (
                            <table className="enterprise-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}></th>
                                        <th onClick={() => handleSort('name')} className="sortable-header">
                                            Employee Name <ArrowUpDown size={12} className="sort-icon" />
                                        </th>
                                        <th onClick={() => handleSort('employeeId')} className="sortable-header">
                                            Employee ID <ArrowUpDown size={12} className="sort-icon" />
                                        </th>
                                        <th onClick={() => handleSort('role')} className="sortable-header">
                                            Role <ArrowUpDown size={12} className="sort-icon" />
                                        </th>
                                        <th onClick={() => handleSort('warehouse')} className="sortable-header">
                                            Warehouse <ArrowUpDown size={12} className="sort-icon" />
                                        </th>
                                        <th onClick={() => handleSort('status')} className="sortable-header">
                                            Status <ArrowUpDown size={12} className="sort-icon" />
                                        </th>
                                        <th onClick={() => handleSort('joinedDate')} className="sortable-header">
                                            Joined Date <ArrowUpDown size={12} className="sort-icon" />
                                        </th>
                                        <th style={{ width: '40px', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedMembers.map(member => (
                                        <tr key={member.id} className="table-row">
                                            <td className="avatar-cell">
                                                {member.avatar ? (
                                                    <img src={member.avatar} alt={`${member.name}`} className="table-avatar" />
                                                ) : (
                                                    <div className={`table-avatar-placeholder ${member.bg}`}>{member.initials}</div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="table-primary-text">{member.name}</div>
                                                <div className="table-secondary-text">{member.email}</div>
                                            </td>
                                            <td className="table-text">{member.employeeId}</td>
                                            <td className="table-text">{member.role}</td>
                                            <td className="table-text">{member.warehouse}</td>
                                            <td>
                                                <span className={`table-status-chip ${getStatusColor(member.status)}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="table-secondary-text">{member.joinedDate}</td>
                                            <td className="action-cell">
                                                <div className="dropdown-wrapper">
                                                    <button className="btn-row-action" onClick={(e) => toggleDropdown(e, member.id)}>
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {activeDropdown === member.id && (
                                                        <div className="row-action-menu">
                                                            <button onClick={() => {}}>View Member</button>
                                                            <button onClick={() => {}}>Edit Member</button>
                                                            <button onClick={() => {}}>Change Role</button>
                                                            <button onClick={() => {}}>Change Warehouse</button>
                                                            <div className="menu-divider"></div>
                                                            <button onClick={() => {}}>Deactivate</button>
                                                            <button className="text-danger" onClick={() => {}}>Delete</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="table-empty-state">
                                <Search size={40} className="empty-icon" />
                                <h4>No matching team members found.</h4>
                                <p>Try adjusting your search term or filters.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="table-pagination">
                            <span className="pagination-info">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedMembers.length)} of {sortedMembers.length} entries
                            </span>
                            <div className="pagination-controls">
                                <button 
                                    className="btn-pagination" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    <ChevronLeft size={14} />
                                    <span>Prev</span>
                                </button>
                                <div className="pagination-pages">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button 
                                            key={i} 
                                            className={`btn-page-number ${currentPage === i + 1 ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    className="btn-pagination"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    <span>Next</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        } else if (activeTab === "roles") {
            return <div style={{ marginTop: '0' }}><UserRolesSection showToast={showToast} /></div>;
        }
        return null;
    };

    const selectedWarehouse = uniqueWarehouses.find(wh => wh.warehouseId === selectedWarehouseId);
    const selectedRoleObj = fetchedRoles.find(role => role.roleId === selectedRoleId);
    
    const displayWarehouseName = selectedWarehouse ? selectedWarehouse.warehouseName : "";
    const displayRoleName = selectedRoleObj ? selectedRoleObj.roleName : "";

    return (
        <div className="settings-page-wrapper admin-layout">
            <style>{`
                .admin-layout {
                    padding-top: 0;
                }
                
                .admin-page-container {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    height: 100%;
                    background: #ffffff;
                    overflow: hidden;
                }
                
                .admin-page-header {
                    background: #ffffff;
                    padding: 24px 32px 0 32px;
                    flex-shrink: 0;
                }
                
                .admin-page-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                
                .admin-tabs-container {
                    display: flex;
                    gap: 8px;
                    margin-top: 16px;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 12px;
                }
                
                .admin-tab-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 40px;
                    padding: 12px 20px;
                    border-radius: 10px;
                    font-family: inherit;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                }
                
                /* Active Tab: Blue background, White text */
                .admin-tab-btn.active {
                    background-color: #2563eb;
                    color: #ffffff;
                    font-weight: 600;
                }
                
                /* Inactive Tab: Transparent background, Dark text */
                .admin-tab-btn:not(.active) {
                    background-color: transparent;
                    color: #334155;
                }
                
                .admin-tab-btn:not(.active):hover {
                    background-color: #f1f5f9;
                    color: #0f172a;
                }
                
                .admin-content-area {
                    flex: 1;
                    padding: 32px 40px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    background: #ffffff;
                }

                
                /* Action Bar */
                .table-action-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    gap: 16px;
                }
                .search-input-wrapper {
                    position: relative;
                }
                .table-search input {
                    width: 320px;
                }
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }
                .member-search-input {
                    padding-left: 36px;
                    padding-right: 30px;
                    height: 38px;
                    border-radius: 8px;
                    border: 1px solid #cbd5e1;
                    font-size: 14px;
                    color: #334155;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    outline: none;
                }
                .member-search-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                .search-clear-btn {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                }
                .search-clear-btn:hover {
                    background: #f1f5f9;
                    color: #64748b;
                }
                .table-action-buttons {
                    display: flex;
                    gap: 12px;
                }
                .btn-secondary-action {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    height: 38px;
                    padding: 0 14px;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    color: #475569;
                    font-size: 14px;
                    font-weight: 500;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-secondary-action:hover {
                    background: #f8fafc;
                    color: #0f172a;
                    border-color: #94a3b8;
                }
                .btn-primary-action {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    height: 38px;
                    padding: 0 16px;
                    background: #2563eb;
                    border: 1px solid #2563eb;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 500;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-primary-action:hover {
                    background: #1d4ed8;
                    border-color: #1d4ed8;
                }

                /* Enterprise Table */
                .enterprise-table-container {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    overflow-x: auto;
                    overflow-y: visible;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
                }
                .enterprise-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    min-width: 900px; /* Prevents columns from squishing and enables horizontal scroll */
                }
                .enterprise-table th {
                    background: #f8fafc;
                    padding: 12px 16px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid #e2e8f0;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    user-select: none;
                }
                .sortable-header {
                    cursor: pointer;
                }
                .sortable-header:hover {
                    color: #0f172a;
                }
                .sort-icon {
                    margin-left: 4px;
                    vertical-align: middle;
                    color: #cbd5e1;
                }
                .sortable-header:hover .sort-icon {
                    color: #94a3b8;
                }
                
                .enterprise-table tbody tr {
                    border-bottom: 1px solid #f1f5f9;
                    transition: background 0.15s;
                }
                .enterprise-table tbody tr:last-child {
                    border-bottom: none;
                }
                .enterprise-table tbody tr:hover {
                    background: #f8fafc;
                }
                
                .enterprise-table td {
                    padding: 12px 16px;
                    vertical-align: middle;
                }
                .avatar-cell {
                    padding-right: 0 !important;
                }
                .table-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .table-avatar-placeholder {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: #ffffff;
                }
                .table-primary-text {
                    font-size: 14px;
                    font-weight: 500;
                    color: #1e293b;
                }
                .table-secondary-text {
                    font-size: 13px;
                    color: #64748b;
                    margin-top: 2px;
                }
                .table-text {
                    font-size: 14px;
                    color: #334155;
                }
                
                /* Status Chips */
                .table-status-chip {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 10px;
                    border-radius: 9999px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .status-active { background: #dcfce7; color: #166534; }
                .status-inactive { background: #f1f5f9; color: #475569; }
                .status-pending { background: #ffedd5; color: #c2410c; }
                .status-suspended { background: #fee2e2; color: #b91c1c; }

                /* Action Menu */
                .action-cell {
                    text-align: center;
                }
                .dropdown-wrapper {
                    position: relative;
                    display: inline-block;
                }
                .btn-row-action {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .btn-row-action:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                }
                .row-action-menu {
                    position: absolute;
                    right: 0;
                    top: 100%;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                    width: 180px;
                    z-index: 50;
                    padding: 6px 0;
                    display: flex;
                    flex-direction: column;
                }
                .row-action-menu button {
                    background: transparent;
                    border: none;
                    padding: 8px 16px;
                    text-align: left;
                    font-size: 13px;
                    color: #334155;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .row-action-menu button:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }
                .row-action-menu .menu-divider {
                    height: 1px;
                    background: #e2e8f0;
                    margin: 4px 0;
                }
                .row-action-menu button.text-danger {
                    color: #ef4444;
                }
                .row-action-menu button.text-danger:hover {
                    background: #fef2f2;
                }

                /* Empty State */
                .table-empty-state {
                    padding: 80px 20px;
                    text-align: center;
                }
                .table-empty-state .empty-icon {
                    color: #cbd5e1;
                    margin-bottom: 16px;
                }
                .table-empty-state h4 {
                    color: #334155;
                    margin: 0 0 8px 0;
                    font-size: 16px;
                    font-weight: 600;
                }
                .table-empty-state p {
                    color: #64748b;
                    margin: 0;
                    font-size: 14px;
                }

                /* Pagination */
                .table-pagination {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 16px;
                    padding: 0 4px;
                }
                .pagination-info {
                    font-size: 13px;
                    color: #64748b;
                }
                .pagination-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .btn-pagination {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #334155;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-pagination:disabled {
                    background: #f8fafc;
                    color: #94a3b8;
                    border-color: #e2e8f0;
                    cursor: not-allowed;
                }
                .btn-pagination:not(:disabled):hover {
                    background: #f1f5f9;
                    border-color: #94a3b8;
                }
                .pagination-pages {
                    display: flex;
                    gap: 4px;
                }
                .btn-page-number {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: 1px solid transparent;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #475569;
                    cursor: pointer;
                }
                .btn-page-number:hover {
                    background: #f1f5f9;
                }
                .btn-page-number.active {
                    background: #eff6ff;
                    color: #2563eb;
                    border-color: #bfdbfe;
                }

                /* Responsive */
                @media (max-width: 1024px) {
                    .enterprise-table th:nth-child(5),
                    .enterprise-table td:nth-child(5) {
                        display: none; /* Hide Warehouse on tablet */
                    }
                    .enterprise-table th:nth-child(7),
                    .enterprise-table td:nth-child(7) {
                        display: none; /* Hide Joined Date on tablet */
                    }
                }
                
                @media (max-width: 768px) {
                    .table-action-bar {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .table-search {
                        width: 100%;
                    }
                    .table-search input {
                        width: 100%;
                    }
                    .table-action-buttons {
                        width: 100%;
                        overflow-x: auto;
                        padding-bottom: 4px;
                    }
                    .btn-secondary-action, .btn-primary-action {
                        flex: 1;
                        justify-content: center;
                    }
                    
                    /* Convert Table to Cards on Mobile */
                    .enterprise-table, .enterprise-table tbody, .enterprise-table tr, .enterprise-table td {
                        display: block;
                        width: 100%;
                    }
                    .enterprise-table thead {
                        display: none; /* Hide headers completely on mobile */
                    }
                    .enterprise-table tr {
                        border: 1px solid #e2e8f0 !important;
                        border-radius: 8px;
                        margin-bottom: 12px;
                        background: #ffffff;
                        position: relative;
                        padding: 16px;
                    }
                    .enterprise-table td {
                        padding: 4px 0;
                        border: none !important;
                    }
                    .avatar-cell {
                        position: absolute;
                        top: 16px;
                        left: 16px;
                    }
                    .table-avatar, .table-avatar-placeholder {
                        width: 40px;
                        height: 40px;
                    }
                    .enterprise-table td:nth-child(2) {
                        padding-left: 56px;
                        margin-bottom: 12px;
                    }
                    .enterprise-table td:nth-child(3),
                    .enterprise-table td:nth-child(4),
                    .enterprise-table td:nth-child(5),
                    .enterprise-table td:nth-child(6),
                    .enterprise-table td:nth-child(7) {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 13px;
                    }
                    .enterprise-table td:nth-child(3)::before { content: "Employee ID"; color: #64748b; }
                    .enterprise-table td:nth-child(4)::before { content: "Role"; color: #64748b; }
                    .enterprise-table td:nth-child(5)::before { content: "Warehouse"; color: #64748b; }
                    .enterprise-table td:nth-child(6)::before { content: "Status"; color: #64748b; }
                    .enterprise-table td:nth-child(7)::before { content: "Joined Date"; color: #64748b; }
                    
                    .action-cell {
                        position: absolute;
                        top: 16px;
                        right: 8px;
                    }
                    
                    .table-pagination {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .admin-page-header {
                        padding: 16px 20px 0 20px;
                    }
                    
                    .admin-content-area {
                        padding: 16px 20px;
                    }
                }

                /* Add Member Modal Custom Styles */
                .member-modal-section-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: #374151;
                    margin: 20px 0 12px 0;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .member-modal-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                @media (max-width: 640px) {
                    .member-modal-grid {
                        grid-template-columns: 1fr;
                    }
                }
                
                /* Select fields */
                .role-form-field select {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 10px;
                    font-size: 13px;
                    font-family: inherit;
                    color: #111827;
                    box-sizing: border-box;
                    background-color: #ffffff;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .role-form-field select:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
                }
                .role-form-field select:disabled {
                    background-color: #f3f4f6;
                    color: #9ca3af;
                    cursor: not-allowed;
                }
                
                /* Radio Group */
                .status-radio-group {
                    display: flex;
                    gap: 16px;
                    margin-top: 8px;
                }
                .status-radio-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    color: #374151;
                }
                .status-radio-option input {
                    width: 16px;
                    height: 16px;
                    accent-color: #2563eb;
                    cursor: pointer;
                    margin: 0;
                }
                
                /* Permissions Summary Card */
                .permissions-summary-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 16px;
                    margin-top: 20px;
                }
                .permissions-summary-title {
                    font-size: 12px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 12px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .permissions-summary-item {
                    font-size: 13px;
                    color: #475569;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: baseline;
                    gap: 6px;
                }
                .permissions-summary-item strong {
                    color: #0f172a;
                    font-weight: 600;
                    min-width: 100px;
                    display: inline-block;
                }
                .permissions-summary-item span {
                    color: #334155;
                }
                .permissions-access-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-top: 6px;
                }
                .permissions-access-tag {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 10px;
                    background: #eff6ff;
                    color: #1d4ed8;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                }
                .permissions-fallback-text {
                    font-size: 12px;
                    color: #64748b;
                    font-style: italic;
                }

                /* Redesigned Add Employee Modal Styles */
                .admin-layout .role-modal:not(.role-modal--compact) {
                    width: min(760px, 95vw) !important;
                    max-height: 85vh !important;
                    border-radius: 20px !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
                    border: 1px solid rgba(0, 0, 0, 0.05) !important;
                    background: #ffffff !important;
                }
                .admin-layout .role-modal__header {
                    padding: 24px 32px !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    background: #ffffff !important;
                }
                .admin-layout .role-modal__body {
                    padding: 24px 32px 32px !important;
                    background: #ffffff !important;
                }
                .admin-layout .role-modal__footer {
                    padding: 16px 32px !important;
                    border-top: 1px solid #f1f5f9 !important;
                    background: #ffffff !important;
                }
                
                .employee-modal-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .employee-section-card {
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 16px;
                    padding: 24px;
                    transition: border-color 0.2s ease;
                }
                .employee-section-card:hover {
                    border-color: #e2e8f0;
                }
                
                .employee-section-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.75px;
                }
                .employee-section-header svg {
                    color: #2563eb;
                }
                
                .employee-fields-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                @media (max-width: 640px) {
                    .employee-fields-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                }
                
                .field-full-width {
                    grid-column: span 2;
                }
                @media (max-width: 640px) {
                    .field-full-width {
                        grid-column: span 1;
                    }
                }
                
                .employee-form-field {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .employee-form-field label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                }
                
                .employee-form-field input[type="text"],
                .employee-form-field input[type="email"],
                .employee-form-field input[type="tel"],
                .employee-form-field select {
                    width: 100%;
                    height: 48px;
                    padding: 0 16px;
                    border: 1px solid #cbd5e1;
                    border-radius: 10px;
                    font-size: 14px;
                    font-family: inherit;
                    color: #1e293b;
                    background-color: #ffffff;
                    box-sizing: border-box;
                    outline: none;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .employee-form-field input::placeholder {
                    color: #94a3b8;
                    font-weight: 400;
                }
                
                .employee-form-field input:focus,
                .employee-form-field select:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
                }
                
                .employee-form-field select:disabled {
                    background-color: #f1f5f9;
                    color: #94a3b8;
                    cursor: not-allowed;
                    border-color: #e2e8f0;
                }
                
                /* Radio Buttons for Status option styling */
                .employee-status-container {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    height: 48px;
                }
                .employee-status-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #334155;
                    font-weight: 500;
                    user-select: none;
                }
                .employee-status-option input {
                    width: 18px;
                    height: 18px;
                    accent-color: #2563eb;
                    cursor: pointer;
                }
                
                /* Header layout and avatar */
                .employee-avatar-placeholder {
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
                    transition: transform 0.2s ease;
                }
                .employee-avatar-placeholder:hover {
                    transform: scale(1.05);
                }
                
                /* Close Button Alignment */
                .admin-layout .role-modal__close {
                    background: #f8fafc !important;
                    border: 1px solid #f1f5f9 !important;
                    color: #64748b !important;
                }
                .admin-layout .role-modal__close:hover {
                    background: #f1f5f9 !important;
                    color: #0f172a !important;
                }

                .add-employee-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    width: 100%;
                }
                .add-employee-modal-footer .role-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .add-employee-modal-footer .role-btn--ghost {
                    height: 48px;
                    padding: 0 20px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                }
                .add-employee-modal-footer .role-btn--ghost:hover:not(:disabled) {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    color: #0f172a;
                }
                .add-employee-modal-footer .role-btn--primary {
                    height: 48px;
                    padding: 0 24px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #ffffff;
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    border: none;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                }
                .add-employee-modal-footer .role-btn--primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
                }
                .add-employee-modal-footer .role-btn--primary:active:not(:disabled) {
                    transform: translateY(0);
                }
                .add-employee-modal-footer .role-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                    box-shadow: none !important;
                }
            `}</style>
            
            {/* Accessible Toast Notification */}
            {toast && (
                <div
                    className="orders-toast slide-in-top"
                    role="alert"
                    aria-live="polite"
                    style={{ position: "fixed", top: 20, right: 24, zIndex: 2000 }}
                >
                    <CheckCircle size={15} className="toast-icon" />
                    <span>{toast}</span>
                </div>
            )}

            {/* Full-width container with top tabs */}
            <div className="admin-page-container">
                {/* Top Header Block */}
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Admin</h1>
                    <div className="admin-tabs-container">
                        {tabs.map((tab) => {
                            return (
                                <button
                                    key={tab.id}
                                    className={`admin-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => handleTabChange(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Pane */}
                <section className="admin-content-area">
                    {renderActiveContent()}
                </section>
            </div>

            {/* Add Member Modal */}
            <Modal
                isOpen={isAddMemberModalOpen}
                onClose={closeAndResetModal}
                ariaLabelledBy="add-member-title"
                header={
                    <div className="add-employee-header-content" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="employee-avatar-placeholder" style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Users size={22} />
                        </div>
                        <div>
                            <h2 id="add-member-title" className="role-edit-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Add Employee</h2>
                            <p className="role-edit-modal-subtitle" style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>Create a new warehouse team member</p>
                        </div>
                    </div>
                }
                footer={
                    <div className="add-employee-modal-footer">
                        <button type="button" className="role-btn role-btn--ghost" onClick={closeAndResetModal} disabled={isCreatingMember}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="add-member-form"
                            className="role-btn role-btn--primary"
                            disabled={!newMemberName.trim() || !newMemberEmail.trim() || !selectedWarehouseId || !selectedRoleId || isCreatingMember || fetchedRoles.length === 0 || !!roleErrorText}
                        >
                            {isCreatingMember ? "Creating..." : "Create Employee"}
                        </button>
                    </div>
                }
            >
                <form id="add-member-form" onSubmit={handleCreateMember} className="employee-modal-sections">
                    {/* Section 1: Personal Information */}
                    <div className="employee-section-card">
                        <div className="employee-section-header">
                            <Users size={16} />
                            <span>Personal Information</span>
                        </div>
                        <div className="employee-fields-grid">
                            <div className="employee-form-field field-full-width">
                                <label htmlFor="new-member-name">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    id="new-member-name"
                                    type="text"
                                    required
                                    placeholder="e.g. John Doe"
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                />
                            </div>
                            
                            <div className="employee-form-field">
                                <label htmlFor="new-member-email">Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    id="new-member-email"
                                    type="email"
                                    required
                                    placeholder="e.g. john.doe@haatza.com"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                />
                            </div>

                            <div className="employee-form-field">
                                <label htmlFor="new-member-phone">Phone Number</label>
                                <input
                                    id="new-member-phone"
                                    type="tel"
                                    placeholder="e.g. +91 9876543210"
                                    value={newMemberPhone}
                                    onChange={(e) => setNewMemberPhone(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Employment Details */}
                    <div className="employee-section-card">
                        <div className="employee-section-header">
                            <Briefcase size={16} />
                            <span>Employment Details</span>
                        </div>
                        <div className="employee-fields-grid">
                            <div className="employee-form-field">
                                <label htmlFor="new-member-empid">Employee ID</label>
                                <input
                                    id="new-member-empid"
                                    type="text"
                                    placeholder="e.g. EMP003"
                                    value={newMemberEmpId}
                                    onChange={(e) => setNewMemberEmpId(e.target.value)}
                                />
                            </div>

                            <div className="employee-form-field">
                                <label htmlFor="new-member-dept">Department</label>
                                <select
                                    id="new-member-dept"
                                    value={newMemberDept}
                                    onChange={(e) => setNewMemberDept(e.target.value)}
                                >
                                    <option value="">&lt;Select Department&gt;</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Logistics">Logistics</option>
                                    <option value="Inventory">Inventory</option>
                                    <option value="Administration">Administration</option>
                                    <option value="Shipping & Receiving">Shipping & Receiving</option>
                                </select>
                            </div>

                            <div className="employee-form-field">
                                <label htmlFor="new-member-warehouse">Warehouse <span style={{ color: '#ef4444' }}>*</span></label>
                                <select
                                    id="new-member-warehouse"
                                    required
                                    value={selectedWarehouseId}
                                    onChange={(e) => {
                                        setSelectedWarehouseId(e.target.value);
                                        setSelectedRoleId(null);
                                    }}
                                >
                                    <option value="">&lt;Select Warehouse&gt;</option>
                                    {uniqueWarehouses.map(wh => (
                                        <option key={wh.warehouseId} value={wh.warehouseId}>
                                            {wh.warehouseName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedWarehouseId && (
                                <div className="employee-form-field">
                                    <label htmlFor="new-member-role">Role <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select
                                        id="new-member-role"
                                        required
                                        disabled={rolesLoading || fetchedRoles.length === 0}
                                        value={selectedRoleId || ""}
                                        onChange={(e) => setSelectedRoleId(e.target.value)}
                                    >
                                        {rolesLoading ? (
                                            <option value="">Loading roles...</option>
                                        ) : fetchedRoles.length === 0 ? (
                                            <option value="">No roles available</option>
                                        ) : (
                                            <>
                                                <option value="">&lt;Select Role&gt;</option>
                                                {fetchedRoles.map(role => (
                                                    <option key={role.roleId} value={role.roleId}>
                                                        {role.roleName}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                    {rolesLoading && <span className="setup-spinner" style={{ marginTop: '4px', width: '16px', height: '16px', border: '2px solid #2563eb', borderTopColor: 'transparent' }}></span>}
                                    {roleErrorText && (
                                        <span className="role-error-helper" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                                            {roleErrorText}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="employee-form-field">
                                <label>Account Status</label>
                                <div className="employee-status-container">
                                    <label className="employee-status-option">
                                        <input
                                            type="radio"
                                            name="accountStatus"
                                            value="ACTIVE"
                                            checked={accountStatus === "ACTIVE"}
                                            onChange={() => setAccountStatus("ACTIVE")}
                                        />
                                        <span>Active</span>
                                    </label>
                                    <label className="employee-status-option">
                                        <input
                                            type="radio"
                                            name="accountStatus"
                                            value="PENDING"
                                            checked={accountStatus === "PENDING"}
                                            onChange={() => setAccountStatus("PENDING")}
                                        />
                                        <span>Pending</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Warehouse Assignment */}
                    <div className="employee-section-card">
                        <div className="employee-section-header">
                            <Warehouse size={16} />
                            <span>Warehouse Assignment</span>
                        </div>
                        <div className="employee-fields-grid">
                            <div className="employee-form-field">
                                <label htmlFor="new-member-access">Access Level</label>
                                <select
                                    id="new-member-access"
                                    value={newMemberAccessLevel}
                                    onChange={(e) => setNewMemberAccessLevel(e.target.value)}
                                >
                                    <option value="Standard">Standard</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <div className="employee-form-field field-full-width">
                                <label htmlFor="new-member-manager">Reporting Manager</label>
                                <select
                                    id="new-member-manager"
                                    value={newMemberManager}
                                    onChange={(e) => setNewMemberManager(e.target.value)}
                                >
                                    <option value="">&lt;Select Reporting Manager&gt;</option>
                                    <option value="Dinesh G K">Dinesh G K (Super Admin)</option>
                                    <option value="Sarah Connor">Sarah Connor (Administrator)</option>
                                    <option value="Sophia Martinez">Sophia Martinez (Administrator)</option>
                                    <option value="Noah Garcia">Noah Garcia (Administrator)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Permissions Summary Card */}
                    <div className="permissions-summary-card" style={{ marginTop: '10px' }}>
                        <div className="permissions-summary-title">Permissions Summary</div>
                        <div className="permissions-summary-item">
                            <strong>Selected Role:</strong>
                            <span>{displayRoleName || "[Role Name]"}</span>
                        </div>
                        <div className="permissions-summary-item">
                            <strong>Warehouse:</strong>
                            <span>{displayWarehouseName || "[Warehouse Name]"}</span>
                        </div>
                        <div className="permissions-summary-item" style={{ flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '8px' }}>
                                <strong>Access:</strong>
                                {selectedRoleId && !permissionsLoading && customAccessiblePages.length > 0 && (
                                    <button
                                        type="button"
                                        className="role-btn role-btn--ghost"
                                        style={{ padding: '4px 12px', fontSize: '12px', height: 'auto', border: '1px solid #d1d5db', cursor: 'pointer' }}
                                        onClick={() => setIsEditingPermissions(!isEditingPermissions)}
                                    >
                                        {isEditingPermissions ? "View Summary" : "Edit Permissions"}
                                    </button>
                                )}
                            </div>

                            {permissionsLoading ? (
                                <span className="setup-spinner" style={{ marginTop: '4px', width: '16px', height: '16px', border: '2px solid #2563eb', borderTopColor: 'transparent' }}></span>
                            ) : isEditingPermissions ? (
                                <div className="custom-permissions-editor" style={{ width: '100%', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f9fafb', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                    {customAccessiblePages.map((page) => (
                                        <div key={page.pageId} style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{page.pageName || page.pageId}</span>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={page.canView}
                                                        onChange={() => {
                                                            setCustomAccessiblePages(prev => prev.map(p => {
                                                                if (p.pageId === page.pageId) {
                                                                    const nextCanView = !p.canView;
                                                                    return {
                                                                        ...p,
                                                                        canView: nextCanView,
                                                                        canCreate: nextCanView ? p.canCreate : false,
                                                                        canEdit: nextCanView ? p.canEdit : false,
                                                                        canDelete: nextCanView ? p.canDelete : false,
                                                                        canApprove: nextCanView ? p.canApprove : false
                                                                    };
                                                                }
                                                                return p;
                                                            }));
                                                        }}
                                                    />
                                                    <span style={{ fontSize: '12px', color: '#4b5563' }}>Enabled</span>
                                                </label>
                                            </div>
                                            {page.canView && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '8px', marginTop: '4px' }}>
                                                    {['canCreate', 'canEdit', 'canDelete', 'canApprove'].map((action) => {
                                                        const label = action === 'canCreate' ? 'Create' :
                                                                      action === 'canEdit' ? 'Edit' :
                                                                      action === 'canDelete' ? 'Delete' : 'Approve';
                                                        const isActive = page[action] || false;
                                                        return (
                                                            <button
                                                                key={action}
                                                                type="button"
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '11px',
                                                                    background: isActive ? '#eff6ff' : '#ffffff',
                                                                    border: isActive ? '1px solid #3b82f6' : '1px solid #d1d5db',
                                                                    padding: '3px 8px',
                                                                    borderRadius: '4px',
                                                                    color: isActive ? '#2563eb' : '#4b5563',
                                                                    transition: 'all 0.15s',
                                                                    fontWeight: isActive ? '600' : 'normal'
                                                                }}
                                                                onClick={() => {
                                                                    setCustomAccessiblePages(prev => prev.map(p => {
                                                                        if (p.pageId === page.pageId) {
                                                                            return { ...p, [action]: !p[action] };
                                                                        }
                                                                        return p;
                                                                    }));
                                                                }}
                                                            >
                                                                {isActive && <Check size={10} strokeWidth={3} />}
                                                                {label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : customAccessiblePages.filter(p => p.canView).length > 0 ? (
                                <div className="permissions-access-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                    {customAccessiblePages.filter(p => p.canView).map((page, index) => {
                                        const actions = [];
                                        if (page.canCreate) actions.push("Create");
                                        if (page.canEdit) actions.push("Edit");
                                        if (page.canDelete) actions.push("Delete");
                                        if (page.canApprove) actions.push("Approve");
                                        const actionStr = actions.length > 0 ? ` (${actions.join(", ")})` : "";
                                        return (
                                            <span key={index} className="permissions-access-tag" style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', color: '#374151' }}>
                                                {page.pageName || page.pageId}{actionStr}
                                            </span>
                                        );
                                    })}
                                </div>
                            ) : (
                                <span className="permissions-fallback-text" style={{ color: '#9ca3af', fontSize: '13px' }}>
                                    Permissions will be assigned based on selected role.
                                </span>
                            )}
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default AdminPage;
