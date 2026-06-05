import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => localStorage.getItem("isAuthenticated") === "true"
    );
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("authUser");
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });
    const [warehouseRoles, setWarehouseRoles] = useState(() => {
        try {
            const saved = localStorage.getItem("warehouseRoles");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

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
        } catch (e) {
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
        } catch (e) {
            return null;
        }
    });
    const [selectedRole, setSelectedRole] = useState(() => {
        try {
            const saved = localStorage.getItem("selectedRole");
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    // Helper methods for RBAC
    const getPagePermission = useCallback((pageId) => {
        return accessiblePages.find(p => p.pageId && p.pageId.toUpperCase() === pageId.toUpperCase());
    }, [accessiblePages]);

    const canView = useCallback((pageId) => {
        const p = getPagePermission(pageId);
        return p ? p.canView : false;
    }, [getPagePermission]);

    const canCreate = useCallback((pageId) => {
        const p = getPagePermission(pageId);
        return p ? p.canCreate : false;
    }, [getPagePermission]);

    const canEdit = useCallback((pageId) => {
        const p = getPagePermission(pageId);
        return p ? p.canEdit : false;
    }, [getPagePermission]);

    const canDelete = useCallback((pageId) => {
        const p = getPagePermission(pageId);
        return p ? p.canDelete : false;
    }, [getPagePermission]);

    const canApprove = useCallback((pageId) => {
        const p = getPagePermission(pageId);
        return p ? p.canApprove : false;
    }, [getPagePermission]);

    const permissions = selectedRoleName ? [] : []; // Kept for backwards compatibility but unused

    const login = useCallback((responseData) => {
        const userProfile = responseData.message;
        const roles = userProfile?.warehouseRoles || [];
        
        // On every fresh login, wipe the previous session's permissions immediately.
        // This prevents stale accessiblePages (from an old role) from leaking into the
        // new session before completeSetup() is called.
        localStorage.removeItem("accessiblePages");
        localStorage.removeItem("permissionsVersion");
        setAccessiblePages([]);

        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("authUser", JSON.stringify(userProfile));
        localStorage.setItem("warehouseRoles", JSON.stringify(roles));
        
        setIsAuthenticated(true);
        setUser(userProfile);
        setWarehouseRoles(roles);
    }, []);

    const completeSetup = useCallback(async (warehouse, role) => {
        setPermissionsLoading(true);
        let pages = [];
        try {
            const { authService } = await import("../services/authService");
            const res = await authService.getRolePermissions(warehouse.warehouseId, role.roleId);
            if (res.status === "success") {
                pages = res.message.accessiblePages || [];
                setAccessiblePages(pages);
            } else {
                setAccessiblePages([]);
            }
        } catch (error) {
            console.error("Failed to fetch permissions", error);
            setAccessiblePages([]);
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
