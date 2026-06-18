import axios from 'axios';

async function run() {
    try {
        console.log("Calling getWarehouseRoles for WH-001...");
        const res = await axios.get("https://haatza.com/_functions/getWarehouseRoles?warehouseId=WH-001");
        console.log("Response WH-001:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Error for WH-001:", err.response ? err.response.status : err.message);
    }

    try {
        console.log("Calling getWarehouseRoles for WH002...");
        const res = await axios.get("https://haatza.com/_functions/getWarehouseRoles?warehouseId=WH002");
        console.log("Response WH002:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Error for WH002:", err.response ? err.response.status : err.message);
    }
}

run();
