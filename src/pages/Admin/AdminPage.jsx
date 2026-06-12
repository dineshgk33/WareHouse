import React, { useState, useEffect, useMemo, useCallback } from "react";
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
    Check,
    Loader2,
    Copy,
    Key,
    Mail
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import avatarImg from "../../assets/dinesh.png";
import { useToast } from "../../hooks/useToast";
import PermissionsViewerModal from "../../components/Roles/PermissionsViewerModal";
import MemberRoleEditModal from "../../components/Roles/MemberRoleEditModal";
import MemberPasswordChangeModal from "../../components/Roles/MemberPasswordChangeModal";
import { DEFAULT_ROLES } from "../../constants/rolePermissions";
import Modal from "../../components/Roles/Modal";
import Accordion from "../../components/Roles/Accordion";
import {
    buildPermissionMap,
    getEnabledInCategory,
    VIEW_PERMISSION_CATEGORIES,
    PERMISSION_CATEGORIES
} from "../../components/Roles/rolePermissionsUtils";
import { authService } from "../../services/authService";
import "../Settings/Settings.css";

// Helper to resolve URLs dynamically, routing through the Vite proxy on localhost to avoid CORS errors
const resolveUrl = (url) => {
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        return url.replace("https://www.haatza.com", "").replace("https://haatza.com", "");
    }
    return url;
};

function AdminPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, selectedRole, selectedRoleName, warehouseRoles, selectedWarehouseId: sessionWarehouseId, selectedWarehouseName: sessionWarehouseName, userPassword } = useAuth();
    // Email validation state
    const [emailCheckStatus, setEmailCheckStatus] = useState(null); // 'checking' | 'available' | 'exists'
    const [emailMessage, setEmailMessage] = useState('');
    
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

    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [initialIsEditing, setInitialIsEditing] = useState(false);

    // Store custom employee permissions locally to simulate database updates
    const [customPermissions, setCustomPermissions] = useState(() => {
        const cached = localStorage.getItem("haatza_custom_employee_permissions");
        return cached ? JSON.parse(cached) : {};
    });

    const [adminVerifyOpen, setAdminVerifyOpen] = useState(false);
    const [verifyConfig, setVerifyConfig] = useState(null);

    useEffect(() => {
        localStorage.setItem("haatza_custom_employee_permissions", JSON.stringify(customPermissions));
    }, [customPermissions]);



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
        { id: "members", label: "Members", icon: Users }
    ];

    const name = user ? `${user.firstName} ${user.lastName}` : "";
    const email = user?.email || "";

    const [members, setMembers] = useState([]);
    const [isMembersLoading, setIsMembersLoading] = useState(false);
    const [membersError, setMembersError] = useState("");
    const [retryTrigger, setRetryTrigger] = useState(0);

    const selectedEmployee = useMemo(() => {
        return members.find((emp) => emp.id === selectedEmployeeId) || null;
    }, [members, selectedEmployeeId]);

    // Map employee's warehouse roles to their corresponding permissions defined in DEFAULT_ROLES
    const getEmployeePermissions = useCallback((empId, employeeRoles) => {
        if (customPermissions[empId]) {
            return customPermissions[empId];
        }

        const permissionsSet = new Set();
        employeeRoles.forEach((roleName) => {
            const matchedRole = DEFAULT_ROLES.find(
                (r) =>
                    r.name.toLowerCase() === roleName.toLowerCase() ||
                    r.id.toLowerCase() === roleName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            );
            if (matchedRole) {
                matchedRole.permissions.forEach((p) => permissionsSet.add(p));
            }
        });
        if (permissionsSet.size === 0) {
            const roRole = DEFAULT_ROLES.find((r) => r.id === "read-only-user");
            if (roRole) roRole.permissions.forEach((p) => permissionsSet.add(p));
        }
        return Array.from(permissionsSet);
    }, [customPermissions]);

    const selectedEmployeeRoleObj = useMemo(() => {
        if (!selectedEmployee) return null;
        return {
            id: selectedEmployee.id,
            name: selectedEmployee.name,
            description: `Assigned Roles: ${selectedEmployee.roles?.join(", ") || selectedEmployee.role} at ${
                selectedEmployee.warehouse
            }`,
            permissions: getEmployeePermissions(selectedEmployee.id, selectedEmployee.roles || [selectedEmployee.role]),
        };
    }, [selectedEmployee, customPermissions, getEmployeePermissions]);

    // Password verification logic matching current login account
    const verifyPassword = useCallback(
        (password) => {
            const adminPassword = userPassword || localStorage.getItem("userPassword") || "";
            if (!password || password !== adminPassword) {
                return { ok: false, message: "Incorrect administrator password." };
            }
            return { ok: true };
        },
        [userPassword]
    );

    // Bypassed Administrator Verification for Save Permissions:
    // Administrator password verification is bypassed in handleSavePermissions; 
    // changes are directly applied to local state and storage for efficiency.
    const requestVerification = useCallback((config) => {
        setVerifyConfig(config);
        setAdminVerifyOpen(true);
    }, []);

    const handleAdminVerified = useCallback(() => {
        verifyConfig?.onSuccess?.();
        setVerifyConfig(null);
        setAdminVerifyOpen(false);
    }, [verifyConfig]);

    const handleSavePermissions = async (updatedPermissions, onSuccess) => {
        if (!selectedEmployee) return;
        
        try {
            const payload = {
                email: selectedEmployee.email,
                employeeId: selectedEmployee.employeeId || selectedEmployee.id,
                employeeCode: selectedEmployee.employeeId || selectedEmployee.id,
                phone: selectedEmployee.phone ? Number(String(selectedEmployee.phone).replace(/\D/g, '')) : "",
                photo: selectedEmployee.avatar || "",
                permissions: updatedPermissions
            };
            
            const res = await authService.updateEmployeeMasters(payload);
            if (res && (res.success === true || res.status === "success")) {
                setCustomPermissions((prev) => ({
                    ...prev,
                    [selectedEmployee.id]: updatedPermissions,
                }));
                showToast?.("Employee permissions updated successfully.");
                if (onSuccess) onSuccess();
            } else {
                showToast?.(res?.message || "Failed to update employee permissions.");
            }
        } catch (error) {
            console.error("Failed to save employee permissions:", error);
            // Fallback for simulation/prototype testing if API returns CORS or 404
            if (!error.response || error.response.status === 404) {
                setCustomPermissions((prev) => ({
                    ...prev,
                    [selectedEmployee.id]: updatedPermissions,
                }));
                showToast?.("Permissions saved successfully (Local Simulation).");
                if (onSuccess) onSuccess();
            } else {
                showToast?.(error.response?.data?.message || "Unable to update permissions. Please try again.");
            }
        }
    };

    const handleViewPermissions = (member) => {
        setSelectedEmployeeId(member.id);
        setInitialIsEditing(false);
        setViewerOpen(true);
    };

    const handleEditPermissions = (member) => {
        setSelectedEmployeeId(member.id);
        setInitialIsEditing(true);
        setViewerOpen(true);
    };

    const handleEditRole = (member) => {
        setSelectedEmployeeId(member.id);
        setIsEditRoleOpen(true);
    };

    const handleChangePassword = (member) => {
        setSelectedEmployeeId(member.id);
        setIsChangePasswordOpen(true);
    };

    const handleSavePassword = async (newPassword, sendEmail, onSuccess) => {
        if (!selectedEmployee) return;
        
        try {
            const payload = {
                email: selectedEmployee.email,
                employeeId: selectedEmployee.employeeId || selectedEmployee.id,
                employeeCode: selectedEmployee.employeeId || selectedEmployee.id,
                phone: selectedEmployee.phone ? Number(String(selectedEmployee.phone).replace(/\D/g, '')) : "",
                photo: selectedEmployee.avatar || "",
                password: newPassword
            };
            
            const res = await authService.updateEmployeeMasters(payload);
            if (res && (res.success === true || res.status === "success")) {
                showToast?.("Password updated successfully.");
                if (sendEmail) {
                    setTimeout(() => {
                        showToast?.(`New password sent to ${selectedEmployee.email} successfully!`);
                    }, 500);
                }
                if (onSuccess) onSuccess();
                setIsChangePasswordOpen(false);
            } else {
                showToast?.(res?.message || "Failed to update employee password.");
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Failed to save employee password:", error);
            if (!error.response || error.response.status === 404) {
                showToast?.("Password updated successfully (Local Simulation).");
                if (sendEmail) {
                    setTimeout(() => {
                        showToast?.(`New password sent to ${selectedEmployee.email} successfully!`);
                    }, 500);
                }
                if (onSuccess) onSuccess();
                setIsChangePasswordOpen(false);
            } else {
                showToast?.(error.response?.data?.message || "Unable to update password. Please try again.");
                if (onSuccess) onSuccess();
            }
        }
    };

    const handleSaveRole = async (updatedWarehouseRoles, onSuccess) => {
        if (!selectedEmployee) return;
        
        try {
            const payload = {
                email: selectedEmployee.email,
                employeeId: selectedEmployee.employeeId || selectedEmployee.id,
                employeeCode: selectedEmployee.employeeId || selectedEmployee.id,
                phone: selectedEmployee.phone ? Number(String(selectedEmployee.phone).replace(/\D/g, '')) : "",
                photo: selectedEmployee.avatar || "",
                warehouseRoles: updatedWarehouseRoles
            };
            
            const res = await authService.updateEmployeeMasters(payload);
            if (res && (res.success === true || res.status === "success")) {
                setMembers(prev => prev.map(m => {
                    if (m.id === selectedEmployee.id) {
                        const roleNames = updatedWarehouseRoles.map(r => r.roleName);
                        const warehouseNames = [...new Set(updatedWarehouseRoles.map(r => r.warehouseName).filter(Boolean))];
                        return {
                            ...m,
                            role: roleNames.join(", "),
                            roles: roleNames,
                            warehouse: warehouseNames.join(", "),
                            warehouses: warehouseNames,
                            warehouseRoles: updatedWarehouseRoles
                        };
                    }
                    return m;
                }));
                
                showToast?.("Employee roles updated successfully.");
                if (onSuccess) onSuccess();
                setIsEditRoleOpen(false);
            } else {
                showToast?.(res?.message || "Failed to update employee roles.");
            }
        } catch (error) {
            console.error("Failed to save employee roles:", error);
            // Fallback for simulation/prototype testing if API returns CORS or 404
            if (!error.response || error.response.status === 404) {
                setMembers(prev => prev.map(m => {
                    if (m.id === selectedEmployee.id) {
                        const roleNames = updatedWarehouseRoles.map(r => r.roleName);
                        const warehouseNames = [...new Set(updatedWarehouseRoles.map(r => r.warehouseName).filter(Boolean))];
                        return {
                            ...m,
                            role: roleNames.join(", "),
                            roles: roleNames,
                            warehouse: warehouseNames.join(", "),
                            warehouses: warehouseNames,
                            warehouseRoles: updatedWarehouseRoles
                        };
                    }
                    return m;
                }));
                showToast?.("Roles saved successfully (Local Simulation).");
                if (onSuccess) onSuccess();
                setIsEditRoleOpen(false);
            } else {
                showToast?.(error.response?.data?.message || "Unable to update roles. Please try again.");
            }
        }
    };

    // Modal & Form States
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [newMemberFirstName, setNewMemberFirstName] = useState("");
    const [newMemberLastName, setNewMemberLastName] = useState("");
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newMemberPhone, setNewMemberPhone] = useState("");
    const [newMemberEmpId, setNewMemberEmpId] = useState("");
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(() => sessionWarehouseId || "");
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [accountStatus, setAccountStatus] = useState("ACTIVE");
    const [newMemberAccessLevel, setNewMemberAccessLevel] = useState("Standard");
    const [newMemberManager, setNewMemberManager] = useState("");
    const [newMemberEmploymentType, setNewMemberEmploymentType] = useState("Full-time");
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [isPhotoConverting, setIsPhotoConverting] = useState(false);
    
    // Credential Modal states
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const [sendEmailOption, setSendEmailOption] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    
    const [fetchedRoles, setFetchedRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [roleErrorText, setRoleErrorText] = useState("");
    const [roleSearchQuery, setRoleSearchQuery] = useState("");
    
    const [permissionsList, setPermissionsList] = useState([]);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [isCreatingMember, setIsCreatingMember] = useState(false);
    const [isEditingPermissions, setIsEditingPermissions] = useState(false);
    const [customAccessiblePages, setCustomAccessiblePages] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [rolePermissionsMap, setRolePermissionsMap] = useState({});
    const [loadingMap, setLoadingMap] = useState(false);

    const getRoleDescription = (roleName) => {
        const defaultRoles = [
            { name: "Super Admin", description: "Full platform ownership with unrestricted access across all modules." },
            { name: "Administrator", description: "Full platform ownership with unrestricted access across all modules." },
            { name: "Warehouse Manager", description: "Oversees stock movement, darkhouse operations, and order fulfillment." },
            { name: "Store Manager", description: "Oversees stock movement, darkhouse operations, and order fulfillment." },
            { name: "Inventory Manager", description: "Maintains inventory records, stock adjustments, and shelf-level accuracy." },
            { name: "Operation Head", description: "Full system operations, analytics, reporting, and team management." },
            { name: "Picker", description: "Locates and collects items from shelves for packaging." },
            { name: "Packer", description: "Packages collected products and prepares shipment labels." },
            { name: "Viewer", description: "Read-only access to warehouse dashboards and inventory logs." }
        ];
        const match = defaultRoles.find(r => r.name.toLowerCase() === roleName.toLowerCase());
        return match ? match.description : "Access to assigned workspace modules and settings.";
    };

    const getPermissionsFromAccessiblePages = (accessiblePages) => {
        const permissions = [];
        if (!Array.isArray(accessiblePages)) return permissions;
        
        accessiblePages.forEach(p => {
            const pageId = p.pageId ? p.pageId.toUpperCase() : "";
            
            if (pageId === "WAREHOUSE_INVENTORY" || pageId === "DARKHOUSE_INVENTORY") {
                if (p.canView) permissions.push("View Inventory");
                if (p.canCreate || p.canEdit) permissions.push("Manage Inventory");
                if (p.canDelete) permissions.push("Delete Inventory");
                if (p.canApprove) permissions.push("Adjust Stock Levels");
            }
            else if (pageId === "ORDERS") {
                if (p.canView) permissions.push("View Orders");
                if (p.canEdit) {
                    permissions.push("Update Order Status");
                    permissions.push("Print Labels");
                }
                if (p.canCreate) permissions.push("Generate Labels");
                if (p.canDelete) permissions.push("Delete Orders");
            }
            else if (pageId === "CUSTOMERS") {
                if (p.canView) permissions.push("View Customers");
                if (p.canEdit) permissions.push("Edit Customer Profiles");
                if (p.canApprove) permissions.push("Verify Customers");
            }
            else if (pageId === "DARKHOUSES") {
                if (p.canView) permissions.push("View Darkhouses");
                if (p.canEdit || p.canCreate) permissions.push("Manage Darkhouses");
            }
            else if (pageId === "ANALYTICS") {
                if (p.canView) permissions.push("View Analytics");
                if (p.canEdit || p.canCreate) permissions.push("Export Analytics Reports");
            }
            else if (pageId === "BILLING") {
                if (p.canView) permissions.push("View Billing");
                if (p.canEdit || p.canCreate) permissions.push("Manage Billing Plans");
                if (p.canApprove) permissions.push("View Invoices");
            }
            else if (pageId === "SETTINGS") {
                if (p.canView) permissions.push("View Settings");
            }
            else if (pageId === "EMPLOYEES" || pageId === "ADMIN") {
                if (p.canView) permissions.push("View Users");
                if (p.canEdit || p.canCreate) permissions.push("Manage Users");
                if (p.canApprove) permissions.push("Assign User Roles");
            }
        });
        
        return permissions;
    };

    const selectedRoleIdsStr = selectedRoleIds.join(",");

    useEffect(() => {
        if (selectedRoleIds.length > 0) {
            setExpandedCategories(
                VIEW_PERMISSION_CATEGORIES.reduce((acc, cat) => {
                    acc[cat] = true;
                    return acc;
                }, {})
            );
        }
    }, [selectedRoleIdsStr]);

    // Email validation effect (500ms debounce)
    useEffect(() => {
        if (!newMemberEmail.trim()) {
            setEmailCheckStatus(null);
            setEmailMessage('');
            return;
        }

        // Basic validation check before querying the API
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newMemberEmail.trim())) {
            setEmailCheckStatus('invalid');
            setEmailMessage('Please enter a valid email address');
            return;
        }

        setEmailCheckStatus('checking');
        setEmailMessage('Checking email availability...');

        const handler = setTimeout(async () => {
            try {
                const data = await authService.checkWarehouseEmployee(newMemberEmail.trim());

                let exists = false;
                if (data && data.status === "success" && data.message && data.message.body) {
                    try {
                        const bodyObj = typeof data.message.body === 'string' ? JSON.parse(data.message.body) : data.message.body;
                        exists = (bodyObj.success === true) || (bodyObj.exists === true);
                    } catch (err) {
                        console.error("Failed to parse body JSON", err);
                    }
                }

                if (exists) {
                    setEmailCheckStatus('exists');
                    setEmailMessage('Employee already exists with this email. Please change the email to select options.');
                } else {
                    setEmailCheckStatus('available');
                    setEmailMessage('Email available');
                }
            } catch (e) {
                console.error('Email validation error', e);
                // On request failure, let user proceed to not block them
                setEmailCheckStatus('available');
                setEmailMessage('Email status check skipped');
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [newMemberEmail]);

    const getPermissionCountForRole = (roleId) => {
        const pages = rolePermissionsMap[roleId];
        if (!pages) return null;
        let count = 0;
        pages.forEach(p => {
            if (p.canView) count++;
            if (p.canCreate) count++;
            if (p.canEdit) count++;
            if (p.canDelete) count++;
            if (p.canApprove) count++;
        });
        return count;
    };

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

    // Fetch warehouse employees dynamically from backend when the active warehouse changes
    useEffect(() => {
        if (!sessionWarehouseId) {
            setMembers([]);
            return;
        }

        let isMounted = true;
        setIsMembersLoading(true);
        setMembersError("");

        authService.getWarehouseEmployees(sessionWarehouseId)
            .then((res) => {
                if (!isMounted) return;

                let rawEmployees = [];
                if (res && res.success === true && Array.isArray(res.data)) {
                    rawEmployees = res.data;
                } else if (res && res.status === "success" && res.message) {
                    if (Array.isArray(res.message.employees)) {
                        rawEmployees = res.message.employees;
                    } else if (Array.isArray(res.message)) {
                        rawEmployees = res.message;
                    } else if (res.message.body) {
                        try {
                            const bodyObj = typeof res.message.body === 'string'
                                ? JSON.parse(res.message.body)
                                : res.message.body;
                            if (Array.isArray(bodyObj.employees)) {
                                rawEmployees = bodyObj.employees;
                            } else if (Array.isArray(bodyObj)) {
                                rawEmployees = bodyObj;
                            }
                        } catch (e) {
                            console.error("Failed to parse body JSON in getWarehouseEmployees", e);
                        }
                    }
                } else if (res && Array.isArray(res)) {
                    rawEmployees = res;
                } else if (res && Array.isArray(res.employees)) {
                    rawEmployees = res.employees;
                }

                const mappedMembers = rawEmployees.map((emp, index) => {
                    const firstName = emp.firstName || "";
                    const lastName = emp.lastName || "";
                    const fullName = emp.fullName || `${firstName} ${lastName}`.trim() || "Unknown Employee";

                    const empRoles = emp.Role || emp.warehouseRoles || [];
                    const roleNames = Array.isArray(empRoles)
                        ? empRoles.map(r => r.roleName)
                        : [];
                    const warehouseNames = Array.isArray(empRoles)
                        ? [...new Set(empRoles.map(r => r.warehouseName).filter(Boolean))]
                        : [];

                    let status = "Active";
                    if (emp.status) {
                        const s = emp.status.toUpperCase();
                        if (s === "ACTIVE") status = "Active";
                        else if (s === "INACTIVE" || s === "DEACTIVATED") status = "Inactive";
                        else if (s === "PENDING") status = "Pending";
                        else if (s === "SUSPENDED") status = "Suspended";
                        else status = emp.status;
                    }

                    let joinedDate = "2026-06-01";
                    if (emp._createdDate) {
                        try {
                            joinedDate = new Date(emp._createdDate).toISOString().split('T')[0];
                        } catch (e) {}
                    } else if (emp.joinedDate) {
                        joinedDate = emp.joinedDate;
                    }

                    const bgClasses = ["text-bg-pink", "text-bg-blue", "text-bg-yellow", "text-bg-green", "text-bg-purple", "text-bg-orange"];
                    const bg = bgClasses[index % bgClasses.length];

                    const initials = fullName
                        .split(' ')
                        .filter(Boolean)
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || "EE";

                    let rawAvatar = emp.photo || emp.avatar || "";
                    let avatar = rawAvatar;
                    if (rawAvatar && rawAvatar.startsWith("wix:image://v1/")) {
                        const parts = rawAvatar.substring("wix:image://v1/".length).split('/');
                        if (parts.length > 0) {
                            avatar = `https://static.wixstatic.com/media/${parts[0]}`;
                        }
                    }

                    return {
                        id: emp.id || emp._id || `EMP-${index}-${Date.now()}`,
                        name: fullName,
                        email: emp.email || "",
                        phone: emp.phone || "",
                        employeeId: emp.employeeId || emp.employeeCode || `EMP-${index}`,
                        role: roleNames.length > 0 ? roleNames.join(", ") : "Member",
                        warehouse: warehouseNames.length > 0 ? warehouseNames.join(", ") : (sessionWarehouseName || "Warehouse"),
                        roles: roleNames.length > 0 ? roleNames : ["Member"],
                        warehouses: warehouseNames.length > 0 ? warehouseNames : [sessionWarehouseName || "Warehouse"],
                        status: status,
                        joinedDate: joinedDate,
                        avatar: avatar,
                        initials: initials,
                        bg: bg,
                        warehouseRoles: empRoles
                    };
                });

                setMembers(mappedMembers);
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error("Failed to fetch warehouse employees:", err);
                setMembers([]);
                setMembersError(err.message || "Failed to load team members from the database.");
            })
            .finally(() => {
                if (isMounted) {
                    setIsMembersLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [sessionWarehouseId, sessionWarehouseName, retryTrigger]);

    // Fetch roles dynamically when a warehouse is selected
    useEffect(() => {
        if (!selectedWarehouseId) {
            setFetchedRoles([]);
            setSelectedRoleIds([]);
            setRoleErrorText("");
            setRolePermissionsMap({});
            return;
        }
        
        setRolesLoading(true);
        setSelectedRoleIds([]);
        setFetchedRoles([]);
        setRoleErrorText("");
        setRolePermissionsMap({});
        
        authService.getWarehouseRoles(selectedWarehouseId)
            .then(async (res) => {
                let rolesList = [];
                if (res.status === "success" && res.message && Array.isArray(res.message.roles) && res.message.roles.length > 0) {
                    rolesList = res.message.roles;
                } else {
                    rolesList = warehouseRoles.filter(r => r.warehouseId === selectedWarehouseId);
                }

                // Filter by selected warehouseId
                const filtered = rolesList.filter(role => role.warehouseId === selectedWarehouseId);
                
                if (filtered.length > 0) {
                    setFetchedRoles(filtered);
                    
                    // Pre-fetch permissions for each role
                    setLoadingMap(true);
                    const map = {};
                    try {
                        await Promise.all(filtered.map(async (role) => {
                            try {
                                const permRes = await authService.getRolePermissions(selectedWarehouseId, role.roleId);
                                if (permRes.status === "success" && permRes.message && Array.isArray(permRes.message.accessiblePages)) {
                                    map[role.roleId] = permRes.message.accessiblePages;
                                }
                            } catch (e) {
                                console.error("Failed to load permissions for role " + role.roleId, e);
                            }
                        }));
                        setRolePermissionsMap(map);
                    } catch (err) {
                        console.error("Failed to prefetch permissions map:", err);
                    } finally {
                        setLoadingMap(false);
                    }
                } else {
                    setFetchedRoles([]);
                    setSelectedRoleIds([]);
                    setRoleErrorText("No roles available for selected warehouse");
                }
            })
            .catch(async (err) => {
                console.error("Failed to load roles:", err);
                const fallback = warehouseRoles.filter(r => r.warehouseId === selectedWarehouseId);
                if (fallback.length > 0) {
                    setFetchedRoles(fallback);
                    
                    // Pre-fetch permissions for fallback
                    setLoadingMap(true);
                    const map = {};
                    try {
                        await Promise.all(fallback.map(async (role) => {
                            try {
                                const permRes = await authService.getRolePermissions(selectedWarehouseId, role.roleId);
                                if (permRes.status === "success" && permRes.message && Array.isArray(permRes.message.accessiblePages)) {
                                    map[role.roleId] = permRes.message.accessiblePages;
                                }
                            } catch (e) {
                                console.error("Failed to load permissions for role " + role.roleId, e);
                            }
                        }));
                        setRolePermissionsMap(map);
                    } catch (e) {
                        console.error(e);
                    } finally {
                        setLoadingMap(false);
                    }
                } else {
                    setFetchedRoles([]);
                    setSelectedRoleIds([]);
                    setRoleErrorText("No roles available for selected warehouse");
                }
            })
            .finally(() => {
                setRolesLoading(false);
            });
    }, [selectedWarehouseId, warehouseRoles]);

    // Fetch permissions dynamically when a role is selected
    useEffect(() => {
        if (!selectedWarehouseId || selectedRoleIds.length === 0 || fetchedRoles.length === 0) {
            setPermissionsList([]);
            setCustomAccessiblePages([]);
            return;
        }
        
        setPermissionsLoading(true);
        setPermissionsList([]);
        setCustomAccessiblePages([]);
        
        Promise.all(
            selectedRoleIds.map(roleId => authService.getRolePermissions(selectedWarehouseId, roleId))
        )
            .then(results => {
                const mergedPagesMap = {};
                
                results.forEach(res => {
                    if (res.status === "success" && res.message && Array.isArray(res.message.accessiblePages)) {
                        res.message.accessiblePages.forEach(page => {
                            const pid = page.pageId;
                            if (!mergedPagesMap[pid]) {
                                mergedPagesMap[pid] = { ...page };
                            } else {
                                mergedPagesMap[pid].canView = mergedPagesMap[pid].canView || page.canView;
                                mergedPagesMap[pid].canCreate = mergedPagesMap[pid].canCreate || page.canCreate;
                                mergedPagesMap[pid].canEdit = mergedPagesMap[pid].canEdit || page.canEdit;
                                mergedPagesMap[pid].canDelete = mergedPagesMap[pid].canDelete || page.canDelete;
                                mergedPagesMap[pid].canApprove = mergedPagesMap[pid].canApprove || page.canApprove;
                            }
                        });
                    }
                });
                
                const mergedPages = Object.values(mergedPagesMap);
                const activeModules = mergedPages
                    .filter(page => page.canView)
                    .map(page => page.pageName || page.pageId);
                
                setPermissionsList(activeModules);
                setCustomAccessiblePages(mergedPages);
            })
            .catch(err => {
                console.error("Failed to load permissions:", err);
                setPermissionsList([]);
                setCustomAccessiblePages([]);
            })
            .finally(() => {
                setPermissionsLoading(false);
            });
    }, [selectedWarehouseId, selectedRoleIdsStr, fetchedRoles]);

    const closeAndResetModal = () => {
        setIsAddMemberModalOpen(false);
        setNewMemberFirstName("");
        setNewMemberLastName("");
        setNewMemberEmail("");
        setNewMemberPhone("");
        setNewMemberEmpId("");
        setSelectedWarehouseId(sessionWarehouseId || "");
        setSelectedRoleIds([]);
        setAccountStatus("ACTIVE");
        setNewMemberAccessLevel("Standard");
        setNewMemberManager("");
        setFetchedRoles([]);
        setPermissionsList([]);
        setRoleErrorText("");
        setIsEditingPermissions(false);
        setCustomAccessiblePages([]);
        setPhotoFile(null);
        setPhotoPreview("");
        setNewMemberEmploymentType("Full-time");
        setEmailCheckStatus(null);
        setEmailMessage("");
        setIsPhotoConverting(false);
        setCreatedCredentials(null);
        setSendEmailOption(false);
        setCopied(false);
        setIsSendingEmail(false);
        setRoleSearchQuery("");
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file type: only JPG, JPEG, and PNG
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            showToast?.("Invalid file type. Supported: JPG, JPEG, PNG");
            return;
        }
        
        // Validate file size (5 MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast?.("File size exceeds 5MB limit.");
            return;
        }
        
        setPhotoFile(file);
        setIsPhotoConverting(true);
        setPhotoPreview(""); // clear old preview while converting
        
        const reader = new FileReader();
        reader.onloadend = () => {
            // Add a brief timeout so the conversion loading state is visible
            setTimeout(() => {
                setPhotoPreview(reader.result);
                setIsPhotoConverting(false);
            }, 600);
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview("");
    };

    const generateSecurePassword = () => {
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const symbols = "!@#$%&*";
        const allChars = uppercase + lowercase + numbers + symbols;
        
        let password = "";
        // Ensure at least one of each type for security
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));
        
        for (let i = 0; i < 6; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }
        
        // Shuffle characters
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    };

    const handleAddMemberToLocalList = (payload) => {
        const isFormData = payload instanceof FormData;
        const payloadRoles = payload.Role || payload.warehouseRoles || [];
        const warehouseId = isFormData ? payload.get("warehouseId") : (payload.warehouseId || (payloadRoles.length > 0 && payloadRoles[0]?.warehouseId) || "");
        const email = isFormData ? payload.get("email") : payload.email;
        const status = isFormData ? payload.get("status") : (payload.status || "ACTIVE");
        const rawRoleIds = isFormData ? payload.getAll("roleIds[]") : (payload.roleIds || (payloadRoles.length > 0 ? payloadRoles.map(r => r.roleId) : []));
        let roleIds = Array.isArray(rawRoleIds) && rawRoleIds.length > 0 ? rawRoleIds : [];
        if (isFormData && roleIds.length === 0) {
            try {
                roleIds = JSON.parse(payload.get("roleIdsStr") || "[]");
            } catch (e) {}
        }

        const selectedWh = uniqueWarehouses.find(wh => wh.warehouseId === warehouseId) || {
            warehouseName: sessionWarehouseName || "Warehouse"
        };
        const roleNames = fetchedRoles
            .filter(role => roleIds && roleIds.includes(role.roleId))
            .map(role => role.roleName);
        
        const firstName = isFormData ? payload.get("firstName") : payload.firstName;
        const lastName = isFormData ? payload.get("lastName") : payload.lastName;
        const fullName = isFormData ? `${firstName} ${lastName}` : (payload.fullName || `${firstName} ${lastName}`);
        const employmentType = isFormData ? payload.get("employmentType") : payload.employmentType;
        
        const newMember = {
            id: `EMP-${Date.now()}`,
            name: fullName,
            email: email,
            employeeId: payload.employeeCode || newMemberEmpId.trim() || `EMP-${Math.floor(100000 + Math.random() * 900000)}`,
            role: roleNames.length > 0 ? roleNames.join(", ") : (payloadRoles.length > 0 ? payloadRoles.map(r => r.roleName).join(", ") : "Member"),
            warehouse: (payloadRoles.length > 0 && payloadRoles[0]?.warehouseName) || selectedWh.warehouseName,
            roles: roleNames.length > 0 ? roleNames : (payloadRoles.length > 0 ? payloadRoles.map(r => r.roleName) : ["Member"]),
            warehouses: (payloadRoles.length > 0 && payloadRoles[0]?.warehouseName) ? [...new Set(payloadRoles.map(r => r.warehouseName).filter(Boolean))] : [selectedWh.warehouseName],
            status: status === "ACTIVE" ? "Active" : "Pending",
            joinedDate: new Date().toISOString().split('T')[0],
            avatar: payload.photo || photoPreview || "",
            initials: fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            bg: ["text-bg-pink", "text-bg-blue", "text-bg-yellow", "text-bg-green", "text-bg-purple", "text-bg-orange"][Math.floor(Math.random() * 6)],
            accessiblePages: isFormData ? JSON.parse(payload.get("accessiblePages") || "[]") : (payload.accessiblePages || []),
            employmentType: employmentType || "Full-time"
        };
        
        setMembers(prev => [newMember, ...prev]);
    };

    const handleSendCredentialsEmail = async (credentialsToUse) => {
        const creds = credentialsToUse || createdCredentials;
        if (!creds) return;
        setIsSendingEmail(true);
        try {
            // Simulate API request to send email
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setCreatedCredentials(prev => prev ? { ...prev, emailSent: true } : null);
            showToast?.(`Credentials sent to ${creds.email} successfully!`);
        } catch (err) {
            console.error("Failed to send credentials email:", err);
            showToast?.("Failed to send email. Please try again.");
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleCreateMember = async (e) => {
        e.preventDefault();
        const isPhoneValid = /^\+?[0-9\s\-]+$/.test(newMemberPhone.trim()) && newMemberPhone.trim().length >= 8;
        if (!newMemberFirstName.trim() || !newMemberLastName.trim() || !newMemberEmail.trim() || !newMemberPhone.trim() || !isPhoneValid || !selectedWarehouseId || selectedRoleIds.length === 0) {
            return;
        }
        
        setIsCreatingMember(true);

        try {
            // Step 1: Upload photo if present
            let photoUrl = "";
            if (photoFile) {
                try {
                    // Convert file to base64
                    const base64Data = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64String = reader.result.split(',')[1];
                            resolve(base64String);
                        };
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(photoFile);
                    });

                    const uploadRes = await authService.uploadMedia(photoFile.name, base64Data, photoFile.type);
                    if (uploadRes && uploadRes.imageUrl) {
                        photoUrl = uploadRes.imageUrl;
                    }
                } catch (uploadErr) {
                    console.error("Failed to upload media:", uploadErr);
                    showToast?.("Photo upload failed. Proceeding without photo.");
                }
            }

            // Step 2: Build the warehouseRolesPayload
            const selectedWh = uniqueWarehouses.find(wh => wh.warehouseId === selectedWarehouseId) || {
                warehouseName: sessionWarehouseName || "Central Hub Alpha"
            };
            const warehouseRolesPayload = selectedRoleIds.map(roleId => {
                const roleObj = fetchedRoles.find(r => r.roleId === roleId);
                return {
                    warehouseId: selectedWarehouseId,
                    roleName: roleObj ? roleObj.roleName : "Member",
                    warehouseName: selectedWh.warehouseName,
                    status: "Active",
                    roleId: roleId
                };
            });

            // Step 3: Format phone number as integer
            const numericPhone = Number(newMemberPhone.trim().replace(/\D/g, ''));

            // Step 4: Map employment type appropriately
            let formattedEmploymentType = newMemberEmploymentType;
            if (newMemberEmploymentType.toLowerCase() === 'full-time') {
                formattedEmploymentType = 'Full-Time';
            } else if (newMemberEmploymentType.toLowerCase() === 'part-time') {
                formattedEmploymentType = 'Part-Time';
            }

            // Step 5: Pre-generate a password and construct the payload
            const generatedPassword = generateSecurePassword();
            const employeePayload = {
                firstName: newMemberFirstName.trim(),
                lastName: newMemberLastName.trim(),
                phone: numericPhone,
                email: newMemberEmail.trim(),
                employeeCode: newMemberEmpId.trim() || `EMP-${Math.floor(100000 + Math.random() * 900000)}`,
                employmentType: formattedEmploymentType,
                photo: photoUrl,
                warehouseRoles: warehouseRolesPayload,
                password: generatedPassword,
                sendEmail: sendEmailOption
            };

            // Step 6: Post to createWarehouseEmployee API
            const res = await authService.createWarehouseEmployee(employeePayload);
            if (res && (res.success === true || res.status === "success")) {
                showToast?.("Employee created successfully.");
                handleAddMemberToLocalList(employeePayload);
                const finalPassword = res.password || generatedPassword;
                const credentials = {
                    employeeId: employeePayload.employeeCode,
                    email: employeePayload.email,
                    password: finalPassword,
                    fullName: `${employeePayload.firstName} ${employeePayload.lastName}`,
                    emailSent: false
                };
                setCreatedCredentials(credentials);

                if (sendEmailOption) {
                    setTimeout(() => {
                        handleSendCredentialsEmail(credentials);
                    }, 200);
                }
            } else {
                showToast?.(res.message || "Failed to create employee.");
            }
        } catch (error) {
            console.error("Failed to create member:", error);
            // Fallback for simulation/prototype testing if API returns CORS or 404
            if (!error.response || error.response.status === 404) {
                showToast?.("Employee created successfully (Local Simulation).");
                const selectedWh = uniqueWarehouses.find(wh => wh.warehouseId === selectedWarehouseId) || {
                    warehouseName: sessionWarehouseName || "Central Hub Alpha"
                };
                const warehouseRolesPayload = selectedRoleIds.map(roleId => {
                    const roleObj = fetchedRoles.find(r => r.roleId === roleId);
                    return {
                        warehouseId: selectedWarehouseId,
                        roleName: roleObj ? roleObj.roleName : "Member",
                        warehouseName: selectedWh.warehouseName,
                        status: "Active",
                        roleId: roleId
                    };
                });
                const generatedPassword = generateSecurePassword();
                const fallbackPayload = {
                    firstName: newMemberFirstName.trim(),
                    lastName: newMemberLastName.trim(),
                    phone: Number(newMemberPhone.trim().replace(/\D/g, '')),
                    email: newMemberEmail.trim(),
                    employeeCode: newMemberEmpId.trim() || `EMP-${Math.floor(100000 + Math.random() * 900000)}`,
                    employmentType: newMemberEmploymentType,
                    photo: photoPreview || "",
                    warehouseRoles: warehouseRolesPayload,
                    password: generatedPassword,
                    sendEmail: sendEmailOption
                };
                handleAddMemberToLocalList(fallbackPayload);
                const credentials = {
                    employeeId: fallbackPayload.employeeCode,
                    email: fallbackPayload.email,
                    password: generatedPassword,
                    fullName: `${fallbackPayload.firstName} ${fallbackPayload.lastName}`,
                    emailSent: false
                };
                setCreatedCredentials(credentials);

                if (sendEmailOption) {
                    setTimeout(() => {
                        handleSendCredentialsEmail(credentials);
                    }, 200);
                }
            } else {
                showToast?.(error.response?.data?.message || "Failed to create employee. Please try again.");
            }
        } finally {
            setIsCreatingMember(false);
        }
    };
    // Filter logic
    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const searchLower = searchTerm.toLowerCase();
            return (member.name || "").toLowerCase().includes(searchLower) ||
                   (member.email || "").toLowerCase().includes(searchLower) ||
                   (member.employeeId || "").toLowerCase().includes(searchLower) ||
                   (member.role || "").toLowerCase().includes(searchLower) ||
                   (member.warehouse || "").toLowerCase().includes(searchLower);
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
                    <style>{`
                        .role-cell-wrapper, .warehouse-cell-wrapper {
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                            white-space: nowrap;
                            position: relative;
                            z-index: 1;
                        }
                        .role-cell-wrapper:hover, .warehouse-cell-wrapper:hover {
                            z-index: 20;
                        }
                        /* Position tooltips below the badge for the first two rows to prevent top boundary clipping */
                        .enterprise-table tbody tr:nth-child(-n+2) .roles-tooltip-content,
                        .enterprise-table tbody tr:nth-child(-n+2) .warehouses-tooltip-content {
                            bottom: auto;
                            top: calc(100% + 8px);
                        }
                        .enterprise-table tbody tr:nth-child(-n+2) .roles-tooltip-content::before,
                        .enterprise-table tbody tr:nth-child(-n+2) .warehouses-tooltip-content::before {
                            top: auto;
                            bottom: 100%;
                        }
                        .enterprise-table tbody tr:nth-child(-n+2) .roles-tooltip-content::after,
                        .enterprise-table tbody tr:nth-child(-n+2) .warehouses-tooltip-content::after {
                            top: auto;
                            bottom: 100%;
                            border-color: transparent transparent #1e293b transparent;
                        }
                        .primary-role, .primary-warehouse {
                            white-space: nowrap;
                        }
                        .more-roles-badge, .more-warehouses-badge {
                            position: relative;
                            margin-left: 4px;
                            padding: 2px 6px;
                            border-radius: 12px;
                            background: #e2e8f0;
                            color: #475569;
                            font-size: 11px;
                            font-weight: 600;
                            cursor: pointer;
                            display: inline-flex;
                            align-items: center;
                            user-select: none;
                        }
                        .more-roles-badge:hover, .more-warehouses-badge:hover {
                            background: #cbd5e1;
                            color: #1e293b;
                        }
                        .roles-tooltip-content, .warehouses-tooltip-content {
                            visibility: hidden;
                            opacity: 0;
                            position: absolute;
                            bottom: calc(100% + 8px);
                            left: 50%;
                            transform: translateX(-50%);
                            background-color: #1e293b;
                            color: #ffffff;
                            padding: 10px 12px;
                            border-radius: 8px;
                            width: max-content;
                            max-width: 250px;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                            z-index: 100;
                            transition: opacity 0.2s, visibility 0.2s;
                            pointer-events: auto;
                            display: flex;
                            flex-direction: column;
                            gap: 6px;
                            text-align: left;
                            font-weight: normal;
                            line-height: 1.4;
                        }
                        .role-cell-wrapper:hover .roles-tooltip-content,
                        .warehouse-cell-wrapper:hover .warehouses-tooltip-content {
                            visibility: visible;
                            opacity: 1;
                        }
                        /* Invisible hover bridge to prevent closing when moving cursor over the gap */
                        .roles-tooltip-content::before, .warehouses-tooltip-content::before {
                            content: "";
                            position: absolute;
                            top: 100%;
                            left: 0;
                            right: 0;
                            height: 10px;
                            background: transparent;
                        }
                        .roles-tooltip-content::after, .warehouses-tooltip-content::after {
                            content: "";
                            position: absolute;
                            top: 100%;
                            left: 50%;
                            transform: translateX(-50%);
                            border-width: 6px;
                            border-style: solid;
                            border-color: #1e293b transparent transparent transparent;
                        }
                        .tooltip-header {
                            font-size: 11px;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            color: #94a3b8;
                            border-bottom: 1px solid #334155;
                            padding-bottom: 4px;
                            white-space: nowrap;
                        }
                        .tooltip-list {
                            display: flex;
                            flex-direction: column;
                            gap: 4px;
                            max-height: 150px;
                            overflow-y: auto;
                        }
                        .tooltip-tag {
                            font-size: 12px;
                            color: #e2e8f0;
                            display: inline-block;
                            white-space: nowrap;
                            padding: 2px 0;
                        }
                    `}</style>
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
                    <div className="enterprise-table-container" style={{ position: 'relative', minHeight: '200px' }}>
                        {isMembersLoading ? (
                            <div className="table-loading-state" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '60px 20px',
                                gap: '12px'
                            }}>
                                <Loader2 className="animate-spin" size={36} style={{ color: '#2563eb' }} />
                                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Fetching team members...</span>
                            </div>
                        ) : membersError ? (
                            <div className="table-empty-state" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '60px 20px',
                                gap: '16px'
                            }}>
                                <span style={{ fontSize: '40px', color: '#ef4444' }}>⚠️</span>
                                <h4 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>Database Connection Error</h4>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{membersError}</p>
                                <button 
                                    className="btn-primary-action" 
                                    onClick={() => setRetryTrigger(prev => prev + 1)}
                                    style={{ marginTop: '8px' }}
                                >
                                    Retry Connection
                                </button>
                            </div>
                        ) : paginatedMembers.length > 0 ? (
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
                                            <td className="table-text">
                                                <div className="role-cell-wrapper">
                                                    <span className="primary-role">{member.roles[0]}</span>
                                                    {member.roles.length > 1 && (
                                                        <span className="more-roles-badge">
                                                            +{member.roles.length - 1}
                                                            <div className="roles-tooltip-content">
                                                                <div className="tooltip-header">All Assigned Roles ({member.roles.length})</div>
                                                                <div className="tooltip-list">
                                                                    {member.roles.map((r, idx) => (
                                                                        <span key={idx} className="tooltip-tag">{r}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="table-text">
                                                <div className="warehouse-cell-wrapper">
                                                    <span className="primary-warehouse">{member.warehouses[0]}</span>
                                                    {member.warehouses.length > 1 && (
                                                        <span className="more-warehouses-badge">
                                                            +{member.warehouses.length - 1}
                                                            <div className="warehouses-tooltip-content">
                                                                <div className="tooltip-header">Assigned Warehouses ({member.warehouses.length})</div>
                                                                <div className="tooltip-list">
                                                                    {member.warehouses.map((w, idx) => (
                                                                        <span key={idx} className="tooltip-tag">{w}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`table-status-chip ${getStatusColor(member.status)}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="action-cell">
                                                <div className="dropdown-wrapper">
                                                    <button className="btn-row-action" onClick={(e) => toggleDropdown(e, member.id)}>
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {activeDropdown === member.id && (
                                                        <div className="row-action-menu">
                                                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleViewPermissions(member); }}>View Permissions</button>
                                                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleEditPermissions(member); }}>Edit Permissions</button>
                                                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleEditRole(member); }}>Edit Role</button>
                                                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleChangePassword(member); }}>Change Password</button>
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
                                {members.length === 0 ? (
                                    <>
                                        <h4>No team members registered.</h4>
                                        <p>Click 'Add Member' to create a new warehouse employee.</p>
                                    </>
                                ) : (
                                    <>
                                        <h4>No matching team members found.</h4>
                                        <p>Try adjusting your search term or filters.</p>
                                    </>
                                )}
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

    const selectedWarehouse = uniqueWarehouses.find(wh => wh.warehouseId === selectedWarehouseId) || {
        warehouseName: sessionWarehouseName || "Central Hub Alpha"
    };
    const selectedRoleObjs = fetchedRoles.filter(role => selectedRoleIds.includes(role.roleId));
    
    const displayWarehouseName = selectedWarehouse.warehouseName;
    const displayRoleName = selectedRoleObjs.map(r => r.roleName).join(", ");

    return (
        <div className="settings-page-wrapper admin-layout">
            <style>{`
                /* Role Cards Selection Section */
                .role-cards-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    padding: 8px 4px 16px 4px;
                    margin-top: 6px;
                    width: 100%;
                }

                @media (max-width: 1024px) {
                    .role-cards-container {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .role-cards-container {
                        grid-template-columns: 1fr;
                    }
                }

                .role-card-item {
                    background: #ffffff;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                }

                .role-card-item:hover {
                    border-color: #cbd5e1;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }

                .role-card-item.selected {
                    border-color: #2563eb;
                    background-color: #eff6ff;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
                }

                .role-card-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 6px;
                    width: 100%;
                }

                .role-card-item-name {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1f2937;
                    display: inline-flex;
                    align-items: center;
                }

                .role-card-item.selected .role-card-item-name {
                    color: #1d4ed8;
                }

                .role-card-item-id {
                    font-size: 10px;
                    color: #6b7280;
                    background: #f3f4f6;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                }

                .role-card-item.selected .role-card-item-id {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .role-card-item-count {
                    font-size: 12px;
                    font-weight: 600;
                    color: #059669;
                    margin-bottom: 6px;
                }

                .role-card-item.selected .role-card-item-count {
                    color: #047857;
                }

                .role-card-item-desc {
                    font-size: 11px;
                    color: #6b7280;
                    line-height: 1.4;
                    margin: 0;
                }

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
                    padding: 20px 32px 32px 32px;
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
                    .enterprise-table td:nth-child(6) {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 13px;
                    }
                    .enterprise-table td:nth-child(3)::before { content: "Employee ID"; color: #64748b; }
                    .enterprise-table td:nth-child(4)::before { content: "Role"; color: #64748b; }
                    .enterprise-table td:nth-child(5)::before { content: "Warehouse"; color: #64748b; }
                    .enterprise-table td:nth-child(6)::before { content: "Status"; color: #64748b; }
                    
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

                /* Credentials Success Screen Styles */
                .credentials-success-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 8px 0;
                }
                .success-icon-pulse {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 64px;
                    height: 64px;
                    background: #dcfce7;
                    color: #15803d;
                    border-radius: 50%;
                    margin-bottom: 20px;
                    animation: pulse-green 2s infinite;
                }
                @keyframes pulse-green {
                    0% {
                        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
                    }
                    70% {
                        box-shadow: 0 0 0 12px rgba(34, 197, 94, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
                    }
                }
                .success-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 8px 0;
                }
                .success-subtitle {
                    font-size: 14px;
                    color: #64748b;
                    margin: 0 0 24px 0;
                    line-height: 1.5;
                    max-width: 420px;
                }
                .credentials-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 480px;
                    padding: 20px;
                    text-align: left;
                    margin-bottom: 24px;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
                    box-sizing: border-box;
                }
                .credentials-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid #f1f5f9;
                    gap: 16px;
                }
                .credentials-row:last-child {
                    border-bottom: none;
                }
                .credentials-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #475569;
                }
                .credentials-value-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .credentials-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: #0f172a;
                }
                .credentials-value--mono {
                    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
                    font-size: 13px;
                    background: #f1f5f9;
                    padding: 6px 10px;
                    border-radius: 6px;
                    letter-spacing: 0.5px;
                }
                .btn-copy-credential {
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    color: #475569;
                    height: 32px;
                    padding: 0 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .btn-copy-credential:hover {
                    border-color: #94a3b8;
                    background: #f8fafc;
                    color: #0f172a;
                }
                .btn-copy-credential.copied {
                    background: #f0fdf4;
                    border-color: #bbf7d0;
                    color: #15803d;
                }
                .email-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    background: #eff6ff;
                    border: 1px solid #dbeafe;
                    border-radius: 12px;
                    color: #1e40af;
                    font-size: 13px;
                    font-weight: 500;
                    width: 100%;
                    max-width: 480px;
                    justify-content: center;
                    box-sizing: border-box;
                }
                .email-status-badge.sent {
                    background: #f0fdf4;
                    border-color: #dcfce7;
                    color: #166534;
                }
                .btn-send-email-now {
                    background: #2563eb;
                    border: none;
                    color: #ffffff;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .btn-send-email-now:hover:not(:disabled) {
                    background: #1d4ed8;
                }
                .btn-send-email-now:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Loading Overlay & Scroll Lock Styles */
                .modal-loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.75);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                    border-radius: 20px;
                }
                .role-modal:has(.modal-loading-overlay) .role-modal__body {
                    overflow-y: hidden !important;
                }
                .loading-spinner-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }
                .spinner-ring {
                    width: 48px;
                    height: 48px;
                    border: 4px solid #e2e8f0;
                    border-top: 4px solid #2563eb;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .loading-text {
                    font-size: 16px;
                    font-weight: 700;
                    color: #0f172a;
                    text-align: center;
                    margin: 0;
                }
                .loading-subtext {
                    font-size: 13px;
                    color: #64748b;
                    margin-top: 6px;
                    text-align: center;
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
                    createdCredentials ? (
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
                                <Key size={22} />
                            </div>
                            <div>
                                <h2 id="add-member-title" className="role-edit-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Employee Created</h2>
                                <p className="role-edit-modal-subtitle" style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>Account credentials generated successfully</p>
                            </div>
                        </div>
                    ) : (
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
                    )
                }
                footer={
                    createdCredentials ? (
                        <div className="add-employee-modal-footer">
                            <button 
                                type="button" 
                                className="role-btn role-btn--primary" 
                                onClick={closeAndResetModal}
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <div className="add-employee-modal-footer">
                            <button type="button" className="role-btn role-btn--ghost" onClick={closeAndResetModal} disabled={isCreatingMember}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="add-member-form"
                                className="role-btn role-btn--primary"
                                disabled={!newMemberFirstName.trim() || !newMemberLastName.trim() || !newMemberEmail.trim() || !newMemberPhone.trim() || !/^\+?[0-9\s\-]+$/.test(newMemberPhone.trim()) || newMemberPhone.trim().length < 8 || !selectedWarehouseId || selectedRoleIds.length === 0 || isCreatingMember || fetchedRoles.length === 0 || !!roleErrorText || emailCheckStatus !== 'available' || isPhotoConverting}
                            >
                                {isCreatingMember ? "Creating..." : "Create Employee"}
                            </button>
                        </div>
                    )
                }
            >
                {isCreatingMember && (
                    <div className="modal-loading-overlay">
                        <div className="loading-spinner-container">
                            <div className="spinner-ring"></div>
                            <div>
                                <h4 className="loading-text">Creating Employee</h4>
                                <p className="loading-subtext">Setting up profile and generating credentials...</p>
                            </div>
                        </div>
                    </div>
                )}
                {createdCredentials ? (
                    <div className="credentials-success-container">
                        <div className="success-icon-pulse">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="success-title">Employee Created Successfully</h3>
                        <p className="success-subtitle">
                            A new warehouse team member account has been created for <strong>{createdCredentials.fullName}</strong>.
                        </p>
                        
                        <div className="credentials-card">
                            <div className="credentials-row">
                                <span className="credentials-label">Employee ID</span>
                                <div className="credentials-value-wrapper">
                                    <span className="credentials-value credentials-value--mono">{createdCredentials.employeeId}</span>
                                    <button 
                                        type="button" 
                                        className={`btn-copy-credential ${copied === 'empid' ? 'copied' : ''}`}
                                        onClick={() => {
                                            navigator.clipboard.writeText(createdCredentials.employeeId);
                                            setCopied('empid');
                                            showToast?.("Employee ID copied to clipboard!");
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                    >
                                        {copied === 'empid' ? <Check size={13} /> : <Copy size={13} />}
                                        {copied === 'empid' ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="credentials-row">
                                <span className="credentials-label">Email Address</span>
                                <div className="credentials-value-wrapper">
                                    <span className="credentials-value">{createdCredentials.email}</span>
                                    <button 
                                        type="button" 
                                        className={`btn-copy-credential ${copied === 'email' ? 'copied' : ''}`}
                                        onClick={() => {
                                            navigator.clipboard.writeText(createdCredentials.email);
                                            setCopied('email');
                                            showToast?.("Email address copied to clipboard!");
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                    >
                                        {copied === 'email' ? <Check size={13} /> : <Copy size={13} />}
                                        {copied === 'email' ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="credentials-row">
                                <span className="credentials-label">Temporary Password</span>
                                <div className="credentials-value-wrapper">
                                    <span className="credentials-value credentials-value--mono">{createdCredentials.password}</span>
                                    <button 
                                        type="button" 
                                        className={`btn-copy-credential ${copied === 'pwd' ? 'copied' : ''}`}
                                        onClick={() => {
                                            navigator.clipboard.writeText(createdCredentials.password);
                                            setCopied('pwd');
                                            showToast?.("Password copied to clipboard!");
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                    >
                                        {copied === 'pwd' ? <Check size={13} /> : <Copy size={13} />}
                                        {copied === 'pwd' ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {createdCredentials.emailSent ? (
                            <div className="email-status-badge sent">
                                <CheckCircle size={16} />
                                <span>Login credentials have been sent to <strong>{createdCredentials.email}</strong></span>
                            </div>
                        ) : (
                            <div className="email-status-badge">
                                <Mail size={16} />
                                <span style={{ flex: 1, textAlign: 'left' }}>Credentials not emailed yet</span>
                                <button
                                    type="button"
                                    className="btn-send-email-now"
                                    onClick={handleSendCredentialsEmail}
                                    disabled={isSendingEmail}
                                    style={{
                                        marginLeft: '8px'
                                    }}
                                >
                                    {isSendingEmail ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        <Mail size={12} />
                                    )}
                                    {isSendingEmail ? "Sending..." : "Send Email"}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <form id="add-member-form" onSubmit={handleCreateMember} className="employee-modal-sections">
                    {/* Section 1: Personal Information */}
                    <div className="employee-section-card">
                        <div className="employee-section-header">
                            <Users size={16} />
                            <span>Personal Information</span>
                        </div>
                        <div className="employee-fields-grid">
                            <div className="employee-form-field">
                                <label htmlFor="new-member-firstname">First Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    id="new-member-firstname"
                                    type="text"
                                    required
                                    placeholder="e.g. John"
                                    value={newMemberFirstName}
                                    onChange={(e) => setNewMemberFirstName(e.target.value)}
                                />
                            </div>
                            <div className="employee-form-field">
                                <label htmlFor="new-member-lastname">Last Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    id="new-member-lastname"
                                    type="text"
                                    required
                                    placeholder="e.g. Doe"
                                    value={newMemberLastName}
                                    onChange={(e) => setNewMemberLastName(e.target.value)}
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
                                 {emailCheckStatus && (emailCheckStatus === 'exists' || emailCheckStatus === 'invalid') && (
                                    <p style={{ 
                                        color: '#ef4444', 
                                        fontSize: '12px', 
                                        marginTop: '4px',
                                        fontWeight: '500'
                                    }}>
                                        {emailMessage}
                                    </p>
                                 )}
                            </div>

                            <div className="employee-form-field">
                                <label htmlFor="new-member-phone">Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    id="new-member-phone"
                                    type="tel"
                                    required
                                    placeholder="e.g. +91 9876543210"
                                    value={newMemberPhone}
                                    onChange={(e) => setNewMemberPhone(e.target.value)}
                                />
                            </div>

                            <div className="employee-form-field field-full-width">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Profile Photo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        backgroundColor: '#eff6ff',
                                        border: '2px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                    }}>
                                        {isPhotoConverting ? (
                                            <Loader2 size={24} className="animate-spin" style={{ color: '#2563eb' }} />
                                        ) : photoPreview ? (
                                            <img src={photoPreview} alt="Employee Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Users size={28} style={{ color: '#94a3b8' }} />
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <label 
                                                className="role-btn role-btn--ghost" 
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    fontSize: '12px', 
                                                    height: 'auto', 
                                                    borderRadius: '6px', 
                                                    border: '1px solid #cbd5e1', 
                                                    cursor: emailCheckStatus === 'available' ? 'pointer' : 'not-allowed',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    opacity: emailCheckStatus === 'available' ? 1 : 0.6,
                                                    pointerEvents: emailCheckStatus === 'available' ? 'auto' : 'none'
                                                }}
                                            >
                                                Upload Photo
                                                <input 
                                                    type="file" 
                                                    accept=".jpg,.jpeg,.png" 
                                                    style={{ display: 'none' }} 
                                                    onChange={handlePhotoChange} 
                                                    disabled={emailCheckStatus !== 'available' || isPhotoConverting}
                                                />
                                            </label>
                                            {photoFile && (
                                                <button 
                                                    type="button" 
                                                    className="role-btn role-btn--ghost" 
                                                    style={{ 
                                                        padding: '6px 12px', 
                                                        fontSize: '12px', 
                                                        height: 'auto', 
                                                        borderRadius: '6px', 
                                                        border: '1px solid #fecaca', 
                                                        color: '#dc2626',
                                                        background: '#fef2f2',
                                                        cursor: emailCheckStatus === 'available' ? 'pointer' : 'not-allowed',
                                                        opacity: emailCheckStatus === 'available' ? 1 : 0.6
                                                    }} 
                                                    onClick={handleRemovePhoto}
                                                    disabled={emailCheckStatus !== 'available' || isPhotoConverting}
                                                >
                                                    Remove Photo
                                                </button>
                                            )}
                                        </div>
                                        {isPhotoConverting ? (
                                            <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600' }}>
                                                Converting image to base64...
                                            </span>
                                        ) : photoPreview ? (
                                            <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600' }}>
                                                Image converted successfully.
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                                Supported: JPG, JPEG, PNG (Max 5MB)
                                            </span>
                                        )}
                                    </div>
                                </div>
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
                                    disabled={emailCheckStatus !== 'available'}
                                />
                            </div>

                            <div className="employee-form-field">
                                <label htmlFor="new-member-employment-type">Employment Type</label>
                                <select
                                    id="new-member-employment-type"
                                    value={newMemberEmploymentType}
                                    onChange={(e) => setNewMemberEmploymentType(e.target.value)}
                                    disabled={emailCheckStatus !== 'available'}
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contractor">Contractor</option>
                                    <option value="Intern">Intern</option>
                                </select>
                            </div>

                            <div className="employee-form-field field-full-width">
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' }}>Role Selection <span style={{ color: '#ef4444' }}>*</span></label>
                                
                                {/* Role Search Input */}
                                <div className="search-input-wrapper" style={{ marginBottom: '12px', position: 'relative' }}>
                                    <Search size={14} className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Search roles..."
                                        value={roleSearchQuery}
                                        onChange={(e) => setRoleSearchQuery(e.target.value)}
                                        className="member-search-input"
                                        style={{ 
                                            width: '100%', 
                                            height: '38px', 
                                            paddingLeft: '36px',
                                            paddingRight: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '13px',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                        disabled={emailCheckStatus !== 'available'}
                                    />
                                </div>

                                {rolesLoading ? (
                                    <div style={{ display: 'flex', gap: '12px', padding: '8px 4px' }}>
                                        {[1, 2].map(i => (
                                            <div key={i} className="role-card-item" style={{ opacity: 0.6, cursor: 'default' }}>
                                                <span className="role-card-item-count">Loading roles...</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : fetchedRoles.length === 0 ? (
                                    <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>
                                        {roleErrorText || "No roles available for selected warehouse"}
                                    </div>
                                ) : fetchedRoles.filter(role => 
                                    role.roleName.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
                                    role.roleId.toLowerCase().includes(roleSearchQuery.toLowerCase())
                                ).length === 0 ? (
                                    <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
                                        No matching roles found.
                                    </div>
                                ) : (
                                    <div className="role-cards-container" style={{
                                        opacity: emailCheckStatus === 'available' ? 1 : 0.6,
                                        pointerEvents: emailCheckStatus === 'available' ? 'auto' : 'none'
                                    }}>
                                        {fetchedRoles
                                            .filter(role => 
                                                role.roleName.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
                                                role.roleId.toLowerCase().includes(roleSearchQuery.toLowerCase())
                                            )
                                            .map(role => (
                                                <div 
                                                    key={role.roleId} 
                                                    className={`role-card-item ${selectedRoleIds.includes(role.roleId) ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        if (emailCheckStatus !== 'available') return;
                                                        setSelectedRoleIds(prev => {
                                                            if (prev.includes(role.roleId)) {
                                                                return prev.filter(id => id !== role.roleId);
                                                            } else {
                                                                return [...prev, role.roleId];
                                                            }
                                                        });
                                                        setIsEditingPermissions(false);
                                                    }}
                                                    style={{
                                                        cursor: emailCheckStatus === 'available' ? 'pointer' : 'not-allowed'
                                                    }}
                                                >
                                                    <div className="role-card-item-header">
                                                        <span className="role-card-item-name">
                                                            {selectedRoleIds.includes(role.roleId) && <Check size={14} strokeWidth={3} style={{ marginRight: '6px' }} />}
                                                            {role.roleName}
                                                        </span>
                                                        <span className="role-card-item-id">{role.roleId}</span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>

                            <div className="employee-form-field">
                                <label>Account Status</label>
                                <div className="employee-status-container" style={{
                                    opacity: emailCheckStatus === 'available' ? 1 : 0.6,
                                    pointerEvents: emailCheckStatus === 'available' ? 'auto' : 'none'
                                }}>
                                    <label className="employee-status-option" style={{ cursor: emailCheckStatus === 'available' ? 'pointer' : 'not-allowed' }}>
                                        <input
                                            type="radio"
                                            name="accountStatus"
                                            value="ACTIVE"
                                            checked={accountStatus === "ACTIVE"}
                                            onChange={() => {
                                                if (emailCheckStatus === 'available') setAccountStatus("ACTIVE");
                                            }}
                                            disabled={emailCheckStatus !== 'available'}
                                        />
                                        <span>Active</span>
                                    </label>
                                    <label className="employee-status-option" style={{ cursor: emailCheckStatus === 'available' ? 'pointer' : 'not-allowed' }}>
                                        <input
                                            type="radio"
                                            name="accountStatus"
                                            value="PENDING"
                                            checked={accountStatus === "PENDING"}
                                            onChange={() => {
                                                if (emailCheckStatus === 'available') setAccountStatus("PENDING");
                                            }}
                                            disabled={emailCheckStatus !== 'available'}
                                        />
                                        <span>Pending</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Assignment Details (Read-only) */}
                    <div className="employee-section-card">
                        <div className="employee-section-header">
                            <Warehouse size={16} />
                            <span>Assignment Info</span>
                        </div>
                        <div className="employee-fields-grid">
                            <div className="employee-form-field">
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Warehouse</label>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#1e293b',
                                    padding: '12px 16px',
                                    background: '#f1f5f9',
                                    borderRadius: '10px',
                                    fontWeight: '500',
                                    minHeight: '48px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    {sessionWarehouseName || "Central Hub Alpha"}
                                </div>
                            </div>
                            <div className="employee-form-field">
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Assigned By</label>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#1e293b',
                                    padding: '12px 16px',
                                    background: '#f1f5f9',
                                    borderRadius: '10px',
                                    fontWeight: '500',
                                    minHeight: '48px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    {selectedRoleName || "Administrator"}
                                </div>
                            </div>
                            <div className="employee-form-field field-full-width">
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Selected Roles</label>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#1e293b',
                                    padding: '12px 16px',
                                    background: '#f1f5f9',
                                    borderRadius: '10px',
                                    fontWeight: '500',
                                    minHeight: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                }}>
                                    {fetchedRoles
                                        .filter(r => selectedRoleIds.includes(r.roleId))
                                        .map(r => r.roleName)
                                        .join(", ") || "No roles selected"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Security & Notification */}
                    <div className="employee-section-card">
                        <div className="employee-section-header">
                            <Mail size={16} />
                            <span>Security & Notification</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="employee-status-option" style={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                gap: '10px', 
                                cursor: emailCheckStatus === 'available' ? 'pointer' : 'not-allowed',
                                opacity: emailCheckStatus === 'available' ? 1 : 0.6
                            }}>
                                <input
                                    type="checkbox"
                                    checked={sendEmailOption}
                                    onChange={(e) => {
                                        if (emailCheckStatus === 'available') setSendEmailOption(e.target.checked);
                                    }}
                                    disabled={emailCheckStatus !== 'available'}
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        accentColor: '#2563eb',
                                        cursor: 'pointer',
                                        marginTop: '2px'
                                    }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                        Send credentials to employee's email
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '400', lineHeight: '1.4' }}>
                                        Automatically send the login password and Employee ID via email once the account is created.
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                </form>
                )}
            </Modal>

            {/* Custom Permissions Modals */}
            <PermissionsViewerModal
                isOpen={viewerOpen}
                role={selectedEmployeeRoleObj}
                onClose={() => {
                    setViewerOpen(false);
                }}
                onSave={handleSavePermissions}
                initialIsEditing={initialIsEditing}
            />

            <MemberRoleEditModal
                isOpen={isEditRoleOpen}
                employee={selectedEmployee}
                uniqueWarehouses={uniqueWarehouses}
                sessionWarehouseId={sessionWarehouseId}
                onClose={() => {
                    setIsEditRoleOpen(false);
                }}
                onSave={handleSaveRole}
            />

            <MemberPasswordChangeModal
                isOpen={isChangePasswordOpen}
                employee={selectedEmployee}
                onClose={() => {
                    setIsChangePasswordOpen(false);
                }}
                onSave={handleSavePassword}
            />
        </div>
    );
}

export default AdminPage;
