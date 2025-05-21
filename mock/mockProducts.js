// Mock product data for development
export const products = [
  {
    id: 'prod-1001',
    name: 'Wi-Fi 6 Router Pro',
    sku: 'WFR-001-PRO',
    description: 'High-performance Wi-Fi 6 router with 4x4 MIMO and multi-gig Ethernet ports.',
    price: 249.99,
    cost: 175.00,
    status: 'active',
    type: 'simple',
    categories: [1, 3], // IDs of categories
    images: [
      { id: 1, url: '/images/products/wifi-router-1.jpg', alt: 'Front view of Wi-Fi 6 router', isDefault: true },
      { id: 2, url: '/images/products/wifi-router-2.jpg', alt: 'Side view of Wi-Fi 6 router', isDefault: false },
      { id: 3, url: '/images/products/wifi-router-3.jpg', alt: 'Back ports of Wi-Fi 6 router', isDefault: false }
    ],
    stock: {
      quantity: 56,
      reserved: 4,
      available: 52,
      backorder: false
    },
    attributes: {
      color: 'Black',
      dimensions: '9.5 x 7.2 x 2.3 inches',
      weight: '2.1 lbs',
      wireless: 'Wi-Fi 6 (802.11ax)',
      ports: '1x 2.5GbE WAN, 4x 1GbE LAN, 1x USB 3.0'
    },
    seo: {
      title: 'Wi-Fi 6 Router Pro - Next-Gen Wireless Networking',
      metaDescription: 'Experience blazing-fast connectivity with our Wi-Fi 6 Router Pro. Perfect for smart homes and power users.',
      slug: 'wifi-6-router-pro'
    },
    createdAt: '2023-02-15T10:30:00Z',
    updatedAt: '2023-07-12T14:22:33Z',
    visibility: {
      webstore: true,
      b2bPortal: true,
      marketplace: true
    }
  },
  {
    id: 'prod-2001',
    name: 'Fiber Optic Media Converter',
    sku: 'FOMC-200',
    description: 'Converts between fiber optic and copper Ethernet connections with support for multiple standards.',
    price: 89.99,
    cost: 52.50,
    status: 'active',
    type: 'simple',
    categories: [2, 5],
    images: [
      { id: 4, url: '/images/products/media-converter-1.jpg', alt: 'Media converter front view', isDefault: true },
      { id: 5, url: '/images/products/media-converter-2.jpg', alt: 'Media converter ports', isDefault: false }
    ],
    stock: {
      quantity: 122,
      reserved: 18,
      available: 104,
      backorder: false
    },
    attributes: {
      color: 'Silver',
      dimensions: '5.2 x 3.4 x 1.1 inches',
      weight: '0.8 lbs',
      ports: '1x SC Fiber, 1x RJ-45 Ethernet'
    },
    seo: {
      title: 'Fiber Optic Media Converter - Network Extension Solution',
      metaDescription: 'Bridge the gap between fiber and copper networks with our reliable media converter.',
      slug: 'fiber-optic-media-converter'
    },
    createdAt: '2023-03-01T09:15:00Z',
    updatedAt: '2023-07-05T11:42:10Z',
    visibility: {
      webstore: true,
      b2bPortal: true,
      marketplace: false
    }
  },
  {
    id: 'prod-3001',
    name: 'Managed Network Switch 24-Port',
    sku: 'MNS-24G',
    description: 'Enterprise-grade 24-port Gigabit managed switch with advanced VLAN and QoS features.',
    price: 349.99,
    cost: 215.00,
    status: 'active',
    type: 'configurable',
    categories: [2],
    images: [
      { id: 6, url: '/images/products/switch-1.jpg', alt: 'Front view of 24-port switch', isDefault: true },
      { id: 7, url: '/images/products/switch-2.jpg', alt: 'Angled view of switch', isDefault: false },
      { id: 8, url: '/images/products/switch-3.jpg', alt: 'Switch in rack mount', isDefault: false }
    ],
    stock: {
      quantity: 32,
      reserved: 7,
      available: 25,
      backorder: true
    },
    variants: [
      {
        id: 301,
        sku: 'MNS-24G-POE',
        name: 'Managed Network Switch 24-Port with PoE',
        price: 499.99,
        cost: 320.00,
        attributes: {
          poe: 'Yes - 802.3at',
          totalPower: '380W'
        },
        stock: {
          quantity: 15,
          reserved: 4,
          available: 11
        }
      },
      {
        id: 302,
        sku: 'MNS-24G-NOPOE',
        name: 'Managed Network Switch 24-Port without PoE',
        price: 349.99,
        cost: 215.00,
        attributes: {
          poe: 'No',
          totalPower: 'N/A'
        },
        stock: {
          quantity: 17,
          reserved: 3,
          available: 14
        }
      }
    ],
    attributes: {
      color: 'Black',
      dimensions: '17.3 x 9.1 x 1.7 inches',
      weight: '7.3 lbs',
      ports: '24x 1GbE, 4x 10GbE SFP+',
      rackUnits: '1U'
    },
    seo: {
      title: 'Managed Network Switch 24-Port - Enterprise Networking',
      metaDescription: 'Boost your network infrastructure with our reliable 24-port managed Gigabit switch.',
      slug: 'managed-network-switch-24-port'
    },
    createdAt: '2022-11-20T14:20:00Z',
    updatedAt: '2023-06-28T09:33:45Z',
    visibility: {
      webstore: false,
      b2bPortal: true,
      marketplace: false
    }
  },
  {
    id: 'prod-4001',
    name: 'Fiber Optic Patch Cable',
    sku: 'FOPC-3M',
    description: 'High-quality single-mode fiber optic patch cable for reliable data transmission.',
    price: 18.99,
    cost: 7.25,
    status: 'active',
    type: 'configurable',
    categories: [4],
    images: [
      { id: 9, url: '/images/products/patch-cable-1.jpg', alt: 'Coiled fiber patch cable', isDefault: true },
      { id: 10, url: '/images/products/patch-cable-2.jpg', alt: 'Cable connector detail', isDefault: false }
    ],
    stock: {
      quantity: 240,
      reserved: 35,
      available: 205,
      backorder: false
    },
    variants: [
      {
        id: 401,
        sku: 'FOPC-1M',
        name: 'Fiber Optic Patch Cable - 1M',
        price: 14.99,
        cost: 5.75,
        attributes: {
          length: '1 meter',
          connectorType: 'LC to LC'
        },
        stock: {
          quantity: 80,
          reserved: 12,
          available: 68
        }
      },
      {
        id: 402,
        sku: 'FOPC-3M',
        name: 'Fiber Optic Patch Cable - 3M',
        price: 18.99,
        cost: 7.25,
        attributes: {
          length: '3 meters',
          connectorType: 'LC to LC'
        },
        stock: {
          quantity: 95,
          reserved: 15,
          available: 80
        }
      },
      {
        id: 403,
        sku: 'FOPC-5M',
        name: 'Fiber Optic Patch Cable - 5M',
        price: 22.99,
        cost: 8.50,
        attributes: {
          length: '5 meters',
          connectorType: 'LC to LC'
        },
        stock: {
          quantity: 65,
          reserved: 8,
          available: 57
        }
      }
    ],
    attributes: {
      fiberType: 'Single-mode',
      jacket: 'PVC',
      color: 'Yellow',
      standard: 'OS2'
    },
    seo: {
      title: 'Fiber Optic Patch Cable - Professional Network Connectivity',
      metaDescription: 'Connect your fiber network with our high-quality single-mode patch cables available in multiple lengths.',
      slug: 'fiber-optic-patch-cable'
    },
    createdAt: '2023-01-10T11:25:00Z',
    updatedAt: '2023-07-15T16:21:05Z',
    visibility: {
      webstore: true,
      b2bPortal: true,
      marketplace: true
    }
  },
  {
    id: 'prod-5001',
    name: 'Network Installation Tool Kit',
    sku: 'NITK-PRO',
    description: 'Complete professional tool kit for network cable installation and testing.',
    price: 199.99,
    cost: 120.00,
    status: 'active',
    type: 'bundle',
    categories: [6],
    images: [
      { id: 11, url: '/images/products/toolkit-1.jpg', alt: 'Complete tool kit case', isDefault: true },
      { id: 12, url: '/images/products/toolkit-2.jpg', alt: 'Open case showing tools', isDefault: false },
      { id: 13, url: '/images/products/toolkit-3.jpg', alt: 'Crimping tool closeup', isDefault: false }
    ],
    stock: {
      quantity: 28,
      reserved: 3,
      available: 25,
      backorder: false
    },
    bundleItems: [
      {
        productId: 501,
        sku: 'CRIMP-PRO',
        name: 'Professional Crimping Tool',
        quantity: 1,
        isRequired: true
      },
      {
        productId: 502,
        sku: 'CABTEST-BASIC',
        name: 'Cable Tester',
        quantity: 1,
        isRequired: true
      },
      {
        productId: 503,
        sku: 'PUNCHDOWN-TOOL',
        name: 'Punchdown Tool',
        quantity: 1,
        isRequired: true
      },
      {
        productId: 504,
        sku: 'WIRE-STRIPPER',
        name: 'Wire Stripper',
        quantity: 1,
        isRequired: true
      },
      {
        productId: 505,
        sku: 'RJ45-CONN-50',
        name: 'RJ-45 Connectors (50 pack)',
        quantity: 1,
        isRequired: false
      }
    ],
    attributes: {
      caseType: 'Hard Shell',
      dimensions: '15.0 x 10.0 x 4.5 inches',
      weight: '4.2 lbs',
      warranty: '2 years'
    },
    seo: {
      title: 'Network Installation Tool Kit - Professional Equipment',
      metaDescription: 'Get all the tools you need for professional network installation with our comprehensive kit.',
      slug: 'network-installation-tool-kit'
    },
    createdAt: '2022-09-05T13:45:00Z',
    updatedAt: '2023-05-12T10:15:40Z',
    visibility: {
      webstore: true,
      b2bPortal: true,
      marketplace: true
    }
  },
  {
    id: 'prod-6001',
    name: 'Enterprise Rack-Mount UPS',
    sku: 'UPS-1500VA',
    description: 'Reliable rack-mount UPS with 1500VA capacity and network management capabilities.',
    price: 699.99,
    cost: 450.00,
    status: 'active',
    type: 'simple',
    categories: [7],
    images: [
      { id: 14, url: '/images/products/ups-1.jpg', alt: 'Front view of rack-mount UPS', isDefault: true },
      { id: 15, url: '/images/products/ups-2.jpg', alt: 'Back view showing outlets', isDefault: false }
    ],
    stock: {
      quantity: 12,
      reserved: 2,
      available: 10,
      backorder: true
    },
    attributes: {
      capacity: '1500VA / 1350W',
      outlets: '8x IEC C13, 2x IEC C19',
      rackUnits: '2U',
      runtime: '11 min at full load, 27 min at half load',
      networkInterface: 'Yes, RJ-45 Ethernet'
    },
    seo: {
      title: 'Enterprise Rack-Mount UPS - Network Power Protection',
      metaDescription: 'Protect your critical network infrastructure with our reliable rack-mountable UPS system.',
      slug: 'enterprise-rack-mount-ups'
    },
    createdAt: '2022-11-01T10:05:00Z',
    updatedAt: '2023-04-20T15:30:22Z',
    visibility: {
      webstore: false,
      b2bPortal: true,
      marketplace: false
    }
  },
  {
    id: 'prod-7001',
    name: 'Residential Fiber ONT',
    sku: 'FONT-RES-1G',
    description: 'Compact fiber optic network terminal for residential FTTH installations.',
    price: 79.99,
    cost: 48.50,
    status: 'active',
    type: 'simple',
    categories: [2, 8],
    images: [
      { id: 16, url: '/images/products/ont-1.jpg', alt: 'Front view of ONT', isDefault: true },
      { id: 17, url: '/images/products/ont-2.jpg', alt: 'Side view showing ports', isDefault: false }
    ],
    stock: {
      quantity: 85,
      reserved: 22,
      available: 63,
      backorder: false
    },
    attributes: {
      color: 'White',
      dimensions: '8.5 x 5.2 x 1.5 inches',
      weight: '0.95 lbs',
      ports: '4x 1GbE LAN, 2x Phone (RJ-11), 1x SC/APC Fiber',
      wifi: 'Dual-band 802.11ac'
    },
    seo: {
      title: 'Residential Fiber ONT - FTTH Network Terminal',
      metaDescription: 'Connect your home to fiber internet with our easy-to-install fiber optic network terminal.',
      slug: 'residential-fiber-ont'
    },
    createdAt: '2023-01-18T09:40:00Z',
    updatedAt: '2023-06-05T12:10:55Z',
    visibility: {
      webstore: true,
      b2bPortal: true,
      marketplace: true
    }
  },
  {
    id: 'prod-8001',
    name: 'Cat6A Ethernet Cable',
    sku: 'CAT6A-50FT',
    description: 'High-performance Cat6A Ethernet cable for 10Gbps networks with enhanced shielding.',
    price: 24.99,
    cost: 10.75,
    status: 'active',
    type: 'configurable',
    categories: [4],
    images: [
      { id: 18, url: '/images/products/ethernet-cable-1.jpg', alt: 'Coiled ethernet cable', isDefault: true },
      { id: 19, url: '/images/products/ethernet-cable-2.jpg', alt: 'Cable connector detail', isDefault: false }
    ],
    stock: {
      quantity: 350,
      reserved: 42,
      available: 308,
      backorder: false
    },
    variants: [
      {
        id: 801,
        sku: 'CAT6A-10FT',
        name: 'Cat6A Ethernet Cable - 10ft',
        price: 14.99,
        cost: 6.25,
        attributes: {
          length: '10 feet',
          color: 'Blue'
        },
        stock: {
          quantity: 120,
          reserved: 15,
          available: 105
        }
      },
      {
        id: 802,
        sku: 'CAT6A-25FT',
        name: 'Cat6A Ethernet Cable - 25ft',
        price: 19.99,
        cost: 8.50,
        attributes: {
          length: '25 feet',
          color: 'Blue'
        },
        stock: {
          quantity: 95,
          reserved: 12,
          available: 83
        }
      },
      {
        id: 803,
        sku: 'CAT6A-50FT',
        name: 'Cat6A Ethernet Cable - 50ft',
        price: 24.99,
        cost: 10.75,
        attributes: {
          length: '50 feet',
          color: 'Blue'
        },
        stock: {
          quantity: 85,
          reserved: 10,
          available: 75
        }
      },
      {
        id: 804,
        sku: 'CAT6A-100FT',
        name: 'Cat6A Ethernet Cable - 100ft',
        price: 39.99,
        cost: 18.25,
        attributes: {
          length: '100 feet',
          color: 'Blue'
        },
        stock: {
          quantity: 50,
          reserved: 5,
          available: 45
        }
      }
    ],
    attributes: {
      category: 'Cat6A',
      shielding: 'STP (Shielded Twisted Pair)',
      jacket: 'PVC',
      awg: '23 AWG',
      certification: 'ETL Verified'
    },
    seo: {
      title: 'Cat6A Ethernet Cable - High-Speed Network Connectivity',
      metaDescription: 'Ensure reliable 10Gbps network connectivity with our premium Cat6A Ethernet cables.',
      slug: 'cat6a-ethernet-cable'
    },
    createdAt: '2022-12-05T14:15:00Z',
    updatedAt: '2023-07-10T09:45:12Z',
    visibility: {
      webstore: true,
      b2bPortal: true,
      marketplace: true
    }
  }
];

// Mock categories data
export const categories = [
  {
    id: 1,
    name: 'Networking Equipment',
    slug: 'networking-equipment',
    description: 'Routers, switches, and network infrastructure devices',
    parent: null,
    children: [2, 3],
    image: '/images/categories/networking.jpg',
    products: 150,
    isActive: true,
    seo: {
      title: 'Networking Equipment - Professional & Home Networking Devices',
      metaDescription: 'Shop our range of professional networking equipment including routers, switches and more.'
    }
  },
  {
    id: 2,
    name: 'Network Switches',
    slug: 'network-switches',
    description: 'Managed and unmanaged network switches for all applications',
    parent: 1,
    children: [],
    image: '/images/categories/switches.jpg',
    products: 42,
    isActive: true,
    seo: {
      title: 'Network Switches - Managed & Unmanaged Ethernet Switches',
      metaDescription: 'Browse our selection of high-performance network switches for enterprise and home networks.'
    }
  },
  {
    id: 3,
    name: 'Wireless Networking',
    slug: 'wireless-networking',
    description: 'Wi-Fi routers, access points, and wireless infrastructure',
    parent: 1,
    children: [],
    image: '/images/categories/wireless.jpg',
    products: 37,
    isActive: true,
    seo: {
      title: 'Wireless Networking - Wi-Fi Solutions for Home & Business',
      metaDescription: 'Discover our range of wireless networking products for reliable Wi-Fi connectivity.'
    }
  },
  {
    id: 4,
    name: 'Cables & Connectivity',
    slug: 'cables-connectivity',
    description: 'Network cables, fiber optics, and connection accessories',
    parent: null,
    children: [],
    image: '/images/categories/cables.jpg',
    products: 86,
    isActive: true,
    seo: {
      title: 'Cables & Connectivity - Network & Fiber Optic Cabling',
      metaDescription: 'Find the right cables and connectivity solutions for your networking needs.'
    }
  },
  {
    id: 5,
    name: 'Media Converters & Transceivers',
    slug: 'media-converters-transceivers',
    description: 'Fiber to Ethernet converters, SFP modules, and network transceivers',
    parent: null,
    children: [],
    image: '/images/categories/converters.jpg',
    products: 28,
    isActive: true,
    seo: {
      title: 'Media Converters & Transceivers - Network Extension Solutions',
      metaDescription: 'Extend your network with our quality media converters and transceiver modules.'
    }
  },
  {
    id: 6,
    name: 'Network Tools',
    slug: 'network-tools',
    description: 'Installation, testing, and maintenance tools for network professionals',
    parent: null,
    children: [],
    image: '/images/categories/tools.jpg',
    products: 42,
    isActive: true,
    seo: {
      title: 'Network Tools - Professional Installation & Testing Equipment',
      metaDescription: 'Get the right tools for network installation, testing, and maintenance.'
    }
  },
  {
    id: 7,
    name: 'Power & Surge Protection',
    slug: 'power-surge-protection',
    description: 'UPS systems, PDUs, and surge protectors for network equipment',
    parent: null,
    children: [],
    image: '/images/categories/power.jpg',
    products: 24,
    isActive: true,
    seo: {
      title: 'Power & Surge Protection - Reliable Network Power Solutions',
      metaDescription: 'Protect your network investment with our power backup and surge protection products.'
    }
  },
  {
    id: 8,
    name: 'Fiber Optic Equipment',
    slug: 'fiber-optic-equipment',
    description: 'ONTs, OLTs, and fiber networking components',
    parent: null,
    children: [],
    image: '/images/categories/fiber.jpg',
    products: 32,
    isActive: true,
    seo: {
      title: 'Fiber Optic Equipment - FTTH & Enterprise Fiber Solutions',
      metaDescription: 'Build and maintain your fiber optic network with our specialized equipment.'
    }
  }
];

// Mock attributes data
export const attributes = [
  {
    id: 1,
    name: 'Color',
    code: 'color',
    type: 'select',
    required: false,
    visible: true,
    options: [
      { id: 101, value: 'Black', label: 'Black' },
      { id: 102, value: 'White', label: 'White' },
      { id: 103, value: 'Silver', label: 'Silver' },
      { id: 104, value: 'Blue', label: 'Blue' },
      { id: 105, value: 'Yellow', label: 'Yellow' }
    ]
  },
  {
    id: 2,
    name: 'Cable Length',
    code: 'length',
    type: 'select',
    required: true,
    visible: true,
    options: [
      { id: 201, value: '1m', label: '1 meter' },
      { id: 202, value: '3m', label: '3 meters' },
      { id: 203, value: '5m', label: '5 meters' },
      { id: 204, value: '10ft', label: '10 feet' },
      { id: 205, value: '25ft', label: '25 feet' },
      { id: 206, value: '50ft', label: '50 feet' },
      { id: 207, value: '100ft', label: '100 feet' }
    ]
  },
  {
    id: 3,
    name: 'Power over Ethernet',
    code: 'poe',
    type: 'boolean',
    required: false,
    visible: true,
    options: [
      { id: 301, value: '1', label: 'Yes' },
      { id: 302, value: '0', label: 'No' }
    ]
  },
  {
    id: 4,
    name: 'Wi-Fi Standard',
    code: 'wifi_standard',
    type: 'select',
    required: false,
    visible: true,
    options: [
      { id: 401, value: '802.11n', label: 'Wi-Fi 4 (802.11n)' },
      { id: 402, value: '802.11ac', label: 'Wi-Fi 5 (802.11ac)' },
      { id: 403, value: '802.11ax', label: 'Wi-Fi 6 (802.11ax)' },
      { id: 404, value: '802.11be', label: 'Wi-Fi 7 (802.11be)' }
    ]
  },
  {
    id: 5,
    name: 'Connector Type',
    code: 'connector_type',
    type: 'select',
    required: true,
    visible: true,
    options: [
      { id: 501, value: 'rj45', label: 'RJ-45' },
      { id: 502, value: 'lc_lc', label: 'LC to LC' },
      { id: 503, value: 'sc_sc', label: 'SC to SC' },
      { id: 504, value: 'lc_sc', label: 'LC to SC' },
      { id: 505, value: 'st_st', label: 'ST to ST' }
    ]
  },
  {
    id: 6,
    name: 'Speed Rating',
    code: 'speed',
    type: 'select',
    required: false,
    visible: true,
    options: [
      { id: 601, value: '100mbps', label: '100 Mbps' },
      { id: 602, value: '1gbps', label: '1 Gbps' },
      { id: 603, value: '10gbps', label: '10 Gbps' },
      { id: 604, value: '25gbps', label: '25 Gbps' },
      { id: 605, value: '40gbps', label: '40 Gbps' },
      { id: 606, value: '100gbps', label: '100 Gbps' }
    ]
  },
  {
    id: 7,
    name: 'Mounting Type',
    code: 'mounting',
    type: 'select',
    required: false,
    visible: true,
    options: [
      { id: 701, value: 'rackmount', label: 'Rack Mount' },
      { id: 702, value: 'wallmount', label: 'Wall Mount' },
      { id: 703, value: 'desktop', label: 'Desktop' },
      { id: 704, value: 'din_rail', label: 'DIN Rail' }
    ]
  }
];

// Mock product API responses
export const mockProductsApi = {
  fetchProducts: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: {
              content: products,
              totalElements: products.length,
              totalPages: 1,
              page: 0,
              size: 20
            }
          }
        });
      }, 500);
    });
  },
  
  fetchProduct: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = products.find(p => p.id === id);
        if (product) {
          resolve({ data: { data: product } });
        } else {
          reject({ response: { data: { message: 'Product not found' } } });
        }
      }, 300);
    });
  },
  
  createProduct: (product) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduct = {
          ...product,
          id: Math.max(...products.map(p => p.id)) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        resolve({ data: { data: newProduct } });
      }, 800);
    });
  },
  
  updateProduct: (id, product) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
          const updatedProduct = {
            ...product,
            updatedAt: new Date().toISOString()
          };
          resolve({ data: { data: updatedProduct } });
        } else {
          reject({ response: { data: { message: 'Product not found' } } });
        }
      }, 800);
    });
  },
  
  deleteProduct: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = products.find(p => p.id === id);
        if (product) {
          resolve({ data: { success: true } });
        } else {
          reject({ response: { data: { message: 'Product not found' } } });
        }
      }, 500);
    });
  },
  
  updateProductStatus: (id, status, reason) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = products.find(p => p.id === id);
        if (product) {
          resolve({ 
            data: { 
              success: true,
              data: {
                id,
                status,
                statusReason: reason || ''
              }
            } 
          });
        } else {
          reject({ response: { data: { message: 'Product not found' } } });
        }
      }, 500);
    });
  },
  
  duplicateProduct: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = products.find(p => p.id === id);
        if (product) {
          const newProduct = {
            ...JSON.parse(JSON.stringify(product)),
            id: Math.max(...products.map(p => p.id)) + 1,
            name: `${product.name} (Copy)`,
            sku: `${product.sku}-COPY`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          resolve({ data: { data: newProduct } });
        } else {
          reject({ response: { data: { message: 'Product not found' } } });
        }
      }, 800);
    });
  },
  
  updateProductVariants: (id, variants) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = products.find(p => p.id === id);
        if (product) {
          resolve({ 
            data: { 
              success: true,
              data: {
                id,
                variants
              }
            } 
          });
        } else {
          reject({ response: { data: { message: 'Product not found' } } });
        }
      }, 700);
    });
  },
  
  bulkUpdateProducts: (productIds, updates) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          data: { 
            success: true,
            affected: productIds.length 
          } 
        });
      }, 1000);
    });
  }
};

// Mock categories API responses
export const mockCategoriesApi = {
  fetchCategories: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: {
              content: categories,
              totalElements: categories.length,
              totalPages: 1,
              page: 0,
              size: 20
            }
          }
        });
      }, 400);
    });
  }
};

// Mock attributes API responses
export const mockAttributesApi = {
  fetchAttributes: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: {
              content: attributes,
              totalElements: attributes.length,
              totalPages: 1,
              page: 0,
              size: 20
            }
          }
        });
      }, 300);
    });
  }
};