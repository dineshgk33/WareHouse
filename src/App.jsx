import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { useAuth } from "./context/AuthContext";
import { ALL_ENTERPRISE_ROLES, ROLES } from "./constants/roles";

// Role-based Access Arrays
const DASHBOARD_ROLES = [ROLES.ADMINISTRATOR, ROLES.STORE_MANAGER, ROLES.OPERATION_HEAD];
const MANAGER_ROLES = [ROLES.ADMINISTRATOR, ROLES.STORE_MANAGER];
const ANALYTICS_ROLES = [ROLES.ADMINISTRATOR, ROLES.OPERATION_HEAD];
const ADMIN_ROLES = [ROLES.ADMINISTRATOR];
const OPERATION_HEAD_ONLY = [ROLES.OPERATION_HEAD];

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────
const MainLayout              = lazy(() => import("./layouts/MainLayout"));
const Dashboard               = lazy(() => import("./pages/Dashboard/Dashboard.jsx"));
const Orders                  = lazy(() => import("./pages/Orders/OrdersPage.jsx"));
const Inventory               = lazy(() => import("./pages/Inventory/InventoryPage.jsx"));
const Analytics               = lazy(() => import("./pages/Analytics/AnalyticsPage.jsx"));
const Customers               = lazy(() => import("./pages/Customers/CustomersPage.jsx"));
const Billing                 = lazy(() => import("./pages/Billing/BillingPage.jsx"));
const Settings                = lazy(() => import("./pages/Settings/SettingsPage.jsx"));
const Darkhouses              = lazy(() => import("./pages/Darkhouses/DarkhousesPage.jsx"));

// Dynamic Role Pages
const ReportsPage             = lazy(() => import("./pages/Reports/ReportsPage.jsx"));
const OperationsPage          = lazy(() => import("./pages/Operations/OperationsPage.jsx"));

// Auth & Setup Pages
const LoginPage               = lazy(() => import("./pages/Auth/LoginPage.jsx"));
const OrgRoleSelectionPage    = lazy(() => import("./pages/Auth/OrgRoleSelectionPage.jsx"));
const SellerZoneDashboard     = lazy(() => import("./pages/Dashboard/SellerZoneDashboard.jsx"));

// Catalog Module Sub-Pages
const CatalogProducts         = lazy(() => import("./pages/catalog/Products/ProductsPage.jsx"));
const CatalogCategories       = lazy(() => import("./pages/catalog/Categories/CategoriesPage.jsx"));
const CatalogBrands           = lazy(() => import("./pages/catalog/Brands/BrandsPage.jsx"));
const CatalogAttributes       = lazy(() => import("./pages/catalog/Attributes/AttributesPage.jsx"));
const CatalogVariants         = lazy(() => import("./pages/catalog/Variants/VariantsPage.jsx"));
const CatalogPricing          = lazy(() => import("./pages/catalog/Pricing/PricingPage.jsx"));
const CatalogMapping          = lazy(() => import("./pages/catalog/Mapping/MappingPage.jsx"));
const CatalogBulkUpload       = lazy(() => import("./pages/catalog/BulkUpload/BulkUploadPage.jsx"));
const CatalogMediaLibrary     = lazy(() => import("./pages/catalog/MediaLibrary/MediaLibraryPage.jsx"));
const CatalogProductAudit     = lazy(() => import("./pages/catalog/ProductAudit/ProductAuditPage.jsx"));

// ─── Page Loader ──────────────────────────────────────────────────────────────
function PageLoader() {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            width: "100%",
        }}>
            <div style={{
                width: 36,
                height: 36,
                border: "3px solid #e5e7eb",
                borderTopColor: "#1e60ff",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ─── Protected Route Wrapper ──────────────────────────────────────────────────
function ProtectedRoute({ allowedRoles }) {
    const { isAuthenticated, userRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!userRole || !ALL_ENTERPRISE_ROLES.includes(userRole)) {
        return <Navigate to="/connect" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/seller-zone" replace />;
    }

    return <Outlet />;
}

// ─── 404 Not Found Page ───────────────────────────────────────────────────────
function NotFoundPage() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: 16,
            fontFamily: "var(--font-sans, sans-serif)",
            background: "var(--bg-app, #F6F8FF)",
        }}>
            <span style={{ fontSize: 72, lineHeight: 1 }}>404</span>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Page Not Found</h1>
            <p style={{ color: "#6B7280", fontSize: 14 }}>
                The page you are looking for does not exist.
            </p>
            <a
                href="/"
                style={{
                    marginTop: 8,
                    padding: "10px 24px",
                    background: "#1e60ff",
                    color: "#fff",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 14,
                }}
            >
                Back to Dashboard
            </a>
        </div>
    );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
function App() {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public Auth & Connection Selection Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/connect" element={<OrgRoleSelectionPage />} />

                        {/* Protected Enterprise Routes */}
                        <Route element={<ProtectedRoute allowedRoles={ALL_ENTERPRISE_ROLES} />}>
                            <Route path="/" element={<MainLayout />}>
                                {/* Shared Seller Fallback Portal Route */}
                                <Route path="seller-zone" element={<SellerZoneDashboard />} />

                                {/* Shared Dashboard View */}
                                <Route element={<ProtectedRoute allowedRoles={DASHBOARD_ROLES} />}>
                                    <Route index element={<Dashboard />} />
                                    <Route path="dashboard" element={<Dashboard />} />
                                </Route>

                                {/* Store Managers and Administrators */}
                                <Route element={<ProtectedRoute allowedRoles={MANAGER_ROLES} />}>
                                    <Route path="darkhouses" element={<Darkhouses />} />
                                    <Route path="orders" element={<Orders />} />
                                    <Route path="inventory"  element={<Inventory />} />

                                    {/* Catalog Module Routes */}
                                    <Route path="catalog/products"   element={<CatalogProducts />} />
                                    <Route path="catalog/categories" element={<CatalogCategories />} />
                                    <Route path="catalog/brands"     element={<CatalogBrands />} />
                                    <Route path="catalog/attributes" element={<CatalogAttributes />} />
                                    <Route path="catalog/variants"   element={<CatalogVariants />} />
                                    <Route path="catalog/pricing"    element={<CatalogPricing />} />
                                    <Route path="catalog/mapping"    element={<CatalogMapping />} />
                                    <Route path="catalog/bulk-upload" element={<CatalogBulkUpload />} />
                                    <Route path="catalog/media"      element={<CatalogMediaLibrary />} />
                                    <Route path="catalog/audit"      element={<CatalogProductAudit />} />

                                    {/* Legacy alias route */}
                                    <Route path="products" element={<CatalogProducts />} />
                                </Route>

                                {/* Operation Heads and Administrators */}
                                <Route element={<ProtectedRoute allowedRoles={ANALYTICS_ROLES} />}>
                                    <Route path="analytics"  element={<Analytics />} />
                                </Route>

                                {/* Administrator Exclusive Pages */}
                                <Route element={<ProtectedRoute allowedRoles={ADMIN_ROLES} />}>
                                    <Route path="customers"  element={<Customers />} />
                                    <Route path="billing"    element={<Billing />} />
                                    <Route path="settings"   element={<Settings />} />
                                </Route>

                                {/* Operation Head Exclusive Pages */}
                                <Route element={<ProtectedRoute allowedRoles={OPERATION_HEAD_ONLY} />}>
                                    <Route path="reports" element={<ReportsPage />} />
                                    <Route path="operations" element={<OperationsPage />} />
                                </Route>
                            </Route>
                        </Route>

                        {/* 404 — explicit not-found page */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </ErrorBoundary>
        </BrowserRouter>
    );
}

export default App;