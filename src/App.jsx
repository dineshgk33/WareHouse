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
const Dashboard               = lazy(() => import("./pages/Dashboard/Dashboard.jsx"));
const Orders                  = lazy(() => import("./pages/Orders/OrdersPage.jsx"));
const Receiving               = lazy(() => import("./pages/receiving/ReceivingPage.jsx"));
const DispatchPage            = lazy(() => import("./pages/dispatch/DispatchPage.jsx"));
const GRNPage                 = lazy(() => import("./pages/grn/GRNPage.jsx"));
const WarehouseCatalogue      = lazy(() => import("./pages/catalogue/warehouse/WarehouseCataloguePage.jsx"));
const DarkhouseProducts       = lazy(() => import("./pages/catalogue/darkhouse/ProductsPage.jsx"));
const DarkhouseInventory      = lazy(() => import("./pages/catalogue/darkhouse/InventoryPage.jsx"));
const FindProductToSell       = lazy(() => import("./pages/catalogue/darkhouse/FindProductToSellPage.jsx"));
const StockTransfers          = lazy(() => import("./pages/catalogue/transfers/StockTransfersPage.jsx"));
const IndentPage              = lazy(() => import("./pages/catalogue/indent/IndentPage.jsx"));
const Analytics               = lazy(() => import("./pages/Analytics/AnalyticsPage.jsx"));
const Customers               = lazy(() => import("./pages/Customers/CustomersPage.jsx"));
const Billing                 = lazy(() => import("./pages/Billing/BillingPage.jsx"));
const Settings                = lazy(() => import("./pages/Settings/SettingsPage.jsx"));
const Darkhouses              = lazy(() => import("./pages/Darkhouses/DarkhousesPage.jsx"));
const ManagePreview           = lazy(() => import("./pages/ManagePreview/ManagePreviewPage.jsx"));

// Purchase Module Pages
const PurchaseDashboard       = lazy(() => import("./pages/purchase/PurchaseDashboard.jsx"));
const PurchaseRequisition     = lazy(() => import("./pages/purchase/PurchaseRequisition.jsx"));
const PurchaseOrders          = lazy(() => import("./pages/purchase/PurchaseOrders.jsx"));
const Vendors                 = lazy(() => import("./pages/purchase/Vendors.jsx"));
const InboundDeliveries       = lazy(() => import("./pages/purchase/InboundDeliveries.jsx"));
const PurchaseGRN             = lazy(() => import("./pages/purchase/PurchaseGRN.jsx"));
const VendorPerformance       = lazy(() => import("./pages/purchase/VendorPerformance.jsx"));

// Dynamic Role Pages
const ReportsPage             = lazy(() => import("./pages/Reports/ReportsPage.jsx"));
const OperationsPage          = lazy(() => import("./pages/Operations/OperationsPage.jsx"));
const DynamicMissingPage      = lazy(() => import("./pages/common/DynamicMissingPage.jsx"));

// Admin Module
const AdminPage               = lazy(() => import("./pages/Admin/AdminPage.jsx"));

// Auth & Setup Pages
const LoginPage               = lazy(() => import("./pages/Auth/LoginPage.jsx"));
const OrgRoleSelectionPage    = lazy(() => import("./pages/Auth/OrgRoleSelectionPage.jsx"));
const AccessDeniedPage        = lazy(() => import("./pages/Auth/AccessDeniedPage.jsx"));
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

import PageLoader from "./components/common/PageLoader";

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

                                {/* Manage Preview */}
                                <Route element={<ProtectedRoute pageId="MANAGE_PREVIEW" />}>
                                    <Route path="manage-preview" element={<ManagePreview />} />
                                </Route>

                                {/* Orders */}
                                <Route element={<ProtectedRoute pageId="ORDERS" />}>
                                    <Route path="orders" element={<Orders />} />
                                    <Route path="orders/pending" element={<Orders />} />
                                </Route>

                                {/* Receiving Management */}
                                <Route element={<ProtectedRoute pageId={["ORDERS", "RECEIVING"]} />}>
                                    <Route path="receiving" element={<Receiving />} />
                                </Route>

                                {/* Dispatch Management */}
                                <Route element={<ProtectedRoute pageId="DISPATCH" />}>
                                    <Route path="dispatch" element={<DispatchPage />} />
                                </Route>

                                {/* GRN (Goods Receipt Note) */}
                                <Route element={<ProtectedRoute pageId="GRN" />}>
                                    <Route path="grn" element={<GRNPage />} />
                                </Route>

                                <Route element={<ProtectedRoute pageId={["WAREHOUSE_INVENTORY", "DARKHOUSE_INVENTORY", "STOCK_TRANSFERS"]} />}>
                                    <Route path="catalogue/warehouse" element={<WarehouseCatalogue />} />
                                    <Route path="catalogue/darkhouse/products" element={<DarkhouseProducts />} />
                                    <Route path="catalogue/darkhouse/inventory" element={<DarkhouseInventory />} />
                                    <Route path="catalogue/darkhouse/find-product-to-sell" element={<FindProductToSell />} />
                                    <Route path="catalogue/transfers" element={<StockTransfers />} />
                                </Route>

                                {/* Stock Requests */}
                                <Route element={<ProtectedRoute pageId="INDENT" />}>
                                    <Route path="indent" element={<IndentPage />} />
                                </Route>

                                {/* Purchase Management Module */}
                                <Route element={<ProtectedRoute pageId="PURCHASE" />}>
                                    <Route path="purchase/dashboard" element={<PurchaseDashboard />} />
                                    <Route path="purchase/requisition" element={<PurchaseRequisition />} />
                                    <Route path="purchase/orders" element={<PurchaseOrders />} />
                                    <Route path="purchase/vendors" element={<Vendors />} />
                                    <Route path="purchase/deliveries" element={<InboundDeliveries />} />
                                    <Route path="purchase/grn" element={<PurchaseGRN />} />
                                    <Route path="purchase/performance" element={<VendorPerformance />} />
                                </Route>

                                {/* Darkhouses */}
                                <Route element={<ProtectedRoute pageId="DARKHOUSES" />}>
                                    <Route path="darkhouses" element={<Darkhouses />} />
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

                                {/* Admin — Unified Command Console sub-routes */}
                                <Route element={<ProtectedRoute pageId="ADMIN" />}>
                                    <Route path="admin/users" element={<AdminPage />} />
                                    <Route path="admin/permissions" element={<AdminPage />} />
                                    <Route path="admin/rolemaster" element={<AdminPage />} />
                                    <Route path="admin/warehouses" element={<AdminPage />} />
                                    <Route path="admin/warehouse-mapping" element={<AdminPage />} />
                                    <Route path="admin/categories" element={<AdminPage />} />
                                    <Route path="admin/products" element={<AdminPage />} />
                                    <Route path="admin" element={<Navigate to="/admin/users" replace />} />
                                    <Route path="admin/members" element={<Navigate to="/admin/users" replace />} />
                                    <Route path="admin/roles" element={<Navigate to="/admin/permissions" replace />} />
                                </Route>

                                {/* Reports */}
                                <Route element={<ProtectedRoute pageId="REPORTS" />}>
                                    <Route path="reports" element={<ReportsPage />} />
                                    <Route path="reports/:reportType" element={<ReportsPage />} />
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

                                {/* Global Support Route */}
                                <Route element={<ProtectedRoute pageId="SUPPORT" />}>
                                    <Route path="support" element={<DynamicMissingPage />} />
                                </Route>

                                {/* Operations Module Routes */}
                                <Route element={<ProtectedRoute pageId="OPERATIONS_ORDER_PICKING" />}>
                                    <Route path="operations/order-picking" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="OPERATIONS_ORDER_PACKING" />}>
                                    <Route path="operations/order-packing" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="OPERATIONS_STORE_OPERATIONS" />}>
                                    <Route path="operations/store-operations" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="OPERATIONS_SHIFT_MANAGEMENT" />}>
                                    <Route path="operations/shift-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="OPERATIONS_WORKFORCE_MANAGEMENT" />}>
                                    <Route path="operations/workforce-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="OPERATIONS_PERFORMANCE_REPORTS" />}>
                                    <Route path="operations/performance-reports" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="OPERATIONS_SUPPORT" />}>
                                    <Route path="operations/support" element={<DynamicMissingPage />} />
                                </Route>

                                {/* Inventory Module Routes */}
                                <Route element={<ProtectedRoute pageId="INVENTORY_STOCK_INWARD" />}>
                                    <Route path="inventory/stock-inward" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INVENTORY_STOCK_ADJUSTMENT" />}>
                                    <Route path="inventory/stock-adjustment" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INVENTORY_INVENTORY_AUDIT" />}>
                                    <Route path="inventory/inventory-audit" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INVENTORY_BIN_LOCATION_MANAGEMENT" />}>
                                    <Route path="inventory/bin-location-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INVENTORY_EXPIRY_MANAGEMENT" />}>
                                    <Route path="inventory/expiry-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INVENTORY_LOW_STOCK_ALERTS" />}>
                                    <Route path="inventory/low-stock-alerts" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="INVENTORY_SUPPORT" />}>
                                    <Route path="inventory/support" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="WAREHOUSE_INVENTORY" />}>
                                    <Route path="inventory/inventory-management" element={<DynamicMissingPage />} />
                                    <Route path="inventory/stock-transfer" element={<StockTransfers />} />
                                </Route>

                                {/* Purchase Module Routes */}
                                <Route element={<ProtectedRoute pageId="PURCHASE_VENDOR_PAYMENTS_STATUS" />}>
                                    <Route path="purchase/vendor-payments-status" element={<DynamicMissingPage />} />
                                    <Route path="purchase/vendor-management" element={<Vendors />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="PURCHASE_REPORTS" />}>
                                    <Route path="purchase/purchase-reports" element={<DynamicMissingPage />} />
                                    <Route path="purchase/purchase-requests" element={<PurchaseRequisition />} />
                                    <Route path="purchase/purchase-orders" element={<PurchaseOrders />} />
                                    <Route path="purchase/goods-receipt-grn" element={<PurchaseGRN />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="PURCHASE_SUPPORT" />}>
                                    <Route path="purchase/support" element={<DynamicMissingPage />} />
                                </Route>

                                {/* Logistics & Delivery Routes */}
                                <Route element={<ProtectedRoute pageId="LOGISTICS_DELIVERY_ASSIGNMENT" />}>
                                    <Route path="logistics-delivery/delivery-assignment" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="LOGISTICS_DELIVERY_TRACKING" />}>
                                    <Route path="logistics-delivery/delivery-tracking" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="LOGISTICS_RIDER_MANAGEMENT" />}>
                                    <Route path="logistics-delivery/rider-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="LOGISTICS_ROUTE_MANAGEMENT" />}>
                                    <Route path="logistics-delivery/route-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="LOGISTICS_DELIVERY_REPORTS" />}>
                                    <Route path="logistics-delivery/delivery-reports" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="LOGISTICS_RETURN_PICKUP_MANAGEMENT" />}>
                                    <Route path="logistics-delivery/return-pickup-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="LOGISTICS_SUPPORT" />}>
                                    <Route path="logistics-delivery/support" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="REPORTS" />}>
                                     <Route path="operations/reports" element={<ReportsPage />} />
                                     <Route path="inventory/reports" element={<ReportsPage />} />
                                     <Route path="purchase/reports" element={<ReportsPage />} />
                                     <Route path="logistics-delivery/reports" element={<ReportsPage />} />
                                     <Route path="customer-support/reports" element={<ReportsPage />} />
                                     <Route path="sales-business/reports" element={<ReportsPage />} />
                                     <Route path="marketing/reports" element={<ReportsPage />} />
                                     <Route path="finance-accounts/reports" element={<ReportsPage />} />
                                     <Route path="human-resources/reports" element={<ReportsPage />} />
                                     <Route path="information-technology/reports" element={<ReportsPage />} />
                                     <Route path="administration/reports" element={<ReportsPage />} />
                                </Route>

                                {/* Customer Support Routes */}
                                <Route element={<ProtectedRoute pageId="CUSTOMER_SUPPORT_CUSTOMER_TICKETS" />}>
                                    <Route path="customer-support/customer-tickets" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="CUSTOMER_SUPPORT_ORDER_LOOKUP" />}>
                                    <Route path="customer-support/order-lookup" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="CUSTOMER_SUPPORT_REFUND_REQUESTS" />}>
                                    <Route path="customer-support/refund-requests" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="CUSTOMER_SUPPORT_RETURN_REQUESTS" />}>
                                    <Route path="customer-support/return-requests" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="CUSTOMER_SUPPORT_COMPLAINT_MANAGEMENT" />}>
                                    <Route path="customer-support/complaint-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="CUSTOMER_SUPPORT_CUSTOMER_CHAT" />}>
                                    <Route path="customer-support/customer-chat" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="CUSTOMER_SUPPORT_CUSTOMER_FEEDBACK" />}>
                                    <Route path="customer-support/customer-feedback" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="CUSTOMER_SUPPORT_SUPPORT" />}>
                                    <Route path="customer-support/support" element={<DynamicMissingPage />} />
                                </Route>

                                {/* Sales & Business Routes */}
                                <Route element={<ProtectedRoute pageId="SALES_BUSINESS_MERCHANT_MANAGEMENT" />}>
                                    <Route path="sales-business/merchant-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="SALES_BUSINESS_PARTNER_MANAGEMENT" />}>
                                    <Route path="sales-business/partner-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="SALES_BUSINESS_LEADS_MANAGEMENT" />}>
                                    <Route path="sales-business/leads-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="SALES_BUSINESS_BUSINESS_OPPORTUNITIES" />}>
                                    <Route path="sales-business/business-opportunities" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="SALES_BUSINESS_SALES_REPORTS" />}>
                                    <Route path="sales-business/sales-reports" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="SALES_BUSINESS_EXPANSION_PLANNING" />}>
                                    <Route path="sales-business/expansion-planning" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="SALES_BUSINESS_SUPPORT" />}>
                                    <Route path="sales-business/support" element={<DynamicMissingPage />} />
                                </Route>

                                {/* Marketing Routes */}
                                <Route element={<ProtectedRoute pageId="MARKETING_CAMPAIGN_MANAGEMENT" />}>
                                    <Route path="marketing/campaign-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="MARKETING_COUPONS_OFFERS" />}>
                                    <Route path="marketing/coupons-offers" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="MARKETING_BANNER_MANAGEMENT" />}>
                                    <Route path="marketing/banner-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="MARKETING_PUSH_NOTIFICATIONS" />}>
                                    <Route path="marketing/push-notifications" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="MARKETING_CUSTOMER_SEGMENTATION" />}>
                                    <Route path="marketing/customer-segmentation" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="MARKETING_MARKETING_ANALYTICS" />}>
                                    <Route path="marketing/marketing-analytics" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="MARKETING_SUPPORT" />}>
                                    <Route path="marketing/support" element={<DynamicMissingPage />} />
                                </Route>

                                {/* Finance & Accounts Routes */}
                                <Route element={<ProtectedRoute pageId="FINANCE_ACCOUNTS_VENDOR_PAYMENTS" />}>
                                    <Route path="finance-accounts/vendor-payments" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="FINANCE_ACCOUNTS_CUSTOMER_REFUNDS" />}>
                                    <Route path="finance-accounts/customer-refunds" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="FINANCE_ACCOUNTS_SETTLEMENTS" />}>
                                    <Route path="finance-accounts/settlements" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="FINANCE_ACCOUNTS_REVENUE_REPORTS" />}>
                                    <Route path="finance-accounts/revenue-reports" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="FINANCE_ACCOUNTS_EXPENSE_MANAGEMENT" />}>
                                    <Route path="finance-accounts/expense-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="FINANCE_ACCOUNTS_GST_REPORTS" />}>
                                    <Route path="finance-accounts/gst-reports" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="FINANCE_ACCOUNTS_PROFIT_LOSS_REPORTS" />}>
                                    <Route path="finance-accounts/profit-loss-reports" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="FINANCE_ACCOUNTS_WALLET_MANAGEMENT" />}>
                                    <Route path="finance-accounts/wallet-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="FINANCE_ACCOUNTS_SUPPORT" />}>
                                    <Route path="finance-accounts/support" element={<DynamicMissingPage />} />
                                </Route>

                                {/* Human Resources Routes */}
                                <Route element={<ProtectedRoute pageId="EMPLOYEES" />}>
                                    <Route path="human-resources/employee-management" element={<AdminPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="HR_ATTENDANCE" />}>
                                    <Route path="human-resources/attendance" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="HR_LEAVE_MANAGEMENT" />}>
                                    <Route path="human-resources/leave-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="HR_PAYROLL" />}>
                                    <Route path="human-resources/payroll" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="HR_RECRUITMENT" />}>
                                    <Route path="human-resources/recruitment" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="HR_PERFORMANCE_REVIEWS" />}>
                                    <Route path="human-resources/performance-reviews" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="HR_OFFER_LETTERS" />}>
                                    <Route path="human-resources/offer-letters" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="HR_SUPPORT" />}>
                                    <Route path="human-resources/support" element={<DynamicMissingPage />} />
                                </Route>

                                {/* Information Technology Routes */}
                                <Route element={<ProtectedRoute pageId="IT_USER_MANAGEMENT" />}>
                                    <Route path="information-technology/user-management" element={<AdminPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="IT_ROLE_PERMISSIONS" />}>
                                    <Route path="information-technology/role-permissions" element={<AdminPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="IT_API_LOGS" />}>
                                    <Route path="information-technology/api-logs" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="IT_SYSTEM_LOGS" />}>
                                    <Route path="information-technology/system-logs" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="IT_DEVICE_MANAGEMENT" />}>
                                    <Route path="information-technology/device-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="IT_SECURITY_SETTINGS" />}>
                                    <Route path="information-technology/security-settings" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="IT_APPLICATION_SETTINGS" />}>
                                    <Route path="information-technology/application-settings" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="IT_SUPPORT" />}>
                                    <Route path="information-technology/support" element={<DynamicMissingPage />} />
                                </Route>

                                {/* Administration Routes */}
                                <Route element={<ProtectedRoute pageId="ADMINISTRATION_ASSET_MANAGEMENT" />}>
                                    <Route path="administration/asset-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ADMINISTRATION_FACILITY_MANAGEMENT" />}>
                                    <Route path="administration/facility-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ADMINISTRATION_OFFICE_SUPPLIES" />}>
                                    <Route path="administration/office-supplies" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ADMINISTRATION_VEHICLE_MANAGEMENT" />}>
                                    <Route path="administration/vehicle-management" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ADMINISTRATION_GENERAL_ADMINISTRATION" />}>
                                    <Route path="administration/general-administration" element={<DynamicMissingPage />} />
                                </Route>
                                <Route element={<ProtectedRoute pageId="ADMINISTRATION_SUPPORT" />}>
                                    <Route path="administration/support" element={<DynamicMissingPage />} />
                                </Route>

                                {/* Settings */}
                                <Route path="settings" element={<Settings />} />
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