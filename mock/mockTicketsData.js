// mockTicketsData.js
export const mockTicketsData = [
    {
        id: 'TKT-102458',
        title: 'Internet connectivity loss',
        description: 'Customer reports complete loss of internet connectivity since 3 PM yesterday. Router lights show online but no devices can connect.',
        status: 'open',
        priority: 'urgent',
        type: 'connectivity',
        customer: {
            id: 'CUST-5678',
            name: 'John Doe',
            phone: '254712345678',
            email: 'john.doe@example.com',
            address: '123 Karen Road, Nairobi'
        },
        equipment: {
            type: 'Router',
            model: 'Huawei HG8245H',
            serialNumber: 'HW38482935',
            macAddress: '00:1A:2B:3C:4D:5E'
        },
        assignedTo: null,
        createdAt: '2023-08-01T13:45:00Z',
        slaStatus: 'at_risk',
        slaDeadline: '2023-08-02T13:45:00Z',
        notes: [
            {
                id: 'note-1',
                content: 'Called customer to confirm outage. Customer reports power is on and router is plugged in with all expected lights.',
                createdAt: '2023-08-01T14:30:00Z',
                createdBy: 'Support Agent'
            }
        ],
        history: [
            {
                action: 'created',
                timestamp: '2023-08-01T13:45:00Z',
                user: 'Customer Portal'
            },
            {
                action: 'status_changed',
                timestamp: '2023-08-01T13:45:00Z',
                user: 'System',
                details: 'Status changed to Open'
            }
        ]
    },
    {
        id: 'TKT-102457',
        title: 'Speed issues during peak hours',
        description: 'Customer complaining about slow speeds between 7 PM and 11 PM. Normal speeds during morning and afternoon.',
        status: 'in_progress',
        priority: 'high',
        type: 'speed',
        customer: {
            id: 'CUST-4567',
            name: 'Jane Smith',
            phone: '254723456789',
            email: 'jane.smith@example.com',
            address: '45 Westlands Avenue, Nairobi'
        },
        assignedTo: 'Thomas Maina',
        createdAt: '2023-08-01T10:15:00Z',
        slaStatus: 'on_track',
        slaDeadline: '2023-08-03T10:15:00Z',
        notes: [
            {
                id: 'note-1',
                content: 'Initial diagnostic shows normal connection. Will need to test during reported slow period.',
                createdAt: '2023-08-01T11:20:00Z',
                createdBy: 'Thomas Maina'
            },
            {
                id: 'note-2',
                content: 'Scheduled remote monitoring for tonight between 8 PM and 10 PM.',
                createdAt: '2023-08-01T14:45:00Z',
                createdBy: 'Thomas Maina'
            }
        ],
        history: [
            {
                action: 'created',
                timestamp: '2023-08-01T10:15:00Z',
                user: 'Support Agent'
            },
            {
                action: 'assigned',
                timestamp: '2023-08-01T10:30:00Z',
                user: 'Dispatch Manager',
                details: 'Assigned to Thomas Maina'
            },
            {
                action: 'status_changed',
                timestamp: '2023-08-01T10:30:00Z',
                user: 'System',
                details: 'Status changed to In Progress'
            }
        ]
    }
    // Additional mock tickets would be added here
];

// mockTicketsData.js (continued)
export const mockTechnicianAppointments = [
    {
        id: 'APT-10245',
        ticketId: 'TKT-102455',
        customerName: 'Michael Kamau',
        address: '78 Ngong Road, Nairobi',
        scheduledTime: '2023-08-02T09:00:00Z',
        estimatedDuration: 90, // minutes
        technician: 'David Ochieng',
        status: 'scheduled',
        serviceType: 'installation',
        equipment: [
            { type: 'Router', model: 'Huawei HG8245H', quantity: 1 },
            { type: 'Fiber Cable', quantity: '25m' }
        ],
        notes: [
            {
                content: 'New fiber installation for premium package',
                timestamp: '2023-08-01T14:30:00Z',
                author: 'Dispatch Manager'
            }
        ]
    },
    {
        id: 'APT-10246',
        ticketId: 'TKT-102458',
        customerName: 'John Doe',
        address: '123 Karen Road, Nairobi',
        scheduledTime: '2023-08-02T11:30:00Z',
        estimatedDuration: 60, // minutes
        technician: 'David Ochieng',
        status: 'scheduled',
        serviceType: 'repair',
        equipment: [
            { type: 'Diagnostic Tools', quantity: 1 },
            { type: 'Replacement Router', model: 'Huawei HG8245H', quantity: 1 }
        ],
        notes: [
            {
                content: 'Customer reports internet outage. Potential router issue.',
                timestamp: '2023-08-01T15:45:00Z',
                author: 'Support Agent'
            }
        ]
    },
    {
        id: 'APT-10247',
        ticketId: 'TKT-102452',
        customerName: 'Sarah Njoroge',
        address: '15 Kiambu Road, Nairobi',
        scheduledTime: '2023-08-02T14:00:00Z',
        estimatedDuration: 45, // minutes
        technician: 'David Ochieng',
        status: 'scheduled',
        serviceType: 'maintenance',
        equipment: [
            { type: 'Diagnostic Tools', quantity: 1 }
        ],
        notes: [
            {
                content: 'Routine maintenance visit for business customer',
                timestamp: '2023-08-01T16:15:00Z',
                author: 'Dispatch Manager'
            }
        ]
    }
];

export const mockKnowledgeBase = [
    {
        id: 'KB-001',
        title: 'Router Troubleshooting Guide',
        category: 'connectivity',
        lastUpdated: '2023-07-15T10:00:00Z',
        content: `
      # Router Troubleshooting Guide
      
      ## Basic Troubleshooting Steps
      
      1. **Power Cycle the Router**
         - Unplug the router
         - Wait 30 seconds
         - Plug it back in
         - Wait 2 minutes for full restart
      
      2. **Check Physical Connections**
         - Ensure all cables are securely connected
         - Check for damaged cables
         - Verify fiber/ethernet connections are clean
      
      3. **Verify Status Lights**
         - Power: Solid green
         - Internet: Solid green or blue
         - WiFi: Solid or blinking green
      
      ## Common Issues and Solutions
      
      ### No Internet Connection
      - Check if the WAN/Internet light is on
      - Verify ONT status if using fiber
      - Test direct connection via ethernet
      
      ### Slow Speeds
      - Test speeds via ethernet first
      - Run speed test at different times of day
      - Check for interference sources
      - Verify package speeds with customer
      
      ### WiFi Issues
      - Check for interference from other devices
      - Test 2.4GHz and 5GHz bands separately
      - Verify WiFi channel settings
      - Consider placement of router
      
      ## Advanced Troubleshooting
      
      - Access router admin page (192.168.1.1 or 192.168.0.1)
      - Check logs for errors
      - Verify firmware is up to date
      - Test with factory reset if necessary
    `
    },
    {
        id: 'KB-002',
        title: 'Fiber Installation Guidelines',
        category: 'installation',
        lastUpdated: '2023-07-20T11:30:00Z',
        content: `
      # Fiber Installation Guidelines
      
      ## Equipment Needed
      
      - Fiber cable (appropriate length)
      - Fiber splices and connectors
      - ONT device
      - Router
      - Fiber tester
      - Protective gear
      - Mounting hardware
      
      ## Installation Process
      
      1. **Survey the Location**
         - Determine best entry point
         - Plan fiber route to minimize bends
         - Identify optimal ONT and router placement
      
      2. **External Installation**
         - Connect to neighborhood fiber terminal
         - Run fiber to building entry point
         - Ensure proper strain relief
         - Weatherproof external connections
      
      3. **Internal Installation**
         - Run fiber to ONT location
         - Mount ONT securely
         - Connect power to ONT
         - Connect ONT to router
      
      4. **Configuration**
         - Activate ONT on network
         - Configure router settings
         - Set up WiFi networks
         - Test speeds
      
      ## Best Practices
      
      - Maintain minimum bend radius (30mm)
      - Label all connections
      - Document installation with photos
      - Leave service loops for future maintenance
      - Train customer on basic usage
      
      ## Common Issues
      
      - Excessive attenuation: Check for tight bends or damaged fiber
      - ONT not syncing: Verify fiber connections and power
      - Low speeds: Test direct connection to ONT
    `
    }
];

export const mockCustomerEquipment = [
    {
        customerId: 'CUST-5678',
        equipment: [
            {
                type: 'Router',
                model: 'Huawei HG8245H',
                serialNumber: 'HW38482935',
                macAddress: '00:1A:2B:3C:4D:5E',
                installDate: '2022-05-15',
                firmwareVersion: '3.10.1',
                status: 'active',
                lastSeen: '2023-08-01T10:15:00Z',
                ipAddress: '192.168.1.1',
                notes: 'Provided during initial installation'
            },
            {
                type: 'ONT',
                model: 'Huawei HG8010H',
                serialNumber: 'HW59371628',
                macAddress: '00:2C:3D:4E:5F:6G',
                installDate: '2022-05-15',
                firmwareVersion: '2.5.3',
                status: 'active',
                lastSeen: '2023-08-01T10:15:00Z',
                notes: 'Mounted in the living room'
            }
        ]
    },
    {
        customerId: 'CUST-4567',
        equipment: [
            {
                type: 'Router',
                model: 'TP-Link Archer C6',
                serialNumber: 'TP45982731',
                macAddress: '00:3D:4E:5F:6G:7H',
                installDate: '2021-10-08',
                firmwareVersion: '1.3.5',
                status: 'active',
                lastSeen: '2023-08-01T09:30:00Z',
                ipAddress: '192.168.0.1',
                notes: 'Customer-owned router'
            },
            {
                type: 'ONT',
                model: 'Nokia G-240G-E',
                serialNumber: 'NK78263541',
                macAddress: '00:4E:5F:6G:7H:8I',
                installDate: '2021-10-08',
                firmwareVersion: '3.1.2',
                status: 'active',
                lastSeen: '2023-08-01T09:30:00Z',
                notes: 'Mounted in the office room'
            }
        ]
    }
];