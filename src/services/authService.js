import axios from "axios";
import { getFallbackAccessiblePages } from "../utils/rbacFallback";

// Load environment variables for API configuration
const VITE_API_URL = import.meta.env.VITE_API_URL || "";
const PERMISSIONS_API_KEY = import.meta.env.VITE_PERMISSIONS_API_KEY || "";

// ─── AUTH SERVICE API PLACEHOLDERS ──────────────────────────────────────────
// DO NOT ASSIGN VALUES. Values will be provided later.
const LOGIN_API = VITE_API_URL || "/_functions/loginEmployee";
const LOGOUT_API = "";
const REFRESH_TOKEN_API = "";
const GET_USER_PROFILE_API = "";
const GET_USER_PERMISSIONS_API = import.meta.env.VITE_PERMISSIONS_API_URL || "";
const GET_ROLE_ACCESS_API = "";
const GET_SIDEBAR_ACCESS_API = "";
const GET_WAREHOUSE_ROLES_API = "/_functions/getWarehouseRoles";
const CREATE_MEMBER_API = "";
const UPLOAD_MEDIA_API = "/_functions/uploadMedia";
const CHECK_EMPLOYEE_API = "/_functions/checkWarehouseemployee";
const CREATE_EMPLOYEE_API = "/_functions/createWarehouseEmployee";
const UPDATE_EMPLOYEE_API = "/_functions/updateEmployeeMasters";
const GET_EMPLOYEES_API = "/_functions/getWarehouseEmployees";

// Warehouse Management API endpoints
const GET_WAREHOUSES_API = "/_functions/getWarehouses";
const CREATE_WAREHOUSE_API = "/_functions/createWarehouse";
const UPDATE_WAREHOUSE_API = "/_functions/updateWarehouse";
const MAP_WAREHOUSE_API = "/_functions/mapWarehouse";

export const authService = {
    login: async (email, password) => {
        const response = await axios.post(LOGIN_API, {
            email,
            password
        });
        return response.data;
    },
    
    getRolePermissions: async (warehouseId, roleId, roleName) => {
        if (!GET_USER_PERMISSIONS_API) {
            return {
                status: "success",
                message: {
                    accessiblePages: getFallbackAccessiblePages(roleName || roleId)
                }
            };
        }
        try {
            const headers = {};
            if (PERMISSIONS_API_KEY) {
                headers["Authorization"] = `Bearer ${PERMISSIONS_API_KEY}`;
                headers["X-API-Key"] = PERMISSIONS_API_KEY;
            }
            const response = await axios.post(GET_USER_PERMISSIONS_API, {
                warehouseId,
                roleId
            }, { headers });
            return response.data;
        } catch (error) {
            console.warn(`Failed to fetch permissions for ${roleId}, falling back to default matrix:`, error);
            return {
                status: "success",
                message: {
                    accessiblePages: getFallbackAccessiblePages(roleName || roleId)
                }
            };
        }
    },

    getWarehouseRoles: async (warehouseId) => {
        const response = await axios.get(`${GET_WAREHOUSE_ROLES_API}?warehouseId=${warehouseId}`);
        return response.data;
    },

    createMember: async (memberData) => {
        const headers = {};
        if (!(memberData instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }
        const response = await axios.post(CREATE_MEMBER_API, memberData, { headers });
        return response.data;
    },

    uploadMedia: async (fileName, fileData, mediaType) => {
        const response = await axios.post(UPLOAD_MEDIA_API, {
            fileName,
            fileData,
            mediaType
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        return response.data;
    },

    checkWarehouseEmployee: async (email) => {
        const response = await axios.get(`${CHECK_EMPLOYEE_API}?email=${encodeURIComponent(email)}`);
        return response.data;
    },

    createWarehouseEmployee: async (employeeData) => {
        const response = await axios.post(CREATE_EMPLOYEE_API, employeeData);
        return response.data;
    },

    updateEmployeeMasters: async (employeeData) => {
        const response = await axios.post(UPDATE_EMPLOYEE_API, employeeData);
        return response.data;
    },

    getWarehouseEmployees: async (warehouseId) => {
        const response = await axios.get(`${GET_EMPLOYEES_API}?warehouseId=${warehouseId}`);
        return response.data;
    },

    getWarehouses: async (page = 1, limit = 100) => {
        const response = await axios.get(`${GET_WAREHOUSES_API}?page=${page}&limit=${limit}`);
        return response.data;
    },

    createWarehouse: async (warehouseData) => {
        const response = await axios.post(CREATE_WAREHOUSE_API, warehouseData);
        return response.data;
    },

    updateWarehouse: async (warehouseData) => {
        const response = await axios.post(UPDATE_WAREHOUSE_API, warehouseData);
        return response.data;
    },

    mapWarehouse: async (mainWarehouseId, darkHouseIds) => {
        const response = await axios.post(MAP_WAREHOUSE_API, {
            mainWarehouseId,
            darkHouseId: darkHouseIds
        });
        return response.data;
    }
};

export {
    LOGIN_API,
    LOGOUT_API,
    REFRESH_TOKEN_API,
    GET_USER_PROFILE_API,
    GET_USER_PERMISSIONS_API,
    GET_ROLE_ACCESS_API,
    GET_SIDEBAR_ACCESS_API,
    GET_WAREHOUSE_ROLES_API,
    CREATE_MEMBER_API,
    UPLOAD_MEDIA_API,
    CHECK_EMPLOYEE_API,
    CREATE_EMPLOYEE_API,
    UPDATE_EMPLOYEE_API,
    GET_EMPLOYEES_API,
    GET_WAREHOUSES_API,
    CREATE_WAREHOUSE_API,
    UPDATE_WAREHOUSE_API,
    MAP_WAREHOUSE_API
};
