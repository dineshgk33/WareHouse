import axios from 'axios';
const PERMISSIONS_API_URL = "https://haatza.com/_functions/getRolePermissions";
axios.post(PERMISSIONS_API_URL, {
    warehouseId: "WH002",
    roleId: "ROLE-INV-01"
})
  .then(res => {
      console.log("WH002 ROLE-INV-01 permissions response:", JSON.stringify(res.data, null, 2));
  })
  .catch(err => {
      console.error("Error details:", err.response ? err.response.data : err.message);
  });
