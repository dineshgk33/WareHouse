import axios from 'axios';

async function run() {
    const payload = {
        email: "vignesh235376@gmail.com",
        employeeId: "EMP0005",
        employeeCode: "EMP0005",
        photo: ""
    };
    try {
        console.log("Querying Vignesh password...");
        const res = await axios.post("https://www.haatza.com/_functions/updateEmployeeMasters", payload, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        console.log("Response data:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Error status:", err.response ? err.response.status : err.message);
        console.error("Error body:", err.response ? JSON.stringify(err.response.data, null, 2) : "none");
    }
}

run();
