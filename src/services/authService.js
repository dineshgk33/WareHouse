import axios from "axios";

// Read API URL from environment variables, defaulting to relative path if not specified
const LOGIN_API_URL = import.meta.env.VITE_API_URL || "";

export const authService = {
    login: async (email, password) => {
        // Perform real Axios POST call to backend login API
        const response = await axios.post(`${LOGIN_API_URL}/api/login`, {
            email,
            password
        });
        return response.data;
    }
};
