// ordersData.js - Comprehensive mock data for HAATZA Orders, Picking, Packing, and Delivery Tracking

export const MOCK_ORDERS = [
    {
        id: "#ORD-8821",
        customer: "Sophia Bennett",
        initials: "SB",
        color: "avatar-indigo",
        date: "01 Jun 2026",
        items: 3,
        amount: "₹249.00",
        payment: "Credit Card",
        status: "Delivered",
        mobile: "+91 98765 43210"
    },
    {
        id: "#ORD-8820",
        customer: "Marcus Johnson",
        initials: "MJ",
        color: "avatar-teal",
        date: "01 Jun 2026",
        items: 1,
        amount: "₹59.95",
        payment: "PayPal",
        status: "Shipped",
        mobile: "+91 87654 32109"
    },
    {
        id: "#ORD-8819",
        customer: "Aisha Rahman",
        initials: "AR",
        color: "avatar-rose",
        date: "01 Jun 2026",
        items: 5,
        amount: "₹512.40",
        payment: "Transfer Bank",
        status: "Processing",
        mobile: "+91 76543 21098"
    },
    {
        id: "#ORD-8818",
        customer: "David Müller",
        initials: "DM",
        color: "avatar-amber",
        date: "31 May 2026",
        items: 2,
        amount: "₹134.99",
        payment: "COD",
        status: "Pending",
        mobile: "+91 99880 12345"
    },
    {
        id: "#ORD-8817",
        customer: "Priya Nair",
        initials: "PN",
        color: "avatar-violet",
        date: "31 May 2026",
        items: 4,
        amount: "₹389.00",
        payment: "Credit Card",
        status: "Delivered",
        mobile: "+91 65432 10987"
    },
    {
        id: "#ORD-8816",
        customer: "Liam O'Brien",
        initials: "LO",
        color: "avatar-sky",
        date: "30 May 2026",
        items: 1,
        amount: "₹78.50",
        payment: "PayPal",
        status: "Cancelled",
        mobile: "+91 54321 09876"
    },
    {
        id: "#ORD-8815",
        customer: "Fatima Al-Hassan",
        initials: "FA",
        color: "avatar-green",
        date: "30 May 2026",
        items: 6,
        amount: "₹730.20",
        payment: "Transfer Bank",
        status: "Shipped",
        mobile: "+91 43210 98765"
    },
    {
        id: "#ORD-8814",
        customer: "Carlos Rivera",
        initials: "CR",
        color: "avatar-orange",
        date: "29 May 2026",
        items: 2,
        amount: "₹199.00",
        payment: "COD",
        status: "Pending",
        mobile: "+91 99880 54321"
    }
];

export const MOCK_PICKING = [
    {
        id: "PCK-4021",
        orderId: "#ORD-8818",
        customer: "David Müller",
        picker: "Ramesh Kumar",
        productsCount: 3,
        status: "Assigned"
    },
    {
        id: "PCK-4022",
        orderId: "#ORD-8814",
        customer: "Carlos Rivera",
        picker: "Unassigned",
        productsCount: 2,
        status: "Pending"
    },
    {
        id: "PCK-4023",
        orderId: "#ORD-8819",
        customer: "Aisha Rahman",
        picker: "Sunita Sharma",
        productsCount: 5,
        status: "Completed"
    },
    {
        id: "PCK-4024",
        orderId: "#ORD-8815",
        customer: "Fatima Al-Hassan",
        picker: "Ramesh Kumar",
        productsCount: 6,
        status: "Completed"
    },
    {
        id: "PCK-4025",
        orderId: "#ORD-8822",
        customer: "Maya Patel",
        picker: "Unassigned",
        productsCount: 4,
        status: "Pending"
    }
];

export const MOCK_PACKING = [
    {
        id: "PAK-5031",
        orderId: "#ORD-8818",
        customer: "David Müller",
        packedBy: "Unassigned",
        items: 2,
        status: "Waiting"
    },
    {
        id: "PAK-5032",
        orderId: "#ORD-8819",
        customer: "Aisha Rahman",
        packedBy: "Vikram Malhotra",
        items: 5,
        status: "Packing"
    },
    {
        id: "PAK-5033",
        orderId: "#ORD-8821",
        customer: "Sophia Bennett",
        packedBy: "Ananya Iyer",
        items: 3,
        status: "Packed"
    },
    {
        id: "PAK-5034",
        orderId: "#ORD-8817",
        customer: "Priya Nair",
        packedBy: "Ananya Iyer",
        items: 4,
        status: "Packed"
    }
];

export const MOCK_DELIVERY = [
    {
        id: "DLV-6011",
        orderId: "#ORD-8820",
        customer: "Marcus Johnson",
        rider: "Suresh Singh",
        eta: "10 mins",
        location: "Sector 4, Koramangala",
        status: "Out for Delivery"
    },
    {
        id: "DLV-6012",
        orderId: "#ORD-8815",
        customer: "Fatima Al-Hassan",
        rider: "Amit Patel",
        eta: "Arrived",
        location: "GK-1 Extension",
        status: "Delivered"
    },
    {
        id: "DLV-6013",
        orderId: "#ORD-8821",
        customer: "Sophia Bennett",
        rider: "Amit Patel",
        eta: "Completed",
        location: "Koramangala 3rd Block",
        status: "Delivered"
    },
    {
        id: "DLV-6014",
        orderId: "#ORD-8816",
        customer: "Liam O'Brien",
        rider: "Suresh Singh",
        eta: "N/A",
        location: "N/A",
        status: "Failed"
    },
    {
        id: "DLV-6015",
        orderId: "#ORD-8817",
        customer: "Priya Nair",
        rider: "Unassigned",
        eta: "25 mins",
        location: "Indiranagar Hub",
        status: "Assigned"
    }
];
