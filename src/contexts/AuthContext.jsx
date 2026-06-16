import React, { createContext, useContext, useState, useCallback } from "react";
import { getFallbackAccessiblePages } from "../utils/rbacFallback";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => localStorage.getItem("isAuthenticated") === "true"
    );
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("authUser");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [warehouseRoles, setWarehouseRoles] = useState(() => {
        try {
            const saved = localStorage.getItem("warehouseRoles");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [userPassword, setUserPassword] = useState("");

    const [accessiblePages, setAccessiblePages] = useState(() => {
        try {
            // Only restore saved pages if they belong to the CURRENT selected role.
            // If the stored role/warehouse differs from the selection, discard — prevents
            // stale permissions from a previous session leaking into the new one.
            const savedWarehouseId = localStorage.getItem("selectedWarehouseId") || "";
            const savedRoleId      = localStorage.getItem("selectedRoleId") || "";
            const permVersion      = localStorage.getItem("permissionsVersion") || "";
            const expectedVersion  = `${savedWarehouseId}::${savedRoleId}`;

            if (!savedWarehouseId || !savedRoleId || permVersion !== expectedVersion) {
                // Version mismatch — discard stale permissions
                localStorage.removeItem("accessiblePages");
                localStorage.removeItem("permissionsVersion");
                return [];
            }

            const saved = localStorage.getItem("accessiblePages");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    
    // Explicit selection session properties
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(
        () => localStorage.getItem("selectedWarehouseId") || ""
    );
    const [selectedWarehouseName, setSelectedWarehouseName] = useState(
        () => localStorage.getItem("selectedWarehouseName") || ""
    );
    const [selectedRoleId, setSelectedRoleId] = useState(
        () => localStorage.getItem("selectedRoleId") || ""
    );
    const [selectedRoleName, setSelectedRoleName] = useState(
        () => localStorage.getItem("selectedRoleName") || ""
    );

    // Objects derived/restored for general component usage
    const [selectedWarehouse, setSelectedWarehouse] = useState(() => {
        try {
            const saved = localStorage.getItem("selectedWarehouse");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [selectedRole, setSelectedRole] = useState(() => {
        try {
            const saved = localStorage.getItem("selectedRole");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    // Helper methods for RBAC
    const canView = useCallback((pageId) => {
        const hasPage = accessiblePages.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase());
        if (hasPage) {
            return accessiblePages.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase() && p.canView);
        }
        const fallbacks = getFallbackAccessiblePages(selectedRoleName || localStorage.getItem("selectedRoleName") || "");
        return fallbacks.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase() && p.canView);
    }, [accessiblePages, selectedRoleName]);

    const canCreate = useCallback((pageId) => {
        const hasPage = accessiblePages.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase());
        if (hasPage) {
            return accessiblePages.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase() && p.canCreate);
        }
        const fallbacks = getFallbackAccessiblePages(selectedRoleName || localStorage.getItem("selectedRoleName") || "");
        return fallbacks.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase() && p.canCreate);
    }, [accessiblePages, selectedRoleName]);

    const canEdit = useCallback((pageId) => {
        const hasPage = accessiblePages.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase());
        if (hasPage) {
            return accessiblePages.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase() && p.canEdit);
        }
        const fallbacks = getFallbackAccessiblePages(selectedRoleName || localStorage.getItem("selectedRoleName") || "");
        return fallbacks.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase() && p.canEdit);
    }, [accessiblePages, selectedRoleName]);

    const canDelete = useCallback((pageId) => {
        const hasPage = accessiblePages.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase());
        if (hasPage) {
            return accessiblePages.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase() && p.canDelete);
        }
        const fallbacks = getFallbackAccessiblePages(selectedRoleName || localStorage.getItem("selectedRoleName") || "");
        return fallbacks.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase() && p.canDelete);
    }, [accessiblePages, selectedRoleName]);

    const canApprove = useCallback((pageId) => {
        const hasPage = accessiblePages.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase());
        if (hasPage) {
            return accessiblePages.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase() && p.canApprove);
        }
        const fallbacks = getFallbackAccessiblePages(selectedRoleName || localStorage.getItem("selectedRoleName") || "");
        return fallbacks.some(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase() && p.canApprove);
    }, [accessiblePages, selectedRoleName]);

    const permissions = selectedRoleName ? [] : []; // Kept for backwards compatibility but unused

    const login = useCallback((responseData, password) => {
        const messageObj = responseData.message || {};
        
        // Support both object-based response and direct arrays
        const userProfile = typeof messageObj === "object" && messageObj !== null && !Array.isArray(messageObj)
            ? { ...messageObj }
            : {};
            
        let roles = [];
        if (Array.isArray(userProfile.roles)) {
            roles = userProfile.roles;
        } else if (Array.isArray(userProfile.warehouseRoles)) {
            roles = userProfile.warehouseRoles;
        } else if (Array.isArray(responseData.message)) {
            roles = responseData.message;
        } else if (responseData && Array.isArray(responseData.roles)) {
            roles = responseData.roles;
        } else if (responseData && Array.isArray(responseData.warehouseRoles)) {
            roles = responseData.warehouseRoles;
        }
        
        // Ensure both fields are set for backward compatibility
        userProfile.warehouseRoles = roles;
        userProfile.roles = roles;
        
        // Ensure user details fallback elegantly if missing
        if (!userProfile.firstName) userProfile.firstName = "Warehouse";
        if (!userProfile.lastName) userProfile.lastName = "User";
        
        // On every fresh login, wipe the previous session's permissions immediately.
        // This prevents stale accessiblePages (from an old role) from leaking into the
        // new session before completeSetup() is called.
        localStorage.removeItem("accessiblePages");
        localStorage.removeItem("permissionsVersion");
        setAccessiblePages([]);

        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("authUser", JSON.stringify(userProfile));
        localStorage.setItem("warehouseRoles", JSON.stringify(roles));
        
        if (password) {
            setUserPassword(password);
        }

        setIsAuthenticated(true);
        setUser(userProfile);
        setWarehouseRoles(roles);
    }, []);

    const completeSetup = useCallback(async (warehouse, role) => {
        setPermissionsLoading(true);
        let pages;
        try {
            const { authService, GET_USER_PERMISSIONS_API } = await import("../services/authService");
            if (!GET_USER_PERMISSIONS_API) {
                throw new Error("No API endpoint configured.");
            }
            const res = await authService.getRolePermissions(warehouse.warehouseId, role.roleId, role.roleName);
            if (res.status === "success") {
                pages = res.message.accessiblePages || [];
                setAccessiblePages(pages);
            } else {
                pages = getFallbackAccessiblePages(role.roleName);
                setAccessiblePages(pages);
            }
        } catch (error) {
            console.warn("Failed to fetch permissions, falling back to default matrix:", error);
            pages = getFallbackAccessiblePages(role.roleName);
            setAccessiblePages(pages);
        } finally {
            setPermissionsLoading(false);
        }

        // Stamp a version key so the page-init code can validate freshness
        // on next app load: permissionsVersion = "<warehouseId>::<roleId>"
        const permVersion = `${warehouse.warehouseId}::${role.roleId}`;
        localStorage.setItem("accessiblePages", JSON.stringify(pages));
        localStorage.setItem("permissionsVersion", permVersion);

        localStorage.setItem("selectedWarehouseId", warehouse.warehouseId);
        localStorage.setItem("selectedWarehouseName", warehouse.warehouseName);
        localStorage.setItem("selectedRoleId", role.roleId);
        localStorage.setItem("selectedRoleName", role.roleName);
        
        setSelectedWarehouseId(warehouse.warehouseId);
        setSelectedWarehouseName(warehouse.warehouseName);
        setSelectedRoleId(role.roleId);
        setSelectedRoleName(role.roleName);

        localStorage.setItem("selectedWarehouse", JSON.stringify(warehouse));
        localStorage.setItem("selectedRole", JSON.stringify(role));
        setSelectedWarehouse(warehouse);
        setSelectedRole(role);
        
        // Backward-compatible fields
        localStorage.setItem("userRole", role.roleName);
        localStorage.setItem("userName", user ? `${user.firstName} ${user.lastName}` : "");
        localStorage.setItem("userOrg", user?.Organization || "");
        
        return pages;
    }, [user]);

    const logout = useCallback(() => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("authUser");
        localStorage.removeItem("warehouseRoles");
        localStorage.removeItem("selectedWarehouseId");
        localStorage.removeItem("selectedWarehouseName");
        localStorage.removeItem("selectedRoleId");
        localStorage.removeItem("selectedRoleName");
        localStorage.removeItem("selectedWarehouse");
        localStorage.removeItem("selectedRole");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("userOrg");
        localStorage.removeItem("userLoc");
        localStorage.removeItem("accessiblePages");
        localStorage.removeItem("permissionsVersion");
        
        setUserPassword("");

        setIsAuthenticated(false);
        setUser(null);
        setWarehouseRoles([]);
        setSelectedWarehouseId("");
        setSelectedWarehouseName("");
        setSelectedRoleId("");
        setSelectedRoleName("");
        setSelectedWarehouse(null);
        setSelectedRole(null);
        setAccessiblePages([]);
    }, []);

    const updatePassword = useCallback((newPassword) => {
        setUserPassword(newPassword);
    }, []);

    const updateUser = useCallback((updatedFields) => {
        setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...updatedFields };
            localStorage.setItem("authUser", JSON.stringify(updated));
            return updated;
        });
    }, []);

    const value = {
        isAuthenticated,
        user,
        warehouseRoles,
        selectedWarehouseId,
        selectedWarehouseName,
        selectedRoleId,
        selectedRoleName,
        selectedWarehouse,
        selectedRole,
        permissions,
        login,
        completeSetup,
        logout,
        userName: user ? `${user.firstName} ${user.lastName}` : "",
        userRole: selectedRoleName,
        userPassword,
        updatePassword,
        updateUser,
        accessiblePages,
        permissionsLoading,
        canView,
        canCreate,
        canEdit,
        canDelete,
        canApprove
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an <AuthProvider>");
    }
    return ctx;
}
