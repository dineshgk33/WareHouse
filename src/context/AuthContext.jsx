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

    const getPermissionsForRole = (roleName) => {
        if (!roleName) return [];
        switch (roleName) {
            case "Administrator":
                return [
                    "View Dashboard",
                    "View Inventory", "Manage Inventory", "Adjust Stock Levels",
                    "View Orders", "Update Order Status", "Generate Labels", "Print Labels",
                    "View Darkhouses", "Manage Darkhouses",
                    "View Customers", "Edit Customer Profiles", "Verify Customers",
                    "View Analytics", "Export Analytics Reports",
                    "View Billing", "Manage Billing Plans", "View Invoices",
                    "View Settings", "Edit Role", "Create Role", "Delete Role",
                    "View Users", "Manage Users", "Assign User Roles"
                ];
            case "Store Manager":
                return [
                    "View Dashboard",
                    "View Inventory", "Manage Inventory", "Adjust Stock Levels",
                    "View Orders", "Update Order Status", "Generate Labels", "Print Labels",
                    "View Darkhouses", "Manage Darkhouses"
                ];
            case "Operation Head":
                return [
                    "View Dashboard",
                    "View Analytics", "Export Analytics Reports",
                    "View Reports", "View Operations"
                ];
            default:
                // Fallback permissions matching typical WMS operations for other roles
                return [
                    "View Dashboard",
                    "View Inventory",
                    "View Orders",
                    "View Darkhouses"
                ];
        }
    };

    const permissions = selectedRoleName ? getPermissionsForRole(selectedRoleName) : [];

    const login = useCallback((responseData) => {
        const userProfile = responseData.message;
        const roles = userProfile?.warehouseRoles || [];
        
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("authUser", JSON.stringify(userProfile));
        localStorage.setItem("warehouseRoles", JSON.stringify(roles));
        
        setIsAuthenticated(true);
        setUser(userProfile);
        setWarehouseRoles(roles);
    }, []);

    const completeSetup = useCallback((warehouse, role) => {
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
        
        setIsAuthenticated(false);
        setUser(null);
        setWarehouseRoles([]);
        setSelectedWarehouseId("");
        setSelectedWarehouseName("");
        setSelectedRoleId("");
        setSelectedRoleName("");
        setSelectedWarehouse(null);
        setSelectedRole(null);
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
