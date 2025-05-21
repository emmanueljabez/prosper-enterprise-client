// Mock data for product bundles
export const bundlesData = [
  {
    id: 'bundle-1001',
    name: 'Home Office Network Kit',
    sku: 'HONK-1001',
    description: 'Complete home office networking solution with high-speed Wi-Fi router, media converter, and Cat6A ethernet cable.',
    price: 329.99, // Bundle price (discount from sum of components)
    compareAtPrice: 364.97, // Sum of component prices
    cost: 238.25, // Sum of component costs
    status: 'active',
    type: 'bundle',
    categories: [1, 3], // Networking Equipment, Wireless Networking
    images: [
      { id: 101, url: '/images/bundles/home-office-kit-1.jpg', alt: 'Home Office Network Kit', isDefault: true },
      { id: 102, url: '/images/bundles/home-office-kit-2.jpg', alt: 'Kit components displayed', isDefault: false }
    ],
    bundleItems: [
      {
        productId: 'prod-1001', // Wi-Fi 6 Router Pro
        quantity: 1,
        isRequired: true,
        isVariable: false
      },
      {
        productId: 'prod-2001', // Fiber Optic Media Converter
        quantity: 1,
        isRequired: true,
        isVariable: false
      },
      {
        productId: 'prod-8001', // Cat6A Ethernet Cable
        variantId: 802, // 25ft cable variant
        quantity: 1,
        isRequired: true,
        isVariable: true, // Customer can choose a different cable length
        variableOptions: {
          attributeId: 'attr-2', // Cable Length
          options: [
            { variantId: 801, label: '10ft' }, // 10ft cable
            { variantId: 802, label: '25ft' }, // 25ft cable
            { variantId: 803, label: '50ft' } // 50ft cable
          ]
        }
      }
    ],
    attributes: {
      warranty: '1 Year',
      dimensions: '20 x 16 x 8 inches (packaged)',
      weight: '3.9 lbs (combined)'
    },
    seo: {
      title: 'Home Office Network Kit - Complete Networking Solution',
      metaDescription: 'Everything you need for a professional home office network setup with Wi-Fi 6 technology and reliable connectivity.',
      slug: 'home-office-network-kit'
    },
    createdAt: '2023-06-10T09:30:00Z',
    updatedAt: '2023-07-18T11:45:22Z',
    visibility: {
      webstore: true,
      b2bPortal: true,
      marketplace: true
    },
    // Dynamic stock calculation based on component availability
    inventory: {
      dynamicStock: true, // Flag to enable dynamic stock calculation
      minComponentQuantity: 1, // Minimum quantity of each component needed
      lowStockThreshold: 5 // When to show "Low Stock" warning
    }
  },
  
  {
    id: 'bundle-1002',
    name: 'Small Business Network Package',
    sku: 'SBNP-1002',
    description: 'Complete networking solution for small businesses including managed switch, fiber connectivity, and reliable power backup.',
    price: 999.99,
    compareAtPrice: 1138.97,
    cost: 717.50,
    status: 'active',
    type: 'bundle',
    categories: [1, 2], // Networking Equipment, Network Switches
    images: [
      { id: 103, url: '/images/bundles/small-business-package-1.jpg', alt: 'Small Business Network Package', isDefault: true },
      { id: 104, url: '/images/bundles/small-business-package-2.jpg', alt: 'Package components laid out', isDefault: false }
    ],
    bundleItems: [
      {
        productId: 'prod-3001', // Managed Network Switch 24-Port
        variantId: 301, // PoE variant
        quantity: 1,
        isRequired: true,
        isVariable: true,
        variableOptions: {
          attributeId: 'attr-3', // Power over Ethernet
          options: [
            { variantId: 301, label: 'With PoE' }, // PoE variant
            { variantId: 302, label: 'Without PoE' } // Non-PoE variant
          ]
        }
      },
      {
        productId: 'prod-2001', // Fiber Optic Media Converter
        quantity: 2,
        isRequired: true,
        isVariable: false
      },
      {
        productId: 'prod-6001', // Enterprise Rack-Mount UPS
        quantity: 1,
        isRequired: true,
        isVariable: false
      },
      {
        productId: 'prod-4001', // Fiber Optic Patch Cable
        variantId: 402, // 3M cable variant
        quantity: 2,
        isRequired: true,
        isVariable: true,
        variableOptions: {
          attributeId: 'attr-2', // Cable Length
          options: [
            { variantId: 401, label: '1M' }, // 1M cable
            { variantId: 402, label: '3M' }, // 3M cable
            { variantId: 403, label: '5M' } // 5M cable
          ]
        }
      }
    ],
    attributes: {
      warranty: '2 Years',
      dimensions: '24 x 24 x 12 inches (packaged)',
      weight: '22.5 lbs (combined)'
    },
    seo: {
      title: 'Small Business Network Package - Complete Business Networking Solution',
      metaDescription: 'Professional business networking package with managed switch, fiber connectivity, and power backup for reliable operation.',
      slug: 'small-business-network-package'
    },
    createdAt: '2023-04-12T14:30:00Z',
    updatedAt: '2023-07-20T09:15:45Z',
    visibility: {
      webstore: false,
      b2bPortal: true,
      marketplace: false
    },
    inventory: {
      dynamicStock: true,
      minComponentQuantity: 1,
      lowStockThreshold: 3
    }
  },
  
  {
    id: 'bundle-1003',
    name: 'Network Technician Kit',
    sku: 'NTK-1003',
    description: 'Essential tools and equipment for network installation and maintenance professionals.',
    price: 249.99,
    compareAtPrice: 274.98,
    cost: 130.75,
    status: 'active',
    type: 'bundle',
    categories: [6], // Network Tools
    images: [
      { id: 105, url: '/images/bundles/network-tech-kit-1.jpg', alt: 'Network Technician Kit', isDefault: true },
      { id: 106, url: '/images/bundles/network-tech-kit-2.jpg', alt: 'Tools and accessories', isDefault: false }
    ],
    bundleItems: [
      {
        productId: 'prod-5001', // Network Installation Tool Kit
        quantity: 1,
        isRequired: true,
        isVariable: false
      },
      {
        productId: 'prod-8001', // Cat6A Ethernet Cable
        variantId: 804, // 100ft cable
        quantity: 1,
        isRequired: true,
        isVariable: true,
        variableOptions: {
          attributeId: 'attr-2', // Cable Length
          options: [
            { variantId: 802, label: '25ft' }, // 25ft cable
            { variantId: 803, label: '50ft' }, // 50ft cable
            { variantId: 804, label: '100ft' } // 100ft cable
          ]
        }
      }
    ],
    attributes: {
      warranty: '2 Years',
      dimensions: '16 x 12 x 6 inches (packaged)',
      weight: '5.1 lbs (combined)'
    },
    seo: {
      title: 'Network Technician Kit - Professional Installation & Maintenance Tools',
      metaDescription: 'Complete kit for network installation and maintenance professionals with essential tools and high-quality cables.',
      slug: 'network-technician-kit'
    },
    createdAt: '2023-01-25T11:20:00Z',
    updatedAt: '2023-07-01T08:30:15Z',
    visibility: {
      webstore: true,
      b2bPortal: true,
      marketplace: true
    },
    inventory: {
      dynamicStock: true,
      minComponentQuantity: 1,
      lowStockThreshold: 5
    }
  },
  
  {
    id: 'bundle-1004',
    name: 'Home Fiber Connectivity Bundle',
    sku: 'HFCB-1004',
    description: 'Complete residential fiber connectivity solution with ONT, media converter, and patch cables.',
    price: 149.99,
    compareAtPrice: 168.97,
    cost: 90.50,
    status: 'active',
    type: 'bundle',
    categories: [5, 8], // Media Converters & Transceivers, Fiber Optic Equipment
    images: [
      { id: 107, url: '/images/bundles/home-fiber-bundle-1.jpg', alt: 'Home Fiber Connectivity Bundle', isDefault: true },
      { id: 108, url: '/images/bundles/home-fiber-bundle-2.jpg', alt: 'Bundle components', isDefault: false }
    ],
    bundleItems: [
      {
        productId: 'prod-7001', // Residential Fiber ONT
        quantity: 1,
        isRequired: true,
        isVariable: false
      },
      {
        productId: 'prod-2001', // Fiber Optic Media Converter
        quantity: 1,
        isRequired: true,
        isVariable: false
      },
      {
        productId: 'prod-4001', // Fiber Optic Patch Cable
        variantId: 401, // 1M cable
        quantity: 1,
        isRequired: true,
        isVariable: true,
        variableOptions: {
          attributeId: 'attr-2', // Cable Length
          options: [
            { variantId: 401, label: '1M' }, // 1M cable
            { variantId: 402, label: '3M' }, // 3M cable
            { variantId: 403, label: '5M' } // 5M cable
          ]
        }
      },
      {
        productId: 'prod-8001', // Cat6A Ethernet Cable
        variantId: 801, // 10ft cable
        quantity: 1,
        isRequired: true,
        isVariable: true,
        variableOptions: {
          attributeId: 'attr-2', // Cable Length
          options: [
            { variantId: 801, label: '10ft' }, // 10ft cable
            { variantId: 802, label: '25ft' } // 25ft cable
          ]
        }
      }
    ],
    attributes: {
      warranty: '1 Year',
      dimensions: '14 x 10 x 5 inches (packaged)',
      weight: '2.8 lbs (combined)'
    },
    seo: {
      title: 'Home Fiber Connectivity Bundle - Complete Residential Fiber Solution',
      metaDescription: 'Everything you need to set up and connect fiber internet in your home, including ONT, media converter, and cables.',
      slug: 'home-fiber-connectivity-bundle'
    },
    createdAt: '2023-05-18T10:15:00Z',
    updatedAt: '2023-06-28T13:40:22Z',
    visibility: {
      webstore: true,
      b2bPortal: true,
      marketplace: true
    },
    inventory: {
      dynamicStock: true,
      minComponentQuantity: 1,
      lowStockThreshold: 4
    }
  },

  {
    id: 'bundle-1005',
    name: 'Enterprise Network Expansion Kit',
    sku: 'ENEK-1005',
    description: 'Complete solution for expanding enterprise networks with managed switches, rack-mount UPS, and fiber connectivity.',
    price: 1599.99,
    compareAtPrice: 1749.97,
    cost: 1065.00,
    status: 'active',
    type: 'bundle',
    categories: [1, 2, 7], // Networking Equipment, Network Switches, Power & Surge Protection
    images: [
      { id: 109, url: '/images/bundles/enterprise-expansion-1.jpg', alt: 'Enterprise Network Expansion Kit', isDefault: true },
      { id: 110, url: '/images/bundles/enterprise-expansion-2.jpg', alt: 'Kit components in rack mount', isDefault: false }
    ],
    bundleItems: [
      {
        productId: 'prod-3001', // Managed Network Switch 24-Port
        variantId: 301, // PoE variant
        quantity: 2,
        isRequired: true,
        isVariable: true,
        variableOptions: {
          attributeId: 'attr-3', // Power over Ethernet
          options: [
            { variantId: 301, label: 'With PoE' }, // PoE variant
            { variantId: 302, label: 'Without PoE' } // Non-PoE variant
          ]
        }
      },
      {
        productId: 'prod-6001', // Enterprise Rack-Mount UPS
        quantity: 1,
        isRequired: true,
        isVariable: false
      },
      {
        productId: 'prod-4001', // Fiber Optic Patch Cable
        variantId: 403, // 5M cable
        quantity: 4,
        isRequired: true,
        isVariable: true,
        variableOptions: {
          attributeId: 'attr-2', // Cable Length
          options: [
            { variantId: 402, label: '3M' }, // 3M cable
            { variantId: 403, label: '5M' } // 5M cable
          ]
        }
      }
    ],
    attributes: {
      warranty: '3 Years',
      rackUnits: '5U (combined)',
      weight: '32.5 lbs (combined)'
    },
    seo: {
      title: 'Enterprise Network Expansion Kit - Professional Network Infrastructure',
      metaDescription: 'Expand your enterprise network with this complete solution including managed switches, power protection, and fiber connectivity.',
      slug: 'enterprise-network-expansion-kit'
    },
    createdAt: '2023-02-08T15:45:00Z',
    updatedAt: '2023-07-15T16:30:10Z',
    visibility: {
      webstore: false,
      b2bPortal: true,
      marketplace: false
    },
    inventory: {
      dynamicStock: true,
      minComponentQuantity: 1,
      lowStockThreshold: 2
    }
  }
];

// Helper utilities for working with bundles
export const bundleUtils = {
  // Calculate stock availability for a bundle based on its components
  calculateBundleAvailability(bundle, products) {
    if (!bundle.bundleItems || !bundle.inventory.dynamicStock) {
      return null;
    }
    
    let minAvailable = Infinity;
    let isFullyAvailable = true;
    
    for (const item of bundle.bundleItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        isFullyAvailable = false;
        minAvailable = 0;
        break;
      }
      
      let itemStock;
      
      if (item.variantId) {
        // Find variant stock
        const variant = product.variants?.find(v => v.id === item.variantId);
        itemStock = variant?.stock?.quantity || 0;
      } else {
        // Use main product stock
        itemStock = product.stock?.quantity || 0;
      }
      
      // Calculate how many bundles we can create from this component
      const bundlesFromThis = Math.floor(itemStock / item.quantity);
      minAvailable = Math.min(minAvailable, bundlesFromThis);
      
      if (bundlesFromThis < 1) {
        isFullyAvailable = false;
      }
    }
    
    return {
      available: minAvailable === Infinity ? 0 : minAvailable,
      isAvailable: isFullyAvailable && minAvailable > 0,
      isLowStock: minAvailable > 0 && minAvailable <= bundle.inventory.lowStockThreshold
    };
  },
  
  // Get bundle price with customizations
  calculateBundlePriceWithOptions(bundle, selectedOptions) {
    let basePrice = bundle.price;
    
    if (!selectedOptions || !bundle.bundleItems) return basePrice;
    
    // Apply price adjustments for selected variant options
    for (const itemId in selectedOptions) {
      const selectedVariantId = selectedOptions[itemId];
      const bundleItem = bundle.bundleItems.find(item => item.productId === itemId);
      
      if (!bundleItem || !bundleItem.isVariable) continue;
      
      // Calculate price difference between default variant and selected variant
      const defaultVariantId = bundleItem.variantId;
      if (defaultVariantId === selectedVariantId) continue;
      
      // This is a simple implementation - in a real system you'd look up actual product prices
      // For this mock example, we'll just add a fixed price adjustment
      // based on the position in the options array
      const optionIndex = bundleItem.variableOptions.options.findIndex(opt => opt.variantId === selectedVariantId);
      const defaultIndex = bundleItem.variableOptions.options.findIndex(opt => opt.variantId === defaultVariantId);
      
      // Add $10 for each step up from default, subtract $10 for each step down
      basePrice += (optionIndex - defaultIndex) * 10;
    }
    
    return basePrice;
  },
  
  // Get bundle components as complete objects (with product details)
  getBundleComponents(bundle, products) {
    if (!bundle.bundleItems) return [];
    
    return bundle.bundleItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      
      if (!product) return null;
      
      let variant = null;
      if (item.variantId && product.variants) {
        variant = product.variants.find(v => v.id === item.variantId);
      }
      
      return {
        bundleItem: item,
        product: product,
        variant: variant,
        stock: variant ? variant.stock : product.stock,
        price: variant ? variant.price : product.price,
        options: item.isVariable ? item.variableOptions : null
      };
    }).filter(Boolean);
  }
};

export default bundlesData;