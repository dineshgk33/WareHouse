import axios from 'axios';

async function run() {
    try {
        console.log("Calling getWarehouses...");
        const res = await axios.get("https://haatza.com/_functions/getWarehouses");
        console.log("Response getWarehouses:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Error getWarehouses:", err.response ? err.response.status : err.message);
    }
}

run();
