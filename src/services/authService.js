import axios from "axios";

// Helper to resolve URLs dynamically, routing through the Vite proxy on localhost to avoid CORS errors
const resolveUrl = (url) => {
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        return url.replace("https://www.haatza.com", "").replace("https://haatza.com", "");
    }
    return url;
};

// Read API URL and keys from environment variables, defaulting to relative path or empty if not specified
const LOGIN_API_URL = resolveUrl(import.meta.env.VITE_API_URL || "https://www.haatza.com/_functions/loginEmployee");
const PERMISSIONS_API_URL = resolveUrl(import.meta.env.VITE_PERMISSIONS_API_URL || "https://www.haatza.com/_functions/getRolePermissions");
const PERMISSIONS_API_KEY = import.meta.env.VITE_PERMISSIONS_API_KEY || ""; // API Key can be pasted here or loaded from .env
const ROLES_API_URL = resolveUrl(import.meta.env.VITE_ROLES_API_URL || "https://www.haatza.com/_functions/getWarehouseRoles");
const CREATE_MEMBER_API_URL = resolveUrl(import.meta.env.VITE_CREATE_MEMBER_API_URL || "https://www.haatza.com/_functions/createMember");
const EMPLOYEES_API_URL = resolveUrl(import.meta.env.VITE_EMPLOYEES_API_URL || "https://www.haatza.com/_functions/getWarehouseEmployees");

export const authService = {
    login: async (email, password) => {
        // Perform real Axios POST call to backend login API without custom headers to avoid CORS preflight errors
        const response = await axios.post(LOGIN_API_URL, {
            email,
            password
        });
        return response.data;
    },
    
    getRolePermissions: async (warehouseId, roleId) => {
        const headers = {
            "Content-Type": "application/json"
        };
        if (PERMISSIONS_API_KEY) {
            headers["x-api-key"] = PERMISSIONS_API_KEY;
        }
        const response = await axios.post(PERMISSIONS_API_URL, {
            warehouseId,
            roleId
        }, { headers });
        return response.data;
    },

    getWarehouseRoles: async (warehouseId) => {
        const response = await axios.get(`${ROLES_API_URL}?warehouseId=${warehouseId}`);
        return response.data;
    },

    createMember: async (memberData) => {
        const headers = {};
        if (!(memberData instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }
        if (PERMISSIONS_API_KEY) {
            headers["x-api-key"] = PERMISSIONS_API_KEY;
        }
        const response = await axios.post(CREATE_MEMBER_API_URL, memberData, { headers });
        return response.data;
    },

    uploadMedia: async (fileName, fileData, mediaType) => {
        const response = await axios.post(resolveUrl("https://www.haatza.com/_functions/uploadMedia"), {
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

    createWarehouseEmployee: async (employeeData) => {
        const response = await axios.post(resolveUrl("https://www.haatza.com/_functions/createWarehouseEmployee"), employeeData, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        return response.data;
    },

    getWarehouseEmployees: async (warehouseId) => {
        const response = await axios.get(`${EMPLOYEES_API_URL}?warehouseId=${warehouseId}`);
        return response.data;
    }
};
