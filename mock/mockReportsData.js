// Report Templates
export const reportTemplates = [
  {
    id: 'inventory-valuation',
    name: 'Inventory Valuation',
    description: 'Shows the current value of all inventory items',
    category: 'Inventory',
    defaultColumns: ['sku', 'name', 'category', 'location', 'quantity', 'unitCost', 'totalValue'],
    availableFilters: ['location', 'category', 'supplier', 'valueRange', 'minStockLevel'],
    preset: true
  },
  {
    id: 'stock-movement',
    name: 'Stock Movement Summary',
    description: 'Summarizes all inventory additions and removals over time',
    category: 'Inventory',
    defaultColumns: ['date', 'sku', 'name', 'transactionType', 'quantity', 'location', 'reference'],
    availableFilters: ['dateRange', 'location', 'category', 'transactionType'],
    preset: true
  },
  {
    id: 'fast-moving-items',
    name: 'Fast vs Slow Moving Items',
    description: 'Analyzes items by their movement frequency',
    category: 'Inventory',
    defaultColumns: ['sku', 'name', 'category', 'quantitySold', 'lastSold', 'daysNoMovement', 'turnoverRate'],
    availableFilters: ['dateRange', 'location', 'category', 'turnoverThreshold'],
    preset: true
  },
  {
    id: 'stock-aging',
    name: 'Stock Aging Report',
    description: 'Shows how long items have been in inventory',
    category: 'Inventory',
    defaultColumns: ['sku', 'name', 'category', 'location', 'quantity', 'receiptDate', 'daysInStock', 'value'],
    availableFilters: ['location', 'category', 'agingBuckets', 'supplier'],
    preset: true
  },
  {
    id: 'overstock-understock',
    name: 'Overstock & Understock Alerts',
    description: 'Identifies items that are below min or above max thresholds',
    category: 'Inventory',
    defaultColumns: ['sku', 'name', 'category', 'location', 'quantity', 'minStockLevel', 'maxStockLevel', 'status'],
    availableFilters: ['location', 'category', 'status', 'supplier'],
    preset: true
  },
  {
    id: 'supplier-performance',
    name: 'Supplier Fulfillment & Lead Time',
    description: 'Analyzes supplier delivery performance and lead times',
    category: 'Procurement',
    defaultColumns: ['supplier', 'orderCount', 'itemsOrdered', 'itemsFulfilled', 'fulfillmentRate', 'avgLeadTime', 'onTimeDelivery'],
    availableFilters: ['dateRange', 'supplier', 'fulfillmentThreshold', 'leadTimeThreshold'],
    preset: true
  },
  {
    id: 'sales-vs-inventory',
    name: 'Sales vs Inventory Report',
    description: 'Compares sales performance against inventory levels',
    category: 'Sales',
    defaultColumns: ['sku', 'name', 'category', 'quantitySold', 'salesRevenue', 'currentStock', 'stockValue', 'turnoverRate'],
    availableFilters: ['dateRange', 'location', 'category', 'salesThreshold'],
    preset: true
  }
];

// Available Column Definitions
export const columnDefinitions = {
  // Product/Item columns
  sku: { id: 'sku', name: 'SKU', type: 'text', sortable: true, filterable: true },
  name: { id: 'name', name: 'Item Name', type: 'text', sortable: true, filterable: true },
  description: { id: 'description', name: 'Description', type: 'text', sortable: true, filterable: true },
  category: { id: 'category', name: 'Category', type: 'text', sortable: true, filterable: true },
  brand: { id: 'brand', name: 'Brand', type: 'text', sortable: true, filterable: true },
  
  // Quantity/Stock columns
  quantity: { id: 'quantity', name: 'Current Quantity', type: 'number', sortable: true, filterable: true },
  minStockLevel: { id: 'minStockLevel', name: 'Min Stock Level', type: 'number', sortable: true, filterable: true },
  maxStockLevel: { id: 'maxStockLevel', name: 'Max Stock Level', type: 'number', sortable: true, filterable: true },
  reorderPoint: { id: 'reorderPoint', name: 'Reorder Point', type: 'number', sortable: true, filterable: true },
  
  // Value/Cost columns
  unitCost: { id: 'unitCost', name: 'Unit Cost', type: 'currency', sortable: true, filterable: true },
  totalValue: { id: 'totalValue', name: 'Total Value', type: 'currency', sortable: true, filterable: true, formula: 'quantity * unitCost' },
  salesPrice: { id: 'salesPrice', name: 'Sales Price', type: 'currency', sortable: true, filterable: true },
  
  // Location columns
  location: { id: 'location', name: 'Location', type: 'text', sortable: true, filterable: true },
  bin: { id: 'bin', name: 'Bin/Shelf', type: 'text', sortable: true, filterable: true },
  
  // Transaction/Movement columns
  date: { id: 'date', name: 'Date', type: 'date', sortable: true, filterable: true },
  transactionType: { id: 'transactionType', name: 'Transaction Type', type: 'text', sortable: true, filterable: true },
  reference: { id: 'reference', name: 'Reference', type: 'text', sortable: true, filterable: true },
  
  // Aging/Time-based columns
  receiptDate: { id: 'receiptDate', name: 'Receipt Date', type: 'date', sortable: true, filterable: true },
  lastSold: { id: 'lastSold', name: 'Last Sold Date', type: 'date', sortable: true, filterable: true },
  daysInStock: { id: 'daysInStock', name: 'Days In Stock', type: 'number', sortable: true, filterable: true },
  daysNoMovement: { id: 'daysNoMovement', name: 'Days No Movement', type: 'number', sortable: true, filterable: true },
  
  // Sales/Performance columns
  quantitySold: { id: 'quantitySold', name: 'Quantity Sold', type: 'number', sortable: true, filterable: true },
  salesRevenue: { id: 'salesRevenue', name: 'Sales Revenue', type: 'currency', sortable: true, filterable: true },
  turnoverRate: { id: 'turnoverRate', name: 'Turnover Rate', type: 'number', sortable: true, filterable: true },
  stockValue: { id: 'stockValue', name: 'Stock Value', type: 'currency', sortable: true, filterable: true },
  
  // Supplier columns
  supplier: { id: 'supplier', name: 'Supplier', type: 'text', sortable: true, filterable: true },
  orderCount: { id: 'orderCount', name: 'Order Count', type: 'number', sortable: true, filterable: true },
  itemsOrdered: { id: 'itemsOrdered', name: 'Items Ordered', type: 'number', sortable: true, filterable: true },
  itemsFulfilled: { id: 'itemsFulfilled', name: 'Items Fulfilled', type: 'number', sortable: true, filterable: true },
  fulfillmentRate: { id: 'fulfillmentRate', name: 'Fulfillment Rate', type: 'percentage', sortable: true, filterable: true },
  avgLeadTime: { id: 'avgLeadTime', name: 'Avg Lead Time (days)', type: 'number', sortable: true, filterable: true },
  onTimeDelivery: { id: 'onTimeDelivery', name: 'On-Time Delivery %', type: 'percentage', sortable: true, filterable: true },
  
  // Status columns
  status: { id: 'status', name: 'Stock Status', type: 'text', sortable: true, filterable: true }
};

// Filter Definitions
export const filterDefinitions = {
  dateRange: {
    id: 'dateRange',
    name: 'Date Range',
    type: 'daterange',
    options: [
      { id: 'today', name: 'Today' },
      { id: 'yesterday', name: 'Yesterday' },
      { id: 'thisWeek', name: 'This Week' },
      { id: 'lastWeek', name: 'Last Week' },
      { id: 'thisMonth', name: 'This Month' },
      { id: 'lastMonth', name: 'Last Month' },
      { id: 'thisQuarter', name: 'This Quarter' },
      { id: 'lastQuarter', name: 'Last Quarter' },
      { id: 'thisYear', name: 'This Year' },
      { id: 'lastYear', name: 'Last Year' },
      { id: 'custom', name: 'Custom Range' }
    ]
  },
  location: {
    id: 'location',
    name: 'Location',
    type: 'multiselect',
    options: [
      { id: 'all', name: 'All Locations' },
      { id: 'warehouse-a', name: 'Warehouse A' },
      { id: 'secure-storage-b', name: 'Secure Storage B' },
      { id: 'tool-storage', name: 'Tool Storage' }
    ]
  },
  category: {
    id: 'category',
    name: 'Category',
    type: 'multiselect',
    options: [
      { id: 'all', name: 'All Categories' },
      { id: 'cabling', name: 'Cabling' },
      { id: 'cpe', name: 'Customer Premise Equipment' },
      { id: 'tools', name: 'Tools' },
      { id: 'power', name: 'Power Equipment' },
      { id: 'network', name: 'Network Termination' }
    ]
  },
  supplier: {
    id: 'supplier',
    name: 'Supplier',
    type: 'multiselect',
    options: [
      { id: 'all', name: 'All Suppliers' },
      { id: 'fibertech', name: 'FiberTech Solutions' },
      { id: 'netgear', name: 'NetGear Inc.' },
      { id: 'techtools', name: 'TechTools Ltd' },
      { id: 'powersafe', name: 'PowerSafe Systems' },
      { id: 'huawei', name: 'Huawei Technologies' },
      { id: 'cisco', name: 'Cisco Systems' },
      { id: 'cablepro', name: 'CablePro Ltd' },
      { id: 'ubiquiti', name: 'Ubiquiti Networks' }
    ]
  },
  transactionType: {
    id: 'transactionType',
    name: 'Transaction Type',
    type: 'multiselect',
    options: [
      { id: 'all', name: 'All Transactions' },
      { id: 'purchase', name: 'Purchase Order' },
      { id: 'sale', name: 'Sale Order' },
      { id: 'return', name: 'Return' },
      { id: 'transfer', name: 'Stock Transfer' },
      { id: 'adjustment', name: 'Stock Adjustment' }
    ]
  },
  valueRange: {
    id: 'valueRange',
    name: 'Value Range',
    type: 'range',
    min: 0,
    max: 10000
  },
  status: {
    id: 'status',
    name: 'Stock Status',
    type: 'multiselect',
    options: [
      { id: 'all', name: 'All Statuses' },
      { id: 'in_stock', name: 'In Stock' },
      { id: 'low_stock', name: 'Low Stock' },
      { id: 'overstock', name: 'Overstock' },
      { id: 'out_of_stock', name: 'Out of Stock' }
    ]
  },
  minStockLevel: {
    id: 'minStockLevel',
    name: 'Min Stock Level',
    type: 'range',
    min: 0,
    max: 100
  },
  turnoverThreshold: {
    id: 'turnoverThreshold',
    name: 'Turnover Threshold',
    type: 'range',
    min: 0,
    max: 20
  },
  agingBuckets: {
    id: 'agingBuckets',
    name: 'Aging Buckets',
    type: 'multiselect',
    options: [
      { id: '0-30', name: '0-30 days' },
      { id: '31-60', name: '31-60 days' },
      { id: '61-90', name: '61-90 days' },
      { id: '91-180', name: '91-180 days' },
      { id: '181-365', name: '181-365 days' },
      { id: '365+', name: 'Over 365 days' }
    ]
  },
  fulfillmentThreshold: {
    id: 'fulfillmentThreshold',
    name: 'Fulfillment Threshold',
    type: 'range',
    min: 0,
    max: 100
  },
  leadTimeThreshold: {
    id: 'leadTimeThreshold',
    name: 'Lead Time Threshold',
    type: 'range',
    min: 0,
    max: 30
  },
  salesThreshold: {
    id: 'salesThreshold',
    name: 'Sales Threshold',
    type: 'range',
    min: 0,
    max: 10000
  }
};

// User defined saved reports
export const savedReports = [
  {
    id: 1,
    name: 'Monthly Inventory Valuation',
    templateId: 'inventory-valuation',
    description: 'Monthly snapshot of inventory value for finance department',
    createdBy: 'admin',
    createdOn: '2023-05-12T10:30:00Z',
    lastModified: '2023-07-18T14:45:00Z',
    isShared: true,
    schedule: {
      frequency: 'monthly',
      day: 1, // 1st day of the month
      time: '01:00', // 1 AM server time
      nextRun: '2023-08-01T01:00:00Z'
    },
    filters: {
      location: ['all'],
      category: ['all']
    },
    columns: ['sku', 'name', 'category', 'location', 'quantity', 'unitCost', 'totalValue'],
    sortBy: 'totalValue',
    sortDirection: 'desc',
    recipients: [
      'finance@example.com',
      'inventory@example.com'
    ],
    exportFormat: 'xlsx'
  },
  {
    id: 2,
    name: 'Weekly Stock Level Alert',
    templateId: 'overstock-understock',
    description: 'Weekly report of items requiring attention (low stock or overstock)',
    createdBy: 'warehouse_manager',
    createdOn: '2023-03-10T09:15:00Z',
    lastModified: '2023-07-20T11:20:00Z',
    isShared: true,
    schedule: {
      frequency: 'weekly',
      day: 1, // Monday
      time: '08:00', // 8 AM server time
      nextRun: '2023-07-31T08:00:00Z'
    },
    filters: {
      location: ['warehouse-a', 'secure-storage-b'],
      status: ['low_stock', 'out_of_stock', 'overstock']
    },
    columns: ['sku', 'name', 'category', 'location', 'quantity', 'minStockLevel', 'maxStockLevel', 'status'],
    sortBy: 'status',
    sortDirection: 'asc',
    recipients: [
      'procurement@example.com',
      'warehouse@example.com'
    ],
    exportFormat: 'pdf'
  },
  {
    id: 3,
    name: 'Quarterly Supplier Performance',
    templateId: 'supplier-performance',
    description: 'Quarterly review of supplier performance metrics',
    createdBy: 'procurement_manager',
    createdOn: '2023-01-15T14:00:00Z',
    lastModified: '2023-07-01T16:30:00Z',
    isShared: true,
    schedule: {
      frequency: 'quarterly',
      day: 5, // 5th day of the first month in quarter
      time: '09:00', // 9 AM server time
      nextRun: '2023-10-05T09:00:00Z'
    },
    filters: {
      dateRange: { preset: 'lastQuarter' },
      supplier: ['all']
    },
    columns: ['supplier', 'orderCount', 'itemsOrdered', 'itemsFulfilled', 'fulfillmentRate', 'avgLeadTime', 'onTimeDelivery'],
    sortBy: 'fulfillmentRate',
    sortDirection: 'desc',
    recipients: [
      'procurement@example.com',
      'management@example.com'
    ],
    exportFormat: 'xlsx'
  },
  {
    id: 4,
    name: 'Daily Stock Movement',
    templateId: 'stock-movement',
    description: 'Daily summary of all stock movements',
    createdBy: 'inventory_clerk',
    createdOn: '2023-06-01T08:45:00Z',
    lastModified: '2023-07-15T10:10:00Z',
    isShared: false,
    schedule: {
      frequency: 'daily',
      time: '23:00', // 11 PM server time
      nextRun: '2023-07-30T23:00:00Z'
    },
    filters: {
      dateRange: { preset: 'today' },
      location: ['all'],
      transactionType: ['all']
    },
    columns: ['date', 'sku', 'name', 'transactionType', 'quantity', 'location', 'reference'],
    sortBy: 'date',
    sortDirection: 'desc',
    recipients: [
      'warehouse@example.com'
    ],
    exportFormat: 'csv'
  },
  {
    id: 5,
    name: 'Cable Products Analysis',
    templateId: 'sales-vs-inventory',
    description: 'Custom report analyzing sales and inventory for cable products',
    createdBy: 'sales_manager',
    createdOn: '2023-04-20T15:30:00Z',
    lastModified: '2023-07-10T09:45:00Z',
    isShared: true,
    schedule: {
      frequency: 'monthly',
      day: 15, // 15th day of the month
      time: '07:00', // 7 AM server time
      nextRun: '2023-08-15T07:00:00Z'
    },
    filters: {
      dateRange: { preset: 'lastMonth' },
      category: ['cabling'],
      location: ['all']
    },
    columns: ['sku', 'name', 'quantitySold', 'salesRevenue', 'currentStock', 'stockValue', 'turnoverRate'],
    sortBy: 'salesRevenue',
    sortDirection: 'desc',
    recipients: [
      'sales@example.com',
      'product@example.com'
    ],
    exportFormat: 'xlsx'
  }
];

// Report execution history
export const reportExecutions = [
  {
    id: 101,
    reportId: 1,
    executedOn: '2023-07-01T01:00:03Z',
    status: 'completed',
    executionTime: 3.2, // seconds
    rowCount: 152,
    fileName: 'Monthly_Inventory_Valuation_2023-07-01.xlsx',
    fileSize: 245760, // bytes
    executedBy: 'system',
    sentTo: ['finance@example.com', 'inventory@example.com'],
    downloadUrl: '/reports/download/101'
  },
  {
    id: 102,
    reportId: 1,
    executedOn: '2023-06-01T01:00:05Z',
    status: 'completed',
    executionTime: 3.5, // seconds
    rowCount: 148,
    fileName: 'Monthly_Inventory_Valuation_2023-06-01.xlsx',
    fileSize: 240640, // bytes
    executedBy: 'system',
    sentTo: ['finance@example.com', 'inventory@example.com'],
    downloadUrl: '/reports/download/102'
  },
  {
    id: 103,
    reportId: 2,
    executedOn: '2023-07-24T08:00:02Z',
    status: 'completed',
    executionTime: 2.1, // seconds
    rowCount: 12,
    fileName: 'Weekly_Stock_Level_Alert_2023-07-24.pdf',
    fileSize: 128500, // bytes
    executedBy: 'system',
    sentTo: ['procurement@example.com', 'warehouse@example.com'],
    downloadUrl: '/reports/download/103'
  },
  {
    id: 104,
    reportId: 2,
    executedOn: '2023-07-17T08:00:03Z',
    status: 'completed',
    executionTime: 2.3, // seconds
    rowCount: 15,
    fileName: 'Weekly_Stock_Level_Alert_2023-07-17.pdf',
    fileSize: 135200, // bytes
    executedBy: 'system',
    sentTo: ['procurement@example.com', 'warehouse@example.com'],
    downloadUrl: '/reports/download/104'
  },
  {
    id: 105,
    reportId: 3,
    executedOn: '2023-07-05T09:00:04Z',
    status: 'completed',
    executionTime: 4.7, // seconds
    rowCount: 8,
    fileName: 'Quarterly_Supplier_Performance_Q2_2023.xlsx',
    fileSize: 185344, // bytes
    executedBy: 'system',
    sentTo: ['procurement@example.com', 'management@example.com'],
    downloadUrl: '/reports/download/105'
  },
  {
    id: 106,
    reportId: 4,
    executedOn: '2023-07-29T23:00:01Z',
    status: 'completed',
    executionTime: 1.8, // seconds
    rowCount: 34,
    fileName: 'Daily_Stock_Movement_2023-07-29.csv',
    fileSize: 12288, // bytes
    executedBy: 'system',
    sentTo: ['warehouse@example.com'],
    downloadUrl: '/reports/download/106'
  },
  {
    id: 107,
    reportId: 4,
    executedOn: '2023-07-28T23:00:02Z',
    status: 'completed',
    executionTime: 1.9, // seconds
    rowCount: 28,
    fileName: 'Daily_Stock_Movement_2023-07-28.csv',
    fileSize: 10240, // bytes
    executedBy: 'system',
    sentTo: ['warehouse@example.com'],
    downloadUrl: '/reports/download/107'
  },
  {
    id: 108,
    reportId: 5,
    executedOn: '2023-07-15T07:00:05Z',
    status: 'completed',
    executionTime: 3.1, // seconds
    rowCount: 32,
    fileName: 'Cable_Products_Analysis_2023-07-15.xlsx',
    fileSize: 165888, // bytes
    executedBy: 'system',
    sentTo: ['sales@example.com', 'product@example.com'],
    downloadUrl: '/reports/download/108'
  },
  {
    id: 109,
    reportId: 1,
    executedOn: '2023-07-25T14:32:12Z',
    status: 'completed',
    executionTime: 3.4, // seconds
    rowCount: 152,
    fileName: 'Monthly_Inventory_Valuation_2023-07-25.xlsx',
    fileSize: 248832, // bytes
    executedBy: 'admin',
    sentTo: [],
    downloadUrl: '/reports/download/109'
  },
  {
    id: 110,
    reportId: 3,
    executedOn: '2023-07-26T10:15:33Z',
    status: 'failed',
    executionTime: 5.2, // seconds
    errorMessage: 'Database connection timeout after 5 seconds',
    executedBy: 'procurement_manager',
    sentTo: [],
    downloadUrl: null
  }
];

// Sample report data (actual rows that would be returned)
export const sampleReportData = {
  'inventory-valuation': [
    { sku: 'FB-CBL-50M', name: 'Fiber Optic Cable (50m)', category: 'Cabling', location: 'Warehouse A', quantity: 45, unitCost: 85.50, totalValue: 3847.50 },
    { sku: 'WF-RT-6', name: 'Wi-Fi 6 Router', category: 'Customer Premise Equipment', location: 'Warehouse A', quantity: 32, unitCost: 120.75, totalValue: 3864.00 },
    { sku: 'FB-SPL-KT', name: 'Fiber Splice Kit', category: 'Tools', location: 'Tool Storage', quantity: 4, unitCost: 350.00, totalValue: 1400.00 },
    { sku: 'UPS-500', name: 'Backup UPS System', category: 'Power Equipment', location: 'Secure Storage B', quantity: 1, unitCost: 450.25, totalValue: 450.25 },
    { sku: 'FB-ONT-R', name: 'Residential Fiber ONT', category: 'Network Termination', location: 'Warehouse A', quantity: 28, unitCost: 95.00, totalValue: 2660.00 },
    { sku: 'BUS-RT-1', name: 'Business-class Router', category: 'Customer Premise Equipment', location: 'Secure Storage B', quantity: 12, unitCost: 280.50, totalValue: 3366.00 },
    { sku: 'FB-PCH-2M', name: 'Fiber Patch Cable (2m)', category: 'Cabling', location: 'Warehouse A', quantity: 65, unitCost: 15.25, totalValue: 991.25 },
    { sku: 'SIG-ANZ', name: 'Signal Analyzer', category: 'Tools', location: 'Tool Storage', quantity: 3, unitCost: 1250.00, totalValue: 3750.00 },
    { sku: 'NW-SWTCH', name: 'Managed Network Switch', category: 'Network Termination', location: 'Secure Storage B', quantity: 8, unitCost: 350.00, totalValue: 2800.00 },
    { sku: 'ENT-AP-1', name: 'Enterprise Access Point', category: 'Customer Premise Equipment', location: 'Warehouse A', quantity: 15, unitCost: 180.50, totalValue: 2707.50 }
  ],
  'overstock-understock': [
    { sku: 'FB-SPL-KT', name: 'Fiber Splice Kit', category: 'Tools', location: 'Tool Storage', quantity: 4, minStockLevel: 5, maxStockLevel: 10, status: 'low_stock' },
    { sku: 'UPS-500', name: 'Backup UPS System', category: 'Power Equipment', location: 'Secure Storage B', quantity: 1, minStockLevel: 2, maxStockLevel: 5, status: 'low_stock' },
    { sku: 'CBL-TST', name: 'Cable Tester', category: 'Tools', location: 'Tool Storage', quantity: 2, minStockLevel: 3, maxStockLevel: 6, status: 'low_stock' },
    { sku: 'FB-CBL-50M', name: 'Fiber Optic Cable (50m)', category: 'Cabling', location: 'Warehouse A', quantity: 45, minStockLevel: 20, maxStockLevel: 40, status: 'overstock' },
    { sku: 'FB-PCH-2M', name: 'Fiber Patch Cable (2m)', category: 'Cabling', location: 'Warehouse A', quantity: 65, minStockLevel: 30, maxStockLevel: 60, status: 'overstock' }
  ],
  'supplier-performance': [
    { supplier: 'FiberTech Solutions', orderCount: 12, itemsOrdered: 342, itemsFulfilled: 328, fulfillmentRate: 95.9, avgLeadTime: 4.2, onTimeDelivery: 91.7 },
    { supplier: 'NetGear Inc.', orderCount: 8, itemsOrdered: 187, itemsFulfilled: 173, fulfillmentRate: 92.5, avgLeadTime: 2.8, onTimeDelivery: 87.5 },
    { supplier: 'TechTools Ltd', orderCount: 5, itemsOrdered: 43, itemsFulfilled: 41, fulfillmentRate: 95.3, avgLeadTime: 3.5, onTimeDelivery: 80.0 },
    { supplier: 'PowerSafe Systems', orderCount: 3, itemsOrdered: 12, itemsFulfilled: 11, fulfillmentRate: 91.7, avgLeadTime: 5.1, onTimeDelivery: 66.7 },
    { supplier: 'Huawei Technologies', orderCount: 7, itemsOrdered: 205, itemsFulfilled: 198, fulfillmentRate: 96.6, avgLeadTime: 3.2, onTimeDelivery: 85.7 },
    { supplier: 'Cisco Systems', orderCount: 6, itemsOrdered: 97, itemsFulfilled: 95, fulfillmentRate: 97.9, avgLeadTime: 3.9, onTimeDelivery: 83.3 },
    { supplier: 'CablePro Ltd', orderCount: 9, itemsOrdered: 254, itemsFulfilled: 249, fulfillmentRate: 98.0, avgLeadTime: 2.5, onTimeDelivery: 88.9 },
    { supplier: 'Ubiquiti Networks', orderCount: 4, itemsOrdered: 85, itemsFulfilled: 82, fulfillmentRate: 96.5, avgLeadTime: 3.1, onTimeDelivery: 75.0 }
  ]
};

// System roles and report access
export const reportAccessRoles = [
  {
    role: 'admin',
    permissions: {
      create: true,
      view: 'all',
      edit: 'all',
      delete: 'all',
      schedule: true,
      export: ['pdf', 'xlsx', 'csv'],
      share: true
    }
  },
  {
    role: 'manager',
    permissions: {
      create: true,
      view: 'all',
      edit: 'owned',
      delete: 'owned',
      schedule: true,
      export: ['pdf', 'xlsx', 'csv'],
      share: true
    }
  },
  {
    role: 'inventory_clerk',
    permissions: {
      create: true,
      view: ['inventory-valuation', 'stock-movement', 'stock-aging', 'overstock-understock'],
      edit: 'owned',
      delete: 'none',
      schedule: true,
      export: ['pdf', 'xlsx', 'csv'],
      share: false
    }
  },
  {
    role: 'sales_staff',
    permissions: {
      create: false,
      view: ['sales-vs-inventory'],
      edit: 'none',
      delete: 'none',
      schedule: false,
      export: ['pdf', 'xlsx'],
      share: false
    }
  }
];

// Export formats
export const exportFormats = [
  {
    id: 'pdf',
    name: 'PDF Document',
    extension: '.pdf',
    icon: 'FileText',
    supportsPrinting: true,
    supportsInteractive: false,
    supportsFilters: false
  },
  {
    id: 'xlsx',
    name: 'Excel Spreadsheet',
    extension: '.xlsx',
    icon: 'Table',
    supportsPrinting: true,
    supportsInteractive: true,
    supportsFilters: true
  },
  {
    id: 'csv',
    name: 'CSV File',
    extension: '.csv',
    icon: 'Database',
    supportsPrinting: false,
    supportsInteractive: false,
    supportsFilters: false
  }
];