export const mockInventoryData = [
  {
    id: 1,
    name: "Fiber Optic Cable (50m)",
    category: "Cabling",
    stockLevel: 45,
    minStockLevel: 20,
    location: "Warehouse A",
    status: "in_stock",
    lastOrdered: "2023-06-15",
    unitCost: 85.50,
    supplier: "FiberTech Solutions"
  },
  {
    id: 2,
    name: "Wi-Fi 6 Router",
    category: "Customer Premise Equipment",
    stockLevel: 32,
    minStockLevel: 15,
    location: "Warehouse A",
    status: "in_stock",
    lastOrdered: "2023-06-28",
    unitCost: 120.75,
    supplier: "NetGear Inc."
  },
  {
    id: 3,
    name: "Fiber Splice Kit",
    category: "Tools",
    stockLevel: 4,
    minStockLevel: 5,
    location: "Tool Storage",
    status: "low_stock",
    lastOrdered: "2023-05-10",
    unitCost: 350.00,
    supplier: "TechTools Ltd"
  },
  {
    id: 4,
    name: "Backup UPS System",
    category: "Power Equipment",
    stockLevel: 1,
    minStockLevel: 2,
    location: "Secure Storage B",
    status: "low_stock",
    lastOrdered: "2023-04-22",
    unitCost: 450.25,
    supplier: "PowerSafe Systems"
  },
  {
    id: 5,
    name: "Residential Fiber ONT",
    category: "Network Termination",
    stockLevel: 28,
    minStockLevel: 10,
    location: "Warehouse A",
    status: "in_stock",
    lastOrdered: "2023-07-05",
    unitCost: 95.00,
    supplier: "Huawei Technologies"
  },
  {
    id: 6,
    name: "Business-class Router",
    category: "Customer Premise Equipment",
    stockLevel: 12,
    minStockLevel: 5,
    location: "Secure Storage B",
    status: "in_stock",
    lastOrdered: "2023-06-10",
    unitCost: 280.50,
    supplier: "Cisco Systems"
  },
  {
    id: 7,
    name: "Fiber Patch Cable (2m)",
    category: "Cabling",
    stockLevel: 65,
    minStockLevel: 30,
    location: "Warehouse A",
    status: "in_stock",
    lastOrdered: "2023-07-10",
    unitCost: 15.25,
    supplier: "CablePro Ltd"
  },
  {
    id: 8,
    name: "Signal Analyzer",
    category: "Tools",
    stockLevel: 3,
    minStockLevel: 2,
    location: "Tool Storage",
    status: "in_stock",
    lastOrdered: "2023-03-15",
    unitCost: 1250.00,
    supplier: "TechTools Ltd"
  },
  {
    id: 9,
    name: "Managed Network Switch",
    category: "Network Termination",
    stockLevel: 8,
    minStockLevel: 4,
    location: "Secure Storage B",
    status: "in_stock",
    lastOrdered: "2023-05-20",
    unitCost: 350.00,
    supplier: "Cisco Systems"
  },
  {
    id: 10,
    name: "Enterprise Access Point",
    category: "Customer Premise Equipment",
    stockLevel: 15,
    minStockLevel: 8,
    location: "Warehouse A",
    status: "in_stock",
    lastOrdered: "2023-06-05",
    unitCost: 180.50,
    supplier: "Ubiquiti Networks"
  },
  {
    id: 11,
    name: "Cat6 Ethernet Cable (100m)",
    category: "Cabling",
    stockLevel: 38,
    minStockLevel: 20,
    location: "Warehouse A",
    status: "in_stock",
    lastOrdered: "2023-07-01",
    unitCost: 45.75,
    supplier: "CablePro Ltd"
  },
  {
    id: 12,
    name: "GPON Splitter (1:8)",
    category: "Network Termination",
    stockLevel: 10,
    minStockLevel: 5,
    location: "Secure Storage B",
    status: "in_stock",
    lastOrdered: "2023-04-28",
    unitCost: 65.00,
    supplier: "FiberTech Solutions"
  },
  {
    id: 13,
    name: "Cable Tester",
    category: "Tools",
    stockLevel: 2,
    minStockLevel: 3,
    location: "Tool Storage",
    status: "low_stock",
    lastOrdered: "2023-02-15",
    unitCost: 120.00,
    supplier: "TechTools Ltd"
  },
  {
    id: 14,
    name: "Fiber Patch Cable (50ft)",
    category: "Cabling",
    stockLevel: 42,
    minStockLevel: 20,
    location: "Warehouse A",
    status: "in_stock",
    lastOrdered: "2023-05-10",
    unitCost: 25.50,
    supplier: "CablePro Ltd"
  },
  {
    id: 15,
    name: "Media Converter",
    category: "Network Termination",
    stockLevel: 7,
    minStockLevel: 4,
    location: "Secure Storage B",
    status: "in_stock",
    lastOrdered: "2023-06-18",
    unitCost: 85.00,
    supplier: "FiberTech Solutions"
  }
];

// Calculate aggregate statistics
export const calculateInventoryStats = () => {
  const totalValue = mockInventoryData.reduce((sum, item) => sum + (item.stockLevel * item.unitCost), 0);
  const totalUnits = mockInventoryData.reduce((sum, item) => sum + item.stockLevel, 0);
  
  const inStock = mockInventoryData.filter(item => item.status === 'in_stock').length;
  const lowStock = mockInventoryData.filter(item => item.status === 'low_stock').length;
  const outOfStock = mockInventoryData.filter(item => item.status === 'out_of_stock').length;
  
  return {
    totalValue,
    totalUnits,
    inStock,
    lowStock,
    outOfStock,
    valueChange: 5.2,
    unitsChange: 3.8,
    turnoverRatio: 4.5,
    turnoverChange: -1.2,
    daysOfInventory: 45,
    targetDays: 60,
    stockAccuracy: 97,
    lastCycleCount: '2023-07-15',
    fulfillmentRate: 95,
    ordersCompleted: 38,
    totalOrders: 40
  };
};
export const mockItems = [
  {
    id: 'item-001',
    sku: 'INV-001',
    name: 'Widget A',
    description: 'Standard size widget for industrial use',
    categoryId: 'cat-001',
    status: 'active',
    upc: '123456789012',
    vendorSku: 'V-001',
    reorderPoint: 10,
    reorderQuantity: 25,
    cost: 5.99,
    stockOnHand: 45,
    stockCommitted: 5,
    stockAvailable: 40,
    unitOfMeasure: 'each',
    dimensions: {
      weight: 0.5,
      length: 3,
      width: 2,
      height: 1,
      weightUnit: 'lb',
      dimensionUnit: 'in'
    },
    locations: [
      {
        id: 'loc-001',
        name: 'Warehouse A',
        quantity: 30,
        bin: 'A1-B2-C3'
      },
      {
        id: 'loc-002',
        name: 'Warehouse B',
        quantity: 15,
        bin: 'D4-E5-F6'
      }
    ],
    createdAt: '2025-01-15T14:22:18Z',
    updatedAt: '2025-01-15T14:22:18Z'
  },
  {
    id: 'item-002',
    sku: 'INV-002',
    name: 'Gadget B',
    description: 'Premium gadget with extended functionality',
    categoryId: 'cat-002',
    status: 'active',
    upc: '223456789012',
    vendorSku: 'V-002',
    reorderPoint: 5,
    reorderQuantity: 15,
    cost: 12.99,
    stockOnHand: 17,
    stockCommitted: 2,
    stockAvailable: 15,
    unitOfMeasure: 'each',
    dimensions: {
      weight: 1.2,
      length: 5,
      width: 4,
      height: 2,
      weightUnit: 'lb',
      dimensionUnit: 'in'
    },
    locations: [
      {
        id: 'loc-001',
        name: 'Warehouse A',
        quantity: 10,
        bin: 'G7-H8-I9'
      },
      {
        id: 'loc-003',
        name: 'Store Front',
        quantity: 7,
        bin: 'SF-12'
      }
    ],
    createdAt: '2025-01-18T11:35:28Z',
    updatedAt: '2025-02-01T09:12:45Z'
  },
  {
    id: 'item-003',
    sku: 'INV-003',
    name: 'Component C',
    description: 'Electronic component for circuit boards',
    categoryId: 'cat-003',
    status: 'active',
    upc: '323456789012',
    vendorSku: 'V-003',
    reorderPoint: 100,
    reorderQuantity: 250,
    cost: 0.59,
    stockOnHand: 350,
    stockCommitted: 50,
    stockAvailable: 300,
    unitOfMeasure: 'each',
    dimensions: {
      weight: 0.01,
      length: 0.5,
      width: 0.5,
      height: 0.1,
      weightUnit: 'oz',
      dimensionUnit: 'in'
    },
    locations: [
      {
        id: 'loc-001',
        name: 'Warehouse A',
        quantity: 300,
        bin: 'J10-K11-L12'
      },
      {
        id: 'loc-004',
        name: 'Assembly Line',
        quantity: 50,
        bin: 'AL-05'
      }
    ],
    createdAt: '2025-01-20T08:45:12Z',
    updatedAt: '2025-01-20T08:45:12Z'
  },
  {
    id: 'item-004',
    sku: 'INV-004',
    name: 'Tool Set D',
    description: 'Professional tool set with carrying case',
    categoryId: 'cat-001',
    status: 'low_stock',
    upc: '423456789012',
    vendorSku: 'V-004',
    reorderPoint: 5,
    reorderQuantity: 10,
    cost: 89.99,
    stockOnHand: 3,
    stockCommitted: 1,
    stockAvailable: 2,
    unitOfMeasure: 'set',
    dimensions: {
      weight: 12,
      length: 18,
      width: 12,
      height: 4,
      weightUnit: 'lb',
      dimensionUnit: 'in'
    },
    locations: [
      {
        id: 'loc-002',
        name: 'Warehouse B',
        quantity: 3,
        bin: 'M13-N14-O15'
      }
    ],
    createdAt: '2025-01-25T16:18:32Z',
    updatedAt: '2025-02-05T10:24:18Z'
  },
  {
    id: 'item-005',
    sku: 'INV-005',
    name: 'Material E',
    description: 'Raw material for manufacturing process',
    categoryId: 'cat-004',
    status: 'active',
    upc: '523456789012',
    vendorSku: 'V-005',
    reorderPoint: 50,
    reorderQuantity: 100,
    cost: 3.49,
    stockOnHand: 85,
    stockCommitted: 15,
    stockAvailable: 70,
    unitOfMeasure: 'kg',
    dimensions: {
      weight: 1,
      weightUnit: 'kg',
    },
    locations: [
      {
        id: 'loc-001',
        name: 'Warehouse A',
        quantity: 60,
        bin: 'P16-Q17-R18'
      },
      {
        id: 'loc-004',
        name: 'Assembly Line',
        quantity: 25,
        bin: 'AL-12'
      }
    ],
    createdAt: '2025-01-10T09:25:44Z',
    updatedAt: '2025-02-03T14:32:19Z'
  },
  {
    id: 'item-006',
    sku: 'INV-006',
    name: 'Product F',
    description: 'Discontinued product, limited stock available',
    categoryId: 'cat-002',
    status: 'discontinued',
    upc: '623456789012',
    vendorSku: 'V-006',
    reorderPoint: 0,
    reorderQuantity: 0,
    cost: 24.99,
    stockOnHand: 8,
    stockCommitted: 0,
    stockAvailable: 8,
    unitOfMeasure: 'each',
    dimensions: {
      weight: 2.5,
      length: 8,
      width: 6,
      height: 4,
      weightUnit: 'lb',
      dimensionUnit: 'in'
    },
    locations: [
      {
        id: 'loc-002',
        name: 'Warehouse B',
        quantity: 8,
        bin: 'S19-T20-U21'
      }
    ],
    createdAt: '2024-11-05T10:18:23Z',
    updatedAt: '2025-01-15T11:42:38Z'
  },
  {
    id: 'item-007',
    sku: 'INV-007',
    name: 'Assembly G',
    description: 'Assembled component ready for installation',
    categoryId: 'cat-003',
    status: 'active',
    upc: '723456789012',
    vendorSku: 'V-007',
    reorderPoint: 15,
    reorderQuantity: 25,
    cost: 45.50,
    stockOnHand: 22,
    stockCommitted: 5,
    stockAvailable: 17,
    unitOfMeasure: 'each',
    dimensions: {
      weight: 5.2,
      length: 12,
      width: 8,
      height: 3,
      weightUnit: 'lb',
      dimensionUnit: 'in'
    },
    locations: [
      {
        id: 'loc-001',
        name: 'Warehouse A',
        quantity: 15,
        bin: 'V22-W23-X24'
      },
      {
        id: 'loc-003',
        name: 'Store Front',
        quantity: 7,
        bin: 'SF-18'
      }
    ],
    createdAt: '2025-01-12T13:48:56Z',
    updatedAt: '2025-02-02T08:15:29Z'
  },
  {
    id: 'item-008',
    sku: 'INV-008',
    name: 'Kit H',
    description: 'Complete kit with all necessary components',
    categoryId: 'cat-001',
    status: 'out_of_stock',
    upc: '823456789012',
    vendorSku: 'V-008',
    reorderPoint: 10,
    reorderQuantity: 20,
    cost: 78.25,
    stockOnHand: 0,
    stockCommitted: 0,
    stockAvailable: 0,
    unitOfMeasure: 'kit',
    dimensions: {
      weight: 8.7,
      length: 14,
      width: 10,
      height: 6,
      weightUnit: 'lb',
      dimensionUnit: 'in'
    },
    locations: [],
    createdAt: '2025-01-08T15:36:42Z',
    updatedAt: '2025-01-30T16:28:53Z'
  }
];

export const mockLocations = [
  {
    id: 'loc-001',
    name: 'Warehouse A',
    type: 'warehouse',
    address: {
      street: '123 Distribution Way',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      country: 'USA'
    },
    isActive: true,
    createdAt: '2024-10-15T12:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    id: 'loc-002',
    name: 'Warehouse B',
    type: 'warehouse',
    address: {
      street: '456 Storage Road',
      city: 'Seattle',
      state: 'WA',
      zip: '98101',
      country: 'USA'
    },
    isActive: true,
    createdAt: '2024-10-18T14:30:00Z',
    updatedAt: '2024-10-18T14:30:00Z'
  },
  {
    id: 'loc-003',
    name: 'Store Front',
    type: 'retail',
    address: {
      street: '789 Retail Drive',
      city: 'Portland',
      state: 'OR',
      zip: '97204',
      country: 'USA'
    },
    isActive: true,
    createdAt: '2024-10-22T09:15:00Z',
    updatedAt: '2024-10-22T09:15:00Z'
  },
  {
    id: 'loc-004',
    name: 'Assembly Line',
    type: 'manufacturing',
    address: {
      street: '101 Factory Avenue',
      city: 'Beaverton',
      state: 'OR',
      zip: '97005',
      country: 'USA'
    },
    isActive: true,
    createdAt: '2024-11-05T11:45:00Z',
    updatedAt: '2024-11-05T11:45:00Z'
  },
  {
    id: 'loc-005',
    name: 'Remote Storage',
    type: 'warehouse',
    address: {
      street: '202 Remote Lane',
      city: 'Eugene',
      state: 'OR',
      zip: '97401',
      country: 'USA'
    },
    isActive: false,
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2025-01-15T09:30:00Z'
  }
];

export const mockTransactions = [
  {
    id: 'txn-001',
    type: 'receipt',
    status: 'completed',
    referenceNumber: 'PO-12345',
    notes: 'Regular stock replenishment',
    createdAt: '2025-01-15T14:30:00Z',
    completedAt: '2025-01-15T15:45:00Z',
    createdBy: 'user-001',
    items: [
      {
        itemId: 'item-001',
        quantity: 25,
        locationId: 'loc-001',
        binLocation: 'A1-B2-C3'
      },
      {
        itemId: 'item-003',
        quantity: 100,
        locationId: 'loc-001',
        binLocation: 'J10-K11-L12'
      }
    ]
  },
  {
    id: 'txn-002',
    type: 'adjustment',
    status: 'completed',
    referenceNumber: 'ADJ-5678',
    notes: 'Inventory count adjustment',
    createdAt: '2025-01-20T09:15:00Z',
    completedAt: '2025-01-20T09:30:00Z',
    createdBy: 'user-002',
    items: [
      {
        itemId: 'item-002',
        quantity: -2,
        locationId: 'loc-001',
        binLocation: 'G7-H8-I9',
        reason: 'damaged'
      }
    ]
  },
  {
    id: 'txn-003',
    type: 'transfer',
    status: 'completed',
    referenceNumber: 'TR-9012',
    notes: 'Transfer to store location',
    createdAt: '2025-01-25T11:00:00Z',
    completedAt: '2025-01-25T16:30:00Z',
    createdBy: 'user-001',
    items: [
      {
        itemId: 'item-007',
        quantity: 5,
        sourceLocationId: 'loc-001',
        sourceBin: 'V22-W23-X24',
        destinationLocationId: 'loc-003',
        destinationBin: 'SF-18'
      }
    ]
  },
  {
    id: 'txn-004',
    type: 'issue',
    status: 'completed',
    referenceNumber: 'ORD-3456',
    notes: 'Customer order fulfillment',
    createdAt: '2025-01-30T13:45:00Z',
    completedAt: '2025-01-30T14:30:00Z',
    createdBy: 'user-003',
    items: [
      {
        itemId: 'item-001',
        quantity: 5,
        locationId: 'loc-001',
        binLocation: 'A1-B2-C3'
      },
      {
        itemId: 'item-002',
        quantity: 2,
        locationId: 'loc-003',
        binLocation: 'SF-12'
      }
    ]
  },
  {
    id: 'txn-005',
    type: 'receipt',
    status: 'pending',
    referenceNumber: 'PO-7890',
    notes: 'Awaiting delivery',
    createdAt: '2025-02-05T10:00:00Z',
    createdBy: 'user-002',
    items: [
      {
        itemId: 'item-004',
        quantity: 10,
        locationId: 'loc-002',
        binLocation: 'M13-N14-O15'
      },
      {
        itemId: 'item-008',
        quantity: 15,
        locationId: 'loc-001',
        binLocation: 'TBD'
      }
    ]
  }
];

export const mockCycleCounts = [
  {
    id: 'count-001',
    name: 'Q1 Full Inventory Count',
    status: 'completed',
    startDate: '2025-01-05T08:00:00Z',
    endDate: '2025-01-10T17:00:00Z',
    createdBy: 'user-001',
    locations: ['loc-001', 'loc-002'],
    items: [
      {
        itemId: 'item-001',
        expectedQuantity: 40,
        countedQuantity: 45,
        variance: 5,
        varianceResolved: true
      },
      {
        itemId: 'item-002',
        expectedQuantity: 20,
        countedQuantity: 17,
        variance: -3,
        varianceResolved: true
      },
      {
        itemId: 'item-003',
        expectedQuantity: 350,
        countedQuantity: 350,
        variance: 0,
        varianceResolved: true
      }
    ]
  },
  {
    id: 'count-002',
    name: 'Retail Store Count',
    status: 'in_progress',
    startDate: '2025-02-10T09:00:00Z',
    createdBy: 'user-003',
    locations: ['loc-003'],
    items: [
      {
        itemId: 'item-002',
        expectedQuantity: 7,
        countedQuantity: null,
        variance: null,
        varianceResolved: false
      },
      {
        itemId: 'item-007',
        expectedQuantity: 7,
        countedQuantity: null,
        variance: null,
        varianceResolved: false
      }
    ]
  }
];

export const mockDocuments = [
  {
    id: 'doc-00001',
    name: 'PO-12345-invoice.pdf',
    type: 'invoice',
    description: 'Invoice for stock replenishment order PO-12345',
    size: 1254000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/PO-12345-invoice.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: 'txn-001',
    transactionReference: 'PO-12345',
    locationId: 'loc-001',
    createdAt: '2025-01-15T14:25:00Z',
    updatedAt: '2025-01-15T14:25:00Z',
    createdBy: 'user-001'
  },
  {
    id: 'doc-00002',
    name: 'PO-12345-packing-slip.pdf',
    type: 'packing_slip',
    description: 'Packing slip for order PO-12345',
    size: 920000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/PO-12345-packing-slip.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: 'txn-001',
    transactionReference: 'PO-12345',
    locationId: 'loc-001',
    createdAt: '2025-01-15T14:28:30Z',
    updatedAt: '2025-01-15T14:28:30Z',
    createdBy: 'user-001'
  },
  {
    id: 'doc-00003',
    name: 'signature-receipt-PO-12345.jpg',
    type: 'receipt',
    description: 'Signed delivery receipt for order PO-12345',
    size: 3250000,
    fileType: 'image/jpeg',
    url: 'https://example.com/documents/signature-receipt-PO-12345.jpg',
    thumbnail: 'https://placehold.co/400x600/jpg',
    transactionId: 'txn-001',
    transactionReference: 'PO-12345',
    locationId: 'loc-001',
    createdAt: '2025-01-15T15:40:00Z',
    updatedAt: '2025-01-15T15:40:00Z',
    createdBy: 'user-004'
  },
  {
    id: 'doc-00004',
    name: 'INV-001-item-photo.jpg',
    type: 'product_image',
    description: 'Photo of Widget A for inventory records',
    size: 2840000,
    fileType: 'image/jpeg',
    url: 'https://example.com/documents/INV-001-item-photo.jpg',
    thumbnail: 'https://placehold.co/400x600/jpg',
    transactionId: null,
    transactionReference: null,
    locationId: 'loc-001',
    createdAt: '2025-01-16T10:15:00Z',
    updatedAt: '2025-01-16T10:15:00Z',
    createdBy: 'user-002'
  },
  {
    id: 'doc-00005',
    name: 'ADJ-5678-inventory-count-sheet.xlsx',
    type: 'internal',
    description: 'Inventory count sheet for adjustment ADJ-5678',
    size: 125000,
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    url: 'https://example.com/documents/ADJ-5678-inventory-count-sheet.xlsx',
    thumbnail: null,
    transactionId: 'txn-002',
    transactionReference: 'ADJ-5678',
    locationId: 'loc-001',
    createdAt: '2025-01-20T09:10:00Z',
    updatedAt: '2025-01-20T09:10:00Z',
    createdBy: 'user-002'
  },
  {
    id: 'doc-00006',
    name: 'TR-9012-transfer-form.pdf',
    type: 'transfer_form',
    description: 'Internal transfer form for TR-9012',
    size: 980000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/TR-9012-transfer-form.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: 'txn-003',
    transactionReference: 'TR-9012',
    locationId: 'loc-001',
    createdAt: '2025-01-25T11:05:00Z',
    updatedAt: '2025-01-25T11:05:00Z',
    createdBy: 'user-001'
  },
  {
    id: 'doc-00007',
    name: 'TR-9012-received-confirmation.pdf',
    type: 'receipt',
    description: 'Confirmation of receipt for transfer TR-9012',
    size: 750000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/TR-9012-received-confirmation.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: 'txn-003',
    transactionReference: 'TR-9012',
    locationId: 'loc-003',
    createdAt: '2025-01-25T16:25:00Z',
    updatedAt: '2025-01-25T16:25:00Z',
    createdBy: 'user-003'
  },
  {
    id: 'doc-00008',
    name: 'ORD-3456-customer-order.pdf',
    type: 'sales_order',
    description: 'Customer order form for ORD-3456',
    size: 1100000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/ORD-3456-customer-order.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: 'txn-004',
    transactionReference: 'ORD-3456',
    locationId: 'loc-003',
    createdAt: '2025-01-30T13:30:00Z',
    updatedAt: '2025-01-30T13:30:00Z',
    createdBy: 'user-003'
  },
  {
    id: 'doc-00009',
    name: 'ORD-3456-shipping-label.pdf',
    type: 'shipping',
    description: 'Shipping label for customer order ORD-3456',
    size: 520000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/ORD-3456-shipping-label.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: 'txn-004',
    transactionReference: 'ORD-3456',
    locationId: 'loc-001',
    createdAt: '2025-01-30T14:15:00Z',
    updatedAt: '2025-01-30T14:15:00Z',
    createdBy: 'user-003'
  },
  {
    id: 'doc-00010',
    name: 'PO-7890-purchase-order.pdf',
    type: 'purchase_order',
    description: 'Purchase order for PO-7890',
    size: 1350000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/PO-7890-purchase-order.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: 'txn-005',
    transactionReference: 'PO-7890',
    locationId: 'loc-002',
    createdAt: '2025-02-05T09:45:00Z',
    updatedAt: '2025-02-05T09:45:00Z',
    createdBy: 'user-002'
  },
  {
    id: 'doc-00011',
    name: 'supplier-quote-Q123.pdf',
    type: 'quote',
    description: 'Supplier quote for upcoming order',
    size: 1050000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/supplier-quote-Q123.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: null,
    transactionReference: null,
    locationId: null,
    createdAt: '2025-02-01T11:20:00Z',
    updatedAt: '2025-02-01T11:20:00Z',
    createdBy: 'user-001'
  },
  {
    id: 'doc-00012',
    name: 'warehouse-layout-2025.pdf',
    type: 'internal',
    description: 'Updated warehouse layout diagram',
    size: 4500000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/warehouse-layout-2025.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: null,
    transactionReference: null,
    locationId: 'loc-001',
    createdAt: '2025-01-10T14:00:00Z',
    updatedAt: '2025-01-10T14:00:00Z',
    createdBy: 'user-005'
  },
  {
    id: 'doc-00013',
    name: 'Q1-inventory-policy.docx',
    type: 'internal',
    description: 'Updated inventory policy document for Q1 2025',
    size: 850000,
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: 'https://example.com/documents/Q1-inventory-policy.docx',
    thumbnail: null,
    transactionId: null,
    transactionReference: null,
    locationId: null,
    createdAt: '2025-01-02T09:30:00Z',
    updatedAt: '2025-01-02T09:30:00Z',
    createdBy: 'user-005'
  },
  {
    id: 'doc-00014',
    name: 'count-001-variance-report.pdf',
    type: 'count',
    description: 'Variance report for Q1 Full Inventory Count',
    size: 1250000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/count-001-variance-report.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: null,
    transactionReference: 'count-001',
    locationId: 'loc-001',
    createdAt: '2025-01-10T16:45:00Z',
    updatedAt: '2025-01-10T16:45:00Z',
    createdBy: 'user-001'
  },
  {
    id: 'doc-00015',
    name: 'damage-report-item-002.pdf',
    type: 'incident',
    description: 'Damage report for Gadget B inventory',
    size: 950000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/damage-report-item-002.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: 'txn-002',
    transactionReference: 'ADJ-5678',
    locationId: 'loc-001',
    createdAt: '2025-01-20T09:20:00Z',
    updatedAt: '2025-01-20T09:20:00Z',
    createdBy: 'user-002'
  },
  {
    id: 'doc-00016',
    name: 'damaged-item-002-photo.jpg',
    type: 'incident',
    description: 'Photo of damaged Gadget B items',
    size: 3100000,
    fileType: 'image/jpeg',
    url: 'https://example.com/documents/damaged-item-002-photo.jpg',
    thumbnail: 'https://placehold.co/400x600/jpg',
    transactionId: 'txn-002',
    transactionReference: 'ADJ-5678',
    locationId: 'loc-001',
    createdAt: '2025-01-20T09:18:00Z',
    updatedAt: '2025-01-20T09:18:00Z',
    createdBy: 'user-002'
  },
  {
    id: 'doc-00017',
    name: 'bill-of-lading-PO-12345.pdf',
    type: 'bill_of_lading',
    description: 'Bill of lading for order PO-12345',
    size: 1150000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/bill-of-lading-PO-12345.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: 'txn-001',
    transactionReference: 'PO-12345',
    locationId: 'loc-001',
    createdAt: '2025-01-15T14:27:00Z',
    updatedAt: '2025-01-15T14:27:00Z',
    createdBy: 'user-001'
  },
  {
    id: 'doc-00018',
    name: 'product-catalog-2025.pdf',
    type: 'catalog',
    description: 'Product catalog for 2025',
    size: 8500000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/product-catalog-2025.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: null,
    transactionReference: null,
    locationId: null,
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z',
    createdBy: 'user-005'
  },
  {
    id: 'doc-00019',
    name: 'monthly-inventory-report-jan-2025.xlsx',
    type: 'report',
    description: 'Monthly inventory status report for January 2025',
    size: 2250000,
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    url: 'https://example.com/documents/monthly-inventory-report-jan-2025.xlsx',
    thumbnail: null,
    transactionId: null,
    transactionReference: null,
    locationId: null,
    createdAt: '2025-02-02T14:30:00Z',
    updatedAt: '2025-02-02T14:30:00Z',
    createdBy: 'user-001'
  },
  {
    id: 'doc-00020',
    name: 'QC-checklist-item-007.pdf',
    type: 'quality',
    description: 'Quality control checklist for Assembly G',
    size: 980000,
    fileType: 'application/pdf',
    url: 'https://example.com/documents/QC-checklist-item-007.pdf',
    thumbnail: 'https://placehold.co/400x600',
    transactionId: null,
    transactionReference: null,
    locationId: 'loc-004',
    createdAt: '2025-01-24T11:40:00Z',
    updatedAt: '2025-01-24T11:40:00Z',
    createdBy: 'user-004'
  }
];

export const mockAuditLogs = [
  {
    id: 'audit-00001',
    timestamp: '2025-01-15T14:22:18Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'item_created',
    entityType: 'item',
    entityId: 'item-001',
    details: 'Created new inventory item "Widget A" with initial stock of 45 units',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'info'
  },
  {
    id: 'audit-00002',
    timestamp: '2025-01-15T14:30:00Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'transaction_created',
    entityType: 'transaction',
    entityId: 'txn-001',
    transactionId: 'txn-001',
    transactionReference: 'PO-12345',
    details: 'Created inventory receipt transaction PO-12345',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'info'
  },
  {
    id: 'audit-00003',
    timestamp: '2025-01-15T15:45:00Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'transaction_completed',
    entityType: 'transaction',
    entityId: 'txn-001',
    transactionId: 'txn-001',
    transactionReference: 'PO-12345',
    details: 'Completed inventory receipt transaction PO-12345',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'info'
  },
  {
    id: 'audit-00004',
    timestamp: '2025-01-15T15:45:10Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'stock_increased',
    entityType: 'item',
    entityId: 'item-001',
    itemId: 'item-001',
    locationId: 'loc-001',
    transactionId: 'txn-001',
    details: 'Stock increased by 25 units at Warehouse A (A1-B2-C3)',
    previousValue: '20',
    newValue: '45',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'info'
  },
  {
    id: 'audit-00005',
    timestamp: '2025-01-15T15:45:15Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'stock_increased',
    entityType: 'item',
    entityId: 'item-003',
    itemId: 'item-003',
    locationId: 'loc-001',
    transactionId: 'txn-001',
    details: 'Stock increased by 100 units at Warehouse A (J10-K11-L12)',
    previousValue: '250',
    newValue: '350',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'info'
  },
  {
    id: 'audit-00006',
    timestamp: '2025-01-15T14:25:00Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'doc-00001',
    transactionId: 'txn-001',
    details: 'Uploaded document "PO-12345-invoice.pdf"',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'info'
  },
  {
    id: 'audit-00007',
    timestamp: '2025-01-16T10:05:35Z',
    userId: 'user-002',
    userDisplayName: 'Jane Johnson',
    action: 'item_updated',
    entityType: 'item',
    entityId: 'item-001',
    details: 'Updated item description from "Standard widget" to "Standard size widget for industrial use"',
    previousValue: 'Standard widget',
    newValue: 'Standard size widget for industrial use',
    ipAddress: '192.168.1.62',
    browser: 'Firefox 97.0.1',
    severity: 'info'
  },
  {
    id: 'audit-00008',
    timestamp: '2025-01-18T11:35:28Z',
    userId: 'user-002',
    userDisplayName: 'Jane Johnson',
    action: 'item_created',
    entityType: 'item',
    entityId: 'item-002',
    details: 'Created new inventory item "Gadget B" with initial stock of 17 units',
    ipAddress: '192.168.1.62',
    browser: 'Firefox 97.0.1',
    severity: 'info'
  },
  {
    id: 'audit-00009',
    timestamp: '2025-01-20T09:15:00Z',
    userId: 'user-002',
    userDisplayName: 'Jane Johnson',
    action: 'transaction_created',
    entityType: 'transaction',
    entityId: 'txn-002',
    transactionId: 'txn-002',
    transactionReference: 'ADJ-5678',
    details: 'Created inventory adjustment transaction ADJ-5678',
    ipAddress: '192.168.1.62',
    browser: 'Firefox 97.0.1',
    severity: 'info'
  },
  {
    id: 'audit-00010',
    timestamp: '2025-01-20T09:30:00Z',
    userId: 'user-002',
    userDisplayName: 'Jane Johnson',
    action: 'transaction_completed',
    entityType: 'transaction',
    entityId: 'txn-002',
    transactionId: 'txn-002',
    transactionReference: 'ADJ-5678',
    details: 'Completed inventory adjustment transaction ADJ-5678',
    ipAddress: '192.168.1.62',
    browser: 'Firefox 97.0.1',
    severity: 'info'
  },
  {
    id: 'audit-00011',
    timestamp: '2025-01-20T09:30:10Z',
    userId: 'user-002',
    userDisplayName: 'Jane Johnson',
    action: 'stock_decreased',
    entityType: 'item',
    entityId: 'item-002',
    itemId: 'item-002',
    locationId: 'loc-001',
    transactionId: 'txn-002',
    details: 'Stock decreased by 2 units at Warehouse A (G7-H8-I9) - Reason: damaged',
    previousValue: '19',
    newValue: '17',
    ipAddress: '192.168.1.62',
    browser: 'Firefox 97.0.1',
    severity: 'warning'
  },
  {
    id: 'audit-00012',
    timestamp: '2025-01-20T09:18:00Z',
    userId: 'user-002',
    userDisplayName: 'Jane Johnson',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'doc-00016',
    transactionId: 'txn-002',
    details: 'Uploaded document "damaged-item-002-photo.jpg"',
    ipAddress: '192.168.1.62',
    browser: 'Firefox 97.0.1',
    severity: 'info'
  },
  {
    id: 'audit-00013',
    timestamp: '2025-01-25T11:00:00Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'transaction_created',
    entityType: 'transaction',
    entityId: 'txn-003',
    transactionId: 'txn-003',
    transactionReference: 'TR-9012',
    details: 'Created inventory transfer transaction TR-9012',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'info'
  },
  {
    id: 'audit-00014',
    timestamp: '2025-01-25T16:30:00Z',
    userId: 'user-003',
    userDisplayName: 'Michael Brown',
    action: 'transaction_completed',
    entityType: 'transaction',
    entityId: 'txn-003',
    transactionId: 'txn-003',
    transactionReference: 'TR-9012',
    details: 'Completed inventory transfer transaction TR-9012',
    ipAddress: '192.168.1.78',
    browser: 'Edge 97.0.1072.69',
    severity: 'info'
  },
  {
    id: 'audit-00015',
    timestamp: '2025-01-25T16:30:15Z',
    userId: 'user-003',
    userDisplayName: 'Michael Brown',
    action: 'stock_transferred',
    entityType: 'item',
    entityId: 'item-007',
    itemId: 'item-007',
    sourceLocationId: 'loc-001',
    destinationLocationId: 'loc-003',
    transactionId: 'txn-003',
    details: 'Transferred 5 units from Warehouse A to Store Front',
    ipAddress: '192.168.1.78',
    browser: 'Edge 97.0.1072.69',
    severity: 'info'
  },
  {
    id: 'audit-00016',
    timestamp: '2025-01-30T08:45:12Z',
    userId: 'user-005',
    userDisplayName: 'Sarah Williams',
    action: 'user_login',
    entityType: 'user',
    entityId: 'user-005',
    details: 'User login successful',
    ipAddress: '192.168.1.102',
    browser: 'Safari 15.2',
    severity: 'info'
  },
  {
    id: 'audit-00017',
    timestamp: '2025-01-30T13:45:00Z',
    userId: 'user-003',
    userDisplayName: 'Michael Brown',
    action: 'transaction_created',
    entityType: 'transaction',
    entityId: 'txn-004',
    transactionId: 'txn-004',
    transactionReference: 'ORD-3456',
    details: 'Created inventory issue transaction ORD-3456',
    ipAddress: '192.168.1.78',
    browser: 'Edge 97.0.1072.69',
    severity: 'info'
  },
  {
    id: 'audit-00018',
    timestamp: '2025-01-30T14:30:00Z',
    userId: 'user-003',
    userDisplayName: 'Michael Brown',
    action: 'transaction_completed',
    entityType: 'transaction',
    entityId: 'txn-004',
    transactionId: 'txn-004',
    transactionReference: 'ORD-3456',
    details: 'Completed inventory issue transaction ORD-3456',
    ipAddress: '192.168.1.78',
    browser: 'Edge 97.0.1072.69',
    severity: 'info'
  },
  {
    id: 'audit-00019',
    timestamp: '2025-01-30T14:30:10Z',
    userId: 'user-003',
    userDisplayName: 'Michael Brown',
    action: 'stock_decreased',
    entityType: 'item',
    entityId: 'item-001',
    itemId: 'item-001',
    locationId: 'loc-001',
    transactionId: 'txn-004',
    details: 'Stock decreased by 5 units at Warehouse A (A1-B2-C3)',
    previousValue: '45',
    newValue: '40',
    ipAddress: '192.168.1.78',
    browser: 'Edge 97.0.1072.69',
    severity: 'info'
  },
  {
    id: 'audit-00020',
    timestamp: '2025-01-30T14:30:15Z',
    userId: 'user-003',
    userDisplayName: 'Michael Brown',
    action: 'stock_decreased',
    entityType: 'item',
    entityId: 'item-002',
    itemId: 'item-002',
    locationId: 'loc-003',
    transactionId: 'txn-004',
    details: 'Stock decreased by 2 units at Store Front (SF-12)',
    previousValue: '7',
    newValue: '5',
    ipAddress: '192.168.1.78',
    browser: 'Edge 97.0.1072.69',
    severity: 'info'
  },
  {
    id: 'audit-00021',
    timestamp: '2025-02-01T09:12:45Z',
    userId: 'user-002',
    userDisplayName: 'Jane Johnson',
    action: 'item_updated',
    entityType: 'item',
    entityId: 'item-002',
    details: 'Updated reorder quantity from 10 to 15',
    previousValue: '10',
    newValue: '15',
    ipAddress: '192.168.1.62',
    browser: 'Firefox 97.0.1',
    severity: 'info'
  },
  {
    id: 'audit-00022',
    timestamp: '2025-02-05T10:00:00Z',
    userId: 'user-002',
    userDisplayName: 'Jane Johnson',
    action: 'transaction_created',
    entityType: 'transaction',
    entityId: 'txn-005',
    transactionId: 'txn-005',
    transactionReference: 'PO-7890',
    details: 'Created pending inventory receipt transaction PO-7890',
    ipAddress: '192.168.1.62',
    browser: 'Firefox 97.0.1',
    severity: 'info'
  },
  {
    id: 'audit-00023',
    timestamp: '2025-01-10T16:45:00Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'doc-00014',
    details: 'Uploaded document "count-001-variance-report.pdf"',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'info'
  },
  {
    id: 'audit-00024',
    timestamp: '2025-01-05T08:00:00Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'count_started',
    entityType: 'cycle_count',
    entityId: 'count-001',
    details: 'Started cycle count "Q1 Full Inventory Count"',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'info'
  },
  {
    id: 'audit-00025',
    timestamp: '2025-01-10T17:00:00Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'count_completed',
    entityType: 'cycle_count',
    entityId: 'count-001',
    details: 'Completed cycle count "Q1 Full Inventory Count"',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'info'
  },
  {
    id: 'audit-00026',
    timestamp: '2025-01-10T17:05:00Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'variance_approved',
    entityType: 'cycle_count',
    entityId: 'count-001',
    itemId: 'item-001',
    details: 'Approved variance of +5 units for item "Widget A"',
    previousValue: '40',
    newValue: '45',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'warning'
  },
  {
    id: 'audit-00027',
    timestamp: '2025-01-10T17:10:00Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'variance_approved',
    entityType: 'cycle_count',
    entityId: 'count-001',
    itemId: 'item-002',
    details: 'Approved variance of -3 units for item "Gadget B"',
    previousValue: '20',
    newValue: '17',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'warning'
  },
  {
    id: 'audit-00028',
    timestamp: '2025-02-10T09:00:00Z',
    userId: 'user-003',
    userDisplayName: 'Michael Brown',
    action: 'count_started',
    entityType: 'cycle_count',
    entityId: 'count-002',
    details: 'Started cycle count "Retail Store Count"',
    ipAddress: '192.168.1.78',
    browser: 'Edge 97.0.1072.69',
    severity: 'info'
  },
  {
    id: 'audit-00029',
    timestamp: '2025-01-15T09:30:00Z',
    userId: 'user-004',
    userDisplayName: 'Emily Davis',
    action: 'location_deactivated',
    entityType: 'location',
    entityId: 'loc-005',
    details: 'Deactivated location "Remote Storage"',
    previousValue: 'active',
    newValue: 'inactive',
    ipAddress: '192.168.1.89',
    browser: 'Chrome 108.0.5359.124',
    severity: 'warning'
  },
  {
    id: 'audit-00030',
    timestamp: '2025-01-24T11:40:00Z',
    userId: 'user-004',
    userDisplayName: 'Emily Davis',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'doc-00020',
    details: 'Uploaded quality control document "QC-checklist-item-007.pdf"',
    ipAddress: '192.168.1.89',
    browser: 'Chrome 108.0.5359.124',
    severity: 'info'
  },
  {
    id: 'audit-00031',
    timestamp: '2025-02-03T14:32:19Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'item_updated',
    entityType: 'item',
    entityId: 'item-005',
    details: 'Updated stock on hand from 80 to 85',
    previousValue: '80',
    newValue: '85',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'info'
  },
  {
    id: 'audit-00032',
    timestamp: '2025-01-15T11:42:38Z',
    userId: 'user-005',
    userDisplayName: 'Sarah Williams',
    action: 'item_status_changed',
    entityType: 'item',
    entityId: 'item-006',
    details: 'Changed item status from "active" to "discontinued"',
    previousValue: 'active',
    newValue: 'discontinued',
    ipAddress: '192.168.1.102',
    browser: 'Safari 15.2',
    severity: 'warning'
  },
  {
    id: 'audit-00033',
    timestamp: '2025-01-05T10:00:00Z',
    userId: 'user-005',
    userDisplayName: 'Sarah Williams',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'doc-00018',
    details: 'Uploaded document "product-catalog-2025.pdf"',
    ipAddress: '192.168.1.102',
    browser: 'Safari 15.2',
    severity: 'info'
  },
  {
    id: 'audit-00034',
    timestamp: '2025-01-02T09:30:00Z',
    userId: 'user-005',
    userDisplayName: 'Sarah Williams',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'doc-00013',
    details: 'Uploaded document "Q1-inventory-policy.docx"',
    ipAddress: '192.168.1.102',
    browser: 'Safari 15.2',
    severity: 'info'
  },
  {
    id: 'audit-00035',
    timestamp: '2025-01-10T14:00:00Z',
    userId: 'user-005',
    userDisplayName: 'Sarah Williams',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'doc-00012',
    details: 'Uploaded document "warehouse-layout-2025.pdf"',
    ipAddress: '192.168.1.102',
    browser: 'Safari 15.2',
    severity: 'info'
  },
  {
    id: 'audit-00036',
    timestamp: '2025-01-30T14:40:00Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'failed_login_attempt',
    entityType: 'user',
    entityId: 'user-001',
    details: 'Failed login attempt for user john.smith',
    ipAddress: '203.0.113.42',
    browser: 'Chrome Mobile',
    severity: 'critical'
  },
  {
    id: 'audit-00037',
    timestamp: '2025-01-30T16:05:00Z',
    userId: 'user-admin',
    userDisplayName: 'System Administrator',
    action: 'user_locked',
    entityType: 'user',
    entityId: 'user-001',
    details: 'User account locked after multiple failed login attempts',
    ipAddress: '192.168.1.1',
    browser: 'System',
    severity: 'critical'
  },
  {
    id: 'audit-00038',
    timestamp: '2025-01-30T16:20:00Z',
    userId: 'user-admin',
    userDisplayName: 'System Administrator',
    action: 'user_unlocked',
    entityType: 'user',
    entityId: 'user-001',
    details: 'User account unlocked',
    ipAddress: '192.168.1.1',
    browser: 'System',
    severity: 'warning'
  },
  {
    id: 'audit-00039',
    timestamp: '2025-02-02T14:30:00Z',
    userId: 'user-001',
    userDisplayName: 'John Smith',
    action: 'document_uploaded',
    entityType: 'document',
    entityId: 'doc-00019',
    details: 'Uploaded document "monthly-inventory-report-jan-2025.xlsx"',
    ipAddress: '192.168.1.45',
    browser: 'Chrome 108.0.5359.124',
    severity: 'info'
  },
  {
    id: 'audit-00040',
    timestamp: '2025-01-30T09:15:00Z',
    userId: 'system',
    userDisplayName: 'System',
    action: 'low_stock_alert',
    entityType: 'item',
    entityId: 'item-004',
    details: 'Low stock alert triggered for "Tool Set D" (3 units remaining, reorder point: 5)',
    ipAddress: '192.168.1.1',
    browser: 'System',
    severity: 'warning'
  }
];

export const mockTransfers = [
  {
    id: 'tr-00001',
    referenceNumber: 'TR-22345',
    type: 'standard',
    fromLocationId: 'loc-001',
    toLocationId: 'loc-003',
    expectedShipDate: '2025-01-25T08:00:00Z',
    expectedDeliveryDate: '2025-01-25T16:00:00Z',
    status: 'completed',
    notes: 'Regular stock transfer to retail location',
    requiresApproval: false,
    createdBy: 'user-001',
    shippedBy: 'user-001',
    shippedAt: '2025-01-25T09:15:00Z',
    receivedBy: 'user-003',
    receivedAt: '2025-01-25T16:30:00Z',
    totalValue: 240.5,
    createdAt: '2025-01-24T14:00:00Z',
    updatedAt: '2025-01-25T16:30:00Z',
    items: [
      {
        itemId: 'item-001',
        name: 'Widget A',
        sku: 'INV-001',
        quantity: 5,
        receivedQuantity: 5,
        hasDiscrepancy: false,
        cost: 5.99,
        sourceBin: 'A1-B2-C3',
        destinationBin: 'SF-05',
        subtotal: 29.95
      },
      {
        itemId: 'item-007',
        name: 'Assembly G',
        sku: 'INV-007',
        quantity: 5,
        receivedQuantity: 5,
        hasDiscrepancy: false,
        cost: 45.50,
        sourceBin: 'V22-W23-X24',
        destinationBin: 'SF-18',
        subtotal: 227.5
      }
    ],
    shippingInfo: {
      method: 'Company Vehicle',
      trackingNumber: null,
      packageCount: 2
    }
  },
  {
    id: 'tr-00002',
    referenceNumber: 'TR-22346',
    type: 'standard',
    fromLocationId: 'loc-001',
    toLocationId: 'loc-004',
    expectedShipDate: '2025-02-05T08:00:00Z',
    expectedDeliveryDate: '2025-02-05T10:00:00Z',
    status: 'in_transit',
    notes: 'Transfer of components to assembly line',
    requiresApproval: true,
    createdBy: 'user-002',
    approvedBy: 'user-001',
    approvedAt: '2025-02-04T16:30:00Z',
    approvalNotes: 'Approved for manufacturing schedule',
    shippedBy: 'user-002',
    shippedAt: '2025-02-05T08:30:00Z',
    totalValue: 104.50,
    createdAt: '2025-02-03T11:30:00Z',
    updatedAt: '2025-02-05T08:30:00Z',
    items: [
      {
        itemId: 'item-003',
        name: 'Component C',
        sku: 'INV-003',
        quantity: 100,
        cost: 0.59,
        sourceBin: 'J10-K11-L12',
        destinationBin: 'AL-05',
        subtotal: 59.00
      },
      {
        itemId: 'item-005',
        name: 'Material E',
        sku: 'INV-005',
        quantity: 13,
        cost: 3.49,
        sourceBin: 'P16-Q17-R18',
        destinationBin: 'AL-12',
        subtotal: 45.50
      }
    ],
    shippingInfo: {
      method: 'Internal Transfer',
      trackingNumber: null,
      packageCount: 3
    }
  },
  {
    id: 'tr-00003',
    referenceNumber: 'TR-22347',
    type: 'return',
    fromLocationId: 'loc-003',
    toLocationId: 'loc-001',
    expectedShipDate: '2025-02-10T09:00:00Z',
    expectedDeliveryDate: '2025-02-10T12:00:00Z',
    status: 'pending',
    notes: 'Return of unsold seasonal items',
    requiresApproval: true,
    createdBy: 'user-003',
    totalValue: 89.90,
    createdAt: '2025-02-08T15:45:00Z',
    updatedAt: '2025-02-08T15:45:00Z',
    items: [
      {
        itemId: 'item-002',
        name: 'Gadget B',
        sku: 'INV-002',
        quantity: 3,
        cost: 12.99,
        sourceBin: 'SF-12',
        destinationBin: 'G7-H8-I9',
        subtotal: 38.97
      },
      {
        itemId: 'item-007',
        name: 'Assembly G',
        sku: 'INV-007',
        quantity: 2,
        cost: 45.50,
        sourceBin: 'SF-18',
        destinationBin: 'V22-W23-X24',
        subtotal: 91.00
      }
    ],
    shippingInfo: {
      method: 'Company Vehicle',
      trackingNumber: null,
      packageCount: 1
    }
  },
  {
    id: 'tr-00004',
    referenceNumber: 'TR-22348',
    type: 'adjustment',
    fromLocationId: 'loc-002',
    toLocationId: 'loc-002',
    status: 'completed',
    notes: 'Inventory adjustment after audit',
    requiresApproval: false,
    createdBy: 'user-001',
    createdAt: '2025-01-18T09:30:00Z',
    updatedAt: '2025-01-18T09:45:00Z',
    completedAt: '2025-01-18T09:45:00Z',
    items: [
      {
        itemId: 'item-004',
        name: 'Tool Set D',
        sku: 'INV-004',
        quantity: 1,
        receivedQuantity: 1,
        hasDiscrepancy: false,
        cost: 89.99,
        sourceBin: null,
        destinationBin: 'M13-N14-O15',
        subtotal: 89.99,
        notes: 'Found missing item during inventory count'
      }
    ]
  },
  {
    id: 'tr-00005',
    referenceNumber: 'TR-22349',
    type: 'standard',
    fromLocationId: 'loc-002',
    toLocationId: 'loc-001',
    expectedShipDate: '2025-02-12T08:00:00Z',
    expectedDeliveryDate: '2025-02-12T14:00:00Z',
    status: 'pending',
    notes: 'Consolidating inventory to main warehouse',
    requiresApproval: true,
    createdBy: 'user-002',
    totalValue: 94.93,
    createdAt: '2025-02-09T11:20:00Z',
    updatedAt: '2025-02-09T11:20:00Z',
    items: [
      {
        itemId: 'item-004',
        name: 'Tool Set D',
        sku: 'INV-004',
        quantity: 1,
        cost: 89.99,
        sourceBin: 'M13-N14-O15',
        destinationBin: 'TBD',
        subtotal: 89.99
      },
      {
        itemId: 'item-006',
        name: 'Product F',
        sku: 'INV-006',
        quantity: 2,
        cost: 24.99,
        sourceBin: 'S19-T20-U21',
        destinationBin: 'TBD',
        subtotal: 49.98
      }
    ],
    shippingInfo: {
      method: 'Company Vehicle',
      trackingNumber: null,
      packageCount: 2
    }
  },
  {
    id: 'tr-00006',
    referenceNumber: 'TR-22350',
    type: 'bulk',
    fromLocationId: 'loc-001',
    toLocationId: 'loc-002',
    expectedShipDate: '2025-02-15T08:00:00Z',
    expectedDeliveryDate: '2025-02-15T17:00:00Z',
    status: 'cancelled',
    notes: 'Bulk transfer of inventory for warehouse reorganization - CANCELLED due to scheduling conflict',
    requiresApproval: true,
    createdBy: 'user-001',
    cancelledBy: 'user-001',
    cancelledAt: '2025-02-13T14:20:00Z',
    cancellationReason: 'Rescheduled for next month due to staffing constraints',
    totalValue: 5432.50,
    createdAt: '2025-02-10T13:45:00Z',
    updatedAt: '2025-02-13T14:20:00Z',
    items: [
      {
        itemId: 'item-001',
        name: 'Widget A',
        sku: 'INV-001',
        quantity: 20,
        cost: 5.99,
        sourceBin: 'A1-B2-C3',
        destinationBin: 'WH-B-001',
        subtotal: 119.80
      },
      {
        itemId: 'item-003',
        name: 'Component C',
        sku: 'INV-003',
        quantity: 200,
        cost: 0.59,
        sourceBin: 'J10-K11-L12',
        destinationBin: 'WH-B-015',
        subtotal: 118.00
      },
      {
        itemId: 'item-005',
        name: 'Material E',
        sku: 'INV-005',
        quantity: 30,
        cost: 3.49,
        sourceBin: 'P16-Q17-R18',
        destinationBin: 'WH-B-022',
        subtotal: 104.70
      },
      {
        itemId: 'item-007',
        name: 'Assembly G',
        sku: 'INV-007',
        quantity: 10,
        cost: 45.50,
        sourceBin: 'V22-W23-X24',
        destinationBin: 'WH-B-018',
        subtotal: 455.00
      }
    ],
    shippingInfo: {
      method: 'Commercial Carrier',
      packageCount: 8
    }
  },
  {
    id: 'tr-00007',
    referenceNumber: 'TR-22351',
    type: 'standard',
    fromLocationId: 'loc-001',
    toLocationId: 'loc-003',
    expectedShipDate: '2025-02-08T09:00:00Z',
    expectedDeliveryDate: '2025-02-08T12:00:00Z',
    status: 'awaiting_receipt',
    notes: 'Replenishing retail store inventory',
    requiresApproval: true,
    createdBy: 'user-003',
    approvedBy: 'user-001',
    approvedAt: '2025-02-07T15:30:00Z',
    approvalNotes: 'Approved for retail stock replenishment',
    shippedBy: 'user-001',
    shippedAt: '2025-02-08T09:15:00Z',
    totalValue: 207.75,
    createdAt: '2025-02-06T14:20:00Z',
    updatedAt: '2025-02-08T09:15:00Z',
    items: [
      {
        itemId: 'item-001',
        name: 'Widget A',
        sku: 'INV-001',
        quantity: 15,
        cost: 5.99,
        sourceBin: 'A1-B2-C3',
        destinationBin: 'SF-05',
        subtotal: 89.85
      },
      {
        itemId: 'item-002',
        name: 'Gadget B',
        sku: 'INV-002',
        quantity: 5,
        cost: 12.99,
        sourceBin: 'G7-H8-I9',
        destinationBin: 'SF-12',
        subtotal: 64.95
      },
      {
        itemId: 'item-007',
        name: 'Assembly G',
        sku: 'INV-007',
        quantity: 3,
        cost: 45.50,
        sourceBin: 'V22-W23-X24',
        destinationBin: 'SF-18',
        subtotal: 136.50
      }
    ],
    shippingInfo: {
      method: 'Company Vehicle',
      trackingNumber: null,
      packageCount: 4
    }
  },
  {
    id: 'tr-00008',
    referenceNumber: 'TR-22352',
    type: 'adjustment',
    fromLocationId: 'loc-003',
    toLocationId: 'loc-003',
    status: 'completed',
    notes: 'Inventory write-off for damaged goods',
    requiresApproval: true,
    createdBy: 'user-003',
    approvedBy: 'user-001',
    approvedAt: '2025-02-02T11:45:00Z',
    approvalNotes: 'Approved for write-off after reviewing damage report',
    createdAt: '2025-02-02T10:30:00Z',
    updatedAt: '2025-02-02T11:45:00Z',
    completedAt: '2025-02-02T11:45:00Z',
    items: [
      {
        itemId: 'item-002',
        name: 'Gadget B',
        sku: 'INV-002',
        quantity: -2,
        receivedQuantity: -2,
        hasDiscrepancy: false,
        cost: 12.99,
        sourceBin: 'SF-12',
        destinationBin: null,
        subtotal: -25.98,
        notes: 'Water damage from sprinkler malfunction'
      }
    ]
  },
  {
    id: 'tr-00009',
    referenceNumber: 'TR-22353',
    type: 'return',
    fromLocationId: 'loc-004',
    toLocationId: 'loc-001',
    expectedShipDate: '2025-02-06T15:00:00Z',
    expectedDeliveryDate: '2025-02-06T16:30:00Z',
    status: 'completed',
    notes: 'Return of unused materials from assembly line',
    requiresApproval: false,
    createdBy: 'user-004',
    shippedBy: 'user-004',
    shippedAt: '2025-02-06T15:15:00Z',
    receivedBy: 'user-002',
    receivedAt: '2025-02-06T16:40:00Z',
    receiptNotes: 'All materials received in good condition',
    totalValue: 34.90,
    createdAt: '2025-02-06T14:00:00Z',
    updatedAt: '2025-02-06T16:40:00Z',
    items: [
      {
        itemId: 'item-005',
        name: 'Material E',
        sku: 'INV-005',
        quantity: 10,
        receivedQuantity: 10,
        hasDiscrepancy: false,
        cost: 3.49,
        sourceBin: 'AL-12',
        destinationBin: 'P16-Q17-R18',
        subtotal: 34.90,
        notes: 'Unused material from project completion'
      }
    ],
    shippingInfo: {
      method: 'Hand Delivery',
      packageCount: 1
    }
  },
  {
    id: 'tr-00010',
    referenceNumber: 'TR-22354',
    type: 'bulk',
    fromLocationId: 'loc-001',
    toLocationId: 'loc-004',
    expectedShipDate: '2025-02-20T08:00:00Z',
    expectedDeliveryDate: '2025-02-20T10:00:00Z',
    status: 'pending',
    notes: 'Bulk materials for upcoming manufacturing project',
    requiresApproval: true,
    createdBy: 'user-004',
    totalValue: 968.00,
    createdAt: '2025-02-15T11:30:00Z',
    updatedAt: '2025-02-15T11:30:00Z',
    items: [
      {
        itemId: 'item-003',
        name: 'Component C',
        sku: 'INV-003',
        quantity: 500,
        cost: 0.59,
        sourceBin: 'J10-K11-L12',
        destinationBin: 'AL-05',
        subtotal: 295.00
      },
      {
        itemId: 'item-005',
        name: 'Material E',
        sku: 'INV-005',
        quantity: 50,
        cost: 3.49,
        sourceBin: 'P16-Q17-R18',
        destinationBin: 'AL-12',
        subtotal: 174.50
      },
      {
        itemId: 'item-007',
        name: 'Assembly G',
        sku: 'INV-007',
        quantity: 11,
        cost: 45.50,
        sourceBin: 'V22-W23-X24',
        destinationBin: 'AL-08',
        subtotal: 500.50
      }
    ],
    shippingInfo: {
      method: 'Commercial Carrier',
      packageCount: 12
    }
  }
];

export default {
  mockItems,
  mockLocations,
  mockTransactions,
  mockCycleCounts,
  mockDocuments,
  mockAuditLogs,
};