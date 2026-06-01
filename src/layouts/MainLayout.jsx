import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import "./MainLayout.css";

function MainLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    return (
        <div className={`layout-container ${isCollapsed ? "sidebar-collapsed" : ""}`}>
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
            
            <div className="layout-main">
                <Topbar />
                <main className="layout-content fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;