import axios from 'axios';

async function run() {
    const payload = {
        warehouseId: "WH-001",
        roleId: "operations"
    };
    try {
        console.log("Sending getRolePermissions payload:", payload);
        const res = await axios.post("https://haatza.com/_functions/getRolePermissions", payload);
        console.log("Response data:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Error status:", err.response ? err.response.status : err.message);
        console.error("Error body:", err.response ? JSON.stringify(err.response.data, null, 2) : "none");
    }
}

run();
