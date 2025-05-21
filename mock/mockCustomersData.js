/**
 * Mock data for customers and customer groups
 */
import { CustomerStatus, PaymentTermType } from '@/types/price-management/customers';

/**
 * Mock customer data
 */
export const mockCustomers = [
  {
    id: 'cust-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    company: 'Acme Corporation',
    groupId: 'group-001',
    tags: ['vip', 'wholesale'],
    status: CustomerStatus.ACTIVE,
    billingAddress: {
      line1: '123 Main Street',
      line2: 'Suite 100',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      isDefault: true
    },
    shippingAddress: {
      line1: '123 Main Street',
      line2: 'Suite 100',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      isDefault: true
    },
    notes: 'Key wholesale customer with monthly orders.',
    taxExempt: true,
    taxId: 'TX-12345',
    totalSpent: 58750.25,
    orderCount: 42,
    lastOrderDate: '2023-10-15T14:30:00Z',
    createdAt: '2021-03-10T09:15:22Z',
    updatedAt: '2023-10-15T14:30:00Z',
    paymentTerms: {
      type: PaymentTermType.NET,
      days: 30
    },
    creditLimit: 100000,
    accountManager: 'Sarah Johnson'
  },
  {
    id: 'cust-002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '555-987-6543',
    company: 'TechStart Inc.',
    groupId: 'group-002',
    tags: ['retail'],
    status: CustomerStatus.ACTIVE,
    billingAddress: {
      line1: '456 Technology Drive',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94107',
      country: 'USA',
      isDefault: true
    },
    shippingAddress: {
      line1: '789 Warehouse Blvd',
      city: 'Oakland',
      state: 'CA',
      postalCode: '94621',
      country: 'USA',
      isDefault: true
    },
    notes: 'Prefers email communication only.',
    taxExempt: false,
    totalSpent: 12430.75,
    orderCount: 17,
    lastOrderDate: '2023-11-02T10:45:00Z',
    createdAt: '2022-01-15T11:22:33Z',
    updatedAt: '2023-11-02T10:45:00Z',
    paymentTerms: {
      type: PaymentTermType.NET,
      days: 15
    },
    creditLimit: 25000,
    accountManager: 'Michael Brown'
  },
  {
    id: 'cust-003',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@example.com',
    phone: '555-333-7777',
    company: 'Johnson Distributors',
    groupId: 'group-001',
    tags: ['wholesale', 'international'],
    status: CustomerStatus.ACTIVE,
    billingAddress: {
      line1: '10 Commerce Street',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60604',
      country: 'USA',
      isDefault: true
    },
    shippingAddress: {
      line1: '10 Commerce Street',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60604',
      country: 'USA',
      isDefault: true
    },
    notes: 'Orders in bulk quarterly. Requires special packaging.',
    taxExempt: true,
    taxId: 'TX-67890',
    totalSpent: 129875.50,
    orderCount: 24,
    lastOrderDate: '2023-09-30T16:20:00Z',
    createdAt: '2021-06-22T14:30:45Z',
    updatedAt: '2023-09-30T16:20:00Z',
    paymentTerms: {
      type: PaymentTermType.NET,
      days: 45
    },
    creditLimit: 200000,
    accountManager: 'Sarah Johnson'
  },
  {
    id: 'cust-004',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@example.com',
    phone: '555-444-8888',
    company: 'Garcia Imports',
    groupId: 'group-003',
    tags: ['international', 'new'],
    status: CustomerStatus.PENDING,
    billingAddress: {
      line1: '123 Avenida Central',
      city: 'Mexico City',
      postalCode: '06000',
      country: 'Mexico',
      isDefault: true
    },
    shippingAddress: {
      line1: '123 Avenida Central',
      city: 'Mexico City',
      postalCode: '06000',
      country: 'Mexico',
      isDefault: true
    },
    notes: 'New international customer. Awaiting credit approval.',
    taxExempt: false,
    totalSpent: 0,
    orderCount: 0,
    createdAt: '2023-10-05T09:12:30Z',
    updatedAt: '2023-10-05T09:12:30Z',
    paymentTerms: {
      type: PaymentTermType.DUE_ON_RECEIPT
    },
    creditLimit: 10000,
    accountManager: 'David Wilson'
  },
  {
    id: 'cust-005',
    firstName: 'William',
    lastName: 'Chen',
    email: 'william.chen@example.com',
    phone: '555-222-9999',
    company: 'Chen Electronics',
    groupId: 'group-002',
    tags: ['retail', 'tech'],
    status: CustomerStatus.ACTIVE,
    billingAddress: {
      line1: '789 Market Street',
      city: 'Boston',
      state: 'MA',
      postalCode: '02109',
      country: 'USA',
      isDefault: true
    },
    shippingAddress: {
      line1: '789 Market Street',
      city: 'Boston',
      state: 'MA',
      postalCode: '02109',
      country: 'USA',
      isDefault: true
    },
    totalSpent: 8745.30,
    orderCount: 9,
    lastOrderDate: '2023-10-25T13:15:00Z',
    createdAt: '2022-08-14T10:30:00Z',
    updatedAt: '2023-10-25T13:15:00Z',
    paymentTerms: {
      type: PaymentTermType.NET,
      days: 30
    },
    creditLimit: 15000,
    accountManager: 'Michael Brown'
  },
  {
    id: 'cust-006',
    firstName: 'Emily',
    lastName: 'Taylor',
    email: 'emily.taylor@example.com',
    phone: '555-666-1234',
    groupId: 'group-005',
    tags: ['individual'],
    status: CustomerStatus.ACTIVE,
    billingAddress: {
      line1: '456 Oak Avenue',
      city: 'Portland',
      state: 'OR',
      postalCode: '97205',
      country: 'USA',
      isDefault: true
    },
    shippingAddress: {
      line1: '456 Oak Avenue',
      city: 'Portland',
      state: 'OR',
      postalCode: '97205',
      country: 'USA',
      isDefault: true
    },
    totalSpent: 2150.75,
    orderCount: 6,
    lastOrderDate: '2023-11-10T11:45:00Z',
    createdAt: '2023-01-20T15:45:20Z',
    updatedAt: '2023-11-10T11:45:00Z',
    paymentTerms: {
      type: PaymentTermType.DUE_ON_RECEIPT
    }
  },
  {
    id: 'cust-007',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@example.com',
    phone: '555-777-4321',
    company: 'Wilson Ventures',
    groupId: 'group-004',
    tags: ['investor', 'partner'],
    status: CustomerStatus.BLOCKED,
    statusReason: 'Payment issues - pending resolution',
    billingAddress: {
      line1: '567 Pine Street',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'USA',
      isDefault: true
    },
    shippingAddress: {
      line1: '567 Pine Street',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'USA',
      isDefault: true
    },
    notes: 'Account temporarily blocked due to payment issues.',
    totalSpent: 45320.80,
    orderCount: 22,
    lastOrderDate: '2023-08-05T09:30:00Z',
    createdAt: '2021-11-15T08:20:10Z',
    updatedAt: '2023-10-10T14:25:30Z',
    paymentTerms: {
      type: PaymentTermType.NET,
      days: 30
    },
    creditLimit: 50000,
    accountManager: 'Sarah Johnson'
  },
  {
    id: 'cust-008',
    firstName: 'Sophia',
    lastName: 'Martinez',
    email: 'sophia.martinez@example.com',
    phone: '555-888-3333',
    company: 'Martinez & Co',
    groupId: 'group-001',
    tags: ['wholesale', 'priority'],
    status: CustomerStatus.ACTIVE,
    billingAddress: {
      line1: '890 Broadway',
      line2: 'Floor 12',
      city: 'New York',
      state: 'NY',
      postalCode: '10003',
      country: 'USA',
      isDefault: true
    },
    shippingAddress: {
      line1: '567 Warehouse Road',
      city: 'Newark',
      state: 'NJ',
      postalCode: '07101',
      country: 'USA',
      isDefault: true
    },
    notes: 'Large wholesale customer with custom shipping requirements.',
    taxExempt: true,
    taxId: 'TX-24680',
    totalSpent: 287650.40,
    orderCount: 68,
    lastOrderDate: '2023-11-12T10:15:00Z',
    createdAt: '2020-05-18T11:30:45Z',
    updatedAt: '2023-11-12T10:15:00Z',
    paymentTerms: {
      type: PaymentTermType.NET,
      days: 60
    },
    creditLimit: 350000,
    accountManager: 'David Wilson'
  },
  {
    id: 'cust-009',
    firstName: 'Daniel',
    lastName: 'Brown',
    email: 'daniel.brown@example.com',
    phone: '555-999-6666',
    company: 'DB Supplies',
    groupId: 'group-002',
    tags: ['retail', 'seasonal'],
    status: CustomerStatus.INACTIVE,
    statusReason: 'Customer requested temporary suspension',
    billingAddress: {
      line1: '432 Maple Drive',
      city: 'Denver',
      state: 'CO',
      postalCode: '80202',
      country: 'USA',
      isDefault: true
    },
    shippingAddress: {
      line1: '432 Maple Drive',
      city: 'Denver',
      state: 'CO',
      postalCode: '80202',
      country: 'USA',
      isDefault: true
    },
    notes: 'Account temporarily inactive at customer request. Seasonal buyer.',
    totalSpent: 28450.25,
    orderCount: 14,
    lastOrderDate: '2023-06-20T15:45:00Z',
    createdAt: '2022-03-10T09:15:30Z',
    updatedAt: '2023-07-05T14:20:15Z',
    paymentTerms: {
      type: PaymentTermType.NET,
      days: 30
    },
    creditLimit: 40000,
    accountManager: 'Michael Brown'
  },
  {
    id: 'cust-010',
    firstName: 'Olivia',
    lastName: 'Lee',
    email: 'olivia.lee@example.com',
    phone: '555-111-2222',
    company: 'Lee Innovations',
    groupId: 'group-003',
    tags: ['tech', 'startup'],
    status: CustomerStatus.ACTIVE,
    billingAddress: {
      line1: '789 Tech Parkway',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'USA',
      isDefault: true
    },
    shippingAddress: {
      line1: '789 Tech Parkway',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'USA',
      isDefault: true
    },
    totalSpent: 15780.90,
    orderCount: 11,
    lastOrderDate: '2023-11-08T16:30:00Z',
    createdAt: '2022-09-25T13:45:10Z',
    updatedAt: '2023-11-08T16:30:00Z',
    paymentTerms: {
      type: PaymentTermType.NET,
      days: 15
    },
    creditLimit: 25000,
    accountManager: 'Sarah Johnson'
  }
];

/**
 * Mock customer groups data
 */
export const mockCustomerGroups = [
  {
    id: 'group-001',
    name: 'Wholesale Customers',
    description: 'Large volume business customers with special pricing',
    isDefault: false,
    customerCount: 3,
    discountType: 'percentage',
    discountValue: 15,
    minimumOrderAmount: 1000,
    taxExempt: true,
    paymentTerms: {
      type: PaymentTermType.NET,
      days: 30
    },
    pricingTier: 'wholesale',
    orderApprovalRequired: false,
    customerTags: ['wholesale', 'business'],
    createdAt: '2020-01-15T10:00:00Z',
    updatedAt: '2023-05-10T14:30:00Z'
  },
  {
    id: 'group-002',
    name: 'Retail Partners',
    description: 'Retail businesses that resell our products',
    isDefault: false,
    customerCount: 3,
    discountType: 'percentage',
    discountValue: 10,
    minimumOrderAmount: 500,
    taxExempt: false,
    paymentTerms: {
      type: PaymentTermType.NET,
      days: 15
    },
    pricingTier: 'retail',
    orderApprovalRequired: false,
    customerTags: ['retail', 'partner'],
    createdAt: '2020-02-20T11:15:00Z',
    updatedAt: '2023-06-15T09:45:00Z'
  },
  {
    id: 'group-003',
    name: 'International Customers',
    description: 'Customers outside the United States',
    isDefault: false,
    customerCount: 2,
    discountType: 'percentage',
    discountValue: 0,
    minimumOrderAmount: 1000,
    taxExempt: true,
    paymentTerms: {
      type: PaymentTermType.DUE_ON_RECEIPT
    },
    pricingTier: 'international',
    orderApprovalRequired: true,
    customerTags: ['international'],
    createdAt: '2021-03-10T14:30:00Z',
    updatedAt: '2023-04-05T10:20:00Z'
  },
  {
    id: 'group-004',
    name: 'VIP Customers',
    description: 'High-value customers with premium service',
    isDefault: false,
    customerCount: 1,
    discountType: 'percentage',
    discountValue: 20,
    minimumOrderAmount: 0,
    taxExempt: false,
    paymentTerms: {
      type: PaymentTermType.NET,
      days: 30
    },
    pricingTier: 'vip',
    orderApprovalRequired: false,
    customerTags: ['vip'],
    createdAt: '2021-06-15T09:00:00Z',
    updatedAt: '2023-07-20T11:30:00Z'
  },
  {
    id: 'group-005',
    name: 'Individual Customers',
    description: 'Default group for individual retail customers',
    isDefault: true,
    customerCount: 1,
    discountType: 'none',
    discountValue: 0,
    minimumOrderAmount: 0,
    taxExempt: false,
    paymentTerms: {
      type: PaymentTermType.DUE_ON_RECEIPT
    },
    pricingTier: 'retail',
    orderApprovalRequired: false,
    customerTags: ['individual'],
    createdAt: '2020-01-10T08:30:00Z',
    updatedAt: '2023-01-05T10:15:00Z'
  }
];

/**
 * Mock customer pricing overrides
 */
export const mockCustomerPricingOverrides = [
  {
    id: 'override-001',
    customerId: 'cust-001',
    productId: 'prod-001',
    price: 89.99,
    compareAtPrice: 99.99,
    startDate: '2023-01-01T00:00:00Z',
    endDate: null,
    isActive: true,
    createdAt: '2023-01-01T10:15:00Z',
    updatedAt: '2023-01-01T10:15:00Z'
  },
  {
    id: 'override-002',
    customerId: 'cust-001',
    productId: 'prod-002',
    price: 149.99,
    compareAtPrice: 179.99,
    startDate: '2023-01-01T00:00:00Z',
    endDate: null,
    isActive: true,
    createdAt: '2023-01-01T10:20:00Z',
    updatedAt: '2023-01-01T10:20:00Z'
  },
  {
    id: 'override-003',
    customerId: 'cust-003',
    productId: 'prod-001',
    price: 85.00,
    compareAtPrice: 99.99,
    startDate: '2023-02-15T00:00:00Z',
    endDate: null,
    isActive: true,
    createdAt: '2023-02-15T14:30:00Z',
    updatedAt: '2023-02-15T14:30:00Z'
  },
  {
    id: 'override-004',
    customerId: 'cust-003',
    productId: 'prod-003',
    price: 249.50,
    compareAtPrice: 299.99,
    startDate: '2023-02-15T00:00:00Z',
    endDate: null,
    isActive: true,
    createdAt: '2023-02-15T14:35:00Z',
    updatedAt: '2023-02-15T14:35:00Z'
  },
  {
    id: 'override-005',
    customerId: 'cust-008',
    productId: 'prod-004',
    price: 399.00,
    compareAtPrice: 449.99,
    startDate: '2023-03-10T00:00:00Z',
    endDate: '2023-12-31T23:59:59Z',
    isActive: true,
    createdAt: '2023-03-10T09:45:00Z',
    updatedAt: '2023-03-10T09:45:00Z'
  }
];

/**
 * Mock API implementations
 */
export const mockCustomersApi = {
  fetchCustomers: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: {
        success: true,
        data: {
          content: mockCustomers,
          totalItems: mockCustomers.length,
          totalPages: 1,
          currentPage: 1
        }
      }
    };
  },
  
  fetchCustomerGroups: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      data: {
        success: true,
        data: {
          content: mockCustomerGroups,
          totalItems: mockCustomerGroups.length,
          totalPages: 1,
          currentPage: 1
        }
      }
    };
  },
  
  getCustomerById: async (customerId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const customer = mockCustomers.find(c => c.id === customerId);
    
    if (!customer) {
      return {
        data: {
          success: false,
          message: `Customer with ID ${customerId} not found`
        }
      };
    }
    
    return {
      data: {
        success: true,
        data: customer
      }
    };
  },
  
  createCustomer: async (customerData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newCustomer = {
      id: `cust-${Date.now().toString().substr(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: CustomerStatus.ACTIVE,
      totalSpent: 0,
      orderCount: 0,
      ...customerData
    };
    
    return {
      data: {
        success: true,
        data: newCustomer,
        message: 'Customer created successfully'
      }
    };
  },
  
  updateCustomer: async (customerId, updates) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const customerIndex = mockCustomers.findIndex(c => c.id === customerId);
    
    if (customerIndex === -1) {
      return {
        data: {
          success: false,
          message: `Customer with ID ${customerId} not found`
        }
      };
    }
    
    const updatedCustomer = {
      ...mockCustomers[customerIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return {
      data: {
        success: true,
        data: updatedCustomer,
        message: 'Customer updated successfully'
      }
    };
  },
  
  deleteCustomer: async (customerId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const customerExists = mockCustomers.some(c => c.id === customerId);
    
    if (!customerExists) {
      return {
        data: {
          success: false,
          message: `Customer with ID ${customerId} not found`
        }
      };
    }
    
    return {
      data: {
        success: true,
        message: 'Customer deleted successfully'
      }
    };
  },
  
  updateCustomerStatus: async (customerId, status, reason) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const customerIndex = mockCustomers.findIndex(c => c.id === customerId);
    
    if (customerIndex === -1) {
      return {
        data: {
          success: false,
          message: `Customer with ID ${customerId} not found`
        }
      };
    }
    
    return {
      data: {
        success: true,
        data: {
          id: customerId,
          status,
          statusReason: reason,
          updatedAt: new Date().toISOString()
        },
        message: 'Customer status updated successfully'
      }
    };
  },
  
  bulkUpdateCustomers: async (customerIds, updates) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {
        success: true,
        data: {
          updatedCount: customerIds.length,
          updatedIds: customerIds
        },
        message: `Updated ${customerIds.length} customers successfully`
      }
    };
  },
  
  createCustomerGroup: async (groupData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newGroup = {
      id: `group-${Date.now().toString().substr(-6)}`,
      customerCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...groupData
    };
    
    return {
      data: {
        success: true,
        data: newGroup,
        message: 'Customer group created successfully'
      }
    };
  },
  
  updateCustomerGroup: async (groupId, updates) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const groupIndex = mockCustomerGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      return {
        data: {
          success: false,
          message: `Customer group with ID ${groupId} not found`
        }
      };
    }
    
    const updatedGroup = {
      ...mockCustomerGroups[groupIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return {
      data: {
        success: true,
        data: updatedGroup,
        message: 'Customer group updated successfully'
      }
    };
  },
  
  deleteCustomerGroup: async (groupId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const groupExists = mockCustomerGroups.some(g => g.id === groupId);
    
    if (!groupExists) {
      return {
        data: {
          success: false,
          message: `Customer group with ID ${groupId} not found`
        }
      };
    }
    
    return {
      data: {
        success: true,
        message: 'Customer group deleted successfully'
      }
    };
  },
  
  setDefaultCustomerGroup: async (groupId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const groupExists = mockCustomerGroups.some(g => g.id === groupId);
    
    if (!groupExists) {
      return {
        data: {
          success: false,
          message: `Customer group with ID ${groupId} not found`
        }
      };
    }
    
    return {
      data: {
        success: true,
        data: {
          id: groupId,
          isDefault: true
        },
        message: 'Default customer group set successfully'
      }
    };
  },
  
  assignCustomersToGroup: async (customerIds, groupId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const groupExists = mockCustomerGroups.some(g => g.id === groupId);
    
    if (!groupExists) {
      return {
        data: {
          success: false,
          message: `Customer group with ID ${groupId} not found`
        }
      };
    }
    
    return {
      data: {
        success: true,
        data: {
          groupId,
          assignedCount: customerIds.length,
          assignedCustomers: customerIds
        },
        message: `${customerIds.length} customers assigned to group successfully`
      }
    };
  },
  
  getCustomerPricingOverrides: async (customerId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const overrides = mockCustomerPricingOverrides.filter(o => o.customerId === customerId);
    
    return {
      data: {
        success: true,
        data: {
          content: overrides,
          totalItems: overrides.length,
          totalPages: 1,
          currentPage: 1
        }
      }
    };
  },
  
  createCustomerPricingOverride: async (overrideData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newOverride = {
      id: `override-${Date.now().toString().substr(-6)}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrideData
    };
    
    return {
      data: {
        success: true,
        data: newOverride,
        message: 'Price override created successfully'
      }
    };
  },
  
  updateCustomerPricingOverride: async (overrideId, updates) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const overrideIndex = mockCustomerPricingOverrides.findIndex(o => o.id === overrideId);
    
    if (overrideIndex === -1) {
      return {
        data: {
          success: false,
          message: `Price override with ID ${overrideId} not found`
        }
      };
    }
    
    const updatedOverride = {
      ...mockCustomerPricingOverrides[overrideIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return {
      data: {
        success: true,
        data: updatedOverride,
        message: 'Price override updated successfully'
      }
    };
  },
  
  deleteCustomerPricingOverride: async (overrideId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const overrideExists = mockCustomerPricingOverrides.some(o => o.id === overrideId);
    
    if (!overrideExists) {
      return {
        data: {
          success: false,
          message: `Price override with ID ${overrideId} not found`
        }
      };
    }
    
    return {
      data: {
        success: true,
        message: 'Price override deleted successfully'
      }
    };
  }
};