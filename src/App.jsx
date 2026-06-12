import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { useAuth } from "./contexts/AuthContext";
import { ALL_ENTERPRISE_ROLES, ROLES } from "./constants/roles";

// Role-based Access Arrays
const DASHBOARD_ROLES = [ROLES.ADMINISTRATOR, ROLES.STORE_MANAGER, ROLES.OPERATION_HEAD];
const MANAGER_ROLES = [ROLES.ADMINISTRATOR, ROLES.STORE_MANAGER];
const ANALYTICS_ROLES = [ROLES.ADMINISTRATOR, ROLES.OPERATION_HEAD];
const ADMIN_ROLES = [ROLES.ADMINISTRATOR];
const OPERATION_HEAD_ONLY = [ROLES.OPERATION_HEAD];

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────
const MainLayout              = lazy(() => import("./layouts/MainLayout"));
const Dashboard               = lazy(() => import("./pages/dashboard/Dashboard.jsx"));
const Orders                  = lazy(() => import("./pages/orders/OrdersPage.jsx"));
const InvoiceDownloadPage     = lazy(() => import("./pages/orders/InvoiceDownloadPage.jsx"));
const PlaceholderPage         = lazy(() => import("./pages/PlaceholderPage.jsx"));
const WarehouseCatalogue      = lazy(() => import("./pages/catalogue/warehouse/WarehouseCataloguePage.jsx"));
const DarkhouseProducts       = lazy(() => import("./pages/catalogue/darkhouse/ProductsPage.jsx"));
const DarkhouseInventory      = lazy(() => import("./pages/catalogue/darkhouse/InventoryPage.jsx"));
const FindProductToSell       = lazy(() => import("./pages/catalogue/darkhouse/FindProductToSellPage.jsx"));
const StockTransfers          = lazy(() => import("./pages/catalogue/transfers/StockTransfersPage.jsx"));
const Analytics               = lazy(() => import("./pages/analytics/AnalyticsPage.jsx"));
const Customers               = lazy(() => import("./pages/customers/CustomersPage.jsx"));
const Billing                 = lazy(() => import("./pages/billing/BillingPage.jsx"));
const Settings                = lazy(() => import("./pages/settings/SettingsPage.jsx"));
const ManagePreview           = lazy(() => import("./pages/managepreview/ManagePreviewPage.jsx"));

// Dynamic Role Pages
const ReportsPage             = lazy(() => import("./pages/reports/ReportsPage.jsx"));
const OperationsPage          = lazy(() => import("./pages/operations/OperationsPage.jsx"));

// Admin Module
const AdminPage               = lazy(() => import("./pages/admin/AdminPage.jsx"));

// Auth & Setup Pages
const LoginPage               = lazy(() => import("./pages/auth/LoginPage.jsx"));
const OrgRoleSelectionPage    = lazy(() => import("./pages/auth/OrgRoleSelectionPage.jsx"));
const AccessDeniedPage        = lazy(() => import("./pages/auth/AccessDeniedPage.jsx"));
const SellerZoneDashboard     = lazy(() => import("./pages/dashboard/SellerZoneDashboard.jsx"));

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
function ProtectedRoute({ allowedRoles, pageId }) {
    const { isAuthenticated, userRole, canView, permissionsLoading, accessiblePages } = useAuth();

    if (permissionsLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (pageId) {
        // If accessiblePages is empty, the user hasn't selected a role yet
        // (or stale permissions were discarded). Send them to /connect.
        if (accessiblePages.length === 0) {
            return <Navigate to="/connect" replace />;
        }
        const hasAccess = Array.isArray(pageId)
            ? pageId.some(id => canView(id))
            : canView(pageId);
        if (!hasAccess) {
            return <Navigate to="/unauthorized" replace />;
        }
    } else {
        if (!userRole || !ALL_ENTERPRISE_ROLES.includes(userRole)) {
            return <Navigate to="/connect" replace />;
        }

        if (allowedRoles && !allowedRoles.includes(userRole)) {
            return <Navigate to="/seller-zone" replace />;
        }
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
                        <Route path="/403" element={<AccessDeniedPage />} />
                        <Route path="/unauthorized" element={<AccessDeniedPage />} />
                        <Route path="/orders/download-pdf/:orderId" element={<InvoiceDownloadPage />} />

                        {/* Protected Enterprise Routes */}
                        <Route element={<ProtectedRoute allowedRoles={ALL_ENTERPRISE_ROLES} />}>
                            <Route path="/" element={<MainLayout />}>
                                {/* Shared Seller Fallback Portal Route */}
                                <Route path="seller-zone" element={<SellerZoneDashboard />} />

                                {/* Dashboard */}
                                <Route element={<ProtectedRoute pageId="DASHBOARD" />}>
                                    <Route index element={<Dashboard />} />
                                    <Route path="dashboard" element={<Dashboard />} />
                                </Route>

                                {/* Module 3: Admin Sub-Pages */}
                                <Route element={<ProtectedRoute pageId="ADMIN_USERS" />}>
                                    <Route path="admin/users" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ADMIN_PERMISSIONS" />}>
                                    <Route path="admin/permissions" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ADMIN_ROLE_MASTER" />}>
                                    <Route path="admin/role-master" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ADMIN_FACILITIES" />}>
                                    <Route path="admin/facilities" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ADMIN_CATEGORIES" />}>
                                    <Route path="admin/categories" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ADMIN_PRODUCTS" />}>
                                    <Route path="admin/products" element={<PlaceholderPage />} />
                                </Route>

                                {/* Module 5: Inventory Management */}
                                <Route element={<ProtectedRoute pageId="INV_WH_LIST" />}>
                                    <Route path="inventory/warehouse-list" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INV_ADJUSTMENT" />}>
                                    <Route path="inventory/adjustment" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INV_HISTORY" />}>
                                    <Route path="inventory/history" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INV_DH_ADJUSTMENT" />}>
                                    <Route path="inventory/darkhouse-adjustment" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INV_DH_HISTORY" />}>
                                    <Route path="inventory/darkhouse-history" element={<PlaceholderPage />} />
                                </Route>

                                {/* Module 6: GRN */}
                                <Route element={<ProtectedRoute pageId="GRN_LIST" />}>
                                    <Route path="grn/list" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="GRN_CREATE" />}>
                                    <Route path="grn/create" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="GRN_DETAILS" />}>
                                    <Route path="grn/details" element={<PlaceholderPage />} />
                                </Route>

                                {/* Module 7: Indent Management */}
                                <Route element={<ProtectedRoute pageId="INDENT_LIST" />}>
                                    <Route path="indent/list" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INDENT_CREATE" />}>
                                    <Route path="indent/create" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INDENT_DETAILS" />}>
                                    <Route path="indent/details" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INDENT_PENDING" />}>
                                    <Route path="indent/status/pending" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INDENT_APPROVED" />}>
                                    <Route path="indent/status/approved" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INDENT_REJECTED" />}>
                                    <Route path="indent/status/rejected" element={<PlaceholderPage />} />
                                </Route>

                                {/* Module 8: Dispatch Management */}
                                <Route element={<ProtectedRoute pageId="DISPATCH_LIST" />}>
                                    <Route path="dispatch/list" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="DISPATCH_CREATE" />}>
                                    <Route path="dispatch/create" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="DISPATCH_DETAILS" />}>
                                    <Route path="dispatch/details" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="DISPATCH_TRACKING" />}>
                                    <Route path="dispatch/tracking" element={<PlaceholderPage />} />
                                </Route>

                                {/* Module 9: Receiving Management */}
                                <Route element={<ProtectedRoute pageId="RECEIVING_PENDING" />}>
                                    <Route path="receiving/pending" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="RECEIVING_PROCESS" />}>
                                    <Route path="receiving/process" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="RECEIVING_HISTORY" />}>
                                    <Route path="receiving/history" element={<PlaceholderPage />} />
                                </Route>

                                {/* Module 10: Reports Sub-Pages */}
                                <Route element={<ProtectedRoute pageId="REP_INV_SUMMARY" />}>
                                    <Route path="reports/inventory-summary" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="REP_LOW_STOCK" />}>
                                    <Route path="reports/low-stock" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="REP_INV_MOVEMENT" />}>
                                    <Route path="reports/inventory-movement" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="REP_INDENT" />}>
                                    <Route path="reports/indent" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="REP_DISPATCH" />}>
                                    <Route path="reports/dispatch" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="REP_RECEIVING" />}>
                                    <Route path="reports/receiving" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="REP_ORDER_SUMMARY" />}>
                                    <Route path="reports/order-summary" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="REP_ORDERS_BY_DH" />}>
                                    <Route path="reports/orders-by-darkhouse" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="REP_TOP_SELLING" />}>
                                    <Route path="reports/top-selling" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="REP_ORDER_STATUS" />}>
                                    <Route path="reports/order-status" element={<PlaceholderPage />} />
                                </Route>

                                {/* Module 11: Orders Sub-Pages */}
                                <Route element={<ProtectedRoute pageId="ORD_MANAGEMENT" />}>
                                    <Route path="orders/management" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ORD_LIST" />}>
                                    <Route path="orders/list" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ORD_DETAILS" />}>
                                    <Route path="orders/details" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ORD_QUERY" />}>
                                    <Route path="orders/query" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ORD_PICKING" />}>
                                    <Route path="orders/picking" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ORD_PACKING" />}>
                                    <Route path="orders/packing" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ORD_DELIVERY" />}>
                                    <Route path="orders/delivery" element={<PlaceholderPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ORD_CANCELLED" />}>
                                    <Route path="orders/cancelled" element={<PlaceholderPage />} />
                                </Route>

                                {/* Manage Preview */}
                                <Route element={<ProtectedRoute pageId="MANAGE_PREVIEW" />}>
                                    <Route path="manage-preview" element={<ManagePreview />} />
                                </Route>

                                {/* Orders */}
                                <Route element={<ProtectedRoute pageId="ORDERS" />}>
                                    <Route path="orders" element={<Orders />} />
                                    <Route path="orders/pending" element={<Orders />} />
                                </Route>

                                {/* Warehouse & Darkhouse Catalogue */}
                                <Route element={<ProtectedRoute pageId={["WAREHOUSE_INVENTORY", "DARKHOUSE_INVENTORY", "STOCK_TRANSFERS"]} />}>
                                    <Route path="catalogue/warehouse" element={<WarehouseCatalogue />} />
                                    <Route path="catalogue/darkhouse/products" element={<DarkhouseProducts />} />
                                    <Route path="catalogue/darkhouse/inventory" element={<DarkhouseInventory />} />
                                    <Route path="catalogue/darkhouse/find-product-to-sell" element={<FindProductToSell />} />
                                    <Route path="catalogue/transfers" element={<StockTransfers />} />
                                </Route>


                                {/* Catalog Module Routes */}
                                <Route element={<ProtectedRoute allowedRoles={MANAGER_ROLES} pageId="CATALOG" />}>
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

                                {/* Analytics */}
                                <Route element={<ProtectedRoute pageId="ANALYTICS" />}>
                                    <Route path="analytics" element={<Analytics />} />
                                </Route>

                                {/* Employees */}
                                <Route element={<ProtectedRoute pageId="EMPLOYEES" />}>
                                    <Route path="employees" element={<AdminPage />} />
                                </Route>

                                {/* Admin — Members & User Roles */}
                                <Route element={<ProtectedRoute pageId="ADMIN" />}>
                                    <Route path="admin/members" element={<AdminPage />} />
                                    <Route path="admin/roles" element={<AdminPage />} />
                                    <Route path="admin" element={<AdminPage />} />
                                </Route>

                                {/* Reports */}
                                <Route element={<ProtectedRoute pageId="REPORTS" />}>
                                    <Route path="reports" element={<ReportsPage />} />
                                </Route>

                                {/* Operations */}
                                <Route element={<ProtectedRoute pageId="OPERATIONS" />}>
                                    <Route path="operations" element={<OperationsPage />} />
                                </Route>

                                {/* Customers */}
                                <Route element={<ProtectedRoute pageId="CUSTOMERS" />}>
                                    <Route path="customers" element={<Customers />} />
                                </Route>

                                {/* Billing */}
                                <Route element={<ProtectedRoute pageId="BILLING" />}>
                                    <Route path="billing" element={<Billing />} />
                                </Route>

                                {/* Settings */}
                                <Route element={<ProtectedRoute pageId="SETTINGS" />}>
                                    <Route path="settings" element={<Settings />} />
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