// Mock data for field service appointments
export const mockAppointmentsData = [
    {
        id: "APPT-102345",
        status: "scheduled",
        type: "installation",
        serviceType: "Fiber Installation",
        customerId: "CUST-98234",
        customerName: "Emily Johnson",
        address: "123 Maple Street, Riverside, CA 92501",
        contactPhone: "951-555-6789",
        scheduledTime: "2023-07-25T10:00:00Z",
        estimatedDuration: 120, // in minutes
        technicianId: "TECH-1001",
        technicianName: "Michael Rodriguez",
        priority: "normal",
        ticketId: "TKT-87643", // Reference to the related ticket
        notes: [
            {
                content: "Customer has a dog in the backyard. Please call before arrival.",
                timestamp: "2023-07-24T15:45:00Z",
                author: "Sarah (Customer Service)"
            }
        ],
        equipmentNeeded: [
            { id: "EQ-ONT-001", name: "Fiber ONT", quantity: 1 },
            { id: "EQ-ROUTER-003", name: "Wi-Fi 6 Router", quantity: 1 },
            { id: "EQ-CABLE-001", name: "Fiber Patch Cable 50ft", quantity: 1 }
        ],
        slaBreached: false,
        slaStatus: "within_limit"
    },
    {
        // Mock data for field service appointments (continued)
        id: "APPT-102346",
        status: "in_progress",
        type: "repair",
        serviceType: "Signal Loss Troubleshooting",
        customerId: "CUST-56789",
        customerName: "Robert Williams",
        address: "456 Oak Avenue, Riverside, CA 92503",
        contactPhone: "951-555-2345",
        scheduledTime: "2023-07-25T09:30:00Z",
        estimatedDuration: 90, // in minutes
        actualStartTime: "2023-07-25T09:35:00Z",
        technicianId: "TECH-1003",
        technicianName: "Jennifer Martinez",
        priority: "high",
        ticketId: "TKT-76543", // Reference to the related ticket
        notes: [
            {
                content: "Customer reports complete signal loss after storm. Line may be damaged.",
                timestamp: "2023-07-24T18:23:00Z",
                author: "David (Tech Support)"
            },
            {
                content: "Arrived at location. Visual inspection shows downed line from pole.",
                timestamp: "2023-07-25T09:42:00Z",
                author: "Jennifer Martinez (Technician)"
            }
        ],
        equipmentNeeded: [
            { id: "EQ-CABLE-002", name: "Fiber Cable 100ft", quantity: 1 },
            { id: "EQ-SPLICE-001", name: "Fiber Splice Kit", quantity: 1 },
            { id: "EQ-TOOL-005", name: "Signal Meter", quantity: 1 }
        ],
        slaBreached: false,
        slaStatus: "within_limit"
    },
    {
        id: "APPT-102347",
        status: "completed",
        type: "maintenance",
        serviceType: "Router Replacement",
        customerId: "CUST-34567",
        customerName: "Thomas Anderson",
        address: "789 Pine Road, Riverside, CA 92505",
        contactPhone: "951-555-7890",
        scheduledTime: "2023-07-25T08:00:00Z",
        estimatedDuration: 60, // in minutes
        actualStartTime: "2023-07-25T08:10:00Z",
        actualEndTime: "2023-07-25T08:55:00Z",
        technicianId: "TECH-1002",
        technicianName: "Sarah Johnson",
        priority: "normal",
        ticketId: "TKT-65432", // Reference to the related ticket
        notes: [
            {
                content: "Router is dropping connections frequently. Recommended replacement.",
                timestamp: "2023-07-23T14:30:00Z",
                author: "Alex (Tech Support)"
            },
            {
                content: "Replaced router with new Wi-Fi 6 model. Set up customer network and verified all devices can connect.",
                timestamp: "2023-07-25T08:57:00Z",
                author: "Sarah Johnson (Technician)"
            }
        ],
        equipmentUsed: [
            { id: "EQ-ROUTER-003", name: "Wi-Fi 6 Router", quantity: 1 }
        ],
        equipmentRetrieved: [
            { id: "EQ-ROUTER-OLD", name: "Returned Defective Router", quantity: 1 }
        ],
        slaBreached: false,
        slaStatus: "completed"
    },
    {
        id: "APPT-102348",
        status: "scheduled",
        type: "installation",
        serviceType: "Business Dedicated Line",
        customerId: "CUST-BIZ-5678",
        customerName: "Pinnacle Financial Services",
        address: "500 Commerce Blvd, Riverside, CA 92507",
        contactPhone: "951-555-4567",
        contactPerson: "Mark Wilson (IT Manager)",
        scheduledTime: "2023-07-25T13:00:00Z",
        estimatedDuration: 240, // in minutes
        technicianId: "TECH-1004",
        technicianName: "Carlos Vasquez",
        priority: "high",
        ticketId: "TKT-54321", // Reference to the related ticket
        notes: [
            {
                content: "Business requires 99.99% uptime SLA. Installing redundant connection with fail-over.",
                timestamp: "2023-07-22T11:15:00Z",
                author: "Janice (Business Accounts)"
            },
            {
                content: "Building has existing conduit. Pre-site survey completed last week.",
                timestamp: "2023-07-24T16:20:00Z",
                author: "Carlos Vasquez (Technician)"
            }
        ],
        equipmentNeeded: [
            { id: "EQ-ROUTER-BIZ", name: "Business-class Router", quantity: 1 },
            { id: "EQ-ONT-BIZ", name: "Enterprise ONT", quantity: 1 },
            { id: "EQ-SWITCH-001", name: "Managed Switch", quantity: 1 },
            { id: "EQ-UPS-001", name: "Backup UPS", quantity: 1 },
            { id: "EQ-CABLE-003", name: "CAT6A Cable 500ft", quantity: 1 }
        ],
        slaBreached: false,
        slaStatus: "within_limit"
    },
    {
        id: "APPT-102349",
        status: "delayed",
        type: "repair",
        serviceType: "Intermittent Connectivity",
        customerId: "CUST-24680",
        customerName: "Lisa Chang",
        address: "222 Elm Court, Riverside, CA 92504",
        contactPhone: "951-555-8901",
        scheduledTime: "2023-07-25T11:30:00Z",
        estimatedDuration: 90, // in minutes
        technicianId: "TECH-1005",
        technicianName: "Daniel Patel",
        priority: "normal",
        ticketId: "TKT-43210", // Reference to the related ticket
        notes: [
            {
                content: "Customer reports intermittent connectivity issues, especially during evening hours.",
                timestamp: "2023-07-24T10:05:00Z",
                author: "Michelle (Customer Service)"
            },
            {
                content: "Delayed due to previous appointment running long. Called customer to advise new ETA of 12:30pm.",
                timestamp: "2023-07-25T11:15:00Z",
                author: "Daniel Patel (Technician)"
            }
        ],
        equipmentNeeded: [
            { id: "EQ-TOOL-002", name: "Signal Analyzer", quantity: 1 },
            { id: "EQ-ROUTER-003", name: "Wi-Fi 6 Router", quantity: 1 }
        ],
        slaBreached: true,
        slaStatus: "at_risk"
    }
];

// Mock data for technicians
export const mockTechniciansData = [
    {
        id: "TECH-1001",
        name: "Michael Rodriguez",
        email: "mrodriguez@ispnet.com",
        phone: "951-555-0101",
        status: "on_job",
        currentLocation: {
            lat: 33.948,
            lng: -117.396
        },
        currentAppointmentId: "APPT-102345",
        specialty: ["fiber", "installation", "residential"],
        certifications: ["Fiber Optic Specialist", "Cisco Certified"],
        vehicle: {
            id: "VEH-005",
            type: "Service Van",
            licensePlate: "ISP-1001"
        },
        shift: {
            start: "2023-07-25T08:00:00Z",
            end: "2023-07-25T17:00:00Z"
        },
        appointmentsToday: 4,
        appointmentsCompleted: 1
    },
    {
        id: "TECH-1002",
        name: "Sarah Johnson",
        email: "sjohnson@ispnet.com",
        phone: "951-555-0102",
        status: "available",
        currentLocation: {
            lat: 33.953,
            lng: -117.415
        },
        specialty: ["wireless", "residential", "repair"],
        certifications: ["Wireless Specialist", "CompTIA Network+"],
        vehicle: {
            id: "VEH-008",
            type: "Compact SUV",
            licensePlate: "ISP-1002"
        },
        shift: {
            start: "2023-07-25T08:00:00Z",
            end: "2023-07-25T17:00:00Z"
        },
        appointmentsToday: 5,
        appointmentsCompleted: 3
    },
    {
        id: "TECH-1003",
        name: "Jennifer Martinez",
        email: "jmartinez@ispnet.com",
        phone: "951-555-0103",
        status: "on_job",
        currentLocation: {
            lat: 33.966,
            lng: -117.408
        },
        currentAppointmentId: "APPT-102346",
        specialty: ["fiber", "copper", "repair", "residential"],
        certifications: ["Line Specialist", "Safety Certified", "Aerial Operations"],
        vehicle: {
            id: "VEH-002",
            type: "Service Truck",
            licensePlate: "ISP-1003"
        },
        shift: {
            start: "2023-07-25T08:00:00Z",
            end: "2023-07-25T17:00:00Z"
        },
        appointmentsToday: 4,
        appointmentsCompleted: 2
    },
    {
        id: "TECH-1004",
        name: "Carlos Vasquez",
        email: "cvasquez@ispnet.com",
        phone: "951-555-0104",
        status: "en_route",
        currentLocation: {
            lat: 33.975,
            lng: -117.393
        },
        nextAppointmentId: "APPT-102348",
        specialty: ["business", "fiber", "installation", "network"],
        certifications: ["Business Solutions Specialist", "CCNA", "Fiber Optic Installer"],
        vehicle: {
            id: "VEH-007",
            type: "Service Van",
            licensePlate: "ISP-1004"
        },
        shift: {
            start: "2023-07-25T08:00:00Z",
            end: "2023-07-25T17:00:00Z"
        },
        appointmentsToday: 3,
        appointmentsCompleted: 1
    },
    {
        id: "TECH-1005",
        name: "Daniel Patel",
        email: "dpatel@ispnet.com",
        phone: "951-555-0105",
        status: "delayed",
        currentLocation: {
            lat: 33.959,
            lng: -117.425
        },
        nextAppointmentId: "APPT-102349",
        specialty: ["residential", "wifi", "troubleshooting", "repair"],
        certifications: ["Wi-Fi Specialist", "Home Network Expert"],
        vehicle: {
            id: "VEH-010",
            type: "Compact Car",
            licensePlate: "ISP-1005"
        },
        shift: {
            start: "2023-07-25T08:00:00Z",
            end: "2023-07-25T17:00:00Z"
        },
        appointmentsToday: 5,
        appointmentsCompleted: 2
    }
];

// Mock data for inventory
export const mockInventoryData = [
    {
        id: "EQ-ONT-001",
        name: "Residential Fiber ONT",
        category: "Network Termination",
        description: "Standard ONT for FTTH installations",
        stockLevel: 25,
        minStockLevel: 10,
        status: "in_stock",
        lastOrdered: "2023-07-10T09:00:00Z",
        location: "Warehouse A",
        cost: 85.50
    },
    {
        id: "EQ-ONT-BIZ",
        name: "Enterprise Fiber ONT",
        category: "Network Termination",
        description: "High-capacity ONT for business installations",
        stockLevel: 4,
        minStockLevel: 5,
        status: "low_stock",
        lastOrdered: "2023-06-25T11:30:00Z",
        location: "Secure Storage B",
        cost: 245.75
    },
    {
        id: "EQ-ROUTER-003",
        name: "Wi-Fi 6 Router",
        category: "Customer Premise Equipment",
        description: "Dual-band Wi-Fi 6 router for residential customers",
        stockLevel: 18,
        minStockLevel: 15,
        status: "in_stock",
        lastOrdered: "2023-07-15T14:00:00Z",
        location: "Warehouse A",
        cost: 129.99
    },
    {
        id: "EQ-ROUTER-BIZ",
        name: "Business-class Router",
        category: "Customer Premise Equipment",
        description: "Managed router with advanced QoS for business customers",
        stockLevel: 7,
        minStockLevel: 5,
        status: "in_stock",
        lastOrdered: "2023-07-01T10:15:00Z",
        location: "Secure Storage B",
        cost: 349.95
    },
    {
        id: "EQ-CABLE-001",
        name: "Fiber Patch Cable 50ft",
        category: "Cabling",
        description: "50ft single-mode fiber optic patch cable",
        stockLevel: 42,
        minStockLevel: 20,
        status: "in_stock",
        lastOrdered: "2023-06-20T08:45:00Z",
        location: "Warehouse A",
        cost: 18.50
    },
    {
        id: "EQ-CABLE-002",
        name: "Fiber Cable 100ft",
        category: "Cabling",
        description: "100ft outdoor-rated fiber optic cable",
        stockLevel: 11,
        minStockLevel: 10,
        status: "in_stock",
        lastOrdered: "2023-07-05T13:30:00Z",
        location: "Warehouse A",
        cost: 35.25
    },
    {
        id: "EQ-SPLICE-001",
        name: "Fiber Splice Kit",
        category: "Tools",
        description: "Complete kit for field splicing of fiber optic cables",
        stockLevel: 4,
        minStockLevel: 5,
        status: "low_stock",
        lastOrdered: "2023-06-15T09:20:00Z",
        location: "Tool Storage",
        cost: 195.50
    },
    {
        id: "EQ-TOOL-002",
        name: "Signal Analyzer",
        category: "Tools",
        description: "Advanced signal analyzer for troubleshooting",
        stockLevel: 3,
        minStockLevel: 3,
        status: "in_stock",
        lastOrdered: "2023-05-20T11:10:00Z",
        location: "Tool Storage",
        cost: 875.00
    },
    {
        id: "EQ-TOOL-005",
        name: "Signal Meter",
        category: "Tools",
        description: "Hand-held signal strength meter",
        stockLevel: 8,
        minStockLevel: 6,
        status: "in_stock",
        lastOrdered: "2023-06-10T15:45:00Z",
        location: "Tool Storage",
        cost: 210.25
    },
    {
        id: "EQ-SWITCH-001",
        name: "Managed Switch",
        category: "Network Equipment",
        description: "24-port managed Gigabit Ethernet switch",
        stockLevel: 2,
        minStockLevel: 2,
        status: "in_stock",
        lastOrdered: "2023-06-28T10:00:00Z",
        location: "Secure Storage B",
        cost: 329.99
    },
    {
        id: "EQ-UPS-001",
        name: "Backup UPS",
        category: "Power Equipment",
        description: "1500VA battery backup UPS for network equipment",
        stockLevel: 1,
        minStockLevel: 2,
        status: "low_stock",
        lastOrdered: "2023-07-08T09:30:00Z",
        location: "Secure Storage B",
        cost: 189.95
    }
];

// Mock tickets that require field service visits
export const mockTicketsRequiringFieldVisit = [
    {
        id: "TKT-98765",
        status: "open",
        priority: "high",
        type: "service_change",
        title: "Upgrade to Gigabit Fiber",
        description: "Customer requests upgrade from 100Mbps to Gigabit fiber service.",
        customer: {
            id: "CUST-12345",
            name: "William Davis",
            address: "840 University Avenue, Riverside, CA 92521",
            phone: "951-555-7777",
            email: "wdavis@example.com"
        },
        createdAt: "2023-07-24T14:20:00Z",
        requiredSkills: ["fiber", "installation", "residential"],
        estimatedDuration: 120, // minutes
        preferredDateRange: {
            start: "2023-07-26T09:00:00Z",
            end: "2023-07-28T17:00:00Z"
        },
        notes: [
            {
                content: "Customer currently has copper-based 100Mbps service. Requires full installation of fiber line to premises.",
                timestamp: "2023-07-24T14:25:00Z",
                author: "Jason (Sales)"
            }
        ]
    },
    {
        id: "TKT-87654",
        status: "open",
        priority: "urgent",
        type: "outage",
        title: "Complete Service Outage - Multiple Customers",
        description: "Multiple customers reporting complete service outage in Canyon Crest neighborhood.",
        customer: {
            id: "CUST-MULTI",
            name: "Multiple Affected Customers",
            address: "Canyon Crest Area, Riverside, CA 92507",
            phone: "N/A",
            email: "N/A"
        },
        createdAt: "2023-07-25T08:10:00Z",
        requiredSkills: ["repair", "fiber", "copper"],
        estimatedDuration: 180, // minutes
        notes: [
            {
                content: "At least 15 customers have reported outages in this area. Initial diagnosis suggests damage to neighborhood distribution node.",
                timestamp: "2023-07-25T08:15:00Z",
                author: "Larry (Network Operations)"
            },
            {
                content: "Possible causes include storm damage from overnight thunderstorm.",
                timestamp: "2023-07-25T08:20:00Z",
                author: "Larry (Network Operations)"
            }
        ]
    },
    {
        id: "TKT-76543",
        status: "in_progress",
        priority: "normal",
        type: "installation",
        title: "New Service Installation",
        description: "New customer requesting internet and TV service installation.",
        customer: {
            id: "CUST-55555",
            name: "Rachel Green",
            address: "721 Magnolia Avenue, Riverside, CA 92506",
            phone: "951-555-2222",
            email: "rgreen@example.com"
        },
        createdAt: "2023-07-23T11:30:00Z",
        requiredSkills: ["installation", "residential"],
        estimatedDuration: 120, // minutes
        appointmentScheduled: true,
        appointmentId: "APPT-102351",
        appointmentTime: "2023-07-26T13:00:00Z",
        notes: [
            {
                content: "New residence, no previous service. Will need complete installation including exterior wiring.",
                timestamp: "2023-07-23T11:35:00Z",
                author: "Karen (Sales)"
            },
            {
                content: "Customer prefers afternoon appointment.",
                timestamp: "2023-07-23T11:40:00Z",
                author: "Karen (Sales)"
            }
        ]
    }
];