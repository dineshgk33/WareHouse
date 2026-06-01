// darkhousesData.js - Comprehensive mock data for HAATZA Darkhouse Managers and Assigned Products

export const MOCK_MANAGERS = [
    {
        id: "MGR-201",
        name: "Amit Sharma",
        email: "amit.sharma@haatza.com",
        phone: "+91 98765 01234",
        darkhouse: "HAATZA Koramangala Hub",
        shift: "Morning",
        status: "Active",
        avatarColor: "avatar-indigo",
        initials: "AS"
    },
    {
        id: "MGR-202",
        name: "Rohan Mehta",
        email: "rohan.mehta@haatza.com",
        phone: "+91 91234 56789",
        darkhouse: "HAATZA Powai Depot",
        shift: "Evening",
        status: "Active",
        avatarColor: "avatar-teal",
        initials: "RM"
    },
    {
        id: "MGR-203",
        name: "Priya Rao",
        email: "priya.rao@haatza.com",
        phone: "+91 98876 54321",
        darkhouse: "HAATZA Indiranagar Hub",
        shift: "Morning",
        status: "Active",
        avatarColor: "avatar-purple",
        initials: "PR"
    },
    {
        id: "MGR-204",
        name: "Vikram Singh",
        email: "vikram.singh@haatza.com",
        phone: "+91 99991 23456",
        darkhouse: "HAATZA GK-1 Warehouse",
        shift: "Night",
        status: "Active",
        avatarColor: "avatar-cyan",
        initials: "VS"
    },
    {
        id: "MGR-205",
        name: "Neha Patil",
        email: "neha.patil@haatza.com",
        phone: "+91 98221 87654",
        darkhouse: "HAATZA Bandra West Hub",
        shift: "Evening",
        status: "On Leave",
        avatarColor: "avatar-rose",
        initials: "NP"
    },
    {
        id: "MGR-206",
        name: "Sanjay Dutt",
        email: "sanjay.dutt@haatza.com",
        phone: "+91 90088 77665",
        darkhouse: "HAATZA HSR Layout Depot",
        shift: "Night",
        status: "Active",
        avatarColor: "avatar-amber",
        initials: "SD"
    }
];

export const MOCK_ASSIGNED_PRODUCTS = [
    {
        id: "MAP-301",
        product: "Fresh Alphonso Mangoes",
        sku: "FRT-MNG-ALP",
        category: "Fruits & Vegetables",
        darkhouse: "HAATZA Koramangala Hub",
        stock: 45,
        reorder: 15,
        status: "In Stock"
    },
    {
        id: "MAP-302",
        product: "Amul Taaza Toned Milk",
        sku: "DRY-MLK-TAZ",
        category: "Dairy & Bread",
        darkhouse: "HAATZA Koramangala Hub",
        stock: 120,
        reorder: 30,
        status: "In Stock"
    },
    {
        id: "MAP-303",
        product: "Fresh Alphonso Mangoes",
        sku: "FRT-MNG-ALP",
        category: "Fruits & Vegetables",
        darkhouse: "HAATZA Powai Depot",
        stock: 30,
        reorder: 15,
        status: "In Stock"
    },
    {
        id: "MAP-304",
        product: "Amul Taaza Toned Milk",
        sku: "DRY-MLK-TAZ",
        category: "Dairy & Bread",
        darkhouse: "HAATZA Powai Depot",
        stock: 8,
        reorder: 20,
        status: "Low Stock"
    },
    {
        id: "MAP-305",
        product: "Lay's Classic Salted Chips",
        sku: "SNK-LYS-CLT",
        category: "Munchies & Snacks",
        darkhouse: "HAATZA Indiranagar Hub",
        stock: 180,
        reorder: 25,
        status: "In Stock"
    },
    {
        id: "MAP-306",
        product: "McCain French Fries",
        sku: "FZN-MCN-FRS",
        category: "Instant & Frozen Food",
        darkhouse: "HAATZA GK-1 Warehouse",
        stock: 3,
        reorder: 10,
        status: "Low Stock"
    },
    {
        id: "MAP-307",
        product: "Dettol Liquid Handwash",
        sku: "PSC-DTL-HDW",
        category: "Personal Care",
        darkhouse: "HAATZA GK-1 Warehouse",
        stock: 0,
        reorder: 8,
        status: "Out of Stock"
    },
    {
        id: "MAP-308",
        product: "Amul Taaza Toned Milk",
        sku: "DRY-MLK-TAZ",
        category: "Dairy & Bread",
        darkhouse: "HAATZA HSR Layout Depot",
        stock: 95,
        reorder: 30,
        status: "In Stock"
    },
    {
        id: "MAP-309",
        product: "Coca-Cola Zero Sugar",
        sku: "DRK-COK-ZER",
        category: "Cold Drinks & Juices",
        darkhouse: "HAATZA HSR Layout Depot",
        stock: 72,
        reorder: 15,
        status: "In Stock"
    }
];
