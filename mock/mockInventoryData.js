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