import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import { DEFAULT_ROLES } from "../../constants/rolePermissions";
import PermissionsViewerModal from "./PermissionsViewerModal";
import AdminVerificationModal from "./AdminVerificationModal";
import "./roles.css";

function UserRolesSection({ showToast }) {
    const { selectedWarehouseId, selectedWarehouseName, userName, userPassword } = useAuth();

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [viewerOpen, setViewerOpen] = useState(false);

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

    useEffect(() => {
        if (!selectedWarehouseId) {
            setEmployees([]);
            return;
        }

        let isMounted = true;
        setLoading(true);
        setError("");

        authService.getWarehouseEmployees(selectedWarehouseId)
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
                            console.error("Failed to parse body JSON in UserRolesSection", e);
                        }
                    }
                } else if (res && Array.isArray(res)) {
                    rawEmployees = res;
                } else if (res && Array.isArray(res.employees)) {
                    rawEmployees = res.employees;
                }

                const mapped = rawEmployees.map((emp, index) => {
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
                        employeeId: emp.employeeId || emp.employeeCode || `EMP-${index}`,
                        role: roleNames.length > 0 ? roleNames.join(", ") : "Member",
                        roles: roleNames.length > 0 ? roleNames : ["Member"],
                        warehouse: warehouseNames.length > 0 ? warehouseNames.join(", ") : (selectedWarehouseName || "Warehouse"),
                        warehouses: warehouseNames.length > 0 ? warehouseNames : [selectedWarehouseName || "Warehouse"],
                        status: emp.status || "Active",
                        avatar: avatar,
                        initials: initials
                    };
                });

                setEmployees(mapped);
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error("Failed to fetch employees:", err);
                setError(err.message || "Failed to load team members.");
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [selectedWarehouseId, selectedWarehouseName]);

    const selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId) || null;

    // Map employee's warehouse roles to their corresponding permissions defined in DEFAULT_ROLES
    const getEmployeePermissions = (empId, employeeRoles) => {
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
    };

    const selectedEmployeeRoleObj = selectedEmployee
        ? {
              id: selectedEmployee.id,
              name: selectedEmployee.name,
              description: `Assigned Roles: ${selectedEmployee.roles.join(", ")} at ${
                  selectedEmployee.warehouse
              }`,
              permissions: getEmployeePermissions(selectedEmployee.id, selectedEmployee.roles),
          }
        : null;

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

    const requestVerification = useCallback((config) => {
        setVerifyConfig(config);
        setAdminVerifyOpen(true);
    }, []);

    const handleAdminVerified = useCallback(() => {
        verifyConfig?.onSuccess?.();
        setVerifyConfig(null);
        setAdminVerifyOpen(false);
    }, [verifyConfig]);

    const handleSavePermissions = (updatedPermissions, onSuccess) => {
        if (!selectedEmployee) return;
        requestVerification({
            message: "Permission changes affect system security. Please enter administrator password to continue.",
            confirmLabel: "Verify & Save",
            onSuccess: () => {
                setCustomPermissions((prev) => ({
                    ...prev,
                    [selectedEmployee.id]: updatedPermissions,
                }));
                showToast?.("Employee permissions updated successfully.");
                if (onSuccess) onSuccess();
            },
        });
    };

    return (
        <div className="tab-panel-content fade-in">
            <div className="panel-title-block">
                <h3>Employee Roles & Access</h3>
                <p>View and manage system permissions for all registered warehouse employees.</p>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px", color: "#64748b" }}>
                    Loading employees...
                </div>
            ) : error ? (
                <p className="roles-audit-empty" style={{ color: "#dc2626" }}>{error}</p>
            ) : employees.length === 0 ? (
                <p className="roles-audit-empty">No employees found for this warehouse.</p>
            ) : (
                <div className="roles-breakdown-list">
                    {employees.map((emp) => (
                        <article className="role-card" key={emp.id}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    marginBottom: "16px",
                                }}
                            >
                                {emp.avatar ? (
                                    <img
                                        src={emp.avatar}
                                        alt={emp.name}
                                        style={{
                                            width: "44px",
                                            height: "44px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            border: "2px solid #e2e8f0",
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="role-card__badge"
                                        style={{
                                            width: "44px",
                                            height: "44px",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: "bold",
                                            fontSize: "15px",
                                            background: "#020079",
                                            color: "#ffffff",
                                        }}
                                    >
                                        {emp.initials}
                                    </div>
                                )}
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <h4
                                        style={{
                                            margin: 0,
                                            fontSize: "15px",
                                            color: "#1e293b",
                                            fontWeight: "600",
                                        }}
                                    >
                                        {emp.name}
                                    </h4>
                                    <span style={{ fontSize: "12px", color: "#64748b" }}>{emp.employeeId}</span>
                                </div>
                            </div>
                            <div
                                className="role-card__header"
                                style={{ marginTop: "0", display: "flex", flexDirection: "column", gap: "4px" }}
                            >
                                <div style={{ fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                                    <strong>Role:</strong> {emp.role}
                                </div>
                                <div style={{ fontSize: "12px", color: "#64748b" }}>
                                    <strong>Email:</strong> {emp.email}
                                </div>
                            </div>
                            <p
                                className="role-card__desc"
                                style={{ marginTop: "8px", minHeight: "auto", fontSize: "12px" }}
                            >
                                Status:{" "}
                                <span
                                    style={{
                                        fontWeight: "600",
                                        color: emp.status === "Active" ? "#16a34a" : "#dc2626",
                                    }}
                                >
                                    {emp.status}
                                </span>
                            </p>
                            <div
                                className="role-card__footer"
                                style={{ marginTop: "16px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}
                            >
                                <button
                                    type="button"
                                    className="role-btn role-btn--ghost"
                                    onClick={() => {
                                        setSelectedEmployeeId(emp.id);
                                        setViewerOpen(true);
                                    }}
                                >
                                    View Permissions
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <PermissionsViewerModal
                isOpen={viewerOpen}
                role={selectedEmployeeRoleObj}
                onClose={() => {
                    setViewerOpen(false);
                }}
                onSave={handleSavePermissions}
            />

            <AdminVerificationModal
                isOpen={adminVerifyOpen}
                administratorName={userName}
                message={
                    verifyConfig?.message ||
                    "You are attempting to modify permissions. Please enter your administrator password to continue."
                }
                confirmLabel={verifyConfig?.confirmLabel || "Verify & Save"}
                onClose={() => {
                    setAdminVerifyOpen(false);
                    setVerifyConfig(null);
                }}
                onVerify={handleAdminVerified}
                verifyPassword={verifyPassword}
            />
        </div>
    );
}

export default UserRolesSection;
