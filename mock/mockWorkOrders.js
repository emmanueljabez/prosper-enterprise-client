/**
 * Mock data for Work Orders
 */

/**
 * Mock Work Order data
 */
export const mockWorkOrders = [
  {
    id: 'wo-001',
    orderNumber: 'WO-2025-0001',
    bomId: 'bom-001',
    bomName: 'Assembly G Manufacturing',
    productId: 'prod-007',
    productName: 'Assembly G',
    productSku: 'INV-007',
    status: 'in_progress',
    materialStatus: 'available',
    priority: 80,
    quantity: 50,
    completed: 20,
    rejected: 2,
    plannedStartDate: '2025-05-15T08:00:00Z',
    plannedEndDate: '2025-05-30T17:00:00Z',
    actualStartDate: '2025-05-15T09:30:00Z',
    dueDate: '2025-05-30T17:00:00Z',
    materials: [
      {
        id: 'wom-001',
        componentId: 'comp-001',
        itemId: 'item-002',
        itemName: 'Gadget B',
        itemSku: 'INV-002',
        required: 100,
        allocated: 100,
        consumed: 40,
        unit: 'each',
        status: 'allocated',
        locationId: 'loc-001',
        locationName: 'Main Warehouse'
      },
      {
        id: 'wom-002',
        componentId: 'comp-002',
        itemId: 'item-003',
        itemName: 'Component C',
        itemSku: 'INV-003',
        required: 250,
        allocated: 250,
        consumed: 100,
        unit: 'each',
        status: 'allocated',
        locationId: 'loc-001',
        locationName: 'Main Warehouse'
      },
      {
        id: 'wom-003',
        componentId: 'comp-003',
        itemId: 'item-005',
        itemName: 'Material E',
        itemSku: 'INV-005',
        required: 25,
        allocated: 25,
        consumed: 10,
        unit: 'kg',
        status: 'allocated',
        locationId: 'loc-001',
        locationName: 'Main Warehouse'
      }
    ],
    operations: [
      {
        id: 'op-001',
        name: 'Prepare Gadget B components',
        description: 'Inspect and prepare all Gadget B components for assembly',
        status: 'completed',
        plannedStartDate: '2025-05-15T08:00:00Z',
        plannedEndDate: '2025-05-18T17:00:00Z',
        actualStartDate: '2025-05-15T09:30:00Z',
        actualEndDate: '2025-05-18T15:45:00Z',
        assignedTo: 'Team A',
        duration: 1935 // minutes
      },
      {
        id: 'op-002',
        name: 'Assemble Component C modules',
        description: 'Connect all Component C modules using the provided diagram',
        status: 'in_progress',
        plannedStartDate: '2025-05-19T08:00:00Z',
        plannedEndDate: '2025-05-22T17:00:00Z',
        actualStartDate: '2025-05-19T08:15:00Z',
        assignedTo: 'Team B',
        duration: 1440
      }
    ],
    createdAt: '2025-05-10T14:30:00Z',
    updatedAt: '2025-05-19T10:15:00Z',
    createdBy: 'user-001',
    notes: 'High priority order for key customer'
  },
  {
    id: 'wo-002',
    orderNumber: 'WO-2025-0002',
    bomId: 'bom-002',
    bomName: 'Widget A Standard Assembly',
    productId: 'prod-001',
    productName: 'Widget A',
    productSku: 'INV-001',
    status: 'planned',
    materialStatus: 'partial',
    priority: 70,
    quantity: 100,
    completed: 0,
    rejected: 0,
    plannedStartDate: '2025-06-01T08:00:00Z',
    plannedEndDate: '2025-06-15T17:00:00Z',
    dueDate: '2025-06-15T17:00:00Z',
    materials: [
      {
        id: 'wom-011',
        componentId: 'comp-011',
        itemId: 'item-003',
        itemName: 'Component C',
        itemSku: 'INV-003',
        required: 300,
        allocated: 200,
        consumed: 0,
        unit: 'each',
        status: 'insufficient',
        locationId: 'loc-001',
        locationName: 'Main Warehouse'
      },
      {
        id: 'wom-012',
        componentId: 'comp-012',
        itemId: 'item-005',
        itemName: 'Material E',
        itemSku: 'INV-005',
        required: 20,
        allocated: 20,
        consumed: 0,
        unit: 'kg',
        status: 'allocated',
        locationId: 'loc-001',
        locationName: 'Main Warehouse'
      }
    ],
    operations: [
      {
        id: 'op-011',
        name: 'Prepare base components',
        description: 'Arrange Component C modules in triangle formation',
        status: 'pending',
        plannedStartDate: '2025-06-01T08:00:00Z',
        plannedEndDate: '2025-06-05T17:00:00Z',
        assignedTo: 'Team C',
        duration: 2400
      }
    ],
    createdAt: '2025-05-20T11:45:00Z',
    updatedAt: '2025-05-20T11:45:00Z',
    createdBy: 'user-002',
    notes: 'Waiting for additional Component C inventory'
  },
  {
    id: 'wo-003',
    orderNumber: 'WO-2025-0003',
    bomId: 'bom-003',
    bomName: 'Tool Set D Manufacturing',
    productId: 'prod-004',
    productName: 'Tool Set D',
    productSku: 'INV-004',
    status: 'completed',
    materialStatus: 'available',
    priority: 60,
    quantity: 20,
    completed: 20,
    rejected: 0,
    plannedStartDate: '2025-04-10T08:00:00Z',
    plannedEndDate: '2025-04-20T17:00:00Z',
    actualStartDate: '2025-04-10T09:15:00Z',
    actualEndDate: '2025-04-18T16:30:00Z',
    completedAt: '2025-04-18T16:30:00Z',
    dueDate: '2025-04-20T17:00:00Z',
    materials: [
      {
        id: 'wom-021',
        componentId: 'comp-021',
        itemId: 'item-002',
        itemName: 'Gadget B',
        itemSku: 'INV-002',
        required: 20,
        allocated: 20,
        consumed: 20,
        unit: 'each',
        status: 'consumed',
        locationId: 'loc-002',
        locationName: 'Assembly Plant'
      }
    ],
    createdAt: '2025-04-01T13:30:00Z',
    updatedAt: '2025-04-18T16:30:00Z',
    createdBy: 'user-003',
    qualityNotes: 'All units passed quality inspection'
  },
  {
    id: 'wo-004',
    orderNumber: 'WO-2025-0004',
    bomId: 'bom-004',
    bomName: 'Product F Assembly',
    productId: 'prod-006',
    productName: 'Product F',
    productSku: 'INV-006',
    status: 'on_hold',
    materialStatus: 'unavailable',
    priority: 40,
    quantity: 15,
    completed: 0,
    rejected: 0,
    plannedStartDate: '2025-05-25T08:00:00Z',
    plannedEndDate: '2025-06-10T17:00:00Z',
    dueDate: '2025-06-10T17:00:00Z',
    materials: [
      {
        id: 'wom-031',
        componentId: 'comp-031',
        itemId: 'item-001',
        itemName: 'Widget A',
        itemSku: 'INV-001',
        required: 30,
        allocated: 0,
        consumed: 0,
        unit: 'each',
        status: 'pending',
        locationId: 'loc-001',
        locationName: 'Main Warehouse'
      }
    ],
    createdAt: '2025-05-15T10:45:00Z',
    updatedAt: '2025-05-20T14:30:00Z',
    createdBy: 'user-001',
    notes: 'On hold due to material shortage - awaiting Widget A production completion'
  },
  {
    id: 'wo-005',
    orderNumber: 'WO-2025-0005',
    bomId: 'bom-001',
    bomName: 'Assembly G Manufacturing',
    productId: 'prod-007',
    productName: 'Assembly G',
    productSku: 'INV-007',
    status: 'cancelled',
    materialStatus: 'available',
    priority: 30,
    quantity: 10,
    completed: 0,
    rejected: 0,
    plannedStartDate: '2025-05-20T08:00:00Z',
    plannedEndDate: '2025-05-25T17:00:00Z',
    dueDate: '2025-05-25T17:00:00Z',
    materials: [],
    createdAt: '2025-05-15T11:30:00Z',
    updatedAt: '2025-05-17T09:15:00Z',
    createdBy: 'user-002',
    notes: 'Order cancelled by customer'
  }
];

export default mockWorkOrders;