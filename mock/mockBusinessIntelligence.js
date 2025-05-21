// KPI data
export const biStats = {
  inventoryTurnover: 4.7,
  inventoryTurnoverChange: 2.3,
  gmroii: 3.15,
  gmroiiChange: -0.8,
  onTimeDelivery: 92,
  ordersOnTime: 115,
  totalOrders: 125,
  forecastAccuracy: 89,
  forecastCategory: 'Medium-term'
};

// Anomalies data
export const anomaliesData = [
  {
    id: 1,
    type: 'stock_adjustment',
    title: 'Unusual Stock Adjustment',
    description: 'Multiple negative adjustments for Wi-Fi 6 Routers in the last 24 hours (-5 units)',
    time: '3 hours ago',
    severity: 'High',
    isRead: false,
    affectedItems: ['Wi-Fi 6 Router'],
    location: 'Warehouse A'
  },
  {
    id: 2,
    type: 'returns',
    title: 'Product Return Spike',
    description: 'Return rate for Residential Fiber ONT increased by 200% this week',
    time: '12 hours ago',
    severity: 'Medium',
    isRead: false,
    affectedItems: ['Residential Fiber ONT'],
    location: 'All Locations'
  },
  {
    id: 3,
    type: 'shrinkage',
    title: 'Inventory Shrinkage Alert',
    description: 'Fiber Patch Cable 50ft shrinkage exceeds 5% threshold (actual: 7.2%)',
    time: '1 day ago',
    severity: 'High',
    isRead: false,
    affectedItems: ['Fiber Patch Cable 50ft'],
    location: 'Warehouse A'
  },
  {
    id: 4,
    type: 'vendor_delay',
    title: 'Vendor Delivery Delay',
    description: 'FiberTech Solutions consistently delayed by 3+ days for the last 5 shipments',
    time: '2 days ago',
    severity: 'Medium',
    isRead: true,
    affectedItems: ['Multiple Items'],
    location: 'N/A',
    vendorId: 'FT001'
  },
  {
    id: 5,
    type: 'sales_drop',
    title: 'Unexpected Sales Drop',
    description: 'Enterprise Access Point sales dropped 35% compared to last month',
    time: '5 days ago',
    severity: 'Low',
    isRead: true,
    affectedItems: ['Enterprise Access Point'],
    location: 'All Locations'
  },
  {
    id: 6,
    type: 'stock_adjustment',
    title: 'Manual Stock Adjustment',
    description: 'Large quantity adjustment for Fiber Splice Kit (+3 units) without documentation',
    time: '6 days ago',
    severity: 'Medium',
    isRead: false,
    affectedItems: ['Fiber Splice Kit'],
    location: 'Tool Storage'
  },
  {
    id: 7,
    type: 'returns',
    title: 'Quality Issue Returns',
    description: 'Multiple returns of Business-class Router citing connectivity issues',
    time: '1 week ago',
    severity: 'High',
    isRead: true,
    affectedItems: ['Business-class Router'],
    location: 'Secure Storage B'
  },
  {
    id: 8,
    type: 'shrinkage',
    title: 'Cycle Count Discrepancy',
    description: 'Signal Analyzer count off by 1 unit during routine cycle count',
    time: '1 week ago',
    severity: 'Low',
    isRead: false,
    affectedItems: ['Signal Analyzer'],
    location: 'Tool Storage'
  }
];

// Custom reports data
export const reportsData = [
  {
    id: 1,
    name: 'Monthly Inventory Valuation',
    module: 'Inventory',
    lastRun: '2023-07-22',
    status: 'Completed',
    schedule: 'Monthly',
    createdBy: 'John Doe',
    description: 'Total value of inventory assets by location and category',
    formatType: 'PDF',
    recipients: ['finance@example.com', 'operations@example.com'],
    parameters: {
      dateRange: 'Last Month',
      locations: ['All Locations'],
      categories: ['All Categories']
    }
  },
  {
    id: 2,
    name: 'Vendor Performance Analysis',
    module: 'Procurement',
    lastRun: '2023-07-20',
    status: 'Completed',
    schedule: 'Weekly',
    createdBy: 'Mary Smith',
    description: 'Vendor delivery timeframes and cost efficiency metrics',
    formatType: 'Excel',
    recipients: ['procurement@example.com'],
    parameters: {
      dateRange: 'Last Quarter',
      vendors: ['All Vendors'],
      metrics: ['Delivery Time', 'Cost Efficiency', 'Quality Rating']
    }
  },
  {
    id: 3,
    name: 'Sales by Product Category',
    module: 'Sales',
    lastRun: '2023-07-24',
    status: 'Completed',
    schedule: 'Daily',
    createdBy: 'Robert Jones',
    description: 'Breakdown of sales performance by product category',
    formatType: 'Excel',
    recipients: ['sales@example.com', 'marketing@example.com'],
    parameters: {
      dateRange: 'Last Week',
      categories: ['All Categories'],
      salesChannels: ['All Channels']
    }
  },
  {
    id: 4,
    name: 'Multi-Warehouse Stock Levels',
    module: 'Inventory',
    lastRun: '2023-07-23',
    status: 'Completed',
    schedule: 'Weekly',
    createdBy: 'John Doe',
    description: 'Current stock levels across all warehouse locations',
    formatType: 'PDF',
    recipients: ['operations@example.com', 'logistics@example.com'],
    parameters: {
      locations: ['All Locations'],
      stockStatus: ['All Statuses'],
      categories: ['All Categories']
    }
  },
  {
    id: 5,
    name: 'Product Profitability Report',
    module: 'Finance',
    lastRun: '2023-07-15',
    status: 'Failed',
    schedule: 'Monthly',
    createdBy: 'Jane Wilson',
    description: 'Profit margin analysis by product and category',
    formatType: 'Excel',
    recipients: ['finance@example.com', 'executive@example.com'],
    parameters: {
      dateRange: 'Last Month',
      products: ['All Products'],
      includeDiscontinued: false
    }
  },
  {
    id: 6,
    name: 'Stock Movement Forecast',
    module: 'Inventory',
    lastRun: '2023-07-18',
    status: 'Scheduled',
    schedule: 'Monthly',
    createdBy: 'David Ochieng',
    description: 'Forecasted stock movements for inventory planning',
    formatType: 'PDF',
    recipients: ['operations@example.com', 'procurement@example.com'],
    parameters: {
      forecastPeriod: 'Next Quarter',
      confidenceLevel: '90%',
      categories: ['All Categories']
    }
  },
  {
    id: 7,
    name: 'Order Fulfillment Performance',
    module: 'Operations',
    lastRun: '2023-07-21',
    status: 'In Progress',
    schedule: 'Weekly',
    createdBy: 'Mary Smith',
    description: 'Analysis of order fulfillment rates and times',
    formatType: 'Excel',
    recipients: ['operations@example.com', 'customerservice@example.com'],
    parameters: {
      dateRange: 'Last Month',
      orderTypes: ['All Types'],
      locations: ['All Locations']
    }
  }
];

// Vendor performance data
export const vendorPerformanceData = [
  {
    name: 'FiberTech',
    deliveryTime: 4.2,
    costEfficiency: 75,
    qualityRating: 82,
    reliability: 78,
    onTimeDelivery: 85,
    id: 'FT001'
  },
  {
    name: 'NetGear',
    deliveryTime: 2.8,
    costEfficiency: 82,
    qualityRating: 88,
    reliability: 90,
    onTimeDelivery: 92,
    id: 'NG001'
  },
  {
    name: 'TechTools',
    deliveryTime: 3.5,
    costEfficiency: 68,
    qualityRating: 91,
    reliability: 85,
    onTimeDelivery: 78,
    id: 'TT001'
  },
  {
    name: 'PowerSafe',
    deliveryTime: 5.1,
    costEfficiency: 63,
    qualityRating: 79,
    reliability: 72,
    onTimeDelivery: 70,
    id: 'PS001'
  },
  {
    name: 'Huawei',
    deliveryTime: 3.2,
    costEfficiency: 85,
    qualityRating: 86,
    reliability: 88,
    onTimeDelivery: 86,
    id: 'HW001'
  }
];

// Product category profitability data
export const profitabilityData = {
  product: [
    { name: 'Fiber ONT', margin: 34 },
    { name: 'Wi-Fi Router', margin: 28 },
    { name: 'Managed Switch', margin: 40 },
    { name: 'Fiber Cable', margin: 22 },
    { name: 'UPS', margin: 15 }
  ],
  category: [
    { name: 'CPE', margin: 32 },
    { name: 'Network Term.', margin: 38 },
    { name: 'Cabling', margin: 24 },
    { name: 'Tools', margin: 18 },
    { name: 'Power Equip.', margin: 12 }
  ],
  location: [
    { name: 'Warehouse A', margin: 28 },
    { name: 'Secure Storage', margin: 35 },
    { name: 'Tool Storage', margin: 22 }
  ]
};

// Sales vs Inventory correlation data
export const correlationData = [
  { x: 28, y: 75, r: 15, category: 'CPE' },
  { x: 65, y: 42, r: 12, category: 'Cabling' },
  { x: 12, y: 34, r: 8, category: 'Tools' },
  { x: 32, y: 68, r: 10, category: 'Network Term.' },
  { x: 15, y: 25, r: 5, category: 'Power Equip.' }
];

// Forecast data
export const forecastData = {
  all: {
    historical: [42, 45, 40, 50, 48, 43, 52, 55, 48, 50, 52, null],
    forecast: [null, null, null, null, null, null, null, null, null, 50, 53, 58],
    upperBound: [null, null, null, null, null, null, null, null, null, 55, 60, 66],
    lowerBound: [null, null, null, null, null, null, null, null, null, 45, 47, 50]
  },
  cabling: {
    historical: [15, 18, 16, 19, 17, 20, 22, 21, 19, 20, 22, null],
    forecast: [null, null, null, null, null, null, null, null, null, 21, 23, 25],
    upperBound: [null, null, null, null, null, null, null, null, null, 24, 27, 30],
    lowerBound: [null, null, null, null, null, null, null, null, null, 18, 19, 21]
  },
  cpe: {
    historical: [12, 10, 11, 14, 16, 12, 15, 17, 14, 15, 16, null],
    forecast: [null, null, null, null, null, null, null, null, null, 16, 17, 18],
    upperBound: [null, null, null, null, null, null, null, null, null, 18, 20, 22],
    lowerBound: [null, null, null, null, null, null, null, null, null, 14, 15, 16]
  },
  networking: {
    historical: [8, 10, 7, 9, 8, 6, 9, 10, 9, 10, 9, null],
    forecast: [null, null, null, null, null, null, null, null, null, 9, 10, 11],
    upperBound: [null, null, null, null, null, null, null, null, null, 11, 12, 14],
    lowerBound: [null, null, null, null, null, null, null, null, null, 8, 8, 9]
  },
  tools: {
    historical: [5, 4, 3, 5, 4, 3, 4, 5, 4, 3, 3, null],
    forecast: [null, null, null, null, null, null, null, null, null, 3, 2, 3],
    upperBound: [null, null, null, null, null, null, null, null, null, 4, 3, 4],
    lowerBound: [null, null, null, null, null, null, null, null, null, 2, 1, 2]
  }
};

// Data for time periods
export const timeframeData = {
  '7': {
    title: 'Last 7 Days',
    inventoryTurnover: 3.8,
    inventoryTurnoverChange: 1.2,
    gmroii: 2.95,
    gmroiiChange: -1.2,
    onTimeDelivery: 90,
    ordersOnTime: 45,
    totalOrders: 50,
    forecastAccuracy: 85,
    forecastCategory: 'Short-term'
  },
  '30': {
    title: 'Last 30 Days',
    inventoryTurnover: 4.7,
    inventoryTurnoverChange: 2.3,
    gmroii: 3.15,
    gmroiiChange: -0.8,
    onTimeDelivery: 92,
    ordersOnTime: 115,
    totalOrders: 125,
    forecastAccuracy: 89,
    forecastCategory: 'Medium-term'
  },
  '90': {
    title: 'Last Quarter',
    inventoryTurnover: 5.2,
    inventoryTurnoverChange: 3.5,
    gmroii: 3.4,
    gmroiiChange: 1.2,
    onTimeDelivery: 88,
    ordersOnTime: 308,
    totalOrders: 350,
    forecastAccuracy: 92,
    forecastCategory: 'Quarterly'
  },
  '365': {
    title: 'Last Year',
    inventoryTurnover: 4.9,
    inventoryTurnoverChange: -0.5,
    gmroii: 3.25,
    gmroiiChange: 0.5,
    onTimeDelivery: 85,
    ordersOnTime: 1060,
    totalOrders: 1250,
    forecastAccuracy: 94,
    forecastCategory: 'Annual'
  }
};