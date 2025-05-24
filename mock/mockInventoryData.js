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
  // Main warehouses (top level)
  {
    id: 'loc-001',
    name: 'Warehouse A',
    code: 'WH-A',
    type: 'warehouse',
    status: 'active',
    parentId: null,
    capacity: 5000,
    itemCount: 2250,
    description: 'Main distribution warehouse for the Portland area',
    address: {
      street: '123 Distribution Way',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      country: 'USA'
    },
    dimensions: {
      length: 200,
      width: 150,
      height: 30,
      unit: 'ft'
    },
    attributes: {
      has_climate_control: 'Yes',
      security_level: 'High',
      dock_doors: '12'
    },
    createdAt: '2024-10-15T12:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z'
  },
  {
    id: 'loc-002',
    name: 'Warehouse B',
    code: 'WH-B',
    type: 'warehouse',
    status: 'active',
    parentId: null,
    capacity: 3500,
    itemCount: 1450,
    description: 'Secondary warehouse facility in Seattle',
    address: {
      street: '456 Storage Road',
      city: 'Seattle',
      state: 'WA',
      zip: '98101',
      country: 'USA'
    },
    dimensions: {
      length: 180,
      width: 120,
      height: 25,
      unit: 'ft'
    },
    attributes: {
      has_climate_control: 'Partial',
      security_level: 'Medium',
      dock_doors: '8'
    },
    createdAt: '2024-10-18T14:30:00Z',
    updatedAt: '2024-10-18T14:30:00Z'
  },
  
  // Zones within Warehouse A
  {
    id: 'loc-101',
    name: 'Electronics Zone',
    code: 'WH-A-EZ',
    type: 'zone',
    status: 'active',
    parentId: 'loc-001',
    capacity: 1000,
    itemCount: 750,
    description: 'Zone for electronic components and devices',
    dimensions: {
      length: 50,
      width: 40,
      height: 25,
      unit: 'ft'
    },
    attributes: {
      esd_protected: 'Yes',
      temperature_controlled: 'Yes'
    },
    createdAt: '2024-10-20T09:15:00Z',
    updatedAt: '2024-10-20T09:15:00Z'
  },
  {
    id: 'loc-102',
    name: 'Raw Materials Zone',
    code: 'WH-A-RM',
    type: 'zone',
    status: 'active',
    parentId: 'loc-001',
    capacity: 1500,
    itemCount: 980,
    description: 'Zone for raw materials and bulk items',
    dimensions: {
      length: 60,
      width: 50,
      height: 28,
      unit: 'ft'
    },
    attributes: {
      heavy_lifting_equipment: 'Yes',
      pallet_racking: 'High Density'
    },
    createdAt: '2024-10-20T10:30:00Z',
    updatedAt: '2024-10-20T10:30:00Z'
  },
  {
    id: 'loc-103',
    name: 'Finished Goods Zone',
    code: 'WH-A-FG',
    type: 'zone',
    status: 'active',
    parentId: 'loc-001',
    capacity: 1200,
    itemCount: 520,
    description: 'Zone for packaged and ready-to-ship products',
    dimensions: {
      length: 45,
      width: 40,
      height: 25,
      unit: 'ft'
    },
    attributes: {
      shipping_station: 'Adjacent',
      packaging_materials: 'On-site'
    },
    createdAt: '2024-10-20T11:45:00Z',
    updatedAt: '2024-10-20T11:45:00Z'
  },
  
  // Zones within Warehouse B
  {
    id: 'loc-104',
    name: 'High-Value Zone',
    code: 'WH-B-HV',
    type: 'zone',
    status: 'active',
    parentId: 'loc-002',
    capacity: 500,
    itemCount: 320,
    description: 'Secure zone for high-value inventory items',
    dimensions: {
      length: 30,
      width: 25,
      height: 20,
      unit: 'ft'
    },
    attributes: {
      security_cameras: 'Yes',
      restricted_access: 'Yes',
      biometric_entry: 'Yes'
    },
    createdAt: '2024-10-25T08:20:00Z',
    updatedAt: '2024-10-25T08:20:00Z'
  },
  {
    id: 'loc-105',
    name: 'Bulk Storage Zone',
    code: 'WH-B-BS',
    type: 'zone',
    status: 'active',
    parentId: 'loc-002',
    capacity: 1500,
    itemCount: 1130,
    description: 'Zone for large and bulky items',
    dimensions: {
      length: 70,
      width: 50,
      height: 25,
      unit: 'ft'
    },
    attributes: {
      forklift_accessible: 'Yes',
      overhead_crane: 'Yes'
    },
    createdAt: '2024-10-25T09:45:00Z',
    updatedAt: '2024-10-25T09:45:00Z'
  },
  
  // Aisles within Electronics Zone (Warehouse A)
  {
    id: 'loc-201',
    name: 'Aisle E1',
    code: 'WH-A-EZ-E1',
    type: 'aisle',
    status: 'active',
    parentId: 'loc-101',
    capacity: 300,
    itemCount: 245,
    description: 'Components aisle',
    dimensions: {
      length: 40,
      width: 8,
      height: 20,
      unit: 'ft'
    },
    createdAt: '2024-10-22T13:10:00Z',
    updatedAt: '2024-10-22T13:10:00Z'
  },
  {
    id: 'loc-202',
    name: 'Aisle E2',
    code: 'WH-A-EZ-E2',
    type: 'aisle',
    status: 'active',
    parentId: 'loc-101',
    capacity: 300,
    itemCount: 285,
    description: 'Circuit boards and modules aisle',
    dimensions: {
      length: 40,
      width: 8,
      height: 20,
      unit: 'ft'
    },
    createdAt: '2024-10-22T13:25:00Z',
    updatedAt: '2024-10-22T13:25:00Z'
  },
  {
    id: 'loc-203',
    name: 'Aisle E3',
    code: 'WH-A-EZ-E3',
    type: 'aisle',
    status: 'active',
    parentId: 'loc-101',
    capacity: 400,
    itemCount: 220,
    description: 'Assembled electronics aisle',
    dimensions: {
      length: 40,
      width: 8,
      height: 20,
      unit: 'ft'
    },
    createdAt: '2024-10-22T13:40:00Z',
    updatedAt: '2024-10-22T13:40:00Z'
  },
  
  // Aisles within Raw Materials Zone (Warehouse A)
  {
    id: 'loc-204',
    name: 'Aisle R1',
    code: 'WH-A-RM-R1',
    type: 'aisle',
    status: 'active',
    parentId: 'loc-102',
    capacity: 400,
    itemCount: 380,
    description: 'Metals and alloys aisle',
    dimensions: {
      length: 45,
      width: 10,
      height: 25,
      unit: 'ft'
    },
    createdAt: '2024-10-22T14:15:00Z',
    updatedAt: '2024-10-22T14:15:00Z'
  },
  {
    id: 'loc-205',
    name: 'Aisle R2',
    code: 'WH-A-RM-R2',
    type: 'aisle',
    status: 'active',
    parentId: 'loc-102',
    capacity: 500,
    itemCount: 320,
    description: 'Plastics and polymers aisle',
    dimensions: {
      length: 45,
      width: 10,
      height: 25,
      unit: 'ft'
    },
    createdAt: '2024-10-22T14:30:00Z',
    updatedAt: '2024-10-22T14:30:00Z'
  },
  {
    id: 'loc-206',
    name: 'Aisle R3',
    code: 'WH-A-RM-R3',
    type: 'aisle',
    status: 'active',
    parentId: 'loc-102',
    capacity: 600,
    itemCount: 280,
    description: 'Chemicals and solutions aisle',
    dimensions: {
      length: 45,
      width: 10,
      height: 25,
      unit: 'ft'
    },
    createdAt: '2024-10-22T14:45:00Z',
    updatedAt: '2024-10-22T14:45:00Z'
  },
  
  // Storage Bins within Aisle E1 (Electronics Zone)
  {
    id: 'loc-301',
    name: 'Bin E1-A',
    code: 'WH-A-EZ-E1-A',
    type: 'bin',
    status: 'active',
    parentId: 'loc-201',
    capacity: 50,
    itemCount: 42,
    description: 'Resistors and capacitors',
    dimensions: {
      length: 4,
      width: 3,
      height: 2,
      unit: 'ft'
    },
    createdAt: '2024-10-23T09:00:00Z',
    updatedAt: '2024-10-23T09:00:00Z'
  },
  {
    id: 'loc-302',
    name: 'Bin E1-B',
    code: 'WH-A-EZ-E1-B',
    type: 'bin',
    status: 'active',
    parentId: 'loc-201',
    capacity: 50,
    itemCount: 38,
    description: 'Transistors and diodes',
    dimensions: {
      length: 4,
      width: 3,
      height: 2,
      unit: 'ft'
    },
    createdAt: '2024-10-23T09:15:00Z',
    updatedAt: '2024-10-23T09:15:00Z'
  },
  {
    id: 'loc-303',
    name: 'Bin E1-C',
    code: 'WH-A-EZ-E1-C',
    type: 'bin',
    status: 'active',
    parentId: 'loc-201',
    capacity: 60,
    itemCount: 55,
    description: 'Integrated circuits',
    dimensions: {
      length: 4,
      width: 3,
      height: 2,
      unit: 'ft'
    },
    createdAt: '2024-10-23T09:30:00Z',
    updatedAt: '2024-10-23T09:30:00Z'
  },
  {
    id: 'loc-304',
    name: 'Bin E1-D',
    code: 'WH-A-EZ-E1-D',
    type: 'bin',
    status: 'active',
    parentId: 'loc-201',
    capacity: 60,
    itemCount: 48,
    description: 'Connectors and terminals',
    dimensions: {
      length: 4,
      width: 3,
      height: 2,
      unit: 'ft'
    },
    createdAt: '2024-10-23T09:45:00Z',
    updatedAt: '2024-10-23T09:45:00Z'
  },
  {
    id: 'loc-305',
    name: 'Bin E1-E',
    code: 'WH-A-EZ-E1-E',
    type: 'bin',
    status: 'active',
    parentId: 'loc-201',
    capacity: 80,
    itemCount: 62,
    description: 'Switches and relays',
    dimensions: {
      length: 4,
      width: 3,
      height: 2,
      unit: 'ft'
    },
    createdAt: '2024-10-23T10:00:00Z',
    updatedAt: '2024-10-23T10:00:00Z'
  },
  
  // Storage Bins within Aisle R1 (Raw Materials Zone)
  {
    id: 'loc-306',
    name: 'Bin R1-A',
    code: 'WH-A-RM-R1-A',
    type: 'bin',
    status: 'active',
    parentId: 'loc-204',
    capacity: 100,
    itemCount: 95,
    description: 'Aluminum sheets',
    dimensions: {
      length: 6,
      width: 4,
      height: 5,
      unit: 'ft'
    },
    createdAt: '2024-10-23T10:30:00Z',
    updatedAt: '2024-10-23T10:30:00Z'
  },
  {
    id: 'loc-307',
    name: 'Bin R1-B',
    code: 'WH-A-RM-R1-B',
    type: 'bin',
    status: 'active',
    parentId: 'loc-204',
    capacity: 100,
    itemCount: 85,
    description: 'Steel rods',
    dimensions: {
      length: 6,
      width: 4,
      height: 5,
      unit: 'ft'
    },
    createdAt: '2024-10-23T10:45:00Z',
    updatedAt: '2024-10-23T10:45:00Z'
  },
  {
    id: 'loc-308',
    name: 'Bin R1-C',
    code: 'WH-A-RM-R1-C',
    type: 'bin',
    status: 'active',
    parentId: 'loc-204',
    capacity: 120,
    itemCount: 110,
    description: 'Copper wire spools',
    dimensions: {
      length: 6,
      width: 4,
      height: 5,
      unit: 'ft'
    },
    createdAt: '2024-10-23T11:00:00Z',
    updatedAt: '2024-10-23T11:00:00Z'
  },
  {
    id: 'loc-309',
    name: 'Bin R1-D',
    code: 'WH-A-RM-R1-D',
    type: 'bin',
    status: 'active',
    parentId: 'loc-204',
    capacity: 80,
    itemCount: 90,
    description: 'Brass fittings',
    dimensions: {
      length: 6,
      width: 4,
      height: 5,
      unit: 'ft'
    },
    createdAt: '2024-10-23T11:15:00Z',
    updatedAt: '2024-10-23T11:15:00Z'
  },
  
  // Other existing locations
  {
    id: 'loc-003',
    name: 'Store Front',
    code: 'SF',
    type: 'retail',
    status: 'active',
    parentId: null,
    capacity: 500,
    itemCount: 320,
    description: 'Retail location in downtown Portland',
    address: {
      street: '789 Retail Drive',
      city: 'Portland',
      state: 'OR',
      zip: '97204',
      country: 'USA'
    },
    dimensions: {
      length: 60,
      width: 40,
      height: 12,
      unit: 'ft'
    },
    createdAt: '2024-10-22T09:15:00Z',
    updatedAt: '2024-10-22T09:15:00Z'
  },
  {
    id: 'loc-004',
    name: 'Assembly Line',
    code: 'AL',
    type: 'manufacturing',
    status: 'active',
    parentId: null,
    capacity: 300,
    itemCount: 175,
    description: 'Production assembly facility',
    address: {
      street: '101 Factory Avenue',
      city: 'Beaverton',
      state: 'OR',
      zip: '97005',
      country: 'USA'
    },
    dimensions: {
      length: 100,
      width: 50,
      height: 18,
      unit: 'ft'
    },
    createdAt: '2024-11-05T11:45:00Z',
    updatedAt: '2024-11-05T11:45:00Z'
  },
  {
    id: 'loc-005',
    name: 'Remote Storage',
    code: 'RS',
    type: 'warehouse',
    status: 'inactive',
    parentId: null,
    capacity: 2000,
    itemCount: 0,
    description: 'Backup storage facility (currently inactive)',
    address: {
      street: '202 Remote Lane',
      city: 'Eugene',
      state: 'OR',
      zip: '97401',
      country: 'USA'
    },
    dimensions: {
      length: 150,
      width: 100,
      height: 24,
      unit: 'ft'
    },
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

export const mockMappings = [
  {
    id: 'map-001',
    itemId: 'item-001',
    productId: 'prod-001',
    itemName: 'Widget A',
    itemSku: 'INV-001',
    itemDescription: 'Standard size widget for industrial use',
    productName: 'Standard Widget',
    productSku: 'PROD-001',
    productDescription: 'Standard widget for industrial applications',
    mappingType: 'manual',
    syncStatus: 'synced',
    lastSyncTime: '2025-02-15T09:30:00Z',
    syncOptions: {
      inventory: true,
      pricing: true,
      metadata: false,
      bidirectional: false
    },
    createdAt: '2025-01-15T14:30:00Z',
    updatedAt: '2025-02-15T09:30:00Z'
  },
  {
    id: 'map-002',
    itemId: 'item-002',
    productId: 'prod-002',
    itemName: 'Gadget B',
    itemSku: 'INV-002',
    itemDescription: 'Premium gadget with extended functionality',
    productName: 'Premium Gadget',
    productSku: 'PROD-002',
    productDescription: 'Premium gadget with advanced features',
    mappingType: 'automatic',
    syncStatus: 'synced',
    lastSyncTime: '2025-02-15T09:32:00Z',
    syncOptions: {
      inventory: true,
      pricing: true,
      metadata: true,
      bidirectional: true
    },
    createdAt: '2025-01-18T11:40:00Z',
    updatedAt: '2025-02-15T09:32:00Z'
  },
  {
    id: 'map-003',
    itemId: 'item-003',
    productId: 'prod-003',
    itemName: 'Component C',
    itemSku: 'INV-003',
    itemDescription: 'Electronic component for circuit boards',
    productName: 'Circuit Component',
    productSku: 'PROD-003',
    productDescription: 'Essential component for electronic circuit boards',
    mappingType: 'manual',
    syncStatus: 'out_of_sync',
    lastSyncTime: '2025-01-20T08:50:00Z',
    syncOptions: {
      inventory: true,
      pricing: false,
      metadata: false,
      bidirectional: false
    },
    createdAt: '2025-01-20T08:50:00Z',
    updatedAt: '2025-02-01T10:15:00Z'
  },
  {
    id: 'map-004',
    itemId: 'item-005',
    productId: 'prod-005',
    itemName: 'Material E',
    itemSku: 'INV-005',
    itemDescription: 'Raw material for manufacturing process',
    productName: 'Manufacturing Material',
    productSku: 'PROD-005',
    productDescription: 'Essential raw material for production processes',
    mappingType: 'automatic',
    syncStatus: 'error',
    lastSyncTime: '2025-02-03T14:40:00Z',
    syncError: 'Price discrepancy detected',
    syncOptions: {
      inventory: true,
      pricing: true,
      metadata: true,
      bidirectional: false
    },
    createdAt: '2025-01-10T09:30:00Z',
    updatedAt: '2025-02-03T14:40:00Z'
  },
  {
    id: 'map-005',
    itemId: 'item-007',
    productId: 'prod-007',
    itemName: 'Assembly G',
    itemSku: 'INV-007',
    itemDescription: 'Assembled component ready for installation',
    productName: 'Ready-to-Install Assembly',
    productSku: 'PROD-007',
    productDescription: 'Pre-assembled component for quick installation',
    mappingType: 'manual',
    syncStatus: 'synced',
    lastSyncTime: '2025-02-15T09:35:00Z',
    syncOptions: {
      inventory: true,
      pricing: true,
      metadata: true,
      bidirectional: false
    },
    createdAt: '2025-01-12T14:00:00Z',
    updatedAt: '2025-02-15T09:35:00Z'
  }
];

// Sync conflicts for demonstrating conflict resolution
export const mockSyncConflicts = [
  {
    id: 'conflict-001',
    mappingId: 'map-003',
    itemId: 'item-003',
    productId: 'prod-003',
    itemName: 'Component C',
    productName: 'Circuit Component',
    type: 'inventory_mismatch',
    details: 'Inventory levels do not match between systems',
    inventoryItem: {
      stockOnHand: 350,
      stockAvailable: 300
    },
    catalogProduct: {
      stockLevel: 320
    },
    detectedAt: '2025-02-01T10:15:00Z',
    status: 'unresolved'
  },
  {
    id: 'conflict-002',
    mappingId: 'map-004',
    itemId: 'item-005',
    productId: 'prod-005',
    itemName: 'Material E',
    productName: 'Manufacturing Material',
    type: 'price_mismatch',
    details: 'Price in inventory system does not match catalog',
    inventoryItem: {
      cost: 3.49
    },
    catalogProduct: {
      price: 8.99
    },
    detectedAt: '2025-02-03T14:40:00Z',
    status: 'unresolved'
  }
];

// Add this getter for location statistics
export const getLocationStats = () => {
  const warehouses = mockLocations.filter(loc => loc.type === 'warehouse' && loc.status === 'active').length;
  const zones = mockLocations.filter(loc => loc.type === 'zone').length;
  const zonesInUse = mockLocations.filter(loc => loc.type === 'zone' && loc.itemCount > 0).length;
  const aisles = mockLocations.filter(loc => loc.type === 'aisle').length;
  const bins = mockLocations.filter(loc => loc.type === 'bin').length;
  const binsInUse = mockLocations.filter(loc => loc.type === 'bin' && loc.itemCount > 0).length;
  
  const totalCapacity = mockLocations.reduce((sum, loc) => sum + (loc.capacity || 0), 0);
  const itemsStored = mockLocations.reduce((sum, loc) => {
    // Only count items at the lowest level to avoid double-counting
    if (loc.type === 'bin') {
      return sum + (loc.itemCount || 0);
    }
    return sum;
  }, 0);
  
  const sites = [...new Set(mockLocations
    .filter(loc => loc.type === 'warehouse' && loc.status === 'active')
    .map(loc => loc.address?.city || '')
  )].length;
  
  return {
    warehouses,
    zones,
    zonesInUse,
    aisles,
    bins,
    binsInUse,
    totalCapacity,
    itemsStored,
    sites
  };
};

// Stock level thresholds by location and category
export const mockStockThresholds = {
  default: {
    inStock: 10,
    lowStock: 5,
    criticalStock: 2
  },
  byLocation: {
    'loc-001': {
      inStock: 15,
      lowStock: 8,
      criticalStock: 3
    },
    'loc-002': {
      inStock: 12,
      lowStock: 6,
      criticalStock: 2
    },
    'loc-003': {
      inStock: 8,
      lowStock: 4,
      criticalStock: 1
    }
  },
  byCategory: {
    'cat-001': {
      inStock: 20,
      lowStock: 10,
      criticalStock: 5
    },
    'cat-002': {
      inStock: 15,
      lowStock: 7,
      criticalStock: 3
    },
    'cat-003': {
      inStock: 100,
      lowStock: 50,
      criticalStock: 25
    },
    'cat-004': {
      inStock: 30,
      lowStock: 15,
      criticalStock: 8
    }
  }
};

// Stock level history over time for trending analysis
export const mockStockHistory = [
  // Widget A (item-001) history
  ...Array.from({ length: 30 }, (_, i) => ({
    itemId: 'item-001',
    date: new Date(2025, 0, i + 1).toISOString(),
    stockLevel: 20 + Math.floor(Math.sin(i * 0.3) * 5 + Math.random() * 3),
    location: 'loc-001'
  })),
  
  // Gadget B (item-002) history
  ...Array.from({ length: 30 }, (_, i) => ({
    itemId: 'item-002',
    date: new Date(2025, 0, i + 1).toISOString(),
    stockLevel: 15 + Math.floor(Math.cos(i * 0.2) * 4 + Math.random() * 2),
    location: 'loc-001'
  })),
  
  // Component C (item-003) history
  ...Array.from({ length: 30 }, (_, i) => ({
    itemId: 'item-003',
    date: new Date(2025, 0, i + 1).toISOString(),
    stockLevel: 250 + Math.floor(Math.sin(i * 0.1) * 30 + Math.random() * 10) + (i > 15 ? 100 : 0),
    location: 'loc-001'
  })),
  
  // Tool Set D (item-004) history
  ...Array.from({ length: 30 }, (_, i) => ({
    itemId: 'item-004',
    date: new Date(2025, 0, i + 1).toISOString(),
    stockLevel: Math.max(0, 5 - Math.floor(i / 8)),
    location: 'loc-002'
  })),
  
  // Material E (item-005) history
  ...Array.from({ length: 30 }, (_, i) => ({
    itemId: 'item-005',
    date: new Date(2025, 0, i + 1).toISOString(),
    stockLevel: 80 + Math.floor(Math.sin(i * 0.2) * 10 + Math.random() * 5),
    location: 'loc-001'
  }))
];

// Transaction flow data for visualization
export const mockTransactionFlow = {
  // Flow between locations
  locationFlow: [
    { from: 'loc-001', to: 'loc-003', count: 15, volume: 540 },
    { from: 'loc-001', to: 'loc-004', count: 8, volume: 230 },
    { from: 'loc-002', to: 'loc-001', count: 3, volume: 125 },
    { from: 'loc-003', to: 'loc-001', count: 2, volume: 65 },
    { from: 'loc-004', to: 'loc-001', count: 4, volume: 180 }
  ],
  
  // Flow by transaction type
  typeFlow: {
    receipt: { count: 42, volume: 1250 },
    issue: { count: 38, volume: 920 },
    transfer: { count: 25, volume: 780 },
    adjustment: { count: 12, volume: 150 }
  },
  
  // Daily transaction volume
  dailyVolume: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2025, 0, i + 1).toISOString(),
    receipts: Math.floor(Math.random() * 3) + (i % 7 === 1 ? 5 : 0),
    issues: Math.floor(Math.random() * 4) + (i % 7 === 5 ? 6 : 0),
    transfers: Math.floor(Math.random() * 2),
    adjustments: i % 10 === 0 ? 1 : 0
  }))
};

// Stock alerts based on threshold configurations
export const mockStockAlerts = [
  {
    id: 'alert-001',
    itemId: 'item-004',
    itemName: 'Tool Set D',
    type: 'low_stock',
    threshold: 5,
    currentLevel: 3,
    locationId: 'loc-002',
    locationName: 'Warehouse B',
    createdAt: '2025-01-28T09:15:00Z',
    status: 'active',
    priority: 'high'
  },
  {
    id: 'alert-002',
    itemId: 'item-003',
    itemName: 'Component C',
    type: 'reorder_point',
    threshold: 100,
    currentLevel: 350,
    locationId: 'loc-001',
    locationName: 'Warehouse A',
    createdAt: '2025-01-20T08:50:00Z',
    status: 'resolved',
    resolvedAt: '2025-01-20T15:25:00Z',
    resolution: 'purchase_order_created',
    priority: 'medium'
  },
  {
    id: 'alert-003',
    itemId: 'item-013',
    itemName: 'Cable Tester',
    type: 'low_stock',
    threshold: 3,
    currentLevel: 2,
    locationId: 'loc-201',
    locationName: 'Tool Storage',
    createdAt: '2025-01-15T10:30:00Z',
    status: 'active',
    priority: 'medium'
  },
  {
    id: 'alert-004',
    itemId: 'item-008',
    itemName: 'Kit H',
    type: 'out_of_stock',
    threshold: 0,
    currentLevel: 0,
    locationId: 'loc-001',
    locationName: 'Warehouse A',
    createdAt: '2025-01-12T16:45:00Z',
    status: 'active',
    priority: 'critical'
  },
  {
    id: 'alert-005',
    itemId: 'item-002',
    itemName: 'Gadget B',
    type: 'overstock',
    threshold: 20,
    currentLevel: 17,
    locationId: 'loc-001',
    locationName: 'Warehouse A',
    createdAt: '2025-02-03T11:20:00Z',
    status: 'active',
    priority: 'low'
  }
];

// Transaction impact records to show how transactions affect stock levels
export const mockTransactionImpacts = mockTransactions.map(transaction => {
  const impacts = transaction.items.map(item => {
    let previousLevel = 0;
    let newLevel = 0;
    
    // Find the affected item to determine stock levels
    const affectedItem = mockItems.find(i => i.id === item.itemId);
    if (affectedItem) {
      switch (transaction.type) {
        case 'receipt':
          previousLevel = affectedItem.stockOnHand - item.quantity;
          newLevel = affectedItem.stockOnHand;
          break;
        case 'issue':
          previousLevel = affectedItem.stockOnHand + item.quantity;
          newLevel = affectedItem.stockOnHand;
          break;
        case 'adjustment':
          previousLevel = affectedItem.stockOnHand - item.quantity;
          newLevel = affectedItem.stockOnHand;
          break;
        case 'transfer':
          // For transfers, just use the same values since we don't track by location in this simplified model
          previousLevel = affectedItem.stockOnHand;
          newLevel = affectedItem.stockOnHand;
          break;
      }
    }
    
    return {
      itemId: item.itemId,
      locationId: item.locationId || (item.destinationLocationId || item.sourceLocationId),
      quantity: item.quantity,
      previousLevel,
      newLevel,
      transactionType: transaction.type,
      direction: ['receipt', 'adjustment'].includes(transaction.type) && item.quantity > 0 ? 'increase' : 
                 ['issue', 'adjustment'].includes(transaction.type) && item.quantity < 0 ? 'decrease' : 
                 transaction.type === 'transfer' ? 'transfer' : 'other',
      date: transaction.completedAt || transaction.createdAt
    };
  });
  
  return {
    transactionId: transaction.id,
    transactionReference: transaction.referenceNumber,
    impacts
  };
});

// Reservation-related mock data
export const mockReservations = [
  {
    id: 'rsv-001',
    type: 'manual',
    status: 'active',
    reference: 'HOLD-12345',
    customerId: 'cust-001',
    customerName: 'Acme Corporation',
    createdAt: '2025-05-10T14:30:00Z',
    expiresAt: '2025-05-17T14:30:00Z',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    notes: 'Reserved for project installation',
    locationId: 'loc-001',
    locationName: 'Warehouse A',
    holdPolicyId: 'policy-001',
    items: [
      {
        itemId: 'item-001',
        itemName: 'Widget A',
        sku: 'INV-001',
        quantity: 10,
        availableQuantity: 10
      },
      {
        itemId: 'item-007',
        itemName: 'Assembly G',
        sku: 'INV-007',
        quantity: 5,
        availableQuantity: 5
      }
    ]
  },
  {
    id: 'rsv-002',
    type: 'service',
    status: 'active',
    reference: 'SVC-78901',
    customerId: 'cust-003',
    customerName: 'TechCorp Industries',
    createdAt: '2025-05-12T10:15:00Z',
    expiresAt: '2025-05-19T10:15:00Z',
    createdBy: 'user-002',
    createdByName: 'Jane Johnson',
    notes: 'For upcoming service call',
    locationId: 'loc-001',
    locationName: 'Warehouse A',
    holdPolicyId: 'policy-002',
    items: [
      {
        itemId: 'item-004',
        itemName: 'Tool Set D',
        sku: 'INV-004',
        quantity: 1,
        availableQuantity: 1
      }
    ]
  }
];

export const mockCartReservations = [
  {
    id: 'cart-001',
    cartId: 'cart-12345',
    customerId: 'cust-002',
    customerName: 'Jane Smith',
    createdAt: '2025-05-15T09:45:00Z',
    expiresAt: '2025-05-15T21:45:00Z',
    status: 'active',
    sessionId: 'sess-a1b2c3d4',
    cartPolicyId: 'cart-policy-001',
    items: [
      {
        itemId: 'item-001',
        itemName: 'Widget A',
        sku: 'INV-001',
        quantity: 2,
        availableQuantity: 2
      },
      {
        itemId: 'item-002',
        itemName: 'Gadget B',
        sku: 'INV-002',
        quantity: 1,
        availableQuantity: 1
      }
    ]
  },
  {
    id: 'cart-002',
    cartId: 'cart-67890',
    customerId: 'cust-004',
    customerName: 'Robert Brown',
    createdAt: '2025-05-15T11:30:00Z',
    expiresAt: '2025-05-15T17:30:00Z',
    status: 'active',
    sessionId: 'sess-e5f6g7h8',
    cartPolicyId: 'cart-policy-002',
    items: [
      {
        itemId: 'item-007',
        itemName: 'Assembly G',
        sku: 'INV-007',
        quantity: 1,
        availableQuantity: 1
      }
    ]
  },
  {
    id: 'cart-003',
    cartId: 'cart-24680',
    customerId: 'cust-005',
    customerName: 'Sarah Davis',
    createdAt: '2025-05-14T15:00:00Z',
    expiresAt: '2025-05-15T15:00:00Z',
    status: 'abandoned',
    sessionId: 'sess-i9j0k1l2',
    cartPolicyId: 'cart-policy-001',
    items: [
      {
        itemId: 'item-002',
        itemName: 'Gadget B',
        sku: 'INV-002',
        quantity: 2,
        availableQuantity: 2
      }
    ]
  }
];

export const mockOrderAllocations = [
  {
    id: 'alloc-001',
    orderId: 'ORD-5678',
    orderReference: 'WEB-5678',
    customerId: 'cust-001',
    customerName: 'Acme Corporation',
    status: 'allocated',
    createdAt: '2025-05-14T14:00:00Z',
    allocatedBy: 'system',
    priority: 'normal',
    locationId: 'loc-001',
    locationName: 'Warehouse A',
    items: [
      {
        itemId: 'item-001',
        itemName: 'Widget A',
        sku: 'INV-001',
        quantity: 5,
        allocatedQuantity: 5
      },
      {
        itemId: 'item-003',
        itemName: 'Component C',
        sku: 'INV-003',
        quantity: 20,
        allocatedQuantity: 20
      }
    ]
  },
  {
    id: 'alloc-002',
    orderId: 'ORD-9012',
    orderReference: 'WEB-9012',
    customerId: 'cust-003',
    customerName: 'TechCorp Industries',
    status: 'partially_allocated',
    createdAt: '2025-05-15T09:30:00Z',
    allocatedBy: 'user-003',
    allocatedByName: 'Michael Brown',
    priority: 'high',
    locationId: 'loc-001',
    locationName: 'Warehouse A',
    items: [
      {
        itemId: 'item-002',
        itemName: 'Gadget B',
        sku: 'INV-002',
        quantity: 3,
        allocatedQuantity: 2,
        backorderQuantity: 1
      }
    ]
  },
  {
    id: 'alloc-003',
    orderId: 'ORD-3456',
    orderReference: 'WEB-3456',
    customerId: 'cust-002',
    customerName: 'Jane Smith',
    status: 'pending',
    createdAt: '2025-05-15T10:45:00Z',
    priority: 'normal',
    locationId: 'loc-001',
    locationName: 'Warehouse A',
    items: [
      {
        itemId: 'item-004',
        itemName: 'Tool Set D',
        sku: 'INV-004',
        quantity: 2,
        allocatedQuantity: 0,
        backorderQuantity: 2
      }
    ]
  }
];

export const mockReservationHistory = [
  {
    id: 'rsv-hist-001',
    reservationId: 'rsv-003',
    type: 'manual',
    reference: 'HOLD-45678',
    customerId: 'cust-002',
    customerName: 'Jane Smith',
    status: 'expired',
    createdAt: '2025-05-01T10:00:00Z',
    expiresAt: '2025-05-08T10:00:00Z',
    completedAt: '2025-05-08T10:00:00Z',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    notes: 'Customer pickup reservation',
    locationId: 'loc-003',
    locationName: 'Store Front',
    holdPolicyId: 'policy-001',
    items: [
      {
        itemId: 'item-002',
        itemName: 'Gadget B',
        sku: 'INV-002',
        quantity: 1
      }
    ]
  },
  {
    id: 'rsv-hist-002',
    reservationId: 'rsv-004',
    type: 'service',
    reference: 'SVC-56789',
    customerId: 'cust-005',
    customerName: 'Sarah Davis',
    status: 'completed',
    createdAt: '2025-05-05T13:30:00Z',
    expiresAt: '2025-05-12T13:30:00Z',
    completedAt: '2025-05-10T09:45:00Z',
    createdBy: 'user-002',
    createdByName: 'Jane Johnson',
    notes: 'Used for installation appointment',
    locationId: 'loc-001',
    locationName: 'Warehouse A',
    holdPolicyId: 'policy-002',
    items: [
      {
        itemId: 'item-004',
        itemName: 'Tool Set D',
        sku: 'INV-004',
        quantity: 1
      },
      {
        itemId: 'item-005',
        itemName: 'Material E',
        sku: 'INV-005',
        quantity: 5
      }
    ]
  },
  {
    id: 'rsv-hist-003',
    reservationId: 'rsv-005',
    type: 'project',
    reference: 'PROJ-12345',
    customerId: 'cust-001',
    customerName: 'Acme Corporation',
    status: 'released',
    createdAt: '2025-04-20T09:00:00Z',
    expiresAt: '2025-05-20T09:00:00Z',
    completedAt: '2025-05-10T16:30:00Z',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    notes: 'Released early as project schedule changed',
    locationId: 'loc-001',
    locationName: 'Warehouse A',
    holdPolicyId: 'policy-003',
    items: [
      {
        itemId: 'item-001',
        itemName: 'Widget A',
        sku: 'INV-001',
        quantity: 15
      },
      {
        itemId: 'item-003',
        itemName: 'Component C',
        sku: 'INV-003',
        quantity: 50
      },
      {
        itemId: 'item-007',
        itemName: 'Assembly G',
        sku: 'INV-007',
        quantity: 8
      }
    ],
    releaseReason: 'Project schedule changed, items no longer needed'
  }
];

export const mockHoldPolicies = [
  {
    id: 'policy-001',
    name: 'Standard Hold',
    description: 'Standard reservation period for customer holds',
    durationType: 'days',
    duration: 7,
    applicableTypes: ['manual', 'customer'],
    renewalAllowed: true,
    maxRenewals: 1,
    renewalDuration: 3,
    autoExpire: true,
    notifyBefore: 24,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'policy-002',
    name: 'Service Call',
    description: 'Reservation for field service appointments',
    durationType: 'days',
    duration: 7,
    applicableTypes: ['service'],
    renewalAllowed: true,
    maxRenewals: 2,
    renewalDuration: 7,
    autoExpire: true,
    notifyBefore: 48,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'policy-003',
    name: 'Project Hold',
    description: 'Long-term reservation for ongoing projects',
    durationType: 'days',
    duration: 30,
    applicableTypes: ['project'],
    renewalAllowed: true,
    maxRenewals: 3,
    renewalDuration: 30,
    autoExpire: false,
    notifyBefore: 72,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];

export const mockCartPolicies = [
  {
    id: 'cart-policy-001',
    name: 'Standard Cart',
    description: 'Default cart reservation settings',
    durationType: 'hours',
    duration: 12,
    applicableCustomerGroups: ['all'],
    applicableItems: ['all'],
    overrideAllowed: true,
    maxOverrideDuration: 24,
    abandonedCartThreshold: 2,
    autoNotify: true,
    notifyBefore: 1,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'cart-policy-002',
    name: 'High-Demand Items',
    description: 'Shorter reservation time for high-demand products',
    durationType: 'hours',
    duration: 6,
    applicableCustomerGroups: ['all'],
    applicableItems: ['high_demand'],
    overrideAllowed: true,
    maxOverrideDuration: 12,
    abandonedCartThreshold: 1,
    autoNotify: true,
    notifyBefore: 0.5,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'cart-policy-003',
    name: 'VIP Customers',
    description: 'Extended cart reservation for VIP customers',
    durationType: 'hours',
    duration: 24,
    applicableCustomerGroups: ['vip', 'wholesale'],
    applicableItems: ['all'],
    overrideAllowed: true,
    maxOverrideDuration: 48,
    abandonedCartThreshold: 3,
    autoNotify: true,
    notifyBefore: 2,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];

export const mockAllocationPriorities = [
  {
    id: 'priority-001',
    name: 'Standard Priority Rules',
    description: 'Default priority settings for order allocation',
    rules: [
      {
        type: 'customer_group',
        value: 'wholesale',
        priority: 8
      },
      {
        type: 'customer_group',
        value: 'vip',
        priority: 9
      },
      {
        type: 'order_type',
        value: 'rush',
        priority: 10
      },
      {
        type: 'order_type',
        value: 'standard',
        priority: 5
      },
      {
        type: 'payment_method',
        value: 'prepaid',
        priority: 7
      }
    ],
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];

export const mockReservationStats = {
  activeHolds: 2,
  expiringToday: 1,
  itemsReserved: 19,
  uniqueSkus: 4,
  cartReservations: 3,
  abandonedCarts: 1,
  orderAllocations: 3,
  pendingAllocations: 1
};

// History of cart duration overrides
export const mockCartOverrides = [
  {
    id: 'override-001',
    cartId: 'cart-12345',
    customerId: 'cust-002',
    customerName: 'Jane Smith',
    originalExpiryTime: '2025-05-15T21:45:00Z',
    newExpiryTime: '2025-05-16T09:45:00Z',
    reason: 'Customer requested more time to complete purchase',
    appliedBy: 'user-001',
    appliedByName: 'John Smith',
    appliedAt: '2025-05-15T20:30:00Z',
    status: 'active'
  },
  {
    id: 'override-002',
    cartId: 'cart-35791',
    customerId: 'cust-003',
    customerName: 'TechCorp Industries',
    originalExpiryTime: '2025-05-10T14:30:00Z',
    newExpiryTime: '2025-05-11T14:30:00Z',
    reason: 'Payment processing issue, allowing extra time',
    appliedBy: 'user-002',
    appliedByName: 'Jane Johnson',
    appliedAt: '2025-05-10T13:45:00Z',
    status: 'completed',
    completedAt: '2025-05-11T10:15:00Z',
    outcome: 'purchase_completed'
  },
  {
    id: 'override-003',
    cartId: 'cart-13579',
    customerId: 'cust-005',
    customerName: 'Sarah Davis',
    originalExpiryTime: '2025-05-05T11:00:00Z',
    newExpiryTime: '2025-05-05T17:00:00Z',
    reason: 'High-value order, customer requested more time',
    appliedBy: 'user-003',
    appliedByName: 'Michael Brown',
    appliedAt: '2025-05-05T10:30:00Z',
    status: 'completed',
    completedAt: '2025-05-05T17:00:00Z',
    outcome: 'expired'
  }
];

// Visibility rules for out-of-stock items
export const mockStockVisibilityRules = [
  {
    id: "rule-001",
    name: "Hide Out-of-Stock Electronics",
    description: "Hide out-of-stock items in the electronics category",
    active: true,
    priority: 100,
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-05T10:00:00Z",
    scope: "category",
    categoryIds: ["cat-003"], // Electronics category
    stockThreshold: {
      type: "absolute",
      value: 0
    },
    action: "hide",
    displayOrder: 1
  },
  {
    id: "rule-002",
    name: "Show with Label - Low Stock Items",
    description: "Show items with low stock but add a 'Low Stock' label",
    active: true,
    priority: 90,
    createdAt: "2025-01-10T14:30:00Z",
    updatedAt: "2025-01-10T14:30:00Z",
    scope: "global",
    stockThreshold: {
      type: "absolute",
      value: 5
    },
    action: "show_with_label",
    message: "Low Stock - Order Soon",
    displayOrder: 2
  },
  {
    id: "rule-003",
    name: "Show Message for Tool Sets",
    description: "Show a message for out-of-stock tool sets",
    active: true,
    priority: 80,
    createdAt: "2025-01-15T09:20:00Z",
    updatedAt: "2025-01-20T11:15:00Z",
    scope: "product",
    productIds: ["prod-004"], // Tool Set D
    stockThreshold: {
      type: "absolute",
      value: 0
    },
    action: "show_with_message",
    message: "Currently unavailable. Check back next week for new inventory.",
    displayOrder: 3
  },
  {
    id: "rule-004",
    name: "Redirect Discontinued Products",
    description: "Redirect discontinued products to their replacements",
    active: true,
    priority: 110,
    createdAt: "2025-01-25T15:45:00Z",
    updatedAt: "2025-01-25T15:45:00Z",
    scope: "product",
    productIds: ["prod-006"], // Product F (discontinued)
    action: "redirect",
    redirectProductId: "prod-007", // Assembly G (replacement)
    displayOrder: 4
  },
  {
    id: "rule-005",
    name: "Show All Raw Materials",
    description: "Always show raw materials even when out of stock",
    active: true,
    priority: 70,
    createdAt: "2025-02-01T08:30:00Z",
    updatedAt: "2025-02-01T08:30:00Z",
    scope: "category",
    categoryIds: ["cat-004"], // Raw Materials category
    stockThreshold: {
      type: "absolute",
      value: 0
    },
    action: "show",
    displayOrder: 5
  }
];

// Backorder settings for various products and categories
export const mockBackorderSettings = [
  {
    id: "backorder-001",
    name: "Standard Backorder Policy",
    description: "Default backorder policy for most products",
    active: true,
    priority: 50,
    createdAt: "2025-01-05T10:30:00Z",
    updatedAt: "2025-01-05T10:30:00Z",
    scope: "global",
    allowBackorders: "partial",
    maxBackorderQuantity: 10,
    maxBackorderDays: 30,
    expectedRestockDate: "2025-03-01T00:00:00Z",
    message: "This item can be backordered. Expected restock within 30 days.",
    displayInSearch: true,
    allowDiscounts: false,
    requireApproval: false
  },
  {
    id: "backorder-002",
    name: "No Backorders for Electronics",
    description: "Prohibit backorders for electronic components",
    active: true,
    priority: 80,
    createdAt: "2025-01-10T14:35:00Z",
    updatedAt: "2025-01-10T14:35:00Z",
    scope: "category",
    categoryIds: ["cat-003"], // Electronics category
    allowBackorders: "none",
    displayInSearch: false,
    allowDiscounts: false,
    requireApproval: false
  },
  {
    id: "backorder-003",
    name: "Extended Backorders for Tools",
    description: "Allow generous backorder terms for professional tools",
    active: true,
    priority: 70,
    createdAt: "2025-01-15T09:25:00Z",
    updatedAt: "2025-01-20T11:20:00Z",
    scope: "product",
    productIds: ["prod-004"], // Tool Set D
    allowBackorders: "all",
    maxBackorderQuantity: 5,
    maxBackorderDays: 60,
    expectedRestockDate: "2025-04-15T00:00:00Z",
    message: "Professional tools are available for backorder with estimated delivery in 4-6 weeks.",
    displayInSearch: true,
    allowDiscounts: true,
    requireApproval: false
  },
  {
    id: "backorder-004",
    name: "Approval Required for Large Backorders",
    description: "Require approval for large volume backorders",
    active: true,
    priority: 90,
    createdAt: "2025-01-25T15:50:00Z",
    updatedAt: "2025-01-25T15:50:00Z",
    scope: "global",
    allowBackorders: "partial",
    maxBackorderQuantity: 50,
    maxBackorderDays: 45,
    message: "Large backorders require approval. Our team will contact you to confirm.",
    displayInSearch: true,
    allowDiscounts: false,
    requireApproval: true,
    conditions: [
      {
        field: "quantity",
        operator: "greater_than",
        value: 20
      }
    ]
  },
  {
    id: "backorder-005",
    name: "Manufacturing Materials Backorder",
    description: "Backorder policy for raw manufacturing materials",
    active: true,
    priority: 60,
    createdAt: "2025-02-01T08:35:00Z",
    updatedAt: "2025-02-01T08:35:00Z",
    scope: "category",
    categoryIds: ["cat-004"], // Raw Materials category
    allowBackorders: "all",
    maxBackorderQuantity: 100,
    maxBackorderDays: 21,
    expectedRestockDate: "2025-02-20T00:00:00Z",
    message: "Materials can be backordered with expected fulfillment in 2-3 weeks.",
    displayInSearch: true,
    allowDiscounts: true,
    requireApproval: false
  }
];

// Product alternatives for when items are out of stock or discontinued
export const mockProductAlternatives = [
  {
    id: "alt-001",
    name: "Standard Widget Alternative",
    description: "Alternative product suggestion for Widget A",
    active: true,
    priority: 10,
    createdAt: "2025-01-15T14:40:00Z",
    updatedAt: "2025-01-15T14:40:00Z",
    primaryProductId: "prod-001", // Widget A
    alternativeProductId: "prod-002", // Gadget B
    relationship: "upgraded_version",
    displayOrder: 1,
    automaticSubstitution: false,
    displayOnProductPage: true,
    displayInCart: true,
    displayWhenOutOfStock: true
  },
  {
    id: "alt-002",
    name: "Tool Set Accessory",
    description: "Complementary product for Tool Set D",
    active: true,
    priority: 20,
    createdAt: "2025-01-20T10:15:00Z",
    updatedAt: "2025-01-20T10:15:00Z",
    primaryProductId: "prod-004", // Tool Set D
    alternativeProductId: "prod-003", // Component C
    relationship: "accessory",
    displayOrder: 1,
    automaticSubstitution: false,
    displayOnProductPage: true,
    displayInCart: true,
    displayWhenOutOfStock: false
  },
  {
    id: "alt-003",
    name: "Discontinued Product Replacement",
    description: "Replacement for discontinued Product F",
    active: true,
    priority: 30,
    createdAt: "2025-01-25T16:00:00Z",
    updatedAt: "2025-01-25T16:00:00Z",
    primaryProductId: "prod-006", // Product F (discontinued)
    alternativeProductId: "prod-007", // Assembly G
    relationship: "substitute",
    displayOrder: 1,
    automaticSubstitution: true,
    displayOnProductPage: true,
    displayInCart: true,
    displayWhenOutOfStock: true
  },
  {
    id: "alt-004",
    name: "Complementary Materials",
    description: "Materials often purchased together",
    active: true,
    priority: 15,
    createdAt: "2025-02-01T09:30:00Z",
    updatedAt: "2025-02-01T09:30:00Z",
    primaryProductId: "prod-005", // Material E
    alternativeProductId: "prod-003", // Component C
    relationship: "complementary",
    displayOrder: 1,
    automaticSubstitution: false,
    displayOnProductPage: true,
    displayInCart: true,
    displayWhenOutOfStock: false
  },
  {
    id: "alt-005",
    name: "Alternative Assembly",
    description: "Alternative assembly with similar functionality",
    active: true,
    priority: 25,
    createdAt: "2025-02-05T13:20:00Z",
    updatedAt: "2025-02-05T13:20:00Z",
    primaryProductId: "prod-007", // Assembly G
    alternativeProductId: "prod-002", // Gadget B
    relationship: "substitute",
    conversionRate: 0.8,
    displayOrder: 1,
    automaticSubstitution: false,
    displayOnProductPage: true,
    displayInCart: true,
    displayWhenOutOfStock: true
  }
];


export const mockSyncRules = [
  {
    id: 'sync-001',
    name: 'Instant Stock Update',
    description: 'Update catalog immediately when inventory stock changes',
    active: true,
    priority: 100,
    scope: 'global',
    triggerType: 'stock_change',
    action: 'update_inventory',
    actionConfig: {
      updateDisplayed: true,
      notifyStaff: false
    },
    notifications: {
      enabled: true,
      channels: ['email'],
      recipients: ['user-001', 'user-002']
    },
    tags: ['automated', 'high-priority'],
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-01-05T09:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001'
  },
  {
    id: 'sync-002',
    name: 'Low Stock Notification',
    description: 'Notify staff when stock falls below threshold',
    active: true,
    priority: 90,
    scope: 'global',
    triggerType: 'threshold',
    thresholdCondition: {
      type: 'absolute',
      value: 5,
      operator: 'less_than_equal'
    },
    action: 'notify_only',
    actionConfig: {
      notifyStaff: true
    },
    notifications: {
      enabled: true,
      channels: ['email', 'push'],
      recipients: ['user-001', 'user-002', 'user-003']
    },
    tags: ['notification', 'inventory-management'],
    createdAt: '2025-01-10T11:30:00Z',
    updatedAt: '2025-01-10T11:30:00Z',
    createdBy: 'user-002',
    updatedBy: 'user-002'
  },
  {
    id: 'sync-003',
    name: 'Hide Electronics When Out of Stock',
    description: 'Hide electronic items in catalog when they become out of stock',
    active: true,
    priority: 85,
    scope: 'category',
    categoryIds: ['cat-003'], // Electronics category
    triggerType: 'stock_change',
    thresholdCondition: {
      type: 'absolute',
      value: 0,
      operator: 'equal'
    },
    action: 'hide_product',
    actionConfig: {
      notifyStaff: true
    },
    notifications: {
      enabled: true,
      channels: ['email'],
      recipients: ['user-002', 'user-005']
    },
    tags: ['visibility', 'electronics'],
    createdAt: '2025-01-15T13:45:00Z',
    updatedAt: '2025-01-20T09:20:00Z',
    createdBy: 'user-005',
    updatedBy: 'user-002'
  },
  {
    id: 'sync-004',
    name: 'Daily Inventory Sync',
    description: 'Synchronize all inventory data with catalog every day at midnight',
    active: true,
    priority: 70,
    scope: 'global',
    triggerType: 'scheduled',
    scheduleConfig: {
      frequency: 'daily',
      time: '00:00:00'
    },
    action: 'update_inventory',
    actionConfig: {
      updateDisplayed: true,
      notifyStaff: true
    },
    notifications: {
      enabled: true,
      channels: ['email'],
      recipients: ['user-001', 'user-002']
    },
    tags: ['scheduled', 'daily'],
    createdAt: '2025-01-25T10:00:00Z',
    updatedAt: '2025-01-25T10:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001'
  },
  {
    id: 'sync-005',
    name: 'Tool Set Status Change',
    description: 'Change status of Tool Set product when stock is below threshold',
    active: false,
    priority: 80,
    scope: 'product',
    productIds: ['prod-004'], // Tool Set D
    triggerType: 'threshold',
    thresholdCondition: {
      type: 'absolute',
      value: 2,
      operator: 'less_than'
    },
    action: 'change_status',
    actionConfig: {
      status: 'limited',
      notifyStaff: true
    },
    notifications: {
      enabled: true,
      channels: ['email', 'sms'],
      recipients: ['user-002', 'user-004']
    },
    tags: ['tools', 'status-change'],
    createdAt: '2025-02-01T15:30:00Z',
    updatedAt: '2025-02-01T15:30:00Z',
    createdBy: 'user-002',
    updatedBy: 'user-002'
  },
  {
    id: 'sync-006',
    name: 'Weekly Stock Review',
    description: 'Generate inventory report and update catalog every Monday',
    active: true,
    priority: 60,
    scope: 'global',
    triggerType: 'scheduled',
    scheduleConfig: {
      frequency: 'weekly',
      dayOfWeek: 1, // Monday
      time: '08:00:00'
    },
    action: 'update_inventory',
    actionConfig: {
      updateDisplayed: true,
      notifyStaff: true
    },
    notifications: {
      enabled: true,
      channels: ['email'],
      recipients: ['user-001', 'user-002', 'user-005'],
      template: 'weekly-inventory-report'
    },
    tags: ['scheduled', 'weekly', 'report'],
    createdAt: '2025-02-05T11:15:00Z',
    updatedAt: '2025-02-05T11:15:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001'
  },
  {
    id: 'sync-007',
    name: 'Show Raw Materials When Backordered',
    description: 'Always show raw materials in catalog even when backordered',
    active: true,
    priority: 75,
    scope: 'category',
    categoryIds: ['cat-004'], // Raw Materials category
    triggerType: 'stock_change',
    action: 'show_product',
    actionConfig: {
      notifyStaff: false
    },
    tags: ['visibility', 'raw-materials'],
    createdAt: '2025-02-10T09:45:00Z',
    updatedAt: '2025-02-10T09:45:00Z',
    createdBy: 'user-005',
    updatedBy: 'user-005'
  },
  {
    id: 'sync-008',
    name: 'Critical Stock Alert',
    description: 'Send high-priority notification when stock is critically low',
    active: true,
    priority: 95,
    scope: 'global',
    triggerType: 'threshold',
    thresholdCondition: {
      type: 'percentage',
      value: 5,
      operator: 'less_than'
    },
    action: 'notify_only',
    actionConfig: {
      notifyStaff: true
    },
    notifications: {
      enabled: true,
      channels: ['email', 'sms', 'push'],
      recipients: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005'],
      template: 'critical-stock-alert'
    },
    tags: ['alert', 'critical'],
    createdAt: '2025-02-15T13:00:00Z',
    updatedAt: '2025-02-15T13:00:00Z',
    createdBy: 'user-001',
    updatedBy: 'user-001'
  }
];


// Add this after the mockSyncRules array

export const mockSyncSchedules = [
  {
    id: 'sched-001',
    name: 'Real-time Inventory Sync',
    description: 'Immediate sync of inventory changes to the product catalog',
    active: true,
    type: 'realtime',
    schedule: {
      frequency: 'custom',
      customCron: '* * * * *' // Every minute (essentially real-time)
    },
    scope: 'global',
    batchSize: 50,
    maxRuntime: 30, // 30 seconds
    retryCount: 3,
    priority: 100,
    conflictResolution: 'overwrite',
    notifications: {
      enabled: true,
      channels: ['email'],
      recipients: ['user-001', 'user-002']
    },
    errorHandling: {
      stopOnError: false,
      logErrors: true,
      alertOnError: true
    },
    lastRunAt: '2025-05-23T23:55:00Z',
    nextRunAt: '2025-05-24T00:00:00Z',
    lastRunStatus: 'success',
    tags: ['real-time', 'high-priority'],
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-05-23T23:55:10Z',
    createdBy: 'user-001',
    updatedBy: 'system',
    optimizationReviewed: true
  },
  {
    id: 'sched-002',
    name: 'Daily Full Sync',
    description: 'Complete synchronization of all inventory data daily at midnight',
    active: true,
    type: 'batch_low',
    schedule: {
      frequency: 'daily',
      time: '00:00:00'
    },
    scope: 'global',
    batchSize: 500,
    maxRuntime: 1800, // 30 minutes
    retryCount: 5,
    priority: 70,
    conflictResolution: 'merge',
    notifications: {
      enabled: true,
      channels: ['email'],
      recipients: ['user-001', 'user-002', 'user-005']
    },
    errorHandling: {
      stopOnError: false,
      logErrors: true,
      alertOnError: true
    },
    lastRunAt: '2025-05-23T00:00:00Z',
    nextRunAt: '2025-05-24T00:00:00Z',
    lastRunStatus: 'success',
    tags: ['daily', 'full-sync'],
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-05-23T00:35:22Z',
    createdBy: 'user-001',
    updatedBy: 'system'
  },
  {
    id: 'sched-003',
    name: 'Electronics Hourly Sync',
    description: 'Hourly sync for electronic components category',
    active: true,
    type: 'batch_medium',
    schedule: {
      frequency: 'hourly'
    },
    scope: 'category',
    categoryIds: ['cat-003'], // Electronics category
    batchSize: 200,
    maxRuntime: 300, // 5 minutes
    retryCount: 3,
    priority: 80,
    conflictResolution: 'overwrite',
    notifications: {
      enabled: true,
      channels: ['email'],
      recipients: ['user-002', 'user-005']
    },
    errorHandling: {
      stopOnError: false,
      logErrors: true,
      alertOnError: true
    },
    lastRunAt: '2025-05-23T23:00:00Z',
    nextRunAt: '2025-05-24T00:00:00Z',
    lastRunStatus: 'success',
    tags: ['hourly', 'electronics'],
    createdAt: '2025-01-20T13:45:00Z',
    updatedAt: '2025-05-23T23:05:12Z',
    createdBy: 'user-005',
    updatedBy: 'system',
    optimizationReviewed: false,
    optimizationSuggested: true,
    optimizationMessage: 'Consider reducing frequency to improve performance'
  },
  {
    id: 'sched-004',
    name: 'Weekly Inventory Report',
    description: 'Generate weekly inventory report and sync with external systems',
    active: true,
    type: 'batch_low',
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 1, // Monday
      time: '06:00:00'
    },
    scope: 'global',
    batchSize: 1000,
    maxRuntime: 3600, // 60 minutes
    retryCount: 2,
    priority: 60,
    conflictResolution: 'skip',
    notifications: {
      enabled: true,
      channels: ['email'],
      recipients: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005']
    },
    errorHandling: {
      stopOnError: false,
      logErrors: true,
      alertOnError: true
    },
    lastRunAt: '2025-05-19T06:00:00Z',
    nextRunAt: '2025-05-26T06:00:00Z',
    lastRunStatus: 'success',
    tags: ['weekly', 'report'],
    createdAt: '2025-02-01T11:20:00Z',
    updatedAt: '2025-05-19T07:15:33Z',
    createdBy: 'user-001',
    updatedBy: 'system'
  },
  {
    id: 'sched-005',
    name: 'High-Value Items Sync',
    description: 'Frequent sync for high-value inventory items',
    active: true,
    type: 'batch_high',
    schedule: {
      frequency: 'custom',
      customCron: '*/5 * * * *' // Every 5 minutes
    },
    scope: 'global',
    batchSize: 100,
    maxRuntime: 120, // 2 minutes
    retryCount: 3,
    priority: 90,
    conflictResolution: 'overwrite',
    notifications: {
      enabled: true,
      channels: ['email', 'push'],
      recipients: ['user-001', 'user-002']
    },
    errorHandling: {
      stopOnError: true,
      logErrors: true,
      alertOnError: true
    },
    lastRunAt: '2025-05-23T23:55:00Z',
    nextRunAt: '2025-05-24T00:00:00Z',
    lastRunStatus: 'success',
    tags: ['high-value', 'frequent'],
    createdAt: '2025-02-10T09:45:00Z',
    updatedAt: '2025-05-23T23:57:05Z',
    createdBy: 'user-002',
    updatedBy: 'system'
  },
  {
    id: 'sched-006',
    name: 'Raw Materials Monthly Audit',
    description: 'Monthly comprehensive audit of raw materials inventory',
    active: true,
    type: 'batch_low',
    schedule: {
      frequency: 'monthly',
      dayOfMonth: 1,
      time: '02:00:00'
    },
    scope: 'category',
    categoryIds: ['cat-004'], // Raw Materials category
    batchSize: 500,
    maxRuntime: 7200, // 2 hours
    retryCount: 5,
    priority: 50,
    conflictResolution: 'merge',
    notifications: {
      enabled: true,
      channels: ['email'],
      recipients: ['user-001', 'user-002', 'user-005']
    },
    errorHandling: {
      stopOnError: false,
      logErrors: true,
      alertOnError: true
    },
    lastRunAt: '2025-05-01T02:00:00Z',
    nextRunAt: '2025-06-01T02:00:00Z',
    lastRunStatus: 'success',
    tags: ['monthly', 'audit', 'raw-materials'],
    createdAt: '2025-02-15T14:30:00Z',
    updatedAt: '2025-05-01T04:22:15Z',
    createdBy: 'user-005',
    updatedBy: 'system'
  },
  {
    id: 'sched-007',
    name: 'Discontinued Products Cleanup',
    description: 'Process discontinued products and update catalog visibility',
    active: true,
    type: 'batch_low',
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 5, // Friday
      time: '22:00:00'
    },
    scope: 'global',
    batchSize: 200,
    maxRuntime: 1800, // 30 minutes
    retryCount: 2,
    priority: 40,
    conflictResolution: 'overwrite',
    notifications: {
      enabled: true,
      channels: ['email'],
      recipients: ['user-002', 'user-005']
    },
    errorHandling: {
      stopOnError: false,
      logErrors: true,
      alertOnError: false
    },
    lastRunAt: '2025-05-16T22:00:00Z',
    nextRunAt: '2025-05-23T22:00:00Z',
    lastRunStatus: 'success',
    tags: ['cleanup', 'discontinued'],
    createdAt: '2025-03-01T10:15:00Z',
    updatedAt: '2025-05-16T22:45:30Z',
    createdBy: 'user-005',
    updatedBy: 'system'
  },
  {
    id: 'sched-008',
    name: 'Manual Sync Trigger',
    description: 'Manual trigger for immediate sync operations',
    active: true,
    type: 'manual',
    schedule: {
      frequency: 'custom'
    },
    scope: 'global',
    batchSize: 1000,
    maxRuntime: 1800, // 30 minutes
    retryCount: 3,
    priority: 95,
    conflictResolution: 'overwrite',
    notifications: {
      enabled: true,
      channels: ['email'],
      recipients: ['user-001', 'user-002']
    },
    errorHandling: {
      stopOnError: false,
      logErrors: true,
      alertOnError: true
    },
    lastRunAt: '2025-05-20T15:30:22Z',
    nextRunAt: null,
    lastRunStatus: 'success',
    tags: ['manual', 'on-demand'],
    createdAt: '2025-01-05T08:00:00Z',
    updatedAt: '2025-05-20T15:30:22Z',
    createdBy: 'user-001',
    updatedBy: 'user-001'
  }
];

export default {
  mockItems,
  mockLocations,
  mockTransactions,
  mockCycleCounts,
  mockDocuments,
  mockAuditLogs,
  mockMappings,
  mockSyncConflicts,
  // Remove this line: mockTransfers, - since it's now properly defined above
  mockStockThresholds,
  mockStockHistory,
  mockTransactionFlow,
  mockStockAlerts,
  mockTransactionImpacts,
  
  // New exports for reservations
  mockReservations,
  mockCartReservations,
  mockOrderAllocations,
  mockReservationHistory,
  mockHoldPolicies,
  mockCartPolicies,
  mockAllocationPriorities,
  mockReservationStats,
  mockCartOverrides,
  
  // Add sync rules export
  mockSyncRules,
  
  getLocationStats,
  mockStockVisibilityRules,
  mockBackorderSettings,
  mockProductAlternatives,

  mockSyncRules,
  mockSyncSchedules,
};