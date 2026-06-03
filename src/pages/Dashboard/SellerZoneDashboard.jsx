import React from "react";
import { 
    CheckSquare, 
    DollarSign, 
    ShoppingBag, 
    Eye, 
    ArrowUpRight, 
    Plus, 
    Layers, 
    Play,
    Sparkles
} from "lucide-react";
import "./SellerZoneDashboard.css";

function SellerZoneDashboard() {
    return (
        <div className="sz-dashboard-container">
            {/* Split Grid Layout */}
            <div className="sz-grid">
                
                {/* Left Side: Brand Promo Hero Banner */}
                <div className="sz-hero-card">
                    <div className="sz-hero-content">
                        <div className="sz-badge">
                            <Sparkles size={14} className="sz-badge-icon" />
                            <span>Seller Zone Premium</span>
                        </div>
                        <h1 className="sz-hero-title">
                            Start Selling.<br />
                            <span className="sz-hero-glow">Start Growing.</span>
                        </h1>
                        <p className="sz-hero-desc">
                            Create powerful product listings and grow your business faster with Haatza's intelligent seller tools.
                        </p>
                        
                        <div className="sz-hero-actions">
                            <button className="sz-btn sz-btn-primary">
                                <Layers size={16} />
                                <span>My Listings</span>
                            </button>
                            <button className="sz-btn sz-btn-outline">
                                <span>In Progress</span>
                                <span className="sz-btn-badge">2</span>
                            </button>
                            <button className="sz-btn sz-btn-add">
                                <Plus size={16} />
                                <span>Add Product</span>
                                <div className="sz-mouse-pointer-mock">
                                    <div className="pointer-arrow"></div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: 2x2 KPI Dashboard Cards */}
                <div className="sz-kpi-grid">
                    
                    {/* Card 1: Featured Listing Showcase */}
                    <div className="sz-card sz-featured-card">
                        <div className="sz-featured-header">
                            <div className="sz-check-circle">
                                <CheckSquare size={18} className="sz-check-icon" />
                            </div>
                            <span className="sz-featured-tag-blue">Electronics</span>
                            <span className="sz-featured-tag-green">Live</span>
                        </div>
                        <h3 className="sz-featured-name">Wireless Earbuds Pro</h3>
                        <div className="sz-featured-price">$89.99</div>
                        
                        <div className="sz-featured-footer">
                            <span className="sz-rating">★ 4.8</span>
                            <span className="sz-sold-count">124 sold</span>
                        </div>
                    </div>

                    {/* Card 2: Total Revenue with Sparkline */}
                    <div className="sz-card sz-kpi-revenue">
                        <div className="sz-kpi-header">
                            <span className="sz-kpi-label">TOTAL REVENUE</span>
                            <div className="sz-kpi-icon-wrap">
                                <DollarSign size={16} />
                            </div>
                        </div>
                        <div className="sz-kpi-value">$48.3k</div>
                        
                        {/* Custom Sparkline SVG */}
                        <div className="sz-sparkline-container">
                            <svg className="sz-sparkline-svg" viewBox="0 0 100 30">
                                <path 
                                    d="M0,25 Q15,10 30,22 T60,8 T90,15 T100,5" 
                                    fill="none" 
                                    stroke="#2563EB" 
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                                <path 
                                    d="M0,25 Q15,10 30,22 T60,8 T90,15 T100,5 L100,30 L0,30 Z" 
                                    fill="url(#sparkline-grad)" 
                                    opacity="0.1"
                                />
                                <defs>
                                    <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#2563EB" />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        <div className="sz-kpi-change sz-change-up">
                            <span className="change-arrow">↑ 23.4%</span>
                            <span className="change-label">vs last month</span>
                        </div>
                    </div>

                    {/* Card 3: Total Orders with Mini Bar Chart */}
                    <div className="sz-card sz-kpi-orders">
                        <div className="sz-kpi-header">
                            <span className="sz-kpi-label">TOTAL ORDERS</span>
                            <div className="sz-kpi-icon-wrap-green">
                                <ShoppingBag size={16} />
                            </div>
                        </div>
                        <div className="sz-kpi-value">1,284</div>
                        
                        {/* Mini Bar Chart */}
                        <div className="sz-barchart-container">
                            <div className="sz-bar" style={{height: "35%"}}></div>
                            <div className="sz-bar" style={{height: "55%"}}></div>
                            <div className="sz-bar" style={{height: "40%"}}></div>
                            <div className="sz-bar" style={{height: "70%"}}></div>
                            <div className="sz-bar" style={{height: "50%"}}></div>
                            <div className="sz-bar" style={{height: "85%"}}></div>
                            <div className="sz-bar" style={{height: "65%"}}></div>
                        </div>

                        <div className="sz-kpi-change sz-change-up">
                            <span className="change-arrow-green">↑ 18.2%</span>
                            <span className="change-label">fulfilled 98%</span>
                        </div>
                    </div>

                    {/* Card 4: Product Views with Radial Progress */}
                    <div className="sz-card sz-kpi-views">
                        <div className="sz-kpi-header">
                            <span className="sz-kpi-label">PRODUCT VIEWS</span>
                            <div className="sz-kpi-icon-wrap-purple">
                                <Eye size={16} />
                            </div>
                        </div>
                        <div className="sz-kpi-value">92.4k</div>
                        
                        {/* Progress Bar & Users */}
                        <div className="sz-views-meta">
                            <div className="sz-progress-line-container">
                                <div className="sz-progress-line-fill" style={{width: "72%"}}></div>
                            </div>
                            
                            <div className="sz-views-details">
                                <span className="sz-organic-badge">72% organic</span>
                                <div className="sz-users-overlap">
                                    <div className="sz-user-circle bg-blue">C</div>
                                    <div className="sz-user-circle bg-green">R</div>
                                    <div className="sz-user-circle bg-purple">A</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default SellerZoneDashboard;
