import axios from 'axios';

async function run() {
    const payload = {
        email: "vignesh235376@gmail.com",
        password: "vignesh@2006"
    };
    try {
        console.log("Sending login payload with actual password:", payload);
        const res = await axios.post("https://www.haatza.com/_functions/loginEmployee", payload);
        console.log("Response data:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Error status:", err.response ? err.response.status : err.message);
        console.error("Error body:", err.response ? JSON.stringify(err.response.data, null, 2) : "none");
    }
}

run();
