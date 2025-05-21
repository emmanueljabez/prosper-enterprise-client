// src/mock/outagesData.js
export const mockOutages = [
    {
        id: 'out-1',
        title: 'Fiber Cut - Westlands Area',
        description: 'A fiber cut has been detected in the Westlands area affecting broadband services.',
        status: 'investigating',
        severity: 'critical',
        serviceType: 'fiber',
        startedAt: '2023-08-01T09:15:00Z',
        estimatedResolution: '2023-08-01T18:00:00Z',
        resolvedAt: null,
        estimatedCustomersAffected: 3500,
        affectedAreas: ['Westlands', 'Parklands', 'Spring Valley'],
        rootCause: null,
        resolution: null,
        latitude: -1.265423,
        longitude: 36.804511,
        updates: [
            {
                timestamp: '2023-08-01T09:15:00Z',
                status: 'investigating',
                notes: 'We are investigating reports of service disruption in Westlands area.'
            },
            {
                timestamp: '2023-08-01T10:30:00Z',
                status: 'identified',
                notes: 'Technicians have identified a fiber cut caused by ongoing road construction.'
            }
        ],
        notificationSent: false,
        dnsAffected: false,
        vpnAffected: false,
        powerOutage: false
    },
    {
        id: 'out-2',
        title: 'Router Failure - Mombasa Road',
        description: 'Router failure at Mombasa Road junction affecting business connectivity.',
        status: 'in_progress',
        severity: 'major',
        serviceType: 'backbone',
        startedAt: '2023-08-01T11:45:00Z',
        estimatedResolution: '2023-08-01T17:00:00Z',
        resolvedAt: null,
        estimatedCustomersAffected: 650,
        affectedAreas: ['Industrial Area', 'South B', 'South C'],
        rootCause: 'Hardware failure on core router',
        resolution: null,
        latitude: -1.319303,
        longitude: 36.828933,
        updates: [
            {
                timestamp: '2023-08-01T11:45:00Z',
                status: 'investigating',
                notes: 'Multiple alerts triggered from our Mombasa Road junction site.'
            },
            {
                timestamp: '2023-08-01T12:20:00Z',
                status: 'identified',
                notes: 'Identified hardware failure on one of our core routers.'
            },
            {
                timestamp: '2023-08-01T13:45:00Z',
                status: 'in_progress',
                notes: 'Replacement hardware being deployed to the site.'
            }
        ],
        notificationSent: true,
        dnsAffected: false,
        vpnAffected: true,
        powerOutage: false
    },
    {
        id: 'out-3',
        title: 'Service Degradation - Kileleshwa',
        description: 'Customers in Kileleshwa experiencing slow speeds and intermittent connectivity.',
        status: 'monitoring',
        severity: 'minor',
        serviceType: 'fiber',
        startedAt: '2023-08-01T08:00:00Z',
        estimatedResolution: '2023-08-01T16:00:00Z',
        resolvedAt: null,
        estimatedCustomersAffected: 430,
        affectedAreas: ['Kileleshwa', 'Lavington'],
        rootCause: 'Signal degradation in fiber segment',
        resolution: null,
        latitude: -1.287247,
        longitude: 36.780214,
        updates: [
            {
                timestamp: '2023-08-01T08:00:00Z',
                status: 'investigating',
                notes: 'Monitoring systems detected performance degradation in Kileleshwa area.'
            },
            {
                timestamp: '2023-08-01T09:30:00Z',
                status: 'identified',
                notes: 'Signal degradation identified in one fiber segment.'
            },
            {
                timestamp: '2023-08-01T11:00:00Z',
                status: 'monitoring',
                notes: 'Applied temporary signal boost while permanent repairs are scheduled.'
            }
        ],
        notificationSent: true,
        dnsAffected: false,
        vpnAffected: false,
        powerOutage: false
    },
    {
        id: 'out-4',
        title: 'DNS Service Issues',
        description: 'Some customers experiencing DNS resolution failures.',
        status: 'mitigated',
        severity: 'degraded',
        serviceType: 'data_center',
        startedAt: '2023-08-01T07:30:00Z',
        estimatedResolution: '2023-08-01T15:00:00Z',
        resolvedAt: null,
        estimatedCustomersAffected: 1200,
        affectedAreas: ['Various locations'],
        rootCause: 'Configuration issue on DNS servers',
        resolution: null,
        latitude: -1.293617,
        longitude: 36.821348,
        updates: [
            {
                timestamp: '2023-08-01T07:30:00Z',
                status: 'investigating',
                notes: 'Reports of DNS resolution issues from multiple locations.'
            },
            {
                timestamp: '2023-08-01T08:15:00Z',
                status: 'identified',
                notes: 'Identified configuration issue after recent DNS server update.'
            },
            {
                timestamp: '2023-08-01T09:45:00Z',
                status: 'mitigated',
                notes: 'Applied configuration fix and restored primary DNS functionality. Monitoring for stability.'
            }
        ],
        notificationSent: true,
        dnsAffected: true,
        vpnAffected: false,
        powerOutage: false
    },
    {
        id: 'out-5',
        title: 'Network Outage - Gigiri',
        description: 'Complete service outage in Gigiri area affecting all services.',
        status: 'resolved',
        severity: 'critical',
        serviceType: 'fiber',
        startedAt: '2023-07-30T14:20:00Z',
        estimatedResolution: '2023-07-30T20:00:00Z',
        resolvedAt: '2023-07-30T19:45:00Z',
        estimatedCustomersAffected: 2100,
        affectedAreas: ['Gigiri', 'Runda', 'Muthaiga'],
        rootCause: 'Fiber backbone damage due to road construction',
        resolution: 'Spliced new fiber connection and rerouted traffic through alternate path',
        latitude: -1.231781,
        longitude: 36.817293,
        updates: [
            {
                timestamp: '2023-07-30T14:20:00Z',
                status: 'investigating',
                notes: 'Complete service outage detected in Gigiri area.'
            },
            {
                timestamp: '2023-07-30T15:10:00Z',
                status: 'identified',
                notes: 'Team on site confirmed major fiber damage from road construction activity.'
            },
            {
                timestamp: '2023-07-30T16:30:00Z',
                status: 'in_progress',
                notes: 'Splicing teams dispatched and working on repairs.'
            },
            {
                timestamp: '2023-07-30T19:45:00Z',
                status: 'resolved',
                notes: 'Repairs completed and services fully restored. Added redundant path to prevent future outages.'
            }
        ],
        notificationSent: true,
        dnsAffected: false,
        vpnAffected: false,
        powerOutage: false
    }
];

export const mockMaintenanceEvents = [
    {
        id: 'maint-1',
        title: 'Core Router Firmware Update',
        description: 'Scheduled firmware updates to improve security and performance on core routers.',
        maintenanceType: 'planned',
        status: 'scheduled',
        serviceType: 'backbone',
        scheduledStart: '2023-08-05T01:00:00Z',
        scheduledEnd: '2023-08-05T05:00:00Z',
        actualStart: null,
        actualEnd: null,
        estimatedCustomersAffected: 4500,
        impact: 'minor',
        affectedAreas: ['Multiple locations'],
        technicians: ['John Doe', 'Jane Smith'],
        latitude: -1.293617,
        longitude: 36.821348,
        updates: [],
        notificationSent: true
    },
    {
        id: 'maint-2',
        title: 'Fiber Cable Relocation - Karen',
        description: 'Relocating fiber cables due to road expansion project in Karen area.',
        maintenanceType: 'planned',
        status: 'scheduled',
        serviceType: 'fiber',
        scheduledStart: '2023-08-03T08:00:00Z',
        scheduledEnd: '2023-08-03T16:00:00Z',
        actualStart: null,
        actualEnd: null,
        estimatedCustomersAffected: 750,
        impact: 'moderate',
        affectedAreas: ['Karen', 'Langata'],
        technicians: ['Robert Johnson', 'Michael Wong'],
        latitude: -1.336267,
        longitude: 36.706036,
        updates: [],
        notificationSent: true
    },
    {
        id: 'maint-3',
        title: 'Emergency Tower Repairs - Limuru Road',
        description: 'Emergency repairs to wireless transmission tower damaged in recent storm.',
        maintenanceType: 'emergency',
        status: 'in_progress',
        serviceType: 'wireless',
        scheduledStart: '2023-08-01T10:00:00Z',
        scheduledEnd: '2023-08-01T18:00:00Z',
        actualStart: '2023-08-01T10:15:00Z',
        actualEnd: null,
        estimatedCustomersAffected: 320,
        impact: 'major',
        affectedAreas: ['Parklands', 'Westlands'],
        technicians: ['Samuel Ochieng'],
        latitude: -1.252987,
        longitude: 36.802236,
        updates: [
            {
                timestamp: '2023-08-01T10:15:00Z',
                status: 'in_progress',
                notes: 'Technicians on site and beginning assessment of tower damage.'
            },
            {
                timestamp: '2023-08-01T12:30:00Z',
                status: 'in_progress',
                notes: 'Replacement parts being installed. Currently ahead of schedule.'
            }
        ],
        notificationSent: true
    },
    {
        id: 'maint-4',
        title: 'Data Center Cooling System Maintenance',
        description: 'Scheduled maintenance on primary cooling systems in main data center.',
        maintenanceType: 'planned',
        status: 'completed',
        serviceType: 'data_center',
        scheduledStart: '2023-07-29T22:00:00Z',
        scheduledEnd: '2023-07-30T02:00:00Z',
        actualStart: '2023-07-29T22:00:00Z',
        actualEnd: '2023-07-30T01:30:00Z',
        estimatedCustomersAffected: 0,
        impact: 'none',
        affectedAreas: [],
        technicians: ['James Mwangi', 'Patricia Achieng'],
        latitude: -1.291287,
        longitude: 36.813416,
        updates: [
            {
                timestamp: '2023-07-29T22:00:00Z',
                status: 'in_progress',
                notes: 'Maintenance activities have begun. Systems operating on backup cooling.'
            },
            {
                timestamp: '2023-07-30T01:30:00Z',
                status: 'completed',
                notes: 'Maintenance completed successfully and ahead of schedule. All systems operating normally.'
            }
        ],
        notificationSent: true
    },
    {
        id: 'maint-5',
        title: 'Network Capacity Upgrade - CBD',
        description: 'Increasing backbone capacity in Central Business District to improve speeds.',
        maintenanceType: 'planned',
        status: 'cancelled',
        serviceType: 'backbone',
        scheduledStart: '2023-07-31T23:00:00Z',
        scheduledEnd: '2023-08-01T05:00:00Z',
        actualStart: null,
        actualEnd: null,
        estimatedCustomersAffected: 1700,
        impact: 'minor',
        affectedAreas: ['CBD', 'Industrial Area'],
        technicians: ['Daniel Kamau'],
        latitude: -1.284720,
        longitude: 36.823680,
        updates: [
            {
                timestamp: '2023-07-30T14:00:00Z',
                status: 'cancelled',
                notes: 'Maintenance cancelled due to equipment delivery delay. Will be rescheduled.'
            }
        ],
        notificationSent: true,
        cancellationReason: 'equipment_delay',
        cancellationNotes: 'Required equipment not delivered on time. Maintenance will be rescheduled.'
    }
];