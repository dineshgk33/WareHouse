const fs = require('fs');

async function runTests() {
    console.log("=== Running Settings, Workspace & Navigation Tests ===");
    let passed = 0;
    let failed = 0;

    const assert = (condition, message) => {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    };

    try {
        // 1. Verify that 'settings' is always added to the bottom items in Sidebar.jsx
        const sidebarSource = fs.readFileSync('src/components/Sidebar/Sidebar.jsx', 'utf8');
        assert(sidebarSource.includes('bottomItems.push({'), "Sidebar logic can inject items to bottom modules");
        assert(sidebarSource.includes('id: "settings"'), "Sidebar injects 'settings' into the menu");
        assert(sidebarSource.includes('const hasSettings = bottomItems.some'), "Sidebar checks if Settings exists before pushing");

        // 2. Verify that '/settings' does not require a specific pageId in App.jsx ProtectedRoute
        const appSource = fs.readFileSync('src/App.jsx', 'utf8');
        assert(appSource.includes('<Route path="settings" element={<Settings />} />'), "Settings route exists");
        
        // Settings should be directly inside `<Route element={<ProtectedRoute allowedRoles={ALL_ENTERPRISE_ROLES} />}>`
        // without a specific pageId block
        const settingsIndex = appSource.indexOf('<Route path="settings" element={<Settings />} />');
        const surroundingText = appSource.substring(settingsIndex - 200, settingsIndex + 100);
        assert(!surroundingText.includes('<ProtectedRoute pageId='), "Settings route is not restricted by a specific pageId");

        // 3. Verify SwitchWorkspaceModal is available and correctly aggregates roles
        const topbarSource = fs.readFileSync('src/components/Topbar/Topbar.jsx', 'utf8');
        assert(topbarSource.includes('workspace-switcher-btn'), "Workspace switcher button exists in Topbar");
        assert(topbarSource.includes('setIsSwitchModalOpen(true)'), "Workspace switcher can be opened");

        const switchModalSource = fs.readFileSync('src/components/Topbar/SwitchWorkspaceModal.jsx', 'utf8');
        assert(switchModalSource.includes('const uniqueWarehouses = React.useMemo('), "SwitchWorkspaceModal memoizes uniqueWarehouses");
        assert(switchModalSource.includes('warehouseMap.set(item.warehouseId, whObj)'), "SwitchWorkspaceModal maps warehouses properly");
        assert(switchModalSource.includes('whObj.roles.push'), "SwitchWorkspaceModal aggregates roles under warehouses");
        
        // 4. Verify AdminPage routing fix for role-permissions
        const adminPageSource = fs.readFileSync('src/pages/Admin/AdminPage.jsx', 'utf8');
        assert(adminPageSource.includes('if (tabFromPath === "role-permissions") tabFromPath = "permissions";'), "AdminPage maps role-permissions correctly");
        assert(adminPageSource.includes('if (tabFromPath === "user-management") tabFromPath = "users";'), "AdminPage maps user-management correctly");

        console.log(`\n=== Test Summary ===`);
        console.log(`Total: ${passed + failed}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);

        if (failed > 0) {
            process.exit(1);
        }
    } catch (e) {
        console.error("Test execution failed:", e);
        process.exit(1);
    }
}

runTests();
