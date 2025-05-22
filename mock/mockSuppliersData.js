// Make sure the mockSuppliers array is defined and exported
export const mockSuppliers = [
  {
    id: 'sup-001',
    name: 'Acme Supply Co',
    code: 'ASC',
    contactPerson: 'John Smith',
    email: 'john@acmesupply.com',
    phone: '555-123-4567',
    address: {
      street: '123 Main St',
      city: 'Metropolis',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    },
    paymentTerms: 'Net 30',
    currency: 'USD',
    accountNumber: 'ACM-12345',
    taxId: '12-3456789',
    minOrderValue: 100.00,
    leadTime: 5,
    status: 'active',
    notes: 'Preferred supplier for widgets and gadgets',
    rating: 4,
    categories: ['widgets', 'gadgets', 'components'],
    primaryCategory: 'widgets',
    createdAt: '2024-11-15T10:20:30Z',
    updatedAt: '2025-01-10T14:35:20Z'
  },
  {
    id: 'sup-002',
    name: 'Component World',
    code: 'CW',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@componentworld.com',
    phone: '555-987-6543',
    address: {
      street: '456 Tech Ave',
      city: 'Silicon Valley',
      state: 'CA',
      postalCode: '94025',
      country: 'USA'
    },
    paymentTerms: 'Net 45',
    currency: 'USD',
    accountNumber: 'CW-67890',
    taxId: '98-7654321',
    minOrderValue: 250.00,
    leadTime: 7,
    status: 'active',
    notes: 'Specialized in electronic components',
    rating: 5,
    categories: ['components', 'electronics', 'circuit_boards'],
    primaryCategory: 'electronics',
    createdAt: '2024-12-05T09:15:45Z',
    updatedAt: '2025-02-18T11:30:15Z'
  },
  {
    id: 'sup-003',
    name: 'Global Materials Inc',
    code: 'GMI',
    contactPerson: 'David Lee',
    email: 'david@globalmaterials.com',
    phone: '555-456-7890',
    address: {
      street: '789 Industrial Pkwy',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60007',
      country: 'USA'
    },
    paymentTerms: 'Net 60',
    currency: 'USD',
    accountNumber: 'GMI-24680',
    taxId: '56-7890123',
    minOrderValue: 500.00,
    leadTime: 10,
    status: 'active',
    notes: 'Bulk raw materials supplier',
    rating: 4,
    categories: ['raw_materials', 'metals', 'plastics'],
    primaryCategory: 'raw_materials',
    createdAt: '2025-01-12T11:40:20Z',
    updatedAt: '2025-03-05T16:25:40Z'
  },
  {
    id: 'sup-004',
    name: 'QuickShip Logistics',
    code: 'QSL',
    contactPerson: 'Maria Garcia',
    email: 'maria@quickship.com',
    phone: '555-789-0123',
    address: {
      street: '101 Distribution Rd',
      city: 'Atlanta',
      state: 'GA',
      postalCode: '30301',
      country: 'USA'
    },
    paymentTerms: 'Net 15',
    currency: 'USD',
    accountNumber: 'QSL-13579',
    taxId: '34-5678901',
    minOrderValue: 0.00,
    leadTime: 2,
    status: 'active',
    notes: 'Fast shipping supplies and packaging materials',
    rating: 3,
    categories: ['packaging', 'shipping_supplies', 'labels'],
    primaryCategory: 'packaging',
    createdAt: '2025-02-08T14:50:30Z',
    updatedAt: '2025-02-08T14:50:30Z'
  },
  {
    id: 'sup-005',
    name: 'Precision Tools Ltd',
    code: 'PTL',
    contactPerson: 'Robert Chen',
    email: 'robert@precisiontools.com',
    phone: '555-321-6549',
    address: {
      street: '222 Craftsman Blvd',
      city: 'Pittsburgh',
      state: 'PA',
      postalCode: '15201',
      country: 'USA'
    },
    paymentTerms: 'Net 30',
    currency: 'USD',
    accountNumber: 'PTL-97531',
    taxId: '45-6789012',
    minOrderValue: 150.00,
    leadTime: 8,
    status: 'inactive',
    notes: 'High-quality specialized tools',
    rating: 5,
    categories: ['tools', 'equipment', 'maintenance'],
    primaryCategory: 'tools',
    createdAt: '2024-10-25T08:35:15Z',
    updatedAt: '2025-03-10T13:45:25Z'
  },
  {
    id: 'sup-006',
    name: 'EcoPackage Solutions',
    code: 'EPS',
    contactPerson: 'Jasmine Patel',
    email: 'jasmine@ecopackage.com',
    phone: '555-654-3210',
    address: {
      street: '333 Green Way',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      country: 'USA'
    },
    paymentTerms: 'Net 30',
    currency: 'USD',
    accountNumber: 'EPS-24680',
    taxId: '67-8901234',
    minOrderValue: 75.00,
    leadTime: 6,
    status: 'active',
    notes: 'Sustainable packaging solutions',
    rating: 4,
    categories: ['packaging', 'sustainable', 'eco_friendly'],
    primaryCategory: 'packaging',
    createdAt: '2025-01-30T15:25:10Z',
    updatedAt: '2025-02-28T10:15:45Z'
  },
  {
    id: 'sup-007',
    name: 'TechPro Electronics',
    code: 'TPE',
    contactPerson: 'Michael Wong',
    email: 'michael@techpro.com',
    phone: '555-987-1234',
    address: {
      street: '444 Innovation Dr',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'USA'
    },
    paymentTerms: 'Net 45',
    currency: 'USD',
    accountNumber: 'TPE-86420',
    taxId: '78-9012345',
    minOrderValue: 300.00,
    leadTime: 9,
    status: 'active',
    notes: 'Cutting-edge electronics and tech components',
    rating: 5,
    categories: ['electronics', 'circuit_boards', 'hardware'],
    primaryCategory: 'electronics',
    createdAt: '2024-12-18T13:10:50Z',
    updatedAt: '2025-03-15T09:40:30Z'
  },
  {
    id: 'sup-008',
    name: 'Industrial Hardware Inc',
    code: 'IHI',
    contactPerson: 'Thomas Wright',
    email: 'thomas@industrialhardware.com',
    phone: '555-369-8520',
    address: {
      street: '555 Factory Ln',
      city: 'Detroit',
      state: 'MI',
      postalCode: '48201',
      country: 'USA'
    },
    paymentTerms: 'Net 45',
    currency: 'USD',
    accountNumber: 'IHI-75319',
    taxId: '89-0123456',
    minOrderValue: 200.00,
    leadTime: 6,
    status: 'active',
    notes: 'Industrial hardware and construction supplies',
    rating: 3,
    categories: ['hardware', 'construction', 'industrial'],
    primaryCategory: 'hardware',
    createdAt: '2025-01-05T10:05:40Z',
    updatedAt: '2025-04-02T14:20:15Z'
  },
  {
    id: 'sup-009',
    name: 'Office Supply Depot',
    code: 'OSD',
    contactPerson: 'Lisa Anderson',
    email: 'lisa@officesupplydepot.com',
    phone: '555-753-9510',
    address: {
      street: '666 Business Park',
      city: 'Phoenix',
      state: 'AZ',
      postalCode: '85001',
      country: 'USA'
    },
    paymentTerms: 'Net 30',
    currency: 'USD',
    accountNumber: 'OSD-24680',
    taxId: '90-1234567',
    minOrderValue: 50.00,
    leadTime: 3,
    status: 'active',
    notes: 'Complete office supply solutions',
    rating: 4,
    categories: ['office_supplies', 'paper', 'stationery'],
    primaryCategory: 'office_supplies',
    createdAt: '2024-11-20T09:25:50Z',
    updatedAt: '2025-02-15T11:30:20Z'
  },
  {
    id: 'sup-010',
    name: 'FastTech Solutions',
    code: 'FTS',
    contactPerson: 'James Wilson',
    email: 'james@fasttechsolutions.com',
    phone: '555-159-7530',
    address: {
      street: '777 Tech Hub',
      city: 'Boston',
      state: 'MA',
      postalCode: '02108',
      country: 'USA'
    },
    paymentTerms: 'Net 15',
    currency: 'USD',
    accountNumber: 'FTS-13579',
    taxId: '01-2345678',
    minOrderValue: 100.00,
    leadTime: 4,
    status: 'inactive',
    notes: 'Rapid-delivery tech components',
    rating: 2,
    categories: ['electronics', 'components', 'accessories'],
    primaryCategory: 'electronics',
    createdAt: '2024-12-10T16:40:30Z',
    updatedAt: '2025-03-25T13:15:20Z'
  }
]

// Helper function to get a supplier by ID
export const getSupplierById = (id) => {
  return mockSuppliers.find(supplier => supplier.id === id)
}

// Helper function to get suppliers by category
export const getSuppliersByCategory = (category) => {
  return mockSuppliers.filter(supplier => 
    supplier.categories.includes(category) || supplier.primaryCategory === category
  )
}

// Helper function to get active suppliers
export const getActiveSuppliers = () => {
  return mockSuppliers.filter(supplier => supplier.status === 'active')
}

// Helper function to get preferred suppliers (rating >= 4)
export const getPreferredSuppliers = () => {
  return mockSuppliers.filter(supplier => 
    supplier.rating >= 4 && supplier.status === 'active'
  )
}