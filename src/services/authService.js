import axios from "axios";

// Read API URL from environment variables, defaulting to relative path if not specified
const LOGIN_API_URL = import.meta.env.VITE_API_URL || "https://haatza.com/_functions/loginEmployee";
const PERMISSIONS_API_URL = import.meta.env.VITE_PERMISSIONS_API_URL || "https://haatza.com/_functions/getRolePermissions";

export const authService = {
    login: async (email, password) => {
        // Perform real Axios POST call to backend login API
        const response = await axios.post(LOGIN_API_URL, {
            email,
            password
        });
        return response.data;
    },
    
    getRolePermissions: async (warehouseId, roleId) => {
        const response = await axios.post(PERMISSIONS_API_URL, {
            warehouseId,
            roleId
        });
        return response.data;
    }
};
