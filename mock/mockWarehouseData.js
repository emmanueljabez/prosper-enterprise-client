import { mockItems, mockLocations, mockTransactions } from './mockInventoryData.js';
import { mockSuppliers } from './mockSuppliersData.js';

// ==============================
// RECEIVING OPERATIONS
// ==============================

export const mockIncomingShipments = [
  {
    id: 'rcv-001',
    poNumber: 'PO-12345',
    supplierId: 'sup-001',
    supplierName: 'Acme Supply Co',
    status: 'scheduled',
    expectedArrival: '2025-05-24T10:00:00Z',
    destinationLocationId: 'loc-001',
    carrierName: 'FastFreight Logistics',
    trackingNumber: 'FF7834592',
    totalItems: 3,
    totalQuantity: 450,
    priority: 'normal',
    notes: 'Regular stock replenishment',
    notificationSent: true,
    createdAt: '2025-05-20T14:30:00Z',
    updatedAt: '2025-05-20T14:30:00Z',
    items: [
      {
        itemId: 'item-001',
        sku: 'INV-001',
        name: 'Widget A',
        quantity: 200,
        receivedQuantity: null,
        unitOfMeasure: 'each',
        unitCost: 5.99,
        totalCost: 1198.00,
        destinationBin: 'A1-B2-C3'
      },
      {
        itemId: 'item-002',
        sku: 'INV-002',
        name: 'Gadget B',
        quantity: 100,
        receivedQuantity: null,
        unitOfMeasure: 'each',
        unitCost: 12.99,
        totalCost: 1299.00,
        destinationBin: 'G7-H8-I9'
      },
      {
        itemId: 'item-003',
        sku: 'INV-003',
        name: 'Component C',
        quantity: 150,
        receivedQuantity: null,
        unitOfMeasure: 'each',
        unitCost: 0.59,
        totalCost: 88.50,
        destinationBin: 'J10-K11-L12'
      }
    ]
  },
  {
    id: 'rcv-002',
    poNumber: 'PO-7890',
    supplierId: 'sup-002',
    supplierName: 'Component World',
    status: 'in_transit',
    expectedArrival: '2025-05-23T14:00:00Z',
    actualArrival: null,
    destinationLocationId: 'loc-001',
    carrierName: 'Global Shipping Co',
    trackingNumber: 'GSC5678901',
    totalItems: 2,
    totalQuantity: 25,
    priority: 'high',
    notes: 'Expedited order to avoid stockout',
    notificationSent: true,
    createdAt: '2025-05-18T09:15:00Z',
    updatedAt: '2025-05-22T08:45:00Z',
    items: [
      {
        itemId: 'item-004',
        sku: 'INV-004',
        name: 'Tool Set D',
        quantity: 10,
        receivedQuantity: null,
        unitOfMeasure: 'set',
        unitCost: 89.99,
        totalCost: 899.90,
        destinationBin: 'M13-N14-O15'
      },
      {
        itemId: 'item-007',
        sku: 'INV-007',
        name: 'Assembly G',
        quantity: 15,
        receivedQuantity: null,
        unitOfMeasure: 'each',
        unitCost: 45.50,
        totalCost: 682.50,
        destinationBin: 'V22-W23-X24'
      }
    ]
  },
  {
    id: 'rcv-003',
    poNumber: 'PO-2468',
    supplierId: 'sup-003',
    supplierName: 'Global Materials Inc',
    status: 'received',
    expectedArrival: '2025-05-21T11:00:00Z',
    actualArrival: '2025-05-21T10:45:00Z',
    destinationLocationId: 'loc-002',
    carrierName: 'FreightLines Express',
    trackingNumber: 'FLE3459876',
    totalItems: 1,
    totalQuantity: 500,
    priority: 'normal',
    notes: 'Bulk raw materials shipment',
    notificationSent: true,
    receivedBy: 'user-002',
    createdAt: '2025-05-15T13:30:00Z',
    updatedAt: '2025-05-21T11:15:00Z',
    items: [
      {
        itemId: 'item-005',
        sku: 'INV-005',
        name: 'Material E',
        quantity: 500,
        receivedQuantity: 500,
        unitOfMeasure: 'kg',
        unitCost: 3.49,
        totalCost: 1745.00,
        destinationBin: 'P16-Q17-R18',
        qualityCheckRequired: true,
        qualityCheckStatus: 'pending'
      }
    ]
  },
  {
    id: 'rcv-004',
    poNumber: 'PO-3691',
    supplierId: 'sup-006',
    supplierName: 'EcoPackage Solutions',
    status: 'completed',
    expectedArrival: '2025-05-19T13:00:00Z',
    actualArrival: '2025-05-19T13:30:00Z',
    destinationLocationId: 'loc-001',
    carrierName: 'Regional Transport',
    trackingNumber: 'RT7865432',
    totalItems: 2,
    totalQuantity: 2500,
    priority: 'normal',
    notes: 'Packaging supplies replenishment',
    notificationSent: true,
    receivedBy: 'user-001',
    createdAt: '2025-05-12T11:25:00Z',
    updatedAt: '2025-05-19T16:45:00Z',
    items: [
      {
        itemId: 'item-009',
        sku: 'PKG-001',
        name: 'Shipping Boxes (Medium)',
        quantity: 1000,
        receivedQuantity: 1000,
        unitOfMeasure: 'each',
        unitCost: 0.89,
        totalCost: 890.00,
        destinationBin: 'X25-Y26-Z27',
        qualityCheckRequired: false,
        qualityCheckStatus: 'passed'
      },
      {
        itemId: 'item-010',
        sku: 'PKG-002',
        name: 'Packing Tape',
        quantity: 1500,
        receivedQuantity: 1500,
        unitOfMeasure: 'roll',
        unitCost: 1.25,
        totalCost: 1875.00,
        destinationBin: 'X25-Y26-Z28',
        qualityCheckRequired: false,
        qualityCheckStatus: 'passed'
      }
    ]
  },
  {
    id: 'rcv-005',
    poNumber: 'PO-4802',
    supplierId: 'sup-005',
    supplierName: 'Precision Tools Ltd',
    status: 'exception',
    expectedArrival: '2025-05-18T09:00:00Z',
    actualArrival: '2025-05-18T09:15:00Z',
    destinationLocationId: 'loc-002',
    carrierName: 'Precision Logistics',
    trackingNumber: 'PL2398765',
    totalItems: 1,
    totalQuantity: 5,
    priority: 'normal',
    notes: 'Special order for maintenance department',
    notificationSent: true,
    receivedBy: 'user-003',
    exceptionNotes: 'Received 4 units instead of 5, damage to one unit reported',
    createdAt: '2025-05-10T10:20:00Z',
    updatedAt: '2025-05-18T10:30:00Z',
    items: [
      {
        itemId: 'item-011',
        sku: 'TOOL-001',
        name: 'Precision Calibration Kit',
        quantity: 5,
        receivedQuantity: 4,
        unitOfMeasure: 'kit',
        unitCost: 235.50,
        totalCost: 1177.50,
        destinationBin: 'Q17-R18-S19',
        qualityCheckRequired: true,
        qualityCheckStatus: 'failed',
        qualityIssues: 'One unit has damaged calibration gauge'
      }
    ]
  }
];

// ==============================
// QUALITY INSPECTIONS
// ==============================

export const mockQualityInspections = [
  {
    id: 'qi-001',
    receivingId: 'rcv-003',
    poNumber: 'PO-2468',
    itemId: 'item-005',
    sku: 'INV-005',
    itemName: 'Material E',
    status: 'pending',
    inspectionType: 'sample',
    sampleSize: 50,
    assignedTo: 'user-004',
    priority: 'high',
    dueDate: '2025-05-22T17:00:00Z',
    checklistId: 'qc-checklist-raw-materials',
    notes: 'Verify material composition and quality',
    createdAt: '2025-05-21T11:15:00Z',
    updatedAt: '2025-05-21T11:15:00Z'
  },
  {
    id: 'qi-002',
    receivingId: 'rcv-005',
    poNumber: 'PO-4802',
    itemId: 'item-011',
    sku: 'TOOL-001',
    itemName: 'Precision Calibration Kit',
    status: 'completed',
    result: 'failed',
    inspectionType: 'full',
    assignedTo: 'user-004',
    completedBy: 'user-004',
    priority: 'high',
    completedAt: '2025-05-18T10:25:00Z',
    checklistId: 'qc-checklist-precision-tools',
    notes: 'Full inspection of all received units',
    findings: 'One unit has damaged calibration gauge, three units passed all tests',
    resolutionPlan: 'Return damaged unit to supplier for replacement',
    attachments: ['qc-report-PO-4802.pdf', 'damaged-unit-photo.jpg'],
    createdAt: '2025-05-18T09:45:00Z',
    updatedAt: '2025-05-18T10:25:00Z'
  },
  {
    id: 'qi-003',
    receivingId: 'rcv-004',
    poNumber: 'PO-3691',
    itemId: 'item-009',
    sku: 'PKG-001',
    itemName: 'Shipping Boxes (Medium)',
    status: 'completed',
    result: 'passed',
    inspectionType: 'sample',
    sampleSize: 50,
    assignedTo: 'user-002',
    completedBy: 'user-002',
    priority: 'normal',
    completedAt: '2025-05-19T14:30:00Z',
    checklistId: 'qc-checklist-packaging',
    notes: 'Random sample inspection of packaging materials',
    findings: 'All samples met quality standards',
    createdAt: '2025-05-19T13:45:00Z',
    updatedAt: '2025-05-19T14:30:00Z'
  }
];

export const mockQualityChecklists = [
  {
    id: 'qc-checklist-raw-materials',
    name: 'Raw Materials Quality Inspection',
    description: 'Standard quality checks for incoming raw materials',
    itemCategories: ['raw_materials', 'components'],
    version: '2.1',
    lastUpdated: '2025-01-15T09:00:00Z',
    items: [
      {
        id: 'qci-001',
        description: 'Visual inspection for contamination',
        type: 'pass_fail',
        required: true,
        instructions: 'Check for any visible contaminants or foreign material'
      },
      {
        id: 'qci-002',
        description: 'Material density check',
        type: 'measurement',
        required: true,
        instructions: 'Measure density using calibrated tools',
        specMin: 0.95,
        specMax: 1.05,
        unit: 'g/cm³'
      },
      {
        id: 'qci-003',
        description: 'Moisture content',
        type: 'measurement',
        required: true,
        instructions: 'Test moisture content with moisture meter',
        specMax: 0.5,
        unit: '%'
      },
      {
        id: 'qci-004',
        description: 'Package integrity',
        type: 'pass_fail',
        required: true,
        instructions: 'Inspect packaging for tears, punctures, or contamination'
      },
      {
        id: 'qci-005',
        description: 'Supplier documentation complete',
        type: 'pass_fail',
        required: true,
        instructions: 'Verify all required supplier certificates are included'
      }
    ]
  },
  {
    id: 'qc-checklist-precision-tools',
    name: 'Precision Tools Inspection',
    description: 'Detailed inspection for precision measurement and calibration tools',
    itemCategories: ['tools', 'equipment'],
    version: '3.0',
    lastUpdated: '2025-02-20T14:30:00Z',
    items: [
      {
        id: 'qci-101',
        description: 'Calibration certificate present',
        type: 'pass_fail',
        required: true,
        instructions: 'Verify calibration certificate is included and valid'
      },
      {
        id: 'qci-102',
        description: 'Physical damage inspection',
        type: 'pass_fail',
        required: true,
        instructions: 'Inspect all components for physical damage'
      },
      {
        id: 'qci-103',
        description: 'Precision test using reference standard',
        type: 'measurement',
        required: true,
        instructions: 'Test against reference standard and record deviation',
        specMax: 0.001,
        unit: 'mm'
      },
      {
        id: 'qci-104',
        description: 'All accessories present',
        type: 'pass_fail',
        required: true,
        instructions: 'Verify all listed accessories are included in the package'
      },
      {
        id: 'qci-105',
        description: 'Operation test',
        type: 'pass_fail',
        required: true,
        instructions: 'Perform standard operation test of all functions'
      }
    ]
  },
  {
    id: 'qc-checklist-packaging',
    name: 'Packaging Materials Inspection',
    description: 'Quality checks for packaging materials',
    itemCategories: ['packaging', 'shipping_supplies'],
    version: '1.5',
    lastUpdated: '2025-03-05T11:15:00Z',
    items: [
      {
        id: 'qci-201',
        description: 'Dimension verification',
        type: 'measurement',
        required: true,
        instructions: 'Measure and verify dimensions match specifications',
        tolerance: 0.25,
        unit: 'in'
      },
      {
        id: 'qci-202',
        description: 'Material thickness',
        type: 'measurement',
        required: true,
        instructions: 'Measure material thickness at multiple points',
        specMin: 0.95,
        specMax: 1.05,
        unit: 'mm'
      },
      {
        id: 'qci-203',
        description: 'Print quality check',
        type: 'pass_fail',
        required: false,
        instructions: 'For printed materials, inspect print quality and alignment'
      },
      {
        id: 'qci-204',
        description: 'Adhesive test',
        type: 'pass_fail',
        required: false,
        instructions: 'For adhesive products, test adhesion strength'
      }
    ]
  }
];

// ==============================
// PUTAWAY OPERATIONS
// ==============================

export const mockPutawayTasks = [
  {
    id: 'put-001',
    receivingId: 'rcv-003',
    status: 'pending',
    priority: 'high',
    createdAt: '2025-05-21T11:30:00Z',
    assignedTo: null,
    locationId: 'loc-002',
    notes: 'Material requires careful handling',
    items: [
      {
        itemId: 'item-005',
        sku: 'INV-005',
        name: 'Material E',
        quantity: 500,
        unitOfMeasure: 'kg',
        sourceBin: 'RECV-DOCK-1',
        destinationBin: 'P16-Q17-R18',
        requiresScanVerification: true
      }
    ]
  },
  {
    id: 'put-002',
    receivingId: 'rcv-004',
    status: 'in_progress',
    priority: 'normal',
    createdAt: '2025-05-19T14:45:00Z',
    assignedTo: 'user-005',
    startedAt: '2025-05-22T09:15:00Z',
    locationId: 'loc-001',
    estimatedCompletionTime: '2025-05-22T10:45:00Z',
    items: [
      {
        itemId: 'item-009',
        sku: 'PKG-001',
        name: 'Shipping Boxes (Medium)',
        quantity: 1000,
        unitOfMeasure: 'each',
        sourceBin: 'RECV-DOCK-2',
        destinationBin: 'X25-Y26-Z27',
        requiresScanVerification: true,
        status: 'pending'
      },
      {
        itemId: 'item-010',
        sku: 'PKG-002',
        name: 'Packing Tape',
        quantity: 1500,
        unitOfMeasure: 'roll',
        sourceBin: 'RECV-DOCK-2',
        destinationBin: 'X25-Y26-Z28',
        requiresScanVerification: true,
        status: 'in_progress',
        completedQuantity: 600
      }
    ]
  },
  {
    id: 'put-003',
    receivingId: 'rcv-005',
    status: 'completed',
    priority: 'normal',
    createdAt: '2025-05-18T10:45:00Z',
    assignedTo: 'user-003',
    startedAt: '2025-05-18T11:00:00Z',
    completedAt: '2025-05-18T11:30:00Z',
    locationId: 'loc-002',
    items: [
      {
        itemId: 'item-011',
        sku: 'TOOL-001',
        name: 'Precision Calibration Kit',
        quantity: 4,
        unitOfMeasure: 'kit',
        sourceBin: 'RECV-QC',
        destinationBin: 'Q17-R18-S19',
        requiresScanVerification: true,
        status: 'completed',
        completedQuantity: 4,
        completedAt: '2025-05-18T11:30:00Z'
      }
    ]
  }
];

// ==============================
// PICKING OPERATIONS
// ==============================

export const mockPickPaths = [
  {
    id: 'path-001',
    warehouseId: 'loc-001',
    name: 'Main Warehouse Standard Path',
    description: 'Optimized path through main warehouse aisles',
    binSequence: [
      'A1-B2-C3', 'D4-E5-F6', 'G7-H8-I9', 'J10-K11-L12', 
      'M13-N14-O15', 'P16-Q17-R18', 'S19-T20-U21', 'V22-W23-X24', 
      'X25-Y26-Z27', 'X25-Y26-Z28'
    ],
    isDefault: true,
    createdAt: '2024-12-15T08:00:00Z',
    updatedAt: '2025-03-10T14:30:00Z'
  },
  {
    id: 'path-002',
    warehouseId: 'loc-002',
    name: 'Secondary Warehouse Path',
    description: 'Standard pick path for secondary warehouse location',
    binSequence: [
      'D4-E5-F6', 'M13-N14-O15', 'Q17-R18-S19', 'S19-T20-U21'
    ],
    isDefault: true,
    createdAt: '2025-01-05T10:15:00Z',
    updatedAt: '2025-01-05T10:15:00Z'
  },
  {
    id: 'path-003',
    warehouseId: 'loc-001',
    name: 'Small Item Express Path',
    description: 'Optimized path for small items with high picking frequency',
    binSequence: [
      'J10-K11-L12', 'G7-H8-I9', 'P16-Q17-R18', 'X25-Y26-Z28'
    ],
    isDefault: false,
    createdAt: '2025-02-12T15:45:00Z',
    updatedAt: '2025-04-05T09:20:00Z'
  }
];

export const mockPickingTasks = [
  {
    id: 'pick-001',
    orderId: 'ORD-5678',
    orderType: 'sales',
    customerName: 'TechCorp Industries',
    status: 'in_progress',
    priority: 'high',
    pickType: 'single',
    locationId: 'loc-001',
    pathId: 'path-001',
    assignedTo: 'user-003',
    createdAt: '2025-05-21T14:30:00Z',
    startedAt: '2025-05-22T08:45:00Z',
    estimatedCompletionTime: '2025-05-22T09:30:00Z',
    dueDate: '2025-05-22T12:00:00Z',
    items: [
      {
        lineItemId: 'li-5678-1',
        itemId: 'item-001',
        sku: 'INV-001',
        name: 'Widget A',
        quantity: 15,
        unitOfMeasure: 'each',
        binLocation: 'A1-B2-C3',
        status: 'in_progress',
        pickedQuantity: 10
      },
      {
        lineItemId: 'li-5678-2',
        itemId: 'item-002',
        sku: 'INV-002',
        name: 'Gadget B',
        quantity: 5,
        unitOfMeasure: 'each',
        binLocation: 'G7-H8-I9',
        status: 'pending',
        pickedQuantity: 0
      },
      {
        lineItemId: 'li-5678-3',
        itemId: 'item-007',
        sku: 'INV-007',
        name: 'Assembly G',
        quantity: 2,
        unitOfMeasure: 'each',
        binLocation: 'V22-W23-X24',
        status: 'pending',
        pickedQuantity: 0
      }
    ]
  },
  {
    id: 'pick-002',
    orderId: 'ORD-5680',
    orderType: 'sales',
    customerName: 'Regional Distributors',
    status: 'pending',
    priority: 'normal',
    pickType: 'single',
    locationId: 'loc-001',
    pathId: 'path-001',
    assignedTo: null,
    createdAt: '2025-05-21T16:15:00Z',
    dueDate: '2025-05-23T15:00:00Z',
    items: [
      {
        lineItemId: 'li-5680-1',
        itemId: 'item-003',
        sku: 'INV-003',
        name: 'Component C',
        quantity: 50,
        unitOfMeasure: 'each',
        binLocation: 'J10-K11-L12',
        status: 'pending',
        pickedQuantity: 0
      },
      {
        lineItemId: 'li-5680-2',
        itemId: 'item-009',
        sku: 'PKG-001',
        name: 'Shipping Boxes (Medium)',
        quantity: 25,
        unitOfMeasure: 'each',
        binLocation: 'X25-Y26-Z27',
        status: 'pending',
        pickedQuantity: 0
      }
    ]
  },
  {
    id: 'pick-003',
    batchId: 'batch-001',
    orderIds: ['ORD-5682', 'ORD-5683', 'ORD-5684'],
    status: 'completed',
    priority: 'normal',
    pickType: 'batch',
    locationId: 'loc-001',
    pathId: 'path-003',
    assignedTo: 'user-005',
    createdAt: '2025-05-20T09:30:00Z',
    startedAt: '2025-05-20T10:15:00Z',
    completedAt: '2025-05-20T11:45:00Z',
    items: [
      {
        lineItemId: 'li-batch-001-1',
        itemId: 'item-003',
        sku: 'INV-003',
        name: 'Component C',
        quantity: 75,
        unitOfMeasure: 'each',
        binLocation: 'J10-K11-L12',
        status: 'completed',
        pickedQuantity: 75,
        orderDistribution: [
          { orderId: 'ORD-5682', quantity: 25 },
          { orderId: 'ORD-5683', quantity: 25 },
          { orderId: 'ORD-5684', quantity: 25 }
        ]
      },
      {
        lineItemId: 'li-batch-001-2',
        itemId: 'item-002',
        sku: 'INV-002',
        name: 'Gadget B',
        quantity: 9,
        unitOfMeasure: 'each',
        binLocation: 'G7-H8-I9',
        status: 'completed',
        pickedQuantity: 9,
        orderDistribution: [
          { orderId: 'ORD-5682', quantity: 3 },
          { orderId: 'ORD-5683', quantity: 3 },
          { orderId: 'ORD-5684', quantity: 3 }
        ]
      }
    ]
  }
];

// ==============================
// PACKING OPERATIONS
// ==============================

export const mockPackingStations = [
  {
    id: 'pack-001',
    name: 'Packing Station 1',
    locationId: 'loc-001',
    status: 'active',
    assignedUser: 'user-002',
    stationType: 'standard',
    supportsLabelPrinting: true,
    supportsDimensioning: true,
    supportsWeighing: true,
    dimensions: {
      length: 60,
      width: 36,
      height: 72,
      unit: 'in'
    },
    availableBoxTypes: ['small', 'medium', 'large', 'custom'],
    availablePackingMaterials: ['bubble_wrap', 'packing_paper', 'air_pillows', 'foam_inserts'],
    createdAt: '2024-11-10T08:00:00Z',
    updatedAt: '2025-04-15T11:30:00Z'
  },
  {
    id: 'pack-002',
    name: 'Packing Station 2',
    locationId: 'loc-001',
    status: 'active',
    assignedUser: 'user-003',
    stationType: 'high_volume',
    supportsLabelPrinting: true,
    supportsDimensioning: true,
    supportsWeighing: true,
    dimensions: {
      length: 72,
      width: 48,
      height: 72,
      unit: 'in'
    },
    availableBoxTypes: ['small', 'medium', 'large', 'extra_large', 'custom'],
    availablePackingMaterials: ['bubble_wrap', 'packing_paper', 'air_pillows', 'foam_inserts', 'custom_inserts'],
    createdAt: '2024-11-10T08:30:00Z',
    updatedAt: '2025-03-22T14:15:00Z'
  },
  {
    id: 'pack-003',
    name: 'Small Package Station',
    locationId: 'loc-001',
    status: 'maintenance',
    assignedUser: null,
    stationType: 'small_items',
    supportsLabelPrinting: true,
    supportsDimensioning: false,
    supportsWeighing: true,
    dimensions: {
      length: 48,
      width: 30,
      height: 60,
      unit: 'in'
    },
    availableBoxTypes: ['small', 'padded_envelope', 'poly_mailer'],
    availablePackingMaterials: ['bubble_wrap', 'tissue_paper'],
    maintenanceNotes: 'Scale calibration in progress',
    maintenanceScheduledEnd: '2025-05-23T17:00:00Z',
    createdAt: '2025-01-15T13:45:00Z',
    updatedAt: '2025-05-22T09:00:00Z'
  }
];

export const mockPackagingMaterials = [
  {
    id: 'box-001',
    name: 'Small Box',
    sku: 'BOX-SM',
    type: 'box',
    dimensions: {
      length: 8,
      width: 6,
      height: 4,
      unit: 'in'
    },
    maxWeight: 5,
    weightUnit: 'lb',
    cost: 0.45,
    stockLevel: 350,
    minStockLevel: 100,
    locationId: 'loc-001',
    binLocation: 'X25-Y26-Z27'
  },
  {
    id: 'box-002',
    name: 'Medium Box',
    sku: 'BOX-MD',
    type: 'box',
    dimensions: {
      length: 12,
      width: 10,
      height: 8,
      unit: 'in'
    },
    maxWeight: 15,
    weightUnit: 'lb',
    cost: 0.89,
    stockLevel: 250,
    minStockLevel: 75,
    locationId: 'loc-001',
    binLocation: 'X25-Y26-Z27'
  },
  {
    id: 'box-003',
    name: 'Large Box',
    sku: 'BOX-LG',
    type: 'box',
    dimensions: {
      length: 18,
      width: 16,
      height: 12,
      unit: 'in'
    },
    maxWeight: 30,
    weightUnit: 'lb',
    cost: 1.25,
    stockLevel: 125,
    minStockLevel: 40,
    locationId: 'loc-001',
    binLocation: 'X25-Y26-Z27'
  },
  {
    id: 'env-001',
    name: 'Padded Envelope',
    sku: 'ENV-PAD',
    type: 'envelope',
    dimensions: {
      length: 12,
      width: 9,
      unit: 'in'
    },
    maxWeight: 2,
    weightUnit: 'lb',
    cost: 0.38,
    stockLevel: 500,
    minStockLevel: 150,
    locationId: 'loc-001',
    binLocation: 'X25-Y26-Z27'
  },
  {
    id: 'wrap-001',
    name: 'Bubble Wrap',
    sku: 'WRAP-BUB',
    type: 'packing_material',
    unit: 'roll',
    cost: 5.99,
    stockLevel: 42,
    minStockLevel: 10,
    locationId: 'loc-001',
    binLocation: 'X25-Y26-Z28'
  },
  {
    id: 'wrap-002',
    name: 'Packing Paper',
    sku: 'WRAP-PAP',
    type: 'packing_material',
    unit: 'bundle',
    cost: 9.99,
    stockLevel: 28,
    minStockLevel: 8,
    locationId: 'loc-001',
    binLocation: 'X25-Y26-Z28'
  },
  {
    id: 'tape-001',
    name: 'Packing Tape',
    sku: 'PKG-002',
    type: 'tape',
    unit: 'roll',
    cost: 1.25,
    stockLevel: 115,
    minStockLevel: 30,
    locationId: 'loc-001',
    binLocation: 'X25-Y26-Z28'
  }
];

export const mockPackingTasks = [
  {
    id: 'pack-task-001',
    orderId: 'ORD-5678',
    customerName: 'TechCorp Industries',
    status: 'pending',
    priority: 'high',
    pickCompleted: false,
    assignedStation: null,
    assignedUser: null,
    createdAt: '2025-05-21T14:30:00Z',
    dueDate: '2025-05-22T12:00:00Z',
    shippingMethod: 'ground',
    shippingCarrier: 'FedEx',
    requiresCustomPackaging: false,
    specialInstructions: 'Fragile items enclosed',
    estimatedWeight: 8.5,
    weightUnit: 'lb',
    items: [
      {
        lineItemId: 'li-5678-1',
        itemId: 'item-001',
        sku: 'INV-001',
        name: 'Widget A',
        quantity: 15,
        unitWeight: 0.5,
        weightUnit: 'lb'
      },
      {
        lineItemId: 'li-5678-2',
        itemId: 'item-002',
        sku: 'INV-002',
        name: 'Gadget B',
        quantity: 5,
        unitWeight: 0.2,
        weightUnit: 'lb'
      },
      {
        lineItemId: 'li-5678-3',
        itemId: 'item-007',
        sku: 'INV-007',
        name: 'Assembly G',
        quantity: 2,
        unitWeight: 0.75,
        weightUnit: 'lb'
      }
    ]
  },
  {
    id: 'pack-task-002',
    orderId: 'ORD-5682',
    customerName: 'Eastern Distributors',
    status: 'in_progress',
    priority: 'normal',
    pickCompleted: true,
    assignedStation: 'pack-001',
    assignedUser: 'user-002',
    createdAt: '2025-05-20T09:30:00Z',
    startedAt: '2025-05-22T10:15:00Z',
    dueDate: '2025-05-22T16:00:00Z',
    shippingMethod: '2day',
    shippingCarrier: 'UPS',
    requiresCustomPackaging: false,
    estimatedWeight: 2.3,
    weightUnit: 'lb',
    packages: [
      {
        packageId: 'pkg-5682-1',
        status: 'in_progress',
        packageType: 'box-002',
        items: [
          {
            lineItemId: 'li-batch-001-1',
            itemId: 'item-003',
            quantity: 25
          },
          {
            lineItemId: 'li-batch-001-2',
            itemId: 'item-002',
            quantity: 3
          }
        ],
        packingMaterials: [
          { id: 'wrap-001', amount: 0.5 }
        ]
      }
    ]
  },
  {
    id: 'pack-task-003',
    orderId: 'ORD-5683',
    customerName: 'Western Supply Co',
    status: 'completed',
    priority: 'normal',
    pickCompleted: true,
    assignedStation: 'pack-002',
    assignedUser: 'user-003',
    createdAt: '2025-05-20T09:30:00Z',
    startedAt: '2025-05-20T13:30:00Z',
    completedAt: '2025-05-20T14:15:00Z',
    dueDate: '2025-05-22T16:00:00Z',
    shippingMethod: 'ground',
    shippingCarrier: 'FedEx',
    requiresCustomPackaging: false,
    estimatedWeight: 2.3,
    actualWeight: 2.5,
    weightUnit: 'lb',
    packages: [
      {
        packageId: 'pkg-5683-1',
        status: 'completed',
        packageType: 'box-002',
        items: [
          {
            lineItemId: 'li-batch-001-1',
            itemId: 'item-003',
            quantity: 25
          },
          {
            lineItemId: 'li-batch-001-2',
            itemId: 'item-002',
            quantity: 3
          }
        ],
        packingMaterials: [
          { id: 'wrap-001', amount: 0.5 },
          { id: 'wrap-002', amount: 1 }
        ],
        dimensions: {
          length: 12,
          width: 10,
          height: 8,
          unit: 'in'
        },
        weight: 2.5,
        weightUnit: 'lb',
        trackingNumber: 'FDX8765432109',
        shippingLabelPrinted: true,
        shippingLabelUrl: 'https://example.com/labels/FDX8765432109.pdf',
        shippingDocuments: ['commercial_invoice', 'packing_slip']
      }
    ]
  }
];

// ==============================
// SHIPPING INTEGRATION
// ==============================

export const mockShippingCarriers = [
  {
    id: 'carrier-001',
    name: 'FedEx',
    code: 'fedex',
    active: true,
    accountNumber: 'FDX123456789',
    services: [
      {
        id: 'fedex-ground',
        name: 'FedEx Ground',
        code: 'GROUND',
        domesticOnly: false,
        estimatedTransitDays: '1-5',
        defaultForDomestic: true
      },
      {
        id: 'fedex-2day',
        name: 'FedEx 2Day',
        code: '2DAY',
        domesticOnly: false,
        estimatedTransitDays: '2'
      },
      {
        id: 'fedex-priority',
        name: 'FedEx Priority Overnight',
        code: 'PRIORITY_OVERNIGHT',
        domesticOnly: false,
        estimatedTransitDays: '1'
      },
      {
        id: 'fedex-international',
        name: 'FedEx International Priority',
        code: 'INTERNATIONAL_PRIORITY',
        domesticOnly: false,
        estimatedTransitDays: '1-3',
        defaultForInternational: true
      }
    ],
    packageTypes: [
      { id: 'fedex-box', name: 'FedEx Box', code: 'FEDEX_BOX' },
      { id: 'fedex-pak', name: 'FedEx Pak', code: 'FEDEX_PAK' },
      { id: 'fedex-envelope', name: 'FedEx Envelope', code: 'FEDEX_ENVELOPE' },
      { id: 'fedex-custom', name: 'Your Packaging', code: 'YOUR_PACKAGING' }
    ],
    apiCredentials: {
      apiKey: 'fedex_api_key_placeholder',
      accountNumber: 'FDX123456789',
      meterNumber: '123456789'
    },
    maxPackageWeight: 150,
    maxPackageDimensions: {
      length: 108,
      width: 70,
      height: 70,
      unit: 'in'
    }
  },
  {
    id: 'carrier-002',
    name: 'UPS',
    code: 'ups',
    active: true,
    accountNumber: 'UPS987654321',
    services: [
      {
        id: 'ups-ground',
        name: 'UPS Ground',
        code: '03',
        domesticOnly: false,
        estimatedTransitDays: '1-5',
        defaultForDomestic: true
      },
      {
        id: 'ups-3day',
        name: 'UPS 3-Day Select',
        code: '12',
        domesticOnly: true,
        estimatedTransitDays: '3'
      },
      {
        id: 'ups-2day',
        name: 'UPS 2nd Day Air',
        code: '02',
        domesticOnly: true,
        estimatedTransitDays: '2'
      },
      {
        id: 'ups-next-day',
        name: 'UPS Next Day Air',
        code: '01',
        domesticOnly: true,
        estimatedTransitDays: '1'
      },
      {
        id: 'ups-worldwide',
        name: 'UPS Worldwide Expedited',
        code: '08',
        domesticOnly: false,
        estimatedTransitDays: '2-5',
        defaultForInternational: true
      }
    ],
    packageTypes: [
      { id: 'ups-letter', name: 'UPS Letter', code: '01' },
      { id: 'ups-pak', name: 'UPS Pak', code: '02' },
      { id: 'ups-box', name: 'UPS Box', code: '03' },
      { id: 'ups-custom', name: 'Customer Packaging', code: '00' }
    ],
    apiCredentials: {
      apiKey: 'ups_api_key_placeholder',
      userId: 'ups_user_id',
      password: 'encrypted_password_placeholder'
    },
    maxPackageWeight: 150,
    maxPackageDimensions: {
      length: 108,
      width: 84,
      height: 60,
      unit: 'in'
    }
  },
  {
    id: 'carrier-003',
    name: 'USPS',
    code: 'usps',
    active: true,
    accountNumber: 'USPS123456',
    services: [
      {
        id: 'usps-priority',
        name: 'USPS Priority Mail',
        code: 'PRIORITY',
        domesticOnly: false,
        estimatedTransitDays: '1-3',
        defaultForDomestic: true
      },
      {
        id: 'usps-first-class',
        name: 'USPS First Class Mail',
        code: 'FIRST_CLASS',
        domesticOnly: true,
        estimatedTransitDays: '2-5'
      },
      {
        id: 'usps-express',
        name: 'USPS Priority Mail Express',
        code: 'PRIORITY_EXPRESS',
        domesticOnly: false,
        estimatedTransitDays: '1-2'
      },
      {
        id: 'usps-international',
        name: 'USPS Priority Mail International',
        code: 'PRIORITY_INTERNATIONAL',
        domesticOnly: false,
        estimatedTransitDays: '6-10',
        defaultForInternational: true
      }
    ],
    packageTypes: [
      { id: 'usps-letter', name: 'Letter', code: 'LETTER' },
      { id: 'usps-flat', name: 'Flat Rate Envelope', code: 'FLAT_RATE_ENVELOPE' },
      { id: 'usps-box-small', name: 'Small Flat Rate Box', code: 'SM_FLAT_RATE_BOX' },
      { id: 'usps-box-medium', name: 'Medium Flat Rate Box', code: 'MD_FLAT_RATE_BOX' },
      { id: 'usps-box-large', name: 'Large Flat Rate Box', code: 'LG_FLAT_RATE_BOX' },
      { id: 'usps-package', name: 'Package/Thick Envelope', code: 'PACKAGE' }
    ],
    apiCredentials: {
      apiKey: 'usps_api_key_placeholder',
      userId: 'usps_user_id'
    },
    maxPackageWeight: 70,
    maxPackageDimensions: {
      length: 108,
      girth: 130,
      unit: 'in'
    }
  }
];

export const mockShipments = [
  {
    id: 'ship-001',
    orderId: 'ORD-5683',
    customerName: 'Western Supply Co',
    status: 'shipped',
    carrierId: 'carrier-001',
    carrierName: 'FedEx',
    serviceId: 'fedex-ground',
    serviceName: 'FedEx Ground',
    trackingNumber: 'FDX8765432109',
    createdAt: '2025-05-20T14:15:00Z',
    shippedAt: '2025-05-20T16:30:00Z',
    estimatedDelivery: '2025-05-23T17:00:00Z',
    shipToAddress: {
      name: 'Western Supply Co',
      attention: 'Receiving Dept',
      street1: '789 Industrial Pkwy',
      street2: 'Suite 400',
      city: 'Portland',
      state: 'OR',
      postalCode: '97204',
      country: 'US',
      phone: '503-555-7890'
    },
    packages: [
      {
        packageId: 'pkg-5683-1',
        trackingNumber: 'FDX8765432109',
        packageType: 'box-002',
        actualWeight: 2.5,
        weightUnit: 'lb',
        dimensions: {
          length: 12,
          width: 10,
          height: 8,
          unit: 'in'
        },
        items: [
          {
            lineItemId: 'li-batch-001-1',
            itemId: 'item-003',
            quantity: 25
          },
          {
            lineItemId: 'li-batch-001-2',
            itemId: 'item-002',
            quantity: 3
          }
        ],
        shippingLabelUrl: 'https://example.com/labels/FDX8765432109.pdf'
      }
    ],
    shippingCost: 12.75,
    currency: 'USD',
    documents: [
      {
        type: 'commercial_invoice',
        url: 'https://example.com/documents/ORD-5683-invoice.pdf'
      },
      {
        type: 'packing_slip',
        url: 'https://example.com/documents/ORD-5683-packing-slip.pdf'
      }
    ],
    events: [
      {
        timestamp: '2025-05-20T14:15:00Z',
        status: 'label_created',
        description: 'Shipping label created',
        location: 'Portland, OR'
      },
      {
        timestamp: '2025-05-20T16:30:00Z',
        status: 'picked_up',
        description: 'Picked up by carrier',
        location: 'Portland, OR'
      }
    ]
  },
  {
    id: 'ship-002',
    orderId: 'ORD-5684',
    customerName: 'Northern Industries',
    status: 'delivered',
    carrierId: 'carrier-002',
    carrierName: 'UPS',
    serviceId: 'ups-2day',
    serviceName: 'UPS 2nd Day Air',
    trackingNumber: '1Z9999W99999999999',
    createdAt: '2025-05-20T14:30:00Z',
    shippedAt: '2025-05-20T17:00:00Z',
    deliveredAt: '2025-05-22T11:45:00Z',
    shipToAddress: {
      name: 'Northern Industries',
      attention: 'John Smith',
      street1: '456 Tech Avenue',
      street2: '4th Floor',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'US',
      phone: '206-555-2345'
    },
    packages: [
      {
        packageId: 'pkg-5684-1',
        trackingNumber: '1Z9999W99999999999',
        packageType: 'box-001',
        actualWeight: 2.2,
        weightUnit: 'lb',
        dimensions: {
          length: 8,
          width: 6,
          height: 4,
          unit: 'in'
        },
        items: [
          {
            lineItemId: 'li-batch-001-1',
            itemId: 'item-003',
            quantity: 25
          },
          {
            lineItemId: 'li-batch-001-2',
            itemId: 'item-002',
            quantity: 3
          }
        ],
        shippingLabelUrl: 'https://example.com/labels/1Z9999W99999999999.pdf'
      }
    ],
    shippingCost: 18.50,
    currency: 'USD',
    documents: [
      {
        type: 'packing_slip',
        url: 'https://example.com/documents/ORD-5684-packing-slip.pdf'
      }
    ],
    events: [
      {
        timestamp: '2025-05-20T14:30:00Z',
        status: 'label_created',
        description: 'Shipping label created',
        location: 'Portland, OR'
      },
      {
        timestamp: '2025-05-20T17:00:00Z',
        status: 'picked_up',
        description: 'Picked up by carrier',
        location: 'Portland, OR'
      },
      {
        timestamp: '2025-05-21T08:15:00Z',
        status: 'in_transit',
        description: 'In transit',
        location: 'UPS Facility, Kent, WA'
      },
      {
        timestamp: '2025-05-22T08:30:00Z',
        status: 'out_for_delivery',
        description: 'Out for delivery',
        location: 'Seattle, WA'
      },
      {
        timestamp: '2025-05-22T11:45:00Z',
        status: 'delivered',
        description: 'Delivered',
        location: 'Seattle, WA'
      }
    ]
  },
  {
    id: 'ship-003',
    orderId: 'ORD-5682',
    customerName: 'Eastern Distributors',
    status: 'label_created',
    carrierId: 'carrier-002',
    carrierName: 'UPS',
    serviceId: 'ups-2day',
    serviceName: 'UPS 2nd Day Air',
    trackingNumber: '1Z9999W99999999998',
    createdAt: '2025-05-22T11:30:00Z',
    shipToAddress: {
      name: 'Eastern Distributors',
      attention: 'Sarah Johnson',
      street1: '123 Commerce Blvd',
      street2: '',
      city: 'Boston',
      state: 'MA',
      postalCode: '02110',
      country: 'US',
      phone: '617-555-1234'
    },
    packages: [
      {
        packageId: 'pkg-5682-1',
        trackingNumber: '1Z9999W99999999998',
        packageType: 'box-002',
        estimatedWeight: 2.3,
        weightUnit: 'lb',
        dimensions: {
          length: 12,
          width: 10,
          height: 8,
          unit: 'in'
        },
        items: [
          {
            lineItemId: 'li-batch-001-1',
            itemId: 'item-003',
            quantity: 25
          },
          {
            lineItemId: 'li-batch-001-2',
            itemId: 'item-002',
            quantity: 3
          }
        ],
        shippingLabelUrl: 'https://example.com/labels/1Z9999W99999999998.pdf'
      }
    ],
    shippingCost: 22.75,
    currency: 'USD',
    documents: [
      {
        type: 'packing_slip',
        url: 'https://example.com/documents/ORD-5682-packing-slip.pdf'
      }
    ],
    events: [
      {
        timestamp: '2025-05-22T11:30:00Z',
        status: 'label_created',
        description: 'Shipping label created',
        location: 'Portland, OR'
      }
    ]
  }
];

// Export all mock data
export default {
  mockIncomingShipments,
  mockQualityInspections,
  mockQualityChecklists,
  mockPutawayTasks,
  mockPickPaths,
  mockPickingTasks,
  mockPackingStations,
  mockPackagingMaterials,
  mockPackingTasks,
  mockShippingCarriers,
  mockShipments
}