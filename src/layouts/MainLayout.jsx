import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import "./MainLayout.css";

function MainLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // Close mobile sidebar automatically after navigation
    useEffect(() => {
        setTimeout(() => {
            setMobileOpen(false);
        }, 0);
    }, [location.pathname, location.search]);

    // Handle screen resize to apply default state rules
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setIsCollapsed(false); // Mobile drawer shows label and icons (no collapsed mode on mobile!)
            } else if (width >= 768 && width < 1024) {
                setIsCollapsed(true); // Collapsed (mini sidebar) on tablet
            } else {
                setIsCollapsed(false); // Expanded on desktop
            }
        };

        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ESC key listener to close mobile drawer
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setMobileOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className={`layout-container app-layout ${isCollapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "mobile-sidebar-active" : ""}`}>
            {mobileOpen && (
                <div className="sidebar-mobile-backdrop" onClick={() => setMobileOpen(false)} />
            )}
            
            <Sidebar 
                isCollapsed={isCollapsed} 
                toggleSidebar={toggleSidebar} 
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />
            
            <div className="layout-main">
                <Topbar onOpenMobileSidebar={() => setMobileOpen(true)} />
                <main className="layout-content fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;