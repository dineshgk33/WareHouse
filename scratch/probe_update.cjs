const axios = require('axios');

async function test() {
    try {
        const payload = {
            email: "dinesh.gk@haatza.com",
            employeeId: "EMP-12345",
            phone: 9876543210,
            photo: "",
            permissions: ["View Inventory", "Manage Inventory"]
        };
        console.log("Sending payload:", payload);
        const res = await axios.post("https://www.haatza.com/_functions/updateEmployeeMasters", payload);
        console.log("Success response:", res.data);
    } catch (err) {
        console.log("Status code:", err.response ? err.response.status : err.message);
        console.log("Response body:", err.response ? JSON.stringify(err.response.data, null, 2) : "no response");
    }
}

test();
